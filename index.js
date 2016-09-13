'use strict'

require('dotenv').load({ silent: true })

const { login, prompt } = require('./lib/login.js')

module.exports = {
  login,
  prompt
}
