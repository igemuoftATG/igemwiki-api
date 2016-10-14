'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const crypto = require('crypto')

const request = require('request')
const rp = require('request-promise-native')
const cheerio = require('cheerio')

const { debug } = require('./util.js')

const hash = (data) => crypto.createHash('sha256').update(data).digest('hex')

const hashCompare = (strs) => {
  const [external, local] = strs

  const previewSize = 20
  debug(`external (${previewSize}): ` + external.substring(0, previewSize))
  debug(`local (${previewSize}): ` + local.toString().substring(0, previewSize))

  const externalHash = hash(external)
  const localHash = hash(local.toString())

  const equal = externalHash === localHash
  debug('equal: ' + equal)

  return equal
}

const getWpTextbox1 = (url) => rp(url).then((body) => {
  const $ = cheerio.load(body)
  const contents = $('#wpTextbox1').text()

  return contents
})

const compare = ({ url, fileName, isImage = false }) => {
  debug(`Comparing ${url} to ${fileName}`)

  const promises = []
  if (isImage) {
    // Simple request for body for images
    promises.push(rp(url))
  } else {
    // Need to extract text box content for pages
    promises.push(getWpTextbox1(url))
  }

  promises.push(fs.readFileAsync(fileName))

  return Promise.all(promises).then(hashCompare)
}

module.exports = compare
