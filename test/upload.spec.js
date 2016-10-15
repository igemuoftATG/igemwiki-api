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
  describe('Page', function() {
    it('Should upload a page', function() {
      this.timeout(10 * 1000)

      return login().then(jar => upload({
        type: 'stylesheet',
        dest: 'test-stylesheet',
        source: path.resolve(__dirname, './files/test-stylesheet.css'),
        dir: path.resolve(__dirname, 'responses'),
        jar,
        force: true
      })).then((responseDetails) => {
        assert.isOk(responseDetails.status === 'uploaded')
      })
    })

    it('Should skip uploading an existing page', function() {
      this.timeout(10 * 1000)

      return login().then(jar => upload({
        type: 'stylesheet',
        dest: 'test-stylesheet',
        source: path.resolve(__dirname, './files/test-stylesheet.css'),
        dir: path.resolve(__dirname, 'responses'),
        jar
      })).then((responseDetails) => {
        assert.isOk(responseDetails.status === 'skipped')
      })
    })
  })

  describe('Images', function() {
    it('Should upload an image', function() {
      this.timeout(30 * 1000)

      return login().then(jar => upload({
        type: 'image',
        dest: 'igem-logo.png',
        source: path.resolve(__dirname, './files/igem-logo.png'),
        dir: path.resolve(__dirname, 'responses'),
        jar,
        force: true
      })).then((responseDetails) => {
        assert.isOk(responseDetails.status === 'uploaded')
      })
    })

    it('Should skip uploading an image that exists', function() {
      this.timeout(10 * 1000)

      return login().then(jar => upload({
        type: 'image',
        dest: 'igem-logo.png',
        source: path.resolve(__dirname, './files/igem-logo.png'),
        dir: path.resolve(__dirname, 'responses'),
        jar
      })).then((responseDetails) => {
        assert.isOk(responseDetails.status === 'skipped')
      })
    })

    it('Should upload a high resolution image', function() {
      this.timeout(10 * 1000)

      return login().then(jar => upload({
        type: 'image',
        dest: 'abstract-cells.jpg',
        source: path.resolve(__dirname, './files/abstract-cells.jpg'),
        dir: path.resolve(__dirname, 'responses'),
        force: true,
        jar
      })).then((responseDetails) => {
        // assert.isOk(responseDetails.status === 'skipped')
        assert.isOk(responseDetails.status === 'uploaded')
      })
    })
  })

  describe('Full page and assets', function() {
    it('Should upload a stylesheet', function() {
      this.timeout(10 * 1000)

      return login().then(jar => upload({
        type: 'stylesheet',
        dest: 'test-stylesheet',
        source: path.resolve(__dirname, './files/test-stylesheet.css'),
        dir: path.resolve(__dirname, 'responses'),
        jar
      })).then((responseDetails) => {
        assert.isOk(responseDetails.status === 'skipped')
      })
    })

    it('Should upload a script', function() {
      this.timeout(10 * 1000)

      return login().then(jar => upload({
        type: 'script',
        dest: 'test-script',
        source: path.resolve(__dirname, './files/test-script.js'),
        dir: path.resolve(__dirname, 'responses'),
        jar
      })).then((responseDetails) => {
        assert.isOk(responseDetails.status === 'skipped')
      })
    })

    it('Should upload a template', function() {
      this.timeout(10 * 1000)

      return login().then(jar => upload({
        type: 'template',
        dest: 'test-template',
        source: path.resolve(__dirname, './files/test-template.html'),
        dir: path.resolve(__dirname, 'responses'),
        jar
      })).then((responseDetails) => {
        assert.isOk(responseDetails.status === 'skipped')
      })
    })

    it('Should upload a page that uses a stylesheet, script, and template', function() {
      this.timeout(10 * 1000)

      return fs.readFileAsync(path.resolve(__dirname, './files/test-upload-undated.html'), 'utf-8')
      .then(content => fillVars(content))
      .then(content => fs.writeFileAsync(path.resolve(__dirname, './files/test-upload.html'), content))
      .then(() => login())
      .then(jar => upload({
        type: 'page',
        dest: 'test-upload',
        source: path.resolve(__dirname, './files/test-upload.html'),
        dir: path.resolve(__dirname, 'responses'),
        jar
      })).then((responseDetails) => {
        assert.isOk(responseDetails.status === 'uploaded')
      })
    })
  })
})

