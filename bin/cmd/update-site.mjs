import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import { spawnSync } from 'child_process'

import { DATA_FOLDER, MARKDOWN_FOLDER, SUPPORTED_VERSIONS, SRC_JSON_FOLDER, SRC_PAGES_FOLDER, SRC_DATA_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:update-site')
const SEP = path.sep

export default (cli) => {
  if (cli.verbose) {
    debug(chalk.magenta.bold('CMD:'), 'update-site')
    debug(chalk.magenta.bold('VERSIONS:'), cli.version ? cli.version.split(',').join(', ') : 'All')
  }

  // Get current supported versions
  const versions = Object.keys(SUPPORTED_VERSIONS)

  let versionModules = ''

  // Loop through supported versions
  versions.forEach((version) => {
    // Check if we should skip this version
    if (cli.version && !cli.version.split(',').includes(version)) {
      if (cli.verbose) {
        debug(chalk.dim(`SKIPPING: ${version}`))
      }

      return
    }

    debug(chalk.green.bold(`UPDATING SITE: v${version}`))

    // Remove old version folder if it exists
    if (fs.existsSync(`${SRC_PAGES_FOLDER}${SEP}${version}`)) {
      spawnSync('rm', ['-fr', `${SRC_PAGES_FOLDER}${SEP}${version}`])
    }

    // Copy new version folder
    spawnSync('cp', ['-r', `${MARKDOWN_FOLDER}${SEP}${version}`, SRC_PAGES_FOLDER])

    // Create mew JSX friendly export
    const nav = fs.readFileSync(path.resolve(DATA_FOLDER, `nav-${version}.json`))

    versionModules = versionModules.concat(`
// Navigation for v${version}
const v${version.replace(/\./g, '_')} = ${nav}
    `)

    debug(chalk.dim(`✔ Complete`))
  })

  // Remove old version folder if it exists
  if (fs.existsSync(SRC_DATA_FOLDER)) {
    spawnSync('rm', ['-fr', SRC_DATA_FOLDER])
  }

  // Recreate it since it's gone
  if (!fs.existsSync(SRC_DATA_FOLDER)) {
    fs.mkdirSync(SRC_DATA_FOLDER, { recursive: true })
  }

  // Create Supported Versions JSON
  const supportedVersions = []

  Object.keys(SUPPORTED_VERSIONS).forEach((version) => {
    supportedVersions.push({
      name: `v${version}`,
      value: version,
      release: SUPPORTED_VERSIONS[version].release,
    })
  })

  const JSX_NAV = `/** THIS FILE IS AUTO GENERATED. DO NOT EDIT. */

${versionModules}

// prettier-ignore
const supportedVersions = {
  ${versions.map((version) => `'${version}': v${version.replace(/\./g, '_')},`).join('\n  ')}
}

export function getNavigation(version) {
  return supportedVersions[version]
}
`

  const JSX_VERSIONS = `/** THIS FILE IS AUTO GENERATED. DO NOT EDIT. */

export const versions = ${JSON.stringify(supportedVersions, null, 2)}

`

  // Copy supported versions to JSON
  fs.writeFileSync(path.resolve(SRC_DATA_FOLDER, 'navigation.jsx'), JSX_NAV)
  fs.writeFileSync(path.resolve(SRC_DATA_FOLDER, 'versions.jsx'), JSX_VERSIONS)

  debug(chalk.green.bold('✅ ALL DONE (๑˃̵ᴗ˂̵)و '))
}
