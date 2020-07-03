
const createPlugin = require('@gerhobbelt/markdown-it-regexp');
const sanitize = require('sanitize-filename');



let lastMatchToken;

function removeInitialSlashes(str) {
  return str.replace(/^\/+/g, '');
}

// separate the setup/config object from the `md.use(...)` call for code clarity:
const setup = {
  pluginId: 'wikilink',
  replacer: function (match, setup, options, env, tokens, id) {
    // when we get here, all parsing has been done: reset the token tracker:
    lastMatchToken = null;

    let label = '';
    let pageName = '';
    let href = '';
    let htmlAttrs = [];
    let htmlAttrsString = '';
    const isSplit = !!match[2];

    function isAbsolute(pageName) {
      return options.makeAllLinksAbsolute || pageName.charCodeAt(0) === 0x2F;/* / */
    }

    if (isSplit) {
      label = match[3];
      pageName = match[1];
    } else {
      label = match[1];
      pageName = options.generatePageNameFromLabel(label);
    }
    label = options.postProcessLabel(label);
    pageName = options.postProcessPageName(pageName);

      // make sure none of the values are empty
    if (!label || !pageName) {
      return match.input;
    }

    if (isAbsolute(pageName)) {
      pageName = removeInitialSlashes(pageName);
      href = options.baseURL + pageName + options.uriSuffix;
    } else {
      href = options.relativeBaseURL + pageName + options.uriSuffix;
    }
    href = setup.escape(href);

    htmlAttrs.push(`href="${href}"`);
    for (let attrName in options.htmlAttributes) {
      const attrValue = options.htmlAttributes[attrName];
      htmlAttrs.push(`${attrName}="${setup.encodeHtmlAttr(attrValue)}"`);
    }
    htmlAttrsString = htmlAttrs.join(' ');

    return `<a ${htmlAttrsString}>${label}</a>`;

    // - showcase using the `options` passed in via `MarkdownIt.use()`
    // - showcase using the `setup` object
    // - showcase using the `tokens` stream + `id` index to access the token
    // return '\n' + setup.pluginId + ':' + options.opt1 + ':' + setup.escape(url) + ':' + options.opt2 + ':' + (token.wonko || '---') + ':' + token.type + ':' + token.nesting + ':' + token.level;
  },
  shouldParse: function (state, match, config, plugin_options) {
    // do not accept wikilinks inside wikilinks: that's insane!
    if (!lastMatchToken) {
      return true;
    }
    let mpos = lastMatchToken.position;
    let mend = mpos + lastMatchToken.size;
    if (state.pos >= mpos && state.pos < mend) {
      // inside an outer link chunk!
      return false;
    }
    return true;
  },
  postprocessParse: function (state, token, config, plugin_options) {
    lastMatchToken = token;
  },
  setup: function (config, options) {
    const defaults = {
      linkPattern: /\[\[([^\x00-\x1f|]+?)(\|([\s\S]+?))?\]\]/,          // accept anything, except control characters (CR, LF, etc) or |
       // linkPattern: /\[\[([-\w\s\/]+)(\|([-\w\s\/]+))?\]\]/,  // accept words, dashes and whitespace

      baseURL: '/',
      relativeBaseURL: './',
      makeAllLinksAbsolute: false,
      uriSuffix: '.html',
      htmlAttributes: {
      },
      generatePageNameFromLabel: (label) => {
        return label;
      },
      postProcessPageName: (pageName) => {
        pageName = pageName.trim();
        pageName = pageName.split('/').map(sanitize).join('/');
        pageName = pageName.replace(/\s+/g, '_');
        return pageName;
      },
      postProcessLabel: (label) => {
        label = label.trim();
        return label;
      }
    };

    options = Object.assign({}, defaults, options);

    // override the regexp used for token matching:
    if (options.linkPattern) {
      config.regexp = options.linkPattern;
    }

    // reset token tracker:
    lastMatchToken = null;

    return options;
  }
};

const plugin = createPlugin(
  // regexp to match: fake one. Will be set up by setup callback instead.
  /./,

  setup
);


module.exports = plugin;
