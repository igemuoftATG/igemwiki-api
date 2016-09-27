'use strict'

const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { assert, should } = chai
should()

const { getTeamPages, downloadPage, downloadAll } = require('../index.js')({ teamName: 'Toronto' })

describe('Download', function() {
  it('Should download all pages from getTeamPages', function() {
    this.timeout(15 * 1000)

    const dir = path.resolve(__dirname, 'download')


    return getTeamPages()
      .then(pages => Promise.all(pages.map(page => downloadPage({ page, dir }))))
  })

  it('Should download all pages and templates', function() {
    this.timeout(30 * 1000)

    return downloadAll({ dir: path.resolve(__dirname, './download') }).then((results) => {
      console.log('results: ', results)
    })
  })
})
