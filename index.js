
import createPlugin from '@gerhobbelt/markdown-it-regexp';
import sanitize from 'sanitize-filename';



function removeInitialSlashes(str) {
  return str.replace(/^\/+/g, '');
}

// separate the setup/config object from the `md.use(...)` call for code clarity:
const defaultSetup = {
  pluginId: 'wikilink',
  replacer: function (match, setup, options, env, tokens, id) {
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
  setup: function (config, options) {
    const defaults = {
      linkPattern: /\[\[([^\x00-\x1f|]+?)(\|([\s\S]+?))?\]\]/,          // accept anything, except control characters (CR, LF, etc) or |
      // linkPattern: /\[\[([-\w\s\/]+)(\|([-\w\s\/]+))?\]\]/,          // accept words, dashes and whitespace

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

    return options;
  }
};

const plugin = createPlugin(
  // regexp to match: fake one. Will be set up by setup callback instead.
  /./,

  Object.assign({}, defaultSetup)
);

// only use this for test rigs:
plugin.createTestInstance = function (setup) {
  createPlugin.reset();
  const p = createPlugin(
    // regexp to match: fake one. Will be set up by setup callback instead.
    /./,

    Object.assign({}, defaultSetup)
  );
  return p;
};


export default plugin;
