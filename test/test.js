/* eslint-env mocha, es6 */

import path from 'path';
import fs from 'fs';
import assert from 'assert';

import markdownit from '@gerhobbelt/markdown-it';
import generate from '@gerhobbelt/markdown-it-testgen';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import wikilinksPlugin from '../index.js';
const plugin = wikilinksPlugin.createTestInstance();


describe('markdown-it-wikilinks', function () {
  const md = markdownit({ linkify: true })
              .use(plugin);

  generate(path.join(__dirname, 'fixtures/wikilinks.txt'), md);
});
