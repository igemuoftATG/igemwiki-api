'use strict'

const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { assert, should } = chai
should()

const { fileSearch, compareImage } = require('../index.js')({ teamName: 'Toronto' })

describe('Compare', function() {
  it('Should find an equal image', function() {
    this.timeout(5 * 1000)

    return fileSearch({ medianame: 'igem-logo.png' })
      .then(imageUrl => compareImage({ url: imageUrl, fileName: path.resolve(__dirname, './files/igem-logo.png') }))
      .then(equal => assert.isOk(equal))
  })

  it('Should find a disequal image', function() {
    this.timeout(5 * 1000)

    return fileSearch({ medianame: 'igem-logo.png' })
      .then(imageUrl => compareImage({ url: imageUrl, fileName: path.resolve(__dirname, './files/abstract-cells.jpg') }))
      .then(equal => assert.isNotOk(equal))
  })
})
