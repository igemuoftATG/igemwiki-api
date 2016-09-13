'use strict'

const rp = require('request-promise-native')
const htmlparser = require('htmlparser2')

const { TEAM_PAGES, TEMPLATE_PAGES } = require('./constants.js')

const { debug, currentYear } = require('./util.js')

const parseLinks = ({
  cleanTeamName,
  year = currentYear,
  body,
  pages = false, templates = false
}) => {
  const results = []
  let currentHref = ''

  let lookingFor
  if (pages) {
    lookingFor = `Team:${cleanTeamName}`
  } else if (templates) {
    lookingFor = cleanTeamName
  }

  const parser = new htmlparser.Parser({
    onopentag: (name, attr) => {
      if (name === 'a') currentHref = attr.href
    },
    ontext: (text) => {
      if (text.indexOf(lookingFor) !== -1) results.push(`http://${year}.igem.org${currentHref}`)
    }
  }, {
    decodeEntities: true
  })

  parser.write(body)
  parser.end()

  return results
}

const getTeamPages = ({ year, teamName }) => {
  // Teams with underscores in their names have underscores removed from links
  const cleanTeamName = teamName.indexOf('_') >= 0
    ? teamName.replace(/_/g, ' ')
    : teamName

  return rp({ url: TEAM_PAGES({ year, teamName }) }).then((body) => {
    const results = parseLinks({
      cleanTeamName,
      body,
      pages: true
    })

    debug('Team pages: ', results)
    return results
  })
}

const getTeamTemplates = ({ year, teamName }) => {
  const cleanTeamName = teamName.indexOf('_') >= 0
    ? teamName.replace(/_/g, ' ')
    : teamName

  return rp({ url: TEMPLATE_PAGES({ year, teamName }) }).then((body) => {
    const results = parseLinks({
      cleanTeamName,
      body,
      templates: true
    })

    debug('Team templates: ', results)
    return results
  })
}

module.exports = ({ year, teamName }) => ({
  getTeamPages: () => getTeamPages({ year, teamName }),
  getTeamTemplates: () => getTeamTemplates({ year, teamName })
})
