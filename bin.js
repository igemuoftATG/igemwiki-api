#!/usr/bin/env node

const path = require('path')
const fs = require('fs-promise')

const Promise = require('bluebird')
const cli = require('cli')
const globby = require('globby')
const yaml = require('js-yaml-promise')
const _ = require('lodash')

const igemwikiEntry = require('./index.js')

const program = process.argv[2]

const baseOptions = {
  year: [ 'y', 'Year to download pages from', 'int', new Date().getFullYear() ],
  team: [ 'n', 'Team name', 'string', undefined ],
  force: [ 'f', 'Force upload', 'bool', false ]
}

const makeDest = (type, source) => {
  source = path.basename(source)

  if (type === 'page' || type === 'template') {
    source = source.replace(/\.html$/, '')
  } else if (type === 'stylesheet') {
    source = source.replace(/\.css$/, '')
  } else if (type === 'script') {
    source = source.replace(/\.js$/, '')
  }

  return source
}

const programs = {
  backup: {
    options: {
      dir: [ 'd', 'Download directory', 'dir', './backups' ]
    },
    main(igemwiki, { dir }) {
      igemwiki.downloadAll({ dir })
        .then(results => console.log('Download results: ', results))
        .catch((err) => {
          console.error(err)
          process.exit(1)
        })
    }
  },
  upload: {
    options: {
      source: [ 's', 'Source file', 'string' ],
      dest: [ 'd', 'Destination', 'string' ],
      type: [ 't', 'Type (page, template, stylesheet, script, or image)', 'string' ]
    },
    main(igemwiki, { type, source, dest, force }) {
      igemwiki.login().then(jar => igemwiki.upload({
        jar,
        type,
        source,
        dest,
        force
      })).catch(console.error)
    }
  },
  ['upload-glob']: {
    options: {
      glob: [ 'g', 'Glob pattern for sources', 'string' ],
      type: [ 't', 'Type (page, template, stylesheet, script, or image)', 'string' ]
    },
    main(igemwiki, { glob, type, force }) {
      Promise.all([
        globby([ glob ])
          .then(files => files.map(file => ({
            type,
            source: file,
            dest: makeDest(type, file),
            force
          }))),
        igemwiki.login()
      ]).then(([ opts, jar ]) => opts.map(opt => Object.assign({}, opt, { jar })))
        .then(opts => Promise.map(opts, opt => igemwiki.upload(opt), { concurrency: 1 }))
        .then(() => console.log('Upload completed'))
        .catch(console.error)
    }
  },
  ['upload-conf']: {
    options: {
      conf: [ 'c', 'YAML configuration file', 'path' ],
      preview: [ 'p', 'Preview source/dest pairs before uploading', 'bool', false ]
    },
    main(igemwiki, { conf, preview, force }) {
      fs.readFile(conf, 'utf8')
        .then(string => yaml.safeLoad(string))
        // configuration is { templates: [...], pages: [...], stylesheets: [...], scripts: [...], images: [...] }
        // where each array is an array of Strings that are either
        // 1. a glob pattern
        // 2. a source:dest mapping
        // Reducer over config keys, building an object with same keys but where each value is the result of Promise.map
        .then(conf => Promise.reduce(Object.keys(conf), (obj, key, i) => {
          const arr = conf[key]
          const type = key.replace(/s$/, '')

          return Promise.map(arr, (val) => {
            if (val.indexOf(':') !== -1) {
              // explicit source:dest mapping
              const source = val.split(':')[0]
              const dest = val.split(':')[1]
              return Promise.resolve({
                explicit: {
                  type,
                  source,
                  dest,
                  force
                }
              })
            } else {
              // glob pattern
              return globby(val)
                .then(files => files.map(file => ({
                  type,
                  source: file,
                  dest: makeDest(type, file),
                  force
                })))
                .then(opt => ({ globbed: opt }))
            }
          })
          .then((results) => {
            // Results is an array of [ { globbed: [{ source, dest }] }, { explicit: { source, dest } } ]
            // Reduce into { globbed: [{ source, dest }], explicit: [{ source, dest }] }
            return results.reduce((obj, curr) => Object.assign({}, obj, {
              globbed: obj.globbed.concat(curr.globbed ? curr.globbed : []),
              explicit: obj.explicit.concat(curr.explicit ? [curr.explicit] : [])
            }), {
              globbed: [],
              explicit: []
            })
          })
          .then((results) => {
            // Take explicit mappings over globs for the same file.
            // Go over { globbed: [{ source, dest }], explicit: [{ source, dest }] }
            // and pop items from globbed with same source as a source in explicit
            results.explicit.forEach((opt) => {
              // List of indices from results.globbed to be removed
              const dups = []
              results.globbed.forEach((gOpt, i) => {
                if (gOpt.source === opt.source) {
                  dups.push(i)
                }
              })

              // Slice just up to and right after to the end for each duplicate index
              // array size decrease by 1 each time, so minus i from duplicate index
              // TODO make this less mutative?
              dups.forEach((dup, i) =>
                results.globbed = []
                  .concat(results.globbed.slice(0, dup - i))
                  .concat(results.globbed.slice(dup - i + 1, results.globbed.length))
              )
            })

            return results
          })
          .then(results => Object.keys(results).reduce((arr, key) => arr.concat(results[key]), []))
          .then(results => Object.assign({}, obj, {
            [Object.keys(conf)[i]]: results
          }))

        }, {}))
        // Resolve to current object if preview is on, else continue to upload everything
        .then(result => preview ? Promise.resolve(result) :
          Promise.all([
            Promise.resolve([]
              .concat(result.stylesheets)
              .concat(result.scripts)
              .concat(result.templates)
              .concat(result.pages)
              .concat(result.images)
            ),
            igemwiki.login()
          ])
          .then(([ opts, jar ]) => opts.map(opt => Object.assign({}, opt, { jar })))
          .then(opts => Promise.map(opts, opt => igemwiki.upload(opt), { concurrency: 1 }))
          .then(() => console.log('Upload completed'))
        )
        .then((result) => {
          if (preview) {
            const logItem = ({ type, source, dest }) => console.log(`[${type}] ${source} -> ${dest}`)

            Object.keys(result).forEach(key => result[key].forEach(logItem))
          }
        })
        .catch(console.error)
    }
  }
}

// Check for valid sub program
if (Object.keys(programs).indexOf(program) === -1) {
  console.log(`Usage: igemwiki <program> [-h] where program is one of [ ${Object.keys(programs)} ]`)
  process.exit(1)
}
const subProgram = programs[program]

// Check for team
const options = cli.parse(Object.assign({}, baseOptions, subProgram.options))
const { year, team } = options

if (team === undefined) {
  console.log('Must provide a team name, use -n or --team')
  process.exit(1)
}

// Run sub program with igemwiki instance and options
subProgram.main(igemwikiEntry({ year, teamName: team }), options)

