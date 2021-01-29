/*! markdown-it-wikilinks 1.1.1-10 https://github.com//GerHobbelt/markdown-it-wikilinks @license MIT */

import createPlugin from '@gerhobbelt/markdown-it-regexp';
import sanitize from 'sanitize-filename';

function removeInitialSlashes(str) {
  return str.replace(/^\/+/g, '');
} // separate the setup/config object from the `md.use(...)` call for code clarity:


const defaultSetup = {
  pluginId: 'wikilink',
  replacer: function wikilinksReplacer(match, setup, options, env, tokens, id) {
    let label = '';
    let pageName = '';
    let href = '';
    let htmlAttrs = [];
    const isSplit = !!match[2];

    function isAbsolute(pageName) {
      return options.makeAllLinksAbsolute || pageName.charCodeAt(0) === 0x2F;
      /* / */
    }

    if (isSplit) {
      label = match[3];
      pageName = match[1];
    } else {
      label = match[1];
      pageName = options.generatePageNameFromLabel(label);
    }

    let originalLabel = label;
    let originalPageName = pageName;
    label = options.postProcessLabel(label);
    pageName = options.postProcessPageName(pageName); // make sure none of the values are empty

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

    return this.renderLink({
      pageName,
      label,
      originalPageName,
      originalLabel,
      href,
      htmlAttrs
    }, setup, options, env, tokens, id); // - showcase using the `options` passed in via `MarkdownIt.use()`
    // - showcase using the `setup` object
    // - showcase using the `tokens` stream + `id` index to access the token
    // return '\n' + setup.pluginId + ':' + options.opt1 + ':' + setup.escape(url) + ':' + options.opt2 + ':' + (token.wonko || '---') + ':' + token.type + ':' + token.nesting + ':' + token.level;
  },
  renderLink: function wikilinksRenderLink(info, setup, options, env, tokens, id) {
    let htmlAttrsString = info.htmlAttrs.join(' ');
    return `<a ${htmlAttrsString}>${info.label}</a>`;
  },
  setup: function wikilinksSetup(config, options) {
    const defaults = {
      linkPattern: /\[\[([^\x00-\x1f|]+?)(\|([\s\S]+?))?\]\]/,
      // accept anything, except control characters (CR, LF, etc) or |
      // linkPattern: /\[\[([-\w\s\/]+)(\|([-\w\s\/]+))?\]\]/,          // accept words, dashes and whitespace
      baseURL: '/',
      relativeBaseURL: './',
      makeAllLinksAbsolute: false,
      uriSuffix: '.html',
      htmlAttributes: {},
      generatePageNameFromLabel: label => {
        return label;
      },
      postProcessPageName: pageName => {
        pageName = pageName.trim();
        pageName = pageName.split('/').map(sanitize).join('/');
        pageName = pageName.replace(/\s+/g, '_');
        return pageName;
      },
      postProcessLabel: label => {
        label = label.trim();
        return label;
      }
    };
    options = Object.assign({}, defaults, options); // override the regexp used for token matching:

    if (options.linkPattern) {
      config.regexp = options.linkPattern;
    }

    return options;
  }
};
const plugin = createPlugin( // regexp to match: fake one. Will be set up by setup callback instead.
/./, Object.assign({}, defaultSetup)); // only use this for test rigs:

plugin.createTestInstance = function (setup) {
  createPlugin.reset();
  let setupObj = null;

  if (setup) {
    // allow user-provided setup to 'postprocess' the default setup:
    setupObj = {
      setup: function customSetup(config, options) {
        options = this.originalSetup(config, options);
        options = this.userSetup(config, options);
        console.error('setup special invoked!', config, options);
        return options;
      },
      originalSetup: defaultSetup.setup,
      userSetup: setup
    };
  }

  console.error('custom setup:', setupObj);
  const p = createPlugin( // regexp to match: fake one. Will be set up by setup callback instead.
  /./, Object.assign({}, defaultSetup, setupObj));
  return p;
};

export default plugin;
//# sourceMappingURL=markdownItWikiLinks.modern.js.map
