'use strict'

const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { assert, should } = chai
should()

const { login, upload } = require('../index.js')({ teamName: 'Toronto' })

const fillVars = (str) => str
  .replace('{{ YEAR }}', new Date().getFullYear())
  .replace('{{ TEAM_NAME }}', 'Toronto')
  .replace('{{ DATE }}', new Date().toString())

describe('Upload', function() {
  it('Should upload a stylesheet', function() {
    this.timeout(10 * 1000)

    return login().then(jar => upload({
      type: 'stylesheet',
      pageOrImageName: 'test-stylesheet',
      fileName: path.resolve(__dirname, './files/test-stylesheet.css'),
      dir: path.resolve(__dirname, 'responses'),
      jar
    })).then((responseDetails) => {
      console.log('responseDetails: ', responseDetails)
    })
  })

  it('Should upload a script', function() {
    this.timeout(10 * 1000)

    return login().then(jar => upload({
      type: 'script',
      pageOrImageName: 'test-script',
      fileName: path.resolve(__dirname, './files/test-script.js'),
      dir: path.resolve(__dirname, 'responses'),
      jar
    })).then((responseDetails) => {
      console.log('responseDetails: ', responseDetails)
    })
  })

  it('Should upload a template', function() {
    this.timeout(10 * 1000)

    return login().then(jar => upload({
      type: 'template',
      pageOrImageName: 'test-template',
      fileName: path.resolve(__dirname, './files/test-template.html'),
      dir: path.resolve(__dirname, 'responses'),
      jar
    })).then((responseDetails) => {
      console.log('responseDetails: ', responseDetails)
    })
  })

  it('Should upload a page', function() {
    this.timeout(10 * 1000)

    return fs.readFileAsync(path.resolve(__dirname, './files/test-upload-undated.html'), 'utf-8')
      .then(content => fillVars(content))
      .then(content => fs.writeFileAsync(path.resolve(__dirname, './files/test-upload.html'), content))
      .then(() => login())
      .then(jar => upload({
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
