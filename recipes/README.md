# Recipes 🍣🍆🍉🍄

*How to get up and going with this tool*

`igemwiki-api` allows you to download/upload pages and images from your local
machine directly to your iGEM wiki at `http://YEAR.igem.org/Team:TEAM_NAME`.
This document will outline a recipe for managing all of your html, css,
javascript, and images. It will then cover more advanced cases like generating
html with templates and markdown. Finally we will cover continuous integration
using GitHub and Drone.

## What is MediaWiki?

First, a summary of what the iGEM wiki system is. It is a hosted
[MediaWiki][MediaWiki] instance. This is the same software that powers
[Wikipedia][Wikipedia] (see: "In other projects"). Essentially MediaWiki is a
platform that allows **users** to create and edit **pages**, as well as upload
**files** (e.g. images). As well, the administrator can set user permisions on
certain pages. Your iGEM Wiki is basically a subset of the iGEM website where
only team members can create and edit pages. Anyone can upload images from
`Special:Upload` - this is why it is suggested to follow a file naming
convention prefixed with your team and year. Think of your team wiki essentially
as a set of Wikipedia pages.

[MediaWiki]: https://www.mediawiki.org/wiki/MediaWiki
[Wikipedia]: https://en.wikipedia.org/wiki/Main_Page

Since this page is not your "standard HTML" website, there are some gotchas with
regards to using css and JavaScript. You may have noticed that each page can
have its content edited by visiting `page?action=edit`. At this page we can edit
a textbox which then becomes the content of that page. As well you can use
templates which are hosted at `Template:TEAM_NAME/templateName`. For the
reminder of this document I will refer to the contents of this text box as
`wpTextbox`.

### HTML/MediaWiki Syntax

You can write HTML or MediaWiki markup in `wpTextbox`. See [MediaWiki
Formatting][MediaWiki-Formatting]. For example, here is some markup
followed by the equivalent HTML.

[MediaWiki-Formatting]: https://www.mediawiki.org/wiki/Help:Formatting

> You must wrap HTML inside a `<html>` tag. If you want to mix markup inside
some html you will need to close and open the html tag.

```
This is some ''italic text'' and some '''bold text'''.

* list item
* another list item

<html>
This is some <i>italic text</i> and some <b>bold text</b>.

<ul>
    <li>list item</li>
    <li>another list item</li>
</ul>
</html>
```

**I recommend sticking to HTML**. This is because:

- someone else who wants to contribute would need to learn MediaWiki markup
- if you are going to spend time learning markup, may as well learn the
  predominant GitHub Flavoured Markdown (GFM)
- GFM is simpler than MediaWiki markup and can render in GitHub repos
- if you want to work on your local machine, to see MediaWiki markup rendered
  you will need your own MediaWiki setup or some other means - HTML will just
  work in your browser

The above as markdown:

```
This is some *italic text* and some **bold text**.

- list item
- another list item
```

### Templates

Given a template that is hosted at `Template:TEAM_NAME/header`, we can link that
from another page using the following syntax:

```
<html>
<!-- in Team:TEAM_NAME/home or similar -->
</html>

{{TEAM_NAME/header}}

<html>
Above me is the header, lol.
</html>
```

The template can be valid HTML/MediaWiki Markup. But if you've been listening
it will be HTML ;)

### CSS and JavaScript

CSS and JavaScript should be inserted into `wpTextbox` as normal - do not wrap
the CSS/JS inside any `html` tags or anything. For example lets say the contents
of `Team:TEAM_NAME/styles` is

```css
a {
  color: blue;
}
a:visted {
  color: blue;
}
```

and the contents of `Team:TEAM_NAME/scripts` is

```javascript
console.log('wahoooooo')
```

Notice two things:

- the name of the page for CSS/JavaScript is irrelevant. **it does not need to
  end in `.css` or `.js`** In fact, you shouldn't, as this has led to issues in
  the past where URLs ending in those formats were rejected by the system (I
  know, right).
- If you visit this page it will make no sense, as essentially the CSS/JS is
  being rendered as if it were markup.

The "regular way" to reference CSS and JS is (given that the files
`/static/styles.css` and `/static/scripts.js` exists on your site):

```html
<link rel="stylesheet" href="/static/styles.css" />

<script src="/static/scripts.js"></script>
```

However, since on the wiki, `Team:TEAM_NAME/styles` and `Team:TEAM_NAME/scripts`
are **pages and not files** we need to specifically request that we want the
"raw" content and specify a "content type" for it:

