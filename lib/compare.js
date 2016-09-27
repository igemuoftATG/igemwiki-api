'use strict'

const fs = require('fs')
const crypto = require('crypto')
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex')

const request = require('request')
const rp = require('request-promise-native')
const Promise = require('bluebird')
const streamEqual = Promise.promisifyAll(require('stream-equal'))

const { debug } = require('./util.js')

const compareImage = ({ url, fileName }) => {
  debug(`Comparing ${url} to ${fileName}`)

  return Promise.all([
    rp(url),
    fs.readFileAsync(fileName)
  ]).then((files) => {
    const [external, local] = files

    const externalHash = hash(external)
    const localHash = hash(local.toString())

    const equal = externalHash === localHash
    debug('equal: ' + equal)

    return equal
  })

  // const requestStream = request(url)
  // const readStream = fs.createReadStream(fileName)

  // Initiate flowing
  // TODO need this? how else. gives wrong results if this not done
  // requestStream.on('data', () => {})
  // readStream.on('data', () => {})

  // return streamEqual(requestStream, readStream).then((equal) => {
  //   debug('equal: ' + equal)

  //   return equal
  // })
}

module.exports = {
  compareImage
}
