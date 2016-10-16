'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { assert, should } = chai
should()


describe('All pages', function() {
  describe('With a team with no _', function() {
    this.timeout(5 * 1000)

    const { getTeamPages, getTeamTemplates } = require('../index.js')({})

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

  describe('With a team with _ in it', function() {
    const { getTeamPages, getTeamTemplates } = require('../index.js')({ teamName: 'UrbanTundra_Edmonton' })

    it('Should return a list of team pages', function() {
      this.timeout(5 * 1000)

      return getTeamPages().then((pages) => {
        assert.isOk(pages.length >= 0)
      })
    })

    it('Should return a list of team templates', function() {
      this.timeout(5 * 1000)

      return getTeamTemplates().then((templates) => {
        assert.isOk(templates.length >= 0)
      })
    })
  })
})
