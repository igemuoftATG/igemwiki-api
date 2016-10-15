'use strict'

// Load username and password into process.env if present in .env file
// Don't throw an error if .env is not present
require('dotenv').load({ silent: true })

const { login, prompt } = require('./lib/login.js')
const { currentYear } = require('./lib/util.js')
const downloadPage = require('./lib/download-page.js')

module.exports = ({ year = currentYear, teamName } = {}) => {
  if (!teamName) {
    if (process.env.teamName) {
      teamName = process.env.teamName
    } else {
      throw new Error('Must pass in teamName')
    }
  }

  const { getTeamPages, getTeamTemplates } = require('./lib/all-pages.js')({ year, teamName })
  const downloadAll = require('./lib/download-all.js')({ year, teamName })
  const upload = require('./lib/upload.js')({ year, teamName })
  const fileSearch = require('./lib/file-search.js')({ year, teamName })

  return {
    login,
    prompt,
    getTeamPages,
    getTeamTemplates,
    downloadPage,
    downloadAll,
    upload,
    fileSearch
  }
}
