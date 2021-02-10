# Markdown-It Wikilinks

[![Build Status](https://travis-ci.org/jsepia/markdown-it-wikilinks.svg?branch=master)](https://travis-ci.org/jsepia/markdown-it-wikilinks) 
[![NPM version](https://img.shields.io/npm/v/@gerhobbelt/markdown-it-wikilinks.svg?style=flat)](https://www.npmjs.org/package/@gerhobbelt/markdown-it-wikilinks)
[![Coverage Status](https://coveralls.io/repos/github/jsepia/markdown-it-wikilinks/badge.svg?branch=master)](https://coveralls.io/github/jsepia/markdown-it-wikilinks?branch=master)

Renders [Wikimedia-style links](https://www.mediawiki.org/wiki/Help:Links#Internal_links) in [markdown-it](https://github.com/markdown-it/markdown-it). This is useful for making Markdown-based wikis.

## Usage

Install this into your project:

```bash
npm --save install https://github.com/YJ2CS/markdown-it-wikilinks
```

...and *use* it:

```js
const wikilinks = require('markdown-it-wikilinks');
const options = ...;
const md = require('markdown-it')()
    .use(wikilinks, options);
const html = md
    .render('Click [[Wiki Links|here]] to learn about [[/Wiki]] links.');
```

**Output:**

```html
<p>Click <a href="./Wiki_Links.html">here</a> to learn about <a href="/Wiki.html">/Wiki</a> links.</p>
```

## Options

### `linkPattern`

**Default:** `/\[\[([\w\s/]+)(\|([\w\s/]+))?\]\]/`

The regex to use when matching WikiLinks.

#### Example

```js
// Using some non-standard markers for demo: [#...#] instead of [[...]]:
const html = require('markdown-it')()
  .use(require('markdown-it-wikilinks'), { 
    linkPattern: /\[#([\w\s/!]+)(\|([\w\s/!]+))?#\]/ 
  })
  .render('[#Slate!#]');
assert.strictEqual(
  html.trim(),
  '<p><a href="./Slate!.html">Slate!</a></p>');
```

### `baseURL`

**Default:** `/`

The base URL for absolute wiki links.

#### Example

```js
const html = require('markdown-it')()
  .use(require('markdown-it-wikilinks'), { 
    baseURL: '/wiki/' 
  })
  .render('[[Main Page]] and also [[/fake-rooty page?]]');
assert.strictEqual(
  html.trim(),
  '<p><a href="./Main_Page.html">Main Page</a> and also <a href="/wiki/fake-rooty_page.html">/fake-rooty page?</a></p>'
);
```

### `relativeBaseURL`

**Default:** `./`

The base URL for relative wiki links.

#### Example

```js
const html = require('markdown-it')()
  .use(require('markdown-it-wikilinks'), { 
    relativeBaseURL: '#', 
    suffix: '' 
  })
  .render('[[Main Page]] and [[super/sub]]');
assert.strictEqual(
  html.trim(),
  '<p><a href="#Main_Page.html">Main Page</a> and <a href="#super/sub.html">super/sub</a></p>'
);
```

### `makeAllLinksAbsolute`

**Default:** `false`

Render all wiki links as absolute links.

#### Example

```js
const html = require('markdown-it')()
  .use(require('markdown-it-wikilinks'), { 
    makeAllLinksAbsolute: true,
    baseURL: '/wiki/',
    relativeBaseURL: '#'
  })
  .render('[[Main Page]] and also [[/fake-rooty page]]');
assert.strictEqual(
  html.trim(),
  '<p><a href="/wiki/Main_Page.html">Main Page</a> and also <a href="/wiki/fake-rooty_page.html">/fake-rooty page</a></p>'
);
```


### `uriSuffix`

**Default:** `.html`

Append this suffix to every URL.

#### Example

```js
const html = require('markdown-it')()
  .use(require('markdown-it-wikilinks'), { 
    uriSuffix: '.php' 
  })
  .render('[[Main Page]]');
assert.strictEqual(
  html.trim(),
  '<p><a href="./Main_Page.php">Main Page</a></p>'
);
```

### `htmlAttributes`

**Default:** `{}`

An object containing HTML attributes to be applied to every link.

#### Example

```js
const attrs = {
  'class': 'wikilink',
  rel: 'nofollow'
}
const html = require('markdown-it')()
  .use(require('markdown-it-wikilinks'), { 
    htmlAttributes: attrs 
  })
  .render('[[Main Page]]');
assert.strictEqual(
  html.trim(),
  '<p><a href="./Main_Page.html" class="wikilink" rel="nofollow">Main Page</a></p>'
);
```

### `generatePageNameFromLabel`

Unless otherwise specified, the labels of the links are used as the targets. This means that a non-[piped](https://meta.wikimedia.org/wiki/Help:Piped_link) link such as `[[Slate]]` will point to the `Slate` page on your website.

But say you wanted a little more flexibility - like being able to have `[[Slate]]`, `[[slate]]`, `[[SLATE]]` and `[[Slate!]]` to all point to the same page. Well, you can do this by providing your own custom `generatePageNameFromLabel` function.

#### Example

```js
const _ = require('lodash');

function myCustomPageNameGenerator(label) {
  return label
    .split('/')
    .map(function(pathSegment) {
      // clean up unwanted characters, normalize case and capitalize the first letter
      pathSegment = _.deburr(pathSegment);
      pathSegment = pathSegment.replace(/[^\w\s]/g, '');

      // normalize case
      pathSegment = _.capitalize(pathSegment.toLowerCase());

      return pathSegment;
    })
    .join(' : ');
}

const html = require('markdown-it')()
  .use(require('markdown-it-wikilinks'), { 
    generatePageNameFromLabel: myCustomPageNameGenerator 
  })
  .render(
    'Vive la [[révolution!]] VIVE LA [[RÉVOLUTION!!!]]\n\nBut no cb for piped [[/Misc/Cats/Slate|kitty]].'
  );
assert.strictEqual(
  html.trim(),
  '<p>Vive la <a href="./Revolution.html">révolution!</a> VIVE LA <a href="./Revolution.html">RÉVOLUTION!!!</a></p>\n<p>But no cb for piped <a href="/Misc/Cats/Slate.html">kitty</a>.</p>'
);
```

Please note that the `generatePageNameFromLabel` function does not get applied for [piped links](https://meta.wikimedia.org/wiki/Help:Piped_link) such as `[[/Misc/Cats/Slate|kitty]]` since those already come with a target. 

### `postProcessPageName`

A transform applied to every page name. You can override it just like `generatePageNameFromLabel` (see above).

The default transform does the following things:

* trim surrounding whitespace
* [sanitize](https://github.com/parshap/node-sanitize-filename) the string
* replace spaces with underscores

#### Example

```js
const _ = require('lodash');

function myCustomPageNamePostprocessor(label) {
  return label
    .split('/')
    .map(function(pathSegment) {
      // clean up unwanted characters, normalize case and capitalize the first letter
      pathSegment = _.deburr(pathSegment);
      pathSegment = pathSegment.replace(/[^\w\s]/g, '');

      // normalize case
      pathSegment = _.capitalize(pathSegment.toLowerCase());

      return pathSegment;
    })
    .join('/');
}

const html = require('markdown-it')()
  .use(require('markdown-it-wikilinks'), { 
    postProcessPageName: myCustomPageNamePostprocessor
  })
  .render(
    'Vive la [[révolution!]] VIVE LA [[RÉVOLUTION!!!]]\n\nBut no cb for piped [[/Misc/Cats/Slate|kitty]].'
  );
assert.strictEqual(
  html.trim(),
  '<p>Vive la <a href="./Revolution.html">révolution!</a> VIVE LA <a href="./Revolution.html">RÉVOLUTION!!!</a></p>\n<p>But no cb for piped <a href="/Misc/Cats/Slate.html">kitty</a>.</p>'
);
```

### `postProcessLabel`

A transform applied to every link label. You can override it just like `generatePageNameFromLabel` (see above).

All the default transform does is trim surrounding whitespace.


#### Example

```js
const _ = require('lodash');

function myCustomLabelPostprocessor(label) {
  // clean up unwanted characters, normalize case and capitalize the first letter
  label = _.deburr(label);
  label = label.replace(/[^\w\s]/g, '');

  // normalize case
  label = _.capitalize(label.toLowerCase());

  return label;
}

const html = require('markdown-it')()
  .use(require('markdown-it-wikilinks'), { 
    postProcessLabel: myCustomLabelPostprocessor 
  })
  .render(
    'Vive la [[révolution!]] VIVE LA [[RÉVOLUTION!!!]]\n\nBut no cb for piped [[/Misc/Cats/Slate|kitty]].'
  );
assert.strictEqual(
  html.trim(),
  '<p>Vive la <a href="./révolution!.html">Revolution</a> VIVE LA <a href="./RÉVOLUTION!!!.html">Revolution</a></p>\n<p>But no cb for piped <a href="/Misc/Cats/Slate.html">Kitty</a>.</p>'
);
```

## TODO

* Unit test options
* Add examples to `postProcessPageName` and `postProcessLabel`

## Credits

Based on [markdown-it-ins](https://github.com/markdown-it/markdown-it-ins) by Vitaly Puzrin, Alex Kocharin.
