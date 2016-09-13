'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { assert, should } = chai
should()


const { login, prompt } = require('../index.js')({})

describe('Login', function() {
  // Only run this on local machine, since we need to use a prompt
  if (process.env.CI === undefined) {
    it('Should resolve to a cookie jar with correct username and password from prompt', function() {
      this.timeout(15 * 1000)

      console.log('You have about 10 seconds or the test will fail...')
      const { username, password } = prompt()

      return login({ username, password }).then((jar) => {
        assert.isOk(Object.keys(jar._jar.store.idx).indexOf('igem.org') >= 0, 'jar does not have igem.org')
      })
    })
  }

  it('Should resolve to a cookie jar with correct username and password from .env', function() {
    this.timeout(5 * 1000)

    return login({}).then((jar) => {
      assert.isOk(Object.keys(jar._jar.store.idx).indexOf('igem.org') >= 0, 'jar does not have igem.org')
    })
  })


  it('Should reject with a bad username', function() {
    const username = 'foo'
    const password = 'password'

    return login({ username, password }).should.be.rejectedWith('Invalid username')
  })

  it('Should reject with a bad password', function() {
    const username = 'jmazz'
    const password = 'password'

    return login({ username, password }).should.be.rejectedWith('Invalid password')
  })
})
