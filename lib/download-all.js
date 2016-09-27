'use strict'

const _ = require('lodash')

const downloadPage = require('./download-page.js')

const downloadAll = ({ year, teamName, dir }) => {
  const { getTeamPages, getTeamTemplates } = require('./all-pages.js')({ year, teamName })

  const pageDownloads = Promise.all([ getTeamPages(), getTeamTemplates() ])
    .then(pages => _.flatten(pages))
    .then(pages => pages.map(page => downloadPage({ page, dir })))
    .then(downloads => Promise.all(downloads))

  return pageDownloads
}

module.exports = ({ year, teamName }) => ({ dir }) => downloadAll({ year, teamName, dir })
