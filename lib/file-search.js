'use strict'

const rp = require('request-promise-native')
const htmlparser = require('htmlparser2')
const cheerio = require('cheerio')

const { LIST_FILES } = require('./constants.js')
const { debug } = require('./util.js')

const fileSearch = ({ year, limit, medianame, username }) => {
  const url = LIST_FILES({ year, limit, medianame, username })
  debug('file search url: ', url)

  return rp(url)
    .then((body) => {
      const $ = cheerio.load(body)

      const files = $('.TablePager_col_img_name')
      if (files.length !== 1) throw new Error('Expected one result')

      let currentHref = ''
      let finalHref = ''
      const parser = new htmlparser.Parser({
        onopentag: (name, attr) => {
          if (name === 'a') currentHref = attr.href
        },
        ontext: (text) => {
          if (text === 'file') finalHref = currentHref
        }
      }, { decodeEntities: true })

      parser.write($(files[0]).html())

      const baseUrl = `http://${year}.igem.org`
      const imageUrl = baseUrl + finalHref

      debug('image link: ' + imageUrl)

      return imageUrl
    })
}

module.exports = ({ year }) => ({
  limit = '50',
  medianame = '',
  username = ''
}) => fileSearch({
  year,
  limit,
  medianame,
  username
})
