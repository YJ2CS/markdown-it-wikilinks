/* eslint-env mocha, es6 */

import assert from 'assert';
import wikilinksPlugin from '../index.js';
const wikilinks = wikilinksPlugin.createTestInstance;
import markdownIt from '@gerhobbelt/markdown-it';
import _ from 'lodash';


describe('markdown-it-wikilinks README demo code', function () {
  it('basic usage', () => {
    //...and *use* it:
    //
    //```js
    const options = undefined;
    const md = markdownIt().use(wikilinks(), options);
    const html = md.render(
      'Click [[Wiki Links|here]] to learn about [[/Wiki]] links.'
    );
    assert.strictEqual(html.trim(),
      '<p>Click <a href="./Wiki_Links.html">here</a> to learn about <a href="/Wiki.html">/Wiki</a> links.</p>');
  });

  describe('showcase options', () => {
    it('linkPattern', () => {
      const html = markdownIt()
        .use(wikilinks(), {
          linkPattern: /\[#([\w\s/!]+)(\|([\w\s/!]+))?#\]/
        })
        .render('[#Slate!#]');
      assert.strictEqual(
        html.trim(),
        '<p><a href="./Slate!.html">Slate!</a></p>'
      );
    });

    it('baseURL', () => {
      const html = markdownIt()
        .use(wikilinks(), {
          baseURL: '/wiki/'
        })
        .render('[[Main Page]] and also [[/fake-rooty page?]]');
      assert.strictEqual(
        html.trim(),
        '<p><a href="./Main_Page.html">Main Page</a> and also <a href="/wiki/fake-rooty_page.html">/fake-rooty page?</a></p>');
    });

    it('relativeBaseURL', () => {
      const html = markdownIt()
        .use(wikilinks(), {
          relativeBaseURL: '#',
          suffix: ''
        })
        .render('[[Main Page]] and [[super/sub]]');
      assert.strictEqual(
        html.trim(),
        '<p><a href="#Main_Page.html">Main Page</a> and <a href="#super/sub.html">super/sub</a></p>'
      );
    });

    it('makeAllLinksAbsolute', () => {
      const html = markdownIt()
        .use(wikilinks(), {
          makeAllLinksAbsolute: true,
          baseURL: '/wiki/',
          relativeBaseURL: '#'
        })
        .render('[[Main Page]] and also [[/fake-rooty page]]');
      assert.strictEqual(
        html.trim(),
        '<p><a href="/wiki/Main_Page.html">Main Page</a> and also <a href="/wiki/fake-rooty_page.html">/fake-rooty page</a></p>'
      );
    });

    it('uriSuffix', () => {
      const html = markdownIt()
        .use(wikilinks(), {
          uriSuffix: '.php'
        })
        .render('[[Main Page]]');
      assert.strictEqual(
        html.trim(),
        '<p><a href="./Main_Page.php">Main Page</a></p>'
      );
    });

    it('htmlAttributes', () => {
      const attrs = {
        'class': 'wikilink',
        rel: 'nofollow'
      };
      const html = markdownIt()
        .use(wikilinks(), {
          htmlAttributes: attrs
        })
        .render('[[Main Page]]');
      assert.strictEqual(
        html.trim(),
        '<p><a href="./Main_Page.html" class="wikilink" rel="nofollow">Main Page</a></p>'
      );
    });

    it('generatePageNameFromLabel', () => {
      function myCustomPageNameGenerator(label) {
        return label
          .split('/')
          .map(function (pathSegment) {
            // clean up unwanted characters, normalize case and capitalize the first letter
            pathSegment = _.deburr(pathSegment);
            pathSegment = pathSegment.replace(/[^\w\s]/g, '');

            // normalize case
            pathSegment = _.capitalize(pathSegment.toLowerCase());

            return pathSegment;
          })
          .join(' : ');
      }

      const html = markdownIt()
        .use(wikilinks(), {
          generatePageNameFromLabel: myCustomPageNameGenerator
        })
        .render(
          'Vive la [[révolution!]] VIVE LA [[RÉVOLUTION!!!]]\n\nBut no cb for piped [[/Misc/Cats/Slate|kitty]].'
        );
      assert.strictEqual(
        html.trim(),
        '<p>Vive la <a href="./Revolution.html">révolution!</a> VIVE LA <a href="./Revolution.html">RÉVOLUTION!!!</a></p>\n<p>But no cb for piped <a href="/Misc/Cats/Slate.html">kitty</a>.</p>'
      );
    });

    it('postProcessPageName', () => {
      function myCustomPageNamePostprocessor(label) {
        return label
          .split('/')
          .map(function (pathSegment) {
            // clean up unwanted characters, normalize case and capitalize the first letter
            pathSegment = _.deburr(pathSegment);
            pathSegment = pathSegment.replace(/[^\w\s]/g, '');

            // normalize case
            pathSegment = _.capitalize(pathSegment.toLowerCase());

            return pathSegment;
          })
          .join('/');
      }

      const html = markdownIt()
        .use(wikilinks(), {
          postProcessPageName: myCustomPageNamePostprocessor
        })
        .render(
          'Vive la [[révolution!]] VIVE LA [[RÉVOLUTION!!!]]\n\nBut no cb for piped [[/Misc/Cats/Slate|kitty]].'
        );
      assert.strictEqual(
        html.trim(),
        '<p>Vive la <a href="./Revolution.html">révolution!</a> VIVE LA <a href="./Revolution.html">RÉVOLUTION!!!</a></p>\n<p>But no cb for piped <a href="/Misc/Cats/Slate.html">kitty</a>.</p>'
      );
    });

    it('postProcessLabel', () => {
      function myCustomLabelPostprocessor(label) {
        // clean up unwanted characters, normalize case and capitalize the first letter
        label = _.deburr(label);
        label = label.replace(/[^\w\s]/g, '');

        // normalize case
        label = _.capitalize(label.toLowerCase());

        return label;
      }

      const html = markdownIt()
        .use(wikilinks(), {
          postProcessLabel: myCustomLabelPostprocessor
        })
        .render(
          'Vive la [[révolution!]] VIVE LA [[RÉVOLUTION!!!]]\n\nBut no cb for piped [[/Misc/Cats/Slate|kitty]].'
        );
      assert.strictEqual(
        html.trim(),
        '<p>Vive la <a href="./révolution!.html">Revolution</a> VIVE LA <a href="./RÉVOLUTION!!!.html">Revolution</a></p>\n<p>But no cb for piped <a href="/Misc/Cats/Slate.html">Kitty</a>.</p>'
      );
    });
  });

  it('advanced usage (user setup)', () => {
    //...and *use* it:
    //
    //```js
    const options = {
      postProcessLabel: function (label) {
        return label.replace('!', '!!!');
      },
      postProcessPageName: function (pageName4Href) {
        return pageName4Href.replace(/^[a-z_-]/g, '');
      }
    };

    const md = markdownIt().use(wikilinks(function testCustomSetup(config, options) {

      // Here we can not only manipulate the new `options` instance, but also tweak the `config` wikilinks class instance itself,
      // for example overriding the rendering of the link in HTML:
      config.renderLink = function testRenderLink(info, setup, options, env, tokens, id) {

        // demo: use all attributes, but strip off the href= attribute!
        let htmlAttrsString = info.htmlAttrs.filter((attr) => !/^href=/.test(attr)).join(' ');

        // demo: show both original label & pageName as extracted from the markdown source,
        // AND what these were turned in, having been fed through the postprocess functions:
        return `<linkComponent pageName="${setup.encodeHtmlAttr(info.originalPageName)}" originalLabel="${setup.encodeHtmlAttr(info.originalLabel)}" sourceUrl="${setup.encodeHtmlAttr(info.href)}" ${htmlAttrsString}>${info.label}</linkComponent>`;

      };
      return options;
    }), options);

    const html = md.render(
      'Click [[Wiki Links|here]] to learn about [[/Wiki]] links: [[for various purposes!|A|B]].'
    );
    assert.strictEqual(html.trim(),
      '<p>Click <linkComponent pageName="Wiki Links" originalLabel="here" sourceUrl="./Wiki Links.html" >here</linkComponent> to learn about <linkComponent pageName="/Wiki" originalLabel="/Wiki" sourceUrl="/Wiki.html" >/Wiki</linkComponent> links: <linkComponent pageName="for various purposes!" originalLabel="A|B" sourceUrl="./or various purposes!.html" >A|B</linkComponent>.</p>');
  });

});