```html
<link rel="stylesheet" href="http://YEAR.igem.org/Team:TEAM_NAME/styles?action=raw&ctype=text/css" />

<script src="http://YEAR.igem.org/Team:TEAM_NAME/scripts?action=raw&ctype=text/javascript"></script>
```

## Simple Website File Organization

Now that we have an understanding of the syntax of our target files, lets
discuss how to organize our website. **We will build a site locally and then use
the igemwiki-api to upload it**. Combined with version control like Git and
GitHub, we can later easily rollback the site if something goes wrong. This also
allows for faster iterative development verses constantly editing `wpTextbox`,
submitting, and refreshing.

You are encouraged to follow along. Later on in the tutorial you will need Node
installed.

This first simple site will use the following:

- HTML for content
- a header and footer template
- CSS styles
- JavaScript
- Vendor CSS
- Vendor JS
- Static content (images and fonts) in a `/static` folder

The directory will look like so:

```
.
├── index.html
├── css
│   ├── styles.css
│   └── vendors.css
├── scripts
│   ├── main.js
│   └── vendor.js
└── templates
    ├── footer.html
    └── header.html
```

We will use [Bootstrap][Bootstrap] as an example of a **vendor dependency**. We
separate our vendor code from our code since we would later like to dump all
external code into its own file and all personal code somewhere else - vendor
dependencies are much less likely to change than actual application code so
there is no point constantly reuploading all of that when only modifying
application code. It's also a good practice to eventually migrate your external
dependencies to a package manager like [Bower][Bower] or [npm][npm] since then
you can lock in versions to the `bower.json` or `package.json` file,
respectively. As well dependencies do not then need to be committed to the
repository, which is looked down upon. For now we will manually download our
dependencies and investigate package manager tools later.

[Bootstrap]: http://getbootstrap.com/
[Bower]: https://bower.io/
[npm]: https://npmjs.com

For this I downloaded the bootstrap dist zip. I've also placed the exact same
file in the [downloads][downloads] folder.

[downloads]: ./downloads

