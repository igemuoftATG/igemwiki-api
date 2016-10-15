#!/usr/bin/env node

const cli = require('cli')
const igemwikiEntry = require('./index.js')

const program = process.argv[2]

const baseOptions = {
  year: [ 'y', 'Year to download pages from', 'int', new Date().getFullYear() ],
  teamName: [ 't', 'Team name', 'string', undefined ],
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
  }
}

// Check for valid sub program
if (Object.keys(programs).indexOf(program) === -1) {
  console.log(`Usage: igemwiki <program> [-h] where program is one of [ ${Object.keys(programs)} ]`)
  process.exit(1)
}
const subProgram = programs[program]

// Check for teamName
const options = cli.parse(Object.assign({}, baseOptions, subProgram.options))
const { year, teamName } = options

if (teamName === undefined) {
  console.log('Must provide a team name, use -t or --team')
  process.exit(1)
}

// Run sub program with igemwiki instance and options
subProgram.main(igemwikiEntry({ year, teamName }), options)

