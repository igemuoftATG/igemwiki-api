'use strict'

const path = require('path')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { assert, should } = chai
should()

const { login, upload } = require('../index.js')({ teamName: 'Toronto' })

describe('Upload', function() {
  it('Should upload a page', function() {
    this.timeout(10 * 1000)

    return login().then(jar => upload({
      type: 'page',
      pageOrImageName: 'test-upload',
      fileName: path.resolve(__dirname, './files/test-upload.html'),
      dir: path.resolve(__dirname, 'responses'),
      jar
    })).then((responseDetails) => {
      console.log('responseDetails: ', responseDetails)
    })
  })
})
