'use strict'

const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { assert, should } = chai
should()

const { fileSearch } = require('../index.js')({ teamName: 'Toronto' })
const compare = require('../lib/compare.js')

describe('Compare', function() {
  it('Should find an equal image', function() {
    this.timeout(10 * 1000)

    return fileSearch({ medianame: 'igem-logo.png' })
      .then(imageUrl => compare({
        url: imageUrl,
        fileName: path.resolve(__dirname, './files/igem-logo.png'),
        isImage: true
      }))
      .then(equal => assert.isOk(equal))
  })

  it('Should find a disequal image', function() {
    this.timeout(10 * 1000)

    return fileSearch({ medianame: 'igem-logo.png' })
      .then(imageUrl => compare({
        url: imageUrl,
        fileName: path.resolve(__dirname, './files/abstract-cells.jpg'),
        isImage: true
      }))
      .then(equal => assert.isNotOk(equal))
  })

  it('Should find an equal page', function() {
    this.timeout(10 * 1000)

    return compare({
      url: 'http://2016.igem.org/Template:Toronto/test-template?action=edit',
      fileName: path.resolve(__dirname, './files/test-template.html')
    }).then(equal => assert.isOk(equal))
  })

  it('Should find a disequal page', function() {
    this.timeout(10 * 1000)

    return compare({
      url: 'http://2016.igem.org/Team:Toronto/test-upload?action=edit',
      fileName: path.resolve(__dirname, './files/test-upload-undated.html')
    }).then(equal => assert.isNotOk(equal))
  })
})

