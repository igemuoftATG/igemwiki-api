'use strict'

const path = require('path')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { assert, should } = chai
should()

const { downloadAll } = require('../index.js')()

describe('Download all', function() {
  it('Should download all pages and templates', function() {
    this.timeout(30 * 1000)

    return downloadAll({ dir: path.resolve(__dirname, './download') }).then((results) => {
      console.log('results: ', results)
    })
  })
})
