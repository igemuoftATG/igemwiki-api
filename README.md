# igemwiki-api

[![node](https://img.shields.io/badge/node-v6.x-blue.svg)]() [![Build Status](https://travis-ci.org/igemuoftATG/igemwiki-api.svg?branch=master)](https://travis-ci.org/igemuoftATG/igemwiki-api)  [![codecov.io](https://codecov.io/github/igemuoftATG/igemwiki-api/coverage.svg?branch=master)](https://codecov.io/github/igemuoftATG/igemwiki-api?branch=master)

NodeJS and CLI API for interacting with an igem wiki (downloading/uploading pages/stylesheets/scripts/templates/images, etc.)

```bash
npm install --save igemwiki-api
```

- [API](#api)
  * [login](#login)
  * [getTeamPages, getTemplatePages](#getteampages-getteamtemplates)
  * [downloadPage](#downloadpage)
  * [upload](#upload)
- [CLI](#cli)

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

```javascript
const igemwiki = require('igemwiki-api')({ teamName: 'Toronto' })

igemwiki.login({
  username: 'randomuser',
  password: 'password'
}).then(function (jar) {
  console.log('Login was successful, received cookie jar: ', jar)
}).catch((error) => {
  console.log('Something went wrong: ', error)
})
```

Obviously you would not want to expose your `username` and `password`. As such, a convenience function `prompt` is provided.
Use it like this:

```javascript
const userDetails = igemwiki.prompt()

igemwiki.login({
  username: userDetails.username,
  password: userDetails.password
})
```

Or like this (**TODO**):

```javascript
igemwiki.login({ prompt: true })
```

However the prompt method falls apart on a serverside or continuous integration
platform. It also just annoying to repeatedly enter the same login information
over and over. As per the [Twelve-Factor App](https://12factor.net), **sensitive
configuration should be stored in the enviroment**. If a `.env` file is present,
`igemwiki-api` will pick values out of there if they are not provided as options.
To enable this, copy [sample.env](./sample.env) into `.env` (and **do not ever
commit .env**) and change the values. Make sure to leave no spaces around `=` in
`key=val`. Then you can login like this:

```javascript
igemwiki.login()
```

The `teamName` is also present in the environment configuration. So you can require the module like so:

```javascript
const igemwiki = require('igemwiki-api')({})
```

**TODO** make it so `require('igemwiki-api')()` works.

See [login.spec.js](./test/login.spec.js).

### getTeamPages, getTeamTemplates

Use these to get all page urls from your team.

```javascript
igemwiki.getTeamPages().then(pages => console.log(pages)) // array of urls
igemwiki.getTeamTemplates().then(templates => console.log(templates)) // array of urls as well

// you should .catch(function (error) { /* ... */ }) in real code.
```

See [all-pages.spec.js](./test/all-pages.spec.js).

### downloadPage

Not just a simple `curl`. Pulls out content of text box from `?action=edit`
page. Takes `page` and `dir` (download directory) in options.

```javascript
// ES2015 destructuring. same as getTeamPages = igemwiki.getTeamPages
const { getTeamPages, getTeamTemplates, downloadPage } = require('igemwiki-api')({})

// Turn [ ['a', 'b'], ['c'] ] into ['a', 'b', 'c']
const flatMap = (arr) => arr.reduce((flattened, current) => flattened.concat(current), [])

// Map urls into an array of downloadPage promises
const pageDownloads = Promise.all([ getTeamPages(), getTeamTemplates() ])
  .then(pages => flatMap(pages).map(url => downloadPage({ page: url, dir: './downloads' })))

// Download all pages
Promise.all(pageDownloads)
  .then(() => console.log('Downloads finished'))
  .catch(error => console.error(error))
```

See [download-page.spec.js](./test/download-page.spec.js).

### upload

```javascript
// Need cookie jar from login
login()
.then(function(jar) {
  // Everything is an ES2015 Promise!
  return upload({
    jar: jar,
    type: 'page', // or stylesheet, script, template, image
    pageOrImageName: 'test-upload', // will create Team:${teamName}/${pageOrImageName} for 'page', or Template:${teamName}/{css|js}/..
    fileName: './src/mypage.html', // the source for upload. what is entered into update page text box.
    dir: './responses' // where to store upload responses and metadata
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

## CLI

WIP
