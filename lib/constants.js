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

const TYPE_IMAGE = exports.TYPE_IMAGE = 'image'
const TYPE_PAGE = exports.TYPE_PAGE = 'page'
const TYPE_TEMPLATE = exports.TYPE_TEMPLATE = 'template'
const TYPE_STYLESHEET = exports.TYPE_STYLESHEET = 'stylesheet'
const TYPE_SCRIPT = exports.TYPE_SCRIPT = 'script'

exports.TYPES = [
  TYPE_IMAGE,
  TYPE_PAGE,
  TYPE_TEMPLATE,
  TYPE_STYLESHEET,
  TYPE_SCRIPT
]

exports.UPLOAD_URLS = ({ year, teamName }) => {
  const baseUrl = `http://${year}.igem.org/`

  return {
    [TYPE_PAGE]: baseUrl + `Team:${teamName}`,
    [TYPE_TEMPLATE]: baseUrl + `Template:${teamName}`,
    [TYPE_STYLESHEET]: baseUrl + `Template:${teamName}/css`,
    [TYPE_SCRIPT]: baseUrl + `Template:${teamName}/js`
  }
}

exports.MULTIFORM_PAGE = {
  wpSection: '',
  wpStarttime: '',
  wpEdittime: '',
  wpScrolltop: '',
  wpAutoSummary: '',
  oldid: '',
  wpTextbox1: '',
  wpSummary: '',
  wpSave: '',
  wpEditToken: ''
}

exports.MULTIFORM_IMAGE = {
  wpUploadFile: '',
  wpDestFile: '',
  wpUploadDescription: '',
  wpLicense: '',
  wpEditToken: '',
  title: '',
  wpDestFileWarningAck: '',
  wpUpload: '',
  wpIgnoreWarning: '1',
  // wpWatchthis: '1'
}
