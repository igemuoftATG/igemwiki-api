'use strict'

require('dotenv').load()

const { login, prompt } = require('./lib/login.js')

module.exports = {
  login,
  prompt
}