For this initial simple site, **I will naively copy the bootstrap files into our
vendor files**. By this I mean that `vendors.js` will be a copied and renamed
`bootstrap.min.js` and `vendors.css` will be a copied and renamed
`bootstrap.min.css`. As well some sample CSS has been entered in
`/css/styles.css` and some sample JS has been entered in `/js/main.js`. Now we
will write our templates. The main purpose of templates is to partition code
that will be used across all pages and import it into those pages easily. We
will load our CSS in the header template and JS in the footer (load JS after DOM
so we don't waste time not showing content). **This is where we need to decide
what to call our wiki pages that server as CSS and JS sources**. I'm using the
following mapping, where I simply follow the same path but just remove the file
extension:

| Local             | Wiki                                     |
|-------------------|------------------------------------------|
| `/css/[name].css` | `/simple/[name]` -> `/css/simple/[name]` |
| `/js/[name].js`   | `/simple/[name]` -> `/js/simple/name`    |

I am prepending with `/simple` just so as not to interfere with our team's
actual wiki. When setting `type` to "stylesheet" or "script" when calling
`igemwiki.upload({ /* options */ })`, the tool will automatically upload to a
template and prepend the url with `css` or `js`.

Then `header.html` will look like:

```html
<html>

<link rel="stylesheet" href="http://2016.igem.org/Template:Toronto/css/simple/vendors?action=raw&ctype=text/css" />
<link rel="stylesheet" href="http://2016.igem.org/Template:Toronto/css/simple/styles?action=raw&ctype=text/css" />

</html>
```

and `footer.html` will look like:

```html
<html>

<script src="http://2016.igem.org/Template:Toronto/js/simple/vendor?action=raw&ctype=text/javascript"></script>
<script src="http://2016.igem.org/Team:Toronto/js/simple/main?action=raw&ctype=text/javascript"></script>

</html>
```

Finally we just need a page to show off Bootstrap and our code. For that I have
slightly modified a Bootstrap template, check the [full
source](./simple/index.html) for details. It also includes the header and footer
templates at the top and bottom of the file.

## Uploading Simple Website Files

For this you will need Node installed. We will write a small script that uploads
our wiki. First, initialize a new npm project in the project folder and install
some dependencies, namely, `igemwiki-api` and [globby][globby]:

[globby]: https://github.com/sindresorhus/globby

```
npm init // add --yes if you want to skip questions
npm install --save igemwiki-api globby lodash bluebird // the --save makes it record dependencies in package.json
```

Then lets start writing `upload.js`:

```javascript
// core node, https://nodejs.org/api/path.html
const path = require('path')

const igemwiki = require('igemwiki-api')({ year: 2016, teamName: 'Toronto' })
const Promise = require('bluebird')
const globby = require('globby')
const _ = require('lodash')

globby([
  './index.html',
  './templates/**/*.html',
  './css/**/*.css',
  './js/**/*.js'
]).then(function(filenames) {
    console.log(filenames)

    const absoluteFilenames = filenames.map(filename => path.resolve(__dirname, filename))
    console.log(absoluteFilenames)
})
```

If we run this it will log out:

```
[ './index.html',
  './templates/footer.html',
  './templates/header.html',
  './css/styles.css',
  './css/vendors.css',
  './js/main.js',
  './js/vendor.js' ]
[ '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/index.html',
  '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/templates/footer.html',
  '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/templates/header.html',
  '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/css/styles.css',
  '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/css/vendors.css',
  '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/js/main.js',
  '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/js/vendor.js' ]
```

**Our goal is to create a mapping between filenames and wiki page
destinations**. So, let's seperate our types:

```javascript
const index = {
  type: 'page',
  fileName: path.resolve(__dirname, './index.html'),
  page: 'simple' // will make Team:Toronto/simple
}

const getTemplates = globby([ './templates/**/*.html' ]).then(function (templates) {
  return templates.map(function (template) {
    return {
      type: 'template',
      fileName: path.resolve(__dirname, template),
      page: 'simple/' + path.basename(template).replace('.html', '')
    }
  })
})

const getCSS = globby([ './css/**/*.css' ]).then((stylesheets) => {
  return stylesheets.map((stylesheet) => {
    return {
      type: 'stylesheet',
      fileName: path.resolve(__dirname, stylesheet),
      page: 'simple/' + path.basename(stylesheet).replace('.css', '')
    }
  })
})

const getJS = globby([ './js/**/*.js' ]).then(scripts => scripts.map(script => ({
  type: 'script',
  fileName: path.resolve(__dirname, script),
  page: 'simple/' + path.basename(script).replace('.js', '')
})))

Promise.all([
  Promise.resolve(index),
  getTemplates,
  getCSS,
  getJS
]).then((confs) => {
  confs = _.flatten(confs)
  console.log(confs)
})
```

This logs:

```
[ { type: 'page',
    fileName: '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/index.html',
    page: 'simple' },
  { type: 'template',
    fileName: '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/templates/footer.html',
    page: 'simple/footer' },
  { type: 'template',
    fileName: '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/templates/header.html',
    page: 'simple/header' },
  { type: 'stylesheet',
    fileName: '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/css/styles.css',
    page: 'simple/styles' },
  { type: 'stylesheet',
    fileName: '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/css/vendors.css',
    page: 'simple/vendors' },
  { type: 'script',
    fileName: '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/js/main.js',
    page: 'simple/main' },
  { type: 'script',
    fileName: '/Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/js/vendor.js',
    page: 'simple/vendor' } ]
```

Now that we are confident the mappings are correct, all that is left to do is
use the upload API. We map the configuration objects to `igemwiki.upload`
Promises. **Note we use Promise.map from bluebird so that we can set concurrency
to 1. This is important. Uploads will fail if the concurrency is too high. I
recommend just using 1.**

```javascript
Promise.all([
  Promise.resolve(index),
  getTemplates,
  getCSS,
  getJS
]).then((confs) => {
  confs = _.flatten(confs)

  igemwiki.login().then((jar) => {
    confs = confs.map(c => ({
      jar: jar,
      type: c.type,
      dest: c.page,
      source: c.fileName,
      // force: true
    }))

    Promise.map(confs, conf => igemwiki.upload(conf), { concurrency: 1 })
      .then(() => console.log('Uploads completed'))
      .catch(console.error)
  })
})
```

Run that and it will log out:

```
skipped /Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/index.html -> http://2016.igem.org/Team:Toronto/simple
uploaded /Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/js/vendor.js -> http://2016.igem.org/Template:Toronto/js/simple/vendor
skipped /Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/js/main.js -> http://2016.igem.org/Template:Toronto/js/simple/main
uploaded /Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/css/vendors.css -> http://2016.igem.org/Template:Toronto/css/simple/vendors
skipped /Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/css/styles.css -> http://2016.igem.org/Template:Toronto/css/simple/styles
skipped /Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/templates/header.html -> http://2016.igem.org/Template:Toronto/simple/header
skipped /Users/jmazz/Documents/repos/igemwiki-api/recipes/simple/templates/footer.html -> http://2016.igem.org/Template:Toronto/simple/footer
Uploads completed
```

Some of mine are `skipped` since I ran it a bunch of times. Sometimes the
compare method finds the local and live copies non-equal when they are, seems
to happen on large minified vendor files.

## Better Dependency Management

Up above I directly copied the bootstrap files into `vendors.css` and
`vendor.js`. This is not scalable, and will get messy fast once we have a lot of
dependencies. [Bower][Bower] is a tool that can be used to achieve this. For
this I will be setting up a site in [simple2](./simple2).

We install bower, initialize the `bower.json` file, and then install Bootstrap:

```bash
npm install -g bower
bower init # inside simple2
bower install bootstrap --save # adds bootstrap to bower.json
```

As well I have also moved the files from before into a `src` directory and
`upload.js` into `scripts`. Our directory structure looks like this now:

```bash
.
├── bower.json
├── bower_components
│   ├── bootstrap
│   └── jquery
├── package.json
├── src
│   ├── css
│   │   └── styles.css
│   ├── index.html
│   ├── js
│   │   └── main.js
│   └── templates
│       ├── footer.html
│       └── header.html
└── scripts
    └── upload.js
```

With [Gulp][Gulp], which is a "task runner" we can isolate and compose small
pieces of JS. One of these things is **bundle all bower dependencies into one
file**, which then lets us easily manage multiple dependencies.

```bash
npm install -g gulp
npm install --save-dev main-bower-files gulp-uglify gulp-concat gulp-cssmin gulp-util
```

Then in `gulpfile.js`:

```javascript
const gulp = require('gulp')
const concat = require('gulp-concat')
const cssmin = require('gulp-cssmin')
const gutil = require('gulp-util')
const uglify = require('gulp-uglify')

const mainBowerFiles = require('main-bower-files')

const dests = {
  js: './dist/js',
  css: './dist/css'
}

gulp.task('bower:js', () => gulp
  .src(mainBowerFiles('**/*.js'), { base: './bower_components' })
  .pipe(concat('vendor.js'))
  .pipe(uglify().on('error', gutil.log))
  .pipe(gulp.dest(dests.js))
)

gulp.task('bower:css', () => gulp
  .src(mainBowerFiles('**/*.css'), { base: './bower_components' })
  .pipe(concat('vendor.css'))
  .pipe(cssmin())
  .pipe(gulp.dest(dests.css))
)
```

Then if you run

```bash
gulp bower:js
gulp bower:css
```

the file `dists/js/vendor.js` will be created. However we are not so lucky with
Bootstrap. Sometimes with Bower you need to provided "overrides" specifying
which files to take from a library, so we add/modify the `overrides` key in
`bower.json`:

```json
"bootstrap": {
  "main": [
    "dist/js/bootstrap.js",
    "dist/css/bootstrap.css",
    "less/bootstrap.less"
  ]
}
```

Then run `gulp bower:css` again and you should have a `dist/css/vendors.css`
file.

Now if we want to install more libraries, like for example [Font
Awesome][Font-Awesome], we can simply install it (`bower install fontawesome
--save`) and rerun our task. If the files are not being picked up for whatever
reason, take a look inside the folder (`ls bower_components/fontawesome`) and
add a custom override:

```json
"font-awesome": {
  "main": [
    "css/font-awesome.min.css"
  ]
}
```

[Font-Awesome]: http://fontawesome.io/
[Gulp]: http://gulpjs.com/

As well it would not be too difficult to modify our upload script `upload.js` to
handle the new location of these vendor files. As well the upload script could
be copy/pasted into gulp and ran as a gulp task. But there is more to do, so we
will leave that to later.

## Working Locally

The setup above works fine in an edit-upload-refresh cycle, and you can imagine
it would not be difficult to expand it to include other pages. However, what if
we would like to iterate on the website locally (since it is much faster) and
then upload later?

It's not too difficult - but we will need to manage a local development copy and
a live deployment copy. The main differences are just how we load images, links,
CSS, and JS. One way to achieve this is by using a templating tool like
[Handlebars][Handlebars] and have different functions for rendering a link
whether we are in "dev mode" or "live mode".

[Handlebars]: http://handlebarsjs.com/

## Using Markdown

[Markdown][Markdown] is a great way to write content. It would great if we could
write each wiki page's content in markdown, then convert it to HTML and include
it in our site. One tool to do this is [marked][marked].

[Markdown]: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet
[marked]: https://github.com/chjj/marked
