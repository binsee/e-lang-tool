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
  .option('-o, --out-json [file]', 'json file to write')
  .option('-s, --save-to-file [file]', 'file to write to')
  .option('-w, --write', 'save new value to e lang file')
  .option('-n, --name <value>', 'change project name')
  .option('-d, --description <value>', 'change project description')
  .option('-a, --author <value>', 'change project author')
  .option('-M, --major <n>', 'change major version number')
  .option('-m, --minor <n>', 'change minor version number')
  .option('-p, --patch <n>', 'change patch version number')
  .option('-d, --date <n>', 'change date version number')
  .option('-v, --project-version <ver>', 'change project version number')
  .option('-f, --project-full-version <ver>', 'change full version number')
  .parse(process.argv)

  .on('--help', () => {
    const example = `
  Examples:

  > show project info:

    $ ${cli._name} file.e

  > output project info to json:

    $ ${cli._name} -o package.json file.e
    $ ${cli._name} -o package.json file.ec

  > update project info:

    $ ${cli._name} -w -n "test project" file.e
    $ ${cli._name} -w -n "test project" -v 1.1.0 file.e
    $ ${cli._name} -w -n "test project" -v 1.1.0 -s new-file.e file.e
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
  ]

fields.forEach(key => {
  if (cli[key] && typeof cli[key] !== 'function') {
    etool.user.data[key].value = cli[key]
  }
})

if (cli.projectVersion) {
  etool.user.data.version = cli.projectVersion
}
if (cli.projectFullVersion) {
  etool.user.data.fullVersion = cli.projectFullVersion
}

const info = {
  name       : etool.user.data.name.value,
  description: etool.user.data.description.value,
  author     : etool.user.data.author.value,
  email      : etool.user.data.email.value,
  homepage   : etool.user.data.homepage.value,
  version    : etool.user.data.version,
  fullVersion: etool.user.data.fullVersion,
  ver_major  : etool.user.data.major.value,
  ver_minor  : etool.user.data.minor.value,
  ver_patch  : etool.user.data.patch.value,
  ver_date   : etool.user.data.date.value,
}

if (cli.outJson) {
  let json = readJson(cli.outJson) || {}
      json = Object.assign({}, json, info)
  try {
    fs.writeFileSync(cli.outJson, JSON.stringify(json, null, 2))
  } catch (e) {
    console.log('Write file error: ', e.message)
  }
}

if (cli.write) {
  const newFile = cli.saveToFile || file
  try {
    const newBuf = etool.save()
    fs.writeFileSync(newFile, newBuf)
  } catch (e) {
    console.log('Write to file error: ', e.message)
  }
}

console.log(info)

function readJson(file) {
  let json = {}
  try {
    json = require(file)
  } catch (e) {
  }
  return json
}
