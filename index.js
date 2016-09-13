'use strict'

require('dotenv').load({ silent: true })

const { login, prompt } = require('./lib/login.js')
const { currentYear } = require('./lib/util.js')

module.exports = ({ year = currentYear, teamName }) => {
  if (!teamName) {
    if (process.env.teamName) {
      teamName = process.env.teamName
    } else {
      throw new Error('Must pass in teamName')
    }
  }

  const { getTeamPages, getTeamTemplates } = require('./lib/all-pages.js')({ year, teamName })

  return {
    login,
    prompt,
    getTeamPages,
    getTeamTemplates
  }
}
