// core node, https://nodejs.org/api/path.html
const path = require('path')

const igemwiki = require('igemwiki-api')({ year: 2016, teamName: 'Toronto' })
const Promise = require('bluebird')
const globby = require('globby')
const _ = require('lodash')

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

  igemwiki.login().then((jar) => {
    confs = confs.map(c => ({
      jar: jar,
      type: c.type,
      pageOrImageName: c.page,
      fileName: c.fileName,
      dir: './responses',
      // force: true
    }))

    Promise.map(confs, conf => igemwiki.upload(conf), { concurrency: 1 })
      .then(() => console.log('Uploads completed'))
      .catch(console.error)
  })
})


