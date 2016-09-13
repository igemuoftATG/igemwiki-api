'use strict'

exports.LOGIN_ENDPOINT = 'https://igem.org/Login2'
exports.LOGOUT_ENDPOINT = 'http://igem.org/Logout'

const NAMESPACE_TEAM_PAGES = '0'
const NAMESPACE_TEMPLATE_PAGES = '10'

exports.TEAM_PAGES = ({ year, teamName }) => `http://${year}.igem.org/wiki/index.php?` + [
  'title=Special:AllPages',
  `from=Team:${teamName}`,
  `namespace=${NAMESPACE_TEAM_PAGES}`
].join('&')

exports.TEMPLATE_PAGES = ({ year, teamName }) => `http://${year}.igem.org/wiki/index.php?` + [
  'title=Special:AllPages',
  `from=${teamName}`,
  `namespace=${NAMESPACE_TEMPLATE_PAGES}`
].join('&')
