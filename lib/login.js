'use strict'

const rp = require('request-promise-native')
const debug = require('debug')('igemwiki-api')

const { LOGIN_ENDPOINT } = require('./constants.js')

const { getUsernameAndPassword } = require('./util.js')

/**
 * Login to igem. Catches the cookie needed for further authenticated requests.
 *
 * @param username {String} account username
 * @param password {String} account password
 * @param loginEndpoint {String} url to login from
 *
 * @returns {Promise} that resolves on login success with the cookie jar,
 * rejects otherwise
 */
const login = ({ username, password, loginEndpoint = LOGIN_ENDPOINT }) => {
  // If BOTH username and password are not provided, use values from .env file
  if (username === undefined && password === undefined) {
    username = process.env.username
    password = process.env.password
  }

  // Cookie jar
  const jar = rp.jar()

  const opts = {
    url: loginEndpoint,
    method: 'POST',
    form: {
      return_to: '',
      username,
      password,
      Login: 'Login'
    },
    jar,
    // Get back full response object instead of just body
    resolveWithFullResponse: true,
    // reject only if request failed for technical reasons
    // this way, http 302 (redirect - which we expect to receive) will not reject
    simple: false
  }

  return rp(opts)
    .then((res) => {
      // Follow the redirect
      if (res.statusCode === 302) {
        debug('Redirecting to: ', res.headers.location)
        return rp({
          url: res.headers.location,
          jar
        })
      } else if (res.statusCode === 200) {
        debug('Did not get expected 302, instead got 200')

        if (res.body.indexOf('That username is not valid') >= 0) {
          debug('Invalid username')
          throw new Error('Invalid username')
        } else if (res.body.indexOf('That username is valid, but the password is not or the emailed password has expired') >= 0) {
          debug('Invalid password')
          throw new Error('Invalid password')
        } else {
          throw new Error('Expected http 302 redirect')
        }
      }
    })
    .then((body) => {
      debug('Login body:', body)

      return(jar)
    })
}

module.exports = {
  login,
  prompt: getUsernameAndPassword
}
