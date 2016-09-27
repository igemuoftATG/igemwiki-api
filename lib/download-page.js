'use strict'

const rp = require('request-promise-native')
const cheerio = require('cheerio')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')

const { debug } = require('./util.js')

const downloadPage = ({ page, dir, fileName }) => {
  let $

  debug('Attempting to download: ', page)

  return rp({ url: page + '?action=edit' })
    .then((body) => {
      // Cheerio is basically like jQuery
      $ = cheerio.load(body)
      // First make sure the output dir exists
      return fs.ensureDirAsync(dir)
    })
    .then(() => {
      const textBoxContent = $('#wpTextbox1').text()

      const splits = page.split('/')
      const pageName = splits[splits.length - 1].replace(/:/g, '-')

      if (!fileName) {
        if (pageName) {
          fileName = path.resolve(dir, pageName + '.html')
        } else {
          fileName = path.resolve(dir, 'index.html')
        }
      }

      return fs.writeFileAsync(fileName, textBoxContent)
    })
    .then(() => {
      debug('Wrote: ', fileName)
      return `Downloaded to ${fileName}`
    })
}

module.exports = downloadPage
