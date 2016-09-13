'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { assert, should } = chai
should()


const { getTeamPages, getTeamTemplates } = require('../index.js')({})

describe('All pages', function() {
  it('Should return a list of team pages', function() {
    return getTeamPages().then((pages) => {
      assert.isOk(pages.length >= 0)
    })
  })

  it('Should return a list of team templates', function() {
    return getTeamTemplates().then((templates) => {
      assert.isOk(templates.length >= 0)
    })
  })
})
