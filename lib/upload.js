'use strict'

const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))

const rp = require('request-promise-native')
const htmlparser = require('htmlparser2')

const {
  TYPES,
  TYPE_IMAGE,
  UPLOAD_URLS,
  MULTIFORM_PAGE,
  MULTIFORM_IMAGE
} = require('./constants.js')
const { currentYear, debug } = require('./util.js')

const getMultiform = ({
  url,
  type,
  pageOrImageName,
  fileName,
  jar,
  year,
  teamName
}) => {
  return rp({ url, jar })
    .then((body) => {
      const multiform = type === TYPE_IMAGE ? MULTIFORM_IMAGE : MULTIFORM_PAGE

      const parser = new htmlparser.Parser({
        onopentag: (name, attr) => {
          if (attr.name && Object.keys(multiform).indexOf(attr.name) !== -1) {
            if (attr.value) {
              multiform[attr.name] = attr.value
            } else {
              multiform[attr.name] = ''
            }
          }
        }
      }, { decodeEntities: true })

      parser.write(body)
      parser.end()

      // Resolves to filled multiform
      return new Promise((resolve, reject) => {
        if (type === TYPE_IMAGE) {
          // TODO check for bad image name (e.g. has :, /)
          const destFile = `T--${teamName}--${year}_${pageOrImageName}`

          multiform['wpUploadFile'] = fs.createReadStream(fileName)
          multiform['wpDestFile'] = destFile
          // TODO expose this as an option
          multiform['wpUploadDescription'] = `Uploaded on ${new Date().toString()} using igemwiki-api (https://github.com/igemuoftATG/igemwiki-api)`

          debug(`Gonna upload ${fileName} to ${destFile}`)

          resolve(multiform)
        } else {
          // page, template, stylesheet, or script
          fs.readFileAsync(fileName, 'utf-8')
            .then((contents) => {
              multiform['wpTextbox1'] = contents

              debug('multiform: ', multiform)
              resolve(multiform)
            })
            .catch(reject)
        }
      })
    })
}

const postMultiform = ({
  url,
  type,
  multiform,
  pageOrImageName,
  dir,
  jar,
  year
}) => {
  let responseDetails = {
    images: {},
    pages: {}
  }
  const outfile = path.resolve(dir, pageOrImageName + '.html')

  debug('posting with multiform: ', multiform)

  return rp({
    url,
    method: 'POST',
    formData: multiform,
    jar,
    // see login.js for what these options do
    resolveWithFullResponse: true,
    simple: false
  }).then((res) => {
    // TODO make a generic redirect handler
    if (res.statusCode === 302) {
      debug('Redirecting to: ', res.headers.location)
      return rp({
        url: res.headers.location,
        jar
      })
    } else if (res.statusCode === 200) {
      debug(`Upload failed for ${pageOrImageName}`)
      throw new Error('Upload failed')
    }
  }).then((body) => {
    if (type === TYPE_IMAGE) {
      let currentHref = ''
      let finalHref = ''

      const parser = new htmlparser.Parser({
        onopentag: (name, attr) => {
          if (name === 'a') currentHref = attr.href
        },
        ontext: (text) => {
          switch(text) {
            case 'Full resolution':
            case multiform['wpDestFile']:
            case 'Original file':
              finalHref = currentHref
              break
            default:
              break
          }
        }
      }, { decodeEntities: true })

      parser.write(body)
      parser.end()

      responseDetails.images[pageOrImageName] = `http://${year}.igem.org${finalHref}`
    } else {
      responseDetails.pages[pageOrImageName] = 'uploaded'
    }

    debug(`Gonna write to ${outfile}`)
    return fs.writeFileAsync(outfile, body)
  }).then(() => {
    return responseDetails
  })
  .catch(err => console.error('ERROR:', err))
}

const upload = ({
  type,
  pageOrImageName,
  fileName,
  dir,
  year = currentYear,
  teamName,
  jar
}) => {
  if (TYPES.indexOf(type) === -1) return Promise.reject('Invalid type')

  const baseUrl = UPLOAD_URLS({ year, teamName })[type] + '/' + pageOrImageName
  const editUrl = baseUrl + '?action=edit'
  const postUrl = type === TYPE_IMAGE ? baseUrl : baseUrl + '?action=submit'
  debug('editUrl: ', editUrl)
  debug('postUrl: ', postUrl)

  return Promise.all([
    fs.ensureDirAsync(dir),
    fs.statAsync(fileName)
  ]).then(() => getMultiform({
    url: editUrl,
    type,
    pageOrImageName,
    fileName,
    jar,
    year,
    teamName
  })).then(multiform => postMultiform({
    url: postUrl,
    type,
    multiform,
    pageOrImageName,
    dir,
    jar,
    year
  })).then((responseDetails) => {
    debug('responseDetails:', responseDetails)
    return(responseDetails)
  })
}

module.exports = ({ year, teamName, }) => ({
  type,
  pageOrImageName,
  fileName,
  dir,
  jar
}) => upload({
  year,
  teamName,
  type,
  pageOrImageName,
  fileName,
  dir,
  jar
})
