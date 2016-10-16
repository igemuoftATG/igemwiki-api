# igemwiki-api

[![node](https://img.shields.io/badge/node-v6.x-blue.svg)]() [![Build Status](https://travis-ci.org/igemuoftATG/igemwiki-api.svg?branch=master)](https://travis-ci.org/igemuoftATG/igemwiki-api)  [![codecov.io](https://codecov.io/github/igemuoftATG/igemwiki-api/coverage.svg?branch=master)](https://codecov.io/github/igemuoftATG/igemwiki-api?branch=master)

NodeJS and CLI API for interacting with an igem wiki (downloading/uploading pages/stylesheets/scripts/templates/images, etc.)

```bash
npm install -g igemwiki-api
```

**TL;DR: Install Node, see [upload-conf](#upload-conf)**

## Recipes

See [Recipes](./recipes).

## Contents

- [CLI](#cli)
  * [upload-conf](#upload-conf)
  * [backup](#backup)
  * [upload](#upload)
  * [upload-glob](#upload-glob)
- [API](#api)
  * [login](#login)
  * [getTeamPages, getTemplatePages](#getteampages-getteamtemplates)
  * [downloadAll](#downloadall)
  * [upload](#upload2)
    - [image upload](#image-upload)

## CLI

### backup

Runs `igemwiki.downloadALL({ dir })` behind the scenes.

```
Usage:
  igemwiki backup [OPTIONS] [ARGS]

Options:
  -y, --year [NUMBER]    Year to download pages from (Default is current year)
  -n, --teamName STRING  Team name
  -d, --dir [DIR]        Download directory (Default is ./backups)
  -h, --help             Display help and usage details
```

### upload-conf

This is the simplest way to get going. By writing a small yaml file and
installing this tool via npm or Docker, you can begin uploading your entire wiki
in minutes.

This will read from a yaml file with `pages`, `templates`, `stylesheets`,
`scripts` being an array that each have objects including `source` and `dest`.

If the value does not contain `:` then it will be evaluated as a glob pattern
(and `dest` will be created just as it were in `upload-glob`). Else, the format
is `source:dest`. `INDEX` is a special dest that will map to your team home
page. Explicit mappings with `source:dest` where `source` is the same as
something that was encountered with a glob pattern will take precedence. This
lets you glob the majority of files and be explicit to "fix the odd ones".

An example `igemwiki-conf.yaml` might look like:

```yaml
templates:
    - ./build-live/templates/*.html
stylesheets:
    - ./build-live/css/*_css
scripts:
    - ./build-live/js/*_js
pages:
    - ./build-live/*.html
    - ./build-live/index.html:INDEX
    - ./build-live/HP-Silver.html:HP/Silver
    - ./build-live/HP-Gold.html:HP/Gold
images:
    - ./images/*.{png,jpg}
```

See [igemwiki-conf.yml](https://github.com/igemuoftATG/wiki2016/blob/develop/igemwiki-conf.yml)
for Toronto's 2016 wiki.

First get a preview of the `{ type, source, dest }` options array:

```
igemwiki upload-conf -n Toronto --conf igemwiki-conf.yml -p
```

And then upload each file:

```
igemwiki upload-conf -n Toronto --conf igemwiki-conf.yml
```

```
Usage:
  igemwiki upload-conf [OPTIONS] [ARGS]

Options:
  -y, --year [NUMBER]    Year to download pages from (Default is current year)
  -n, --team STRING      Team name
  -f, --force BOOL       Force upload
  -c, --conf PATH        YAML configuration file
  -p, --preview BOOL     Preview source/dest pairs before uploading
  -h, --help             Display help and usage details
```

### upload

```
Usage:
  igemwiki upload [OPTIONS] [ARGS]

Options:
  -y, --year [NUMBER]    Year to download pages from (Default is current year)
  -n, --teamName STRING  Team name
  -s, --source STRING    Source file
  -d, --dest STRING      Destination
  -t, --type STRING      Type (page, template, stylesheet, script, or image)
  -f, --force BOOL       Force upload
  -h, --help             Display help and usage details
```

*stylesheet*
```
▶ igemwiki upload -n Toronto --type stylesheet --source ./test/files/test-stylesheet.css --dest test-stylesheet
skipped[889ms] ./test/files/test-stylesheet.css -> http://2016.igem.org/Template:Toronto/css/test-stylesheet
```

*script*
```
▶ igemwiki upload -n Toronto --type script --source ./test/files/test-script.js --dest test-script -f
uploaded[1451ms] ./test/files/test-script.js -> http://2016.igem.org/Template:Toronto/js/test-script
```

*template*
```
▶ igemwiki upload -n Toronto --type template --source ./test/files/test-template.html --dest test-template
skipped[476ms] ./test/files/test-template.html -> http://2016.igem.org/Template:Toronto/test-template
```

*page*
```
▶ igemwiki upload -n Toronto --type page --source ./test/files/test-upload.html --dest test-upload
uploaded[2092ms] ./test/files/test-upload.html -> http://2016.igem.org/Team:Toronto/test-upload
```

*image* (**use filename extension in dest!**)
```
▶ igemwiki upload -n Toronto --type image --source ./test/files/igem-logo.png --dest igem-logo.png
skipped[1401ms] ./test/files/igem-logo.png -> http://2016.igem.org/wiki/images/4/4d/T--Toronto--2016_igem-logo.png

▶ igemwiki upload -n Toronto --type image --source ./test/files/igem-logo.png --dest igem-logo.png -f
uploaded[3382ms] ./test/files/igem-logo.png -> http://2016.igem.org/wiki/images/4/4d/T--Toronto--2016_igem-logo.png
```

### upload-glob

Upload files matching a pattern with [globby](https://github.com/sindresorhus/globby).

**Dest will be produced by stripping the basename of paths with the appropiate
extension for that type.** Thus this method will fail if you wish to have control over
special destinations for some files, in which case [upload-conf](#upload-conf) is
recommended.

For example, if `./css/*.css` produces `[ './css/styles.css',
'./css/vendors.css' ]` the dests will be `[ 'styles', 'vendors' ]`

```
Usage:
  igemwiki upload-glob [OPTIONS] [ARGS]

Options:
  -y, --year [NUMBER]    Year to download pages from (Default is current year)
  -n, --teamName STRING  Team name
  -g, --glob STRING      Glob pattern for sources
  -t, --type STRING      Type (page, template, stylesheet, script, or image)
  -f, --force BOOL       Force upload
  -h, --help             Display help and usage details
```


## API

When you require this module, it returns a function which takes one parameter, which is an object of options.

```javascript
const igemwiki = require('igemwiki-api')({
    year: 2016,
    teamName: 'Toronto'
})
```

> Note
> `const` does not mean "constant". It **can have its properties modified, but cannot be reassigned.**

The `year` can actually be omitted, and the current year (`new Date().getFullYear()`) will be used instead.

```javascript
const igemwiki = require('igemwiki-api')({ teamName: 'Toronto' })
```

The `teamName` **needs to be exactly as it is on your wiki page**, so: `http://2016.igem.org/Team:${teamName}`.

Once you require the module and call it with options, the rest of the API becomes available.

### Login

Logging in is required for most actions. It resolves to a cookie jar.

```javascript
const igemwiki = require('igemwiki-api')({ year: 2016, teamName: 'Toronto' })

igemwiki.login({
  username: 'randomuser',
  password: 'password'
}).then(function (jar) {
  console.log('Login was successful, received cookie jar: ', jar)
}).catch((error) => {
  console.log('Something went wrong: ', error)
})
```

Obviously you would not want to expose your `username` and `password`. As such,
if one of `username` or `password` is not passed in, you will be asked to enter
them in a prompt:

```javascript
igemwiki.login().then(jar => console.log('Cookie jar: ', jar))
```

However the prompt method fails on a serverside or continuous integration
platform. It also just annoying to repeatedly enter the same login information
over and over. As per the [Twelve-Factor App](https://12factor.net), **sensitive
configuration should be stored in the enviroment**. If a `.env` file is present,
`igemwiki-api` will pick values out of there if they are not provided as
options.  To enable this, copy [sample.env](./sample.env) into `.env` (and **do
not ever commit .env**) and change the values. Make sure to leave no spaces
around `=` in `key=val`. Instead of using `.env` file, you can also just export
the variable in your current shell:

```bash
export username=jmazz
export password=superSecretPassword
```

These variables will then be available from `process.env.username` and
`process.env.password` within Node. In fact, then `.env` method just uses
[dotenv](https://github.com/motdotla/dotenv) to load key/value pairs from the
`.env` file into `process.env`. The benefit of providing the `.env` method is
that `sample.env` makes it clear which values need to be set.

Then you can login like this and won't be prompted:

```javascript
igemwiki.login()
```

TODO take this out. Make it so `year` and `teamName` NEED to be passed in.
The `teamName` is also present in the environment configuration. So you can require the module like so:

```javascript
const igemwiki = require('igemwiki-api')({})
```

See [login.spec.js](./test/login.spec.js).

### getTeamPages, getTeamTemplates

Use these to get all page urls from your team.

```javascript
igemwiki.getTeamPages().then(pages => console.log(pages)) // array of urls
igemwiki.getTeamTemplates().then(templates => console.log(templates)) // array of urls as well

// you should .catch(function (error) { /* ... */ }) in real code.
```

See [all-pages.spec.js](./test/all-pages.spec.js).

### downloadAll

Not just a simple `curl`. Pulls out content of text box from `?action=edit`
page. Takes `dir` (download directory) in options. Use `downloadAll` to download
all team pages *and* templates.

```javascript
const path = require('path')
const { downloadAll } = require('igemwiki-api')()

downloadAll({ dir: path.resolve(__dirname, './downloads') }).then(function (results) {
  console.log('Download results: ', results)
})
```

There is also `downloadPage` to download one page at a time. It takes `page` and `dir`:

```javascript
downloadPage({
  page: 'http://2016.igem.org/Team:Toronto/test-upload',
  dir: downloadDir
}).then(result => console.log('Download: ', result))
```

See [download.spec.js](./test/download.spec.js).

<h3 id="upload2">upload</h3>

Upload file contents into pages, templates, or images. If local content matches
existing live content, the upload will be skipped, unless `force: true` is set.

```javascript
// Need cookie jar from login
login()
.then(function(jar) {
  // Everything is an ES2015 Promise!
  return upload({
    jar: jar,
    type: 'page', // or stylesheet, script, template, image
    dest: 'test-upload', // will create Team:${teamName}/${dest} for 'page', or Template:${teamName}/{css|js}/..
    source: './src/mypage.html', // the source for upload. what is entered into update page text box.
    force: false // force upload even if live/local content match, default is false
  })
})
.then(function(results) {
  console.log('Upload results:', results)
})
```

See [upload.spec.js](./test/upload.spec.js) for the API calls which produce the
test pages below. The `page` example shows how to load in CSS, Javascript, and a
template. The `test-upload-undated.html` file has `{{ DATE }}` replaced with the
current date when tests are ran.

| Type         | Source                                                            | Destination                                                                                       |
|--------------|-------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `stylesheet` | [test-stylesheet.css](./test/files/test-stylesheet.css)           | [Template:Toronto/css/test-stylesheet](http://2016.igem.org/Template:Toronto/css/test-stylesheet?action=edit) |
| `script`     | [test-script.js](./test/files/test-script.js)                     | [Template:Toronto/js/test-script](http://2016.igem.org/Template:Toronto/js/test-script?action=edit)           |
| `template`   | [test-template.html](./test/files/test-template.html)             | [Template:Toronto/test-template](http://2016.igem.org/Template:Toronto/test-template?action=edit)             |
| `page`       | [test-upload-undated.html](./test/files/test-upload-undated.html) | [Team:Toronto/test-upload](http://2016.igem.org/Team:Toronto/test-upload)                                     |

#### image upload

Just need to set `type` to image. `dest` **must be the image
filename, including extension**.

```javascript
login().then(jar => upload({
  type: 'image',
  dest: 'igem-logo.png', // Note full file name including extension
  source: './images/igem-logo.png' // Good idea to match this to dest,
  jar // with ES2015, this is the same as jar: jar
})).then(results => console.log(results.target)) // results.target is the direct image link
```

