'use strict'

const rp = require('request-promise-native')
const cheerio = require('cheerio')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')

const { debug } = require('./util.js')

const downloadPage = ({ page, dir, filename }) => {
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

      if (!filename) {
        if (pageName) {
          filename = path.resolve(dir, pageName + '.html')
        } else {
          filename = path.resolve(dir, 'index.html')
        }
      }

      return fs.writeFileAsync(filename, textBoxContent)
    })
    .then(() => {
      debug('Wrote: ', filename)
    })
}

module.exports = downloadPage
