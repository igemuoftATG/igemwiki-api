'use strict'

const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { assert, should } = chai
should()

const { downloadPage, getTeamPages } = require('../index.js')({ teamName: 'Toronto' })

describe('Download page', function() {
  it('Should download all pages from getTeamPages', function() {
    this.timeout(15 * 1000)

    const dir = path.resolve(__dirname, 'download')

    let expectedLength

    return getTeamPages()
      .then((pages) => {
        expectedLength = pages.length

        return Promise.all(pages.map(page => downloadPage({ page, dir })))
      })
      .then(() => fs.readdirAsync(dir))
      .then((files) => {
        assert.isOk(files.length === expectedLength, 'Did not download all pages')
      })
  })
})
