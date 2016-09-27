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

describe('File search', function() {
  it('Should search for a file', function() {
    this.timeout(5 * 1000)

    return fileSearch({ medianame: 'igem-logo.png' }).then((imageUrl) => {
      console.log('Received: ', imageUrl)
    })
  })
})
