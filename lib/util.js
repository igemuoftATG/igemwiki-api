'use strict'

const readlineSync = require('readline-sync')

/**
 * Prompt for username and password in terminal
 *
 * @returns {Object} { username, password }
 */
exports.getUsernameAndPassword = () => {
  const username = readlineSync.question('Username: ')
  const password = readlineSync.question('Password: ', { hideEchoBack: true })

  return { username, password }
}
