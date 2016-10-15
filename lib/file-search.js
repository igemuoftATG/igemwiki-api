'use strict'

const rp = require('request-promise-native')
const htmlparser = require('htmlparser2')
const cheerio = require('cheerio')

const { LIST_FILES, UPLOAD_FILENAME } = require('./constants.js')
const { debug } = require('./util.js')

const fileSearch = ({ year, teamName, limit, medianame, username }) => {
  const url = LIST_FILES({ year, limit, medianame, username })
  debug('file search url: ', url)

  return rp(url)
    .then((body) => {
      const $ = cheerio.load(body)

      const files = $('.TablePager_col_img_name')
      const target = UPLOAD_FILENAME({ year, teamName, dest: medianame })

      const htmls = []
      for (let i=0; i < files.length; i++) {
        const html = $(files[i]).html()

        if (html.indexOf(target) !== -1) {
          htmls.push(html)
        }
      }

      if (htmls.length > 1) throw new Error('Expected one or zero results')

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

      parser.write(htmls[0])

      const baseUrl = `http://${year}.igem.org`
      if (finalHref === '') throw new Error('Did not retrieve image href')
      const imageUrl = baseUrl + finalHref

      debug('image link: ' + imageUrl)

      return imageUrl
    })
}

module.exports = ({ year, teamName }) => ({
  limit = '50',
  medianame = '',
  username = ''
}) => fileSearch({
  year,
  teamName,
  limit,
  medianame,
  username
})
