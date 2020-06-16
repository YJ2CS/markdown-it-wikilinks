/* eslint-env mocha, es6 */

const path = require('path');
const generate = require('@gerhobbelt/markdown-it-testgen');
const plugin = require('../')();


describe('markdown-it-wikilinks', function () {
  const md = require('@gerhobbelt/markdown-it')({ linkify: true })
              .use(plugin);

  generate(path.join(__dirname, 'fixtures/wikilinks.txt'), md);
});
