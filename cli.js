#!/usr/bin/env node
'use strict'

const cli     = require('commander')
const Package = require('./package')
const ETool   = require('./etool')
const fs      = require('fs')


cli
  .description('Read and Write project info for e lang code file.')
  .usage('[options] <efile>')
  .version(Package.version)
  .option('-i, --input-json [file]', 'json file to read')
  .option('-o, --out-json [file]', 'json file to write')
  .option('-s, --save-to-file [file]', 'E lang file to write to')
  .option('-w, --write', 'save new value to e lang file')
  .option('-f, --read-json-fields [field, ...]', 'read fields from input json file')
  .option('-F, --write-json-fields [field, ...]', 'write fields to out json file')

  .option('-n, --name <value>', 'change project name')
  .option('-d, --description <value>', 'change project description')
  .option('-a, --author <value>', 'change project author')
  .option('-M, --major <n>', 'change major version number')
  .option('-m, --minor <n>', 'change minor version number')
  .option('-p, --patch <n>', 'change patch version number')
  .option('-d, --date <n>', 'change date version number')
  .option('-v, --ver <ver>', 'change project version number')
  .option('-f, --full-version <ver>', 'change full version number')
  .parse(process.argv)

  .on('--help', () => {
    const example = `
  Examples:

  > show project info:

    $ ${cli._name} file.e

  > output project info to json:

    $ ${cli._name} -o package.json file.e
    $ ${cli._name} -o package.json -F version,name,author file.ec

  > update project info:

    $ ${cli._name} -w -n "test project" -v 1.1.0 file.e
    $ ${cli._name} -w -n "test project" -v 1.1.0 -s new-file.e file.e
    $ ${cli._name} -w -i ./info.json -f version -s new-file.e file.e
    `
    console.log(example)

  })

const file = cli.args[0]

if (!file) {
  cli.help()
} else if (!fs.existsSync(file)) {
  console.log('------------------------')
  console.error('Error: File not exist!\n\nFile: "%s"', file)
  console.log('------------------------')
  cli.help()
}

const etool = new ETool(fs.readFileSync(file))
etool
  .on('error', e => {
    console.log('Error: ', e.message)
    process.exit(-1)
  })

const fields = 
  [
    'name',
    'description',
    'author',
    'major',
    'minor',
    'patch',
    'date',
    'ver',
    'version',
    'fullVersion',
  ]

fields.forEach(key => {
  if (cli[key] && typeof cli[key] !== 'function') {
    etool.user.data[key].value = cli[key]
  }
})


if (cli.inputJson) {
  let json       = readJson(cli.inputJson)
  let readFields = fields
  if (cli.readJsonFields) {
    const fields     = (cli.readJsonFields + '').split(',')
          readFields = fields.filter(key => fields.includes(key))
  }
  readFields.forEach(key => {
    if (key === 'version') {
      key = 'ver'
    }
    if (json.hasOwnProperty(key)) {
      cli[key] = json[key]
    }
  })
}

fields.forEach(key => {
  if (cli[key] && typeof cli[key] !== 'function') {
    if (key === 'ver') {
      etool.user.data['version'] = cli['ver']
    } else if (key === 'version') {
      return
    } else if (etool.user.data[key].value !== undefined) {
      etool.user.data[key].value = cli[key]
    } else if (etool.user.data.hasOwnProperty(key)) {
      etool.user.data[key] = cli[key]
    }
  }
})

const info = {
  name       : etool.user.data.name.value,
  description: etool.user.data.description.value,
  author     : etool.user.data.author.value,
  email      : etool.user.data.email.value,
  homepage   : etool.user.data.homepage.value,
  version    : etool.user.data.version,
  fullVersion: etool.user.data.fullVersion,
  major      : etool.user.data.major.value,
  minor      : etool.user.data.minor.value,
  patch      : etool.user.data.patch.value,
  date       : etool.user.data.date.value,
}

if (cli.outJson) {
  let json        = readJson(cli.outJson)
  let writeFields = fields
  if (cli.writeJsonFields) {
    const fields      = (cli.writeJsonFields + '').split(',')
          writeFields = fields.filter(key => fields.includes(key))
  }
  writeFields.forEach(key => {
    if (key === 'ver') {
      key = 'version'
    }
    if (info.hasOwnProperty(key)) {
      json[key] = info[key]
    }
  })
  try {
    fs.writeFileSync(cli.outJson, JSON.stringify(json, null, 2))
  } catch (e) {
    console.log('Write to json file error: ', e.message)
  }
}

if (cli.write) {
  const newFile = cli.saveToFile || file
  try {
    const newBuf = etool.save()
    fs.writeFileSync(newFile, newBuf)
  } catch (e) {
    console.log('Write to E lang file error: ', e.message)
  }
}


let showFields = fields
if (cli.writeJsonFields) {
  const fields     = (cli.writeJsonFields + '').split(',')
        showFields = fields.filter(key => fields.includes(key))
}
const json = {}
showFields.map(key => {
  if (key === 'ver') {
    key = 'version'
  }
  if (info[key]) {
    json[key] = info[key]
  }
})
if (Object.keys(json).length > 0) {
  console.log(json)
}

function readJson(file) {
  let json = {}
  try {
    json = require(file)
  } catch (e) {
  }
  return json
}
