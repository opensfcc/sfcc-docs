import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import { parseDiff } from 'react-diff-view'
import { spawnSync } from 'child_process'

import { getVersion } from '../utils.mjs'
import { DATA_FOLDER, DIFF_FOLDER, MARKDOWN_FOLDER, SUPPORTED_VERSIONS, SRC_JSON_FOLDER, SRC_PAGES_FOLDER, SRC_DATA_FOLDER, PUBLIC_JSON_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:update-site')

export default (cli) => {
  // Get Version
  const version = getVersion(cli)

  debug(chalk.green.bold(`UPDATING SITE: v${version}`))

  // Copy new version folder
  spawnSync('cp', ['-R', path.join(MARKDOWN_FOLDER, version, '/*'), SRC_PAGES_FOLDER], { shell: true })

  // Load JSON file to process diffs
  const mappingFile = path.resolve(DATA_FOLDER, 'mapping.json')
  const diffsFile = path.resolve(DATA_FOLDER, 'diffs.json')

  let mapping, mappingKeys, mappingText
  let diffs, diffsKeys, diffsText

  // Load Mapping Data
  if (fs.existsSync(mappingFile)) {
    mappingText = fs.readFileSync(mappingFile)
    mapping = JSON.parse(mappingText)
    mappingKeys = Object.keys(mapping)
  } else {
    debug(chalk.red.bold(`✖ ERROR: ${version} mapping data missing.`))
    process.exit()
  }

  // Load Diff Data
  if (fs.existsSync(diffsFile)) {
    diffsText = fs.readFileSync(diffsFile)
    diffs = JSON.parse(diffsText)
    diffsKeys = Object.keys(diffs)
  } else {
    debug(chalk.red.bold(`✖ ERROR: ${version} diff data missing.`))
    process.exit()
  }

  // Remove old version folder if it exists
  if (fs.existsSync(SRC_DATA_FOLDER)) {
    spawnSync('rm', ['-fr', SRC_DATA_FOLDER])
  }

  // Recreate it since it's gone
  if (!fs.existsSync(SRC_DATA_FOLDER)) {
    fs.mkdirSync(SRC_DATA_FOLDER, { recursive: true })
  }

  // Recreate it since it's gone
  if (!fs.existsSync(SRC_JSON_FOLDER)) {
    fs.mkdirSync(SRC_JSON_FOLDER, { recursive: true })
  }

  // Remove old version folder if it exists
  if (fs.existsSync(PUBLIC_JSON_FOLDER)) {
    spawnSync('rm', ['-fr', PUBLIC_JSON_FOLDER])
  }

  // Recreate it since it's gone
  if (!fs.existsSync(PUBLIC_JSON_FOLDER)) {
    fs.mkdirSync(PUBLIC_JSON_FOLDER, { recursive: true })
  }

  // Loop through the diffs and update the links
  let mappedDiffs = {}
  diffsKeys.forEach((key) => {
    mappingKeys.forEach((map) => {
      if (key === mapping[map]) {
        mappedDiffs[map] = diffs[key]
        mappedDiffs[map].forEach((change, idx) => {
          if (change.diff) {
            const diffFile = fs.readFileSync(path.resolve(DIFF_FOLDER, change.diff))
            const diffObj = parseDiff(diffFile.toString())
            const exportFile = path.resolve(PUBLIC_JSON_FOLDER, change.diff.toLowerCase().replace('.diff', '.json'))
            change.file = exportFile.replace(PUBLIC_JSON_FOLDER, '').replace('/', '/json/')
            const JSX_DIFF = JSON.stringify(diffObj, null, 2)
            fs.writeFileSync(exportFile, JSX_DIFF)
            delete mappedDiffs[map][idx].diff
          }
        })
      }
    })
  })

  // Grab some generated JSON files so we can export them as JSX
  const nav = fs.readFileSync(path.resolve(DATA_FOLDER, `nav-${version}.json`))
  const meta = fs.readFileSync(path.resolve(DATA_FOLDER, `meta-${version}.json`))

  // Create mew JSX friendly export
  const JSX_DIFFS = `export const diffs = ${JSON.stringify(mappedDiffs, null, 2)}`
  const JSX_NAV = `export const navigation = ${nav}`
  const JSX_VERSIONS = `export const currentVersion = '${version}'\n\nexport const versions = ${JSON.stringify(SUPPORTED_VERSIONS, null, 2)}`

  const JSX_META = `export const meta = ${meta}

export function getMeta(key, deprecated) {
  let metaKey = deprecated ? key.replace('/deprecated/', '/') : key

  return meta[metaKey]
}
`

  // Copy supported versions to JSON
  fs.writeFileSync(path.resolve(SRC_DATA_FOLDER, 'diffs.jsx'), JSX_DIFFS)
  fs.writeFileSync(path.resolve(SRC_DATA_FOLDER, 'meta.jsx'), JSX_META)
  fs.writeFileSync(path.resolve(SRC_DATA_FOLDER, 'navigation.jsx'), JSX_NAV)
  fs.writeFileSync(path.resolve(SRC_DATA_FOLDER, 'versions.jsx'), JSX_VERSIONS)

  debug(chalk.green.bold('✅ ALL DONE (๑˃̵ᴗ˂̵)و '))
}
