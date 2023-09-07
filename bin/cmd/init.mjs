import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import * as cheerio from 'cheerio'

import { Glob } from 'glob'
import { parse } from 'node-html-parser'
import { spawnSync } from 'child_process'

import { DATA_FOLDER, DIFF_FOLDER, MARKDOWN_FOLDER, PREP_FOLDER, SRC_DATA_FOLDER, SUPPORTED_VERSIONS_FILE, SUPPORTED_VERSIONS, VERSIONS_FOLDER } from '../config.mjs'
import { downloadExternalFile } from '../utils.mjs'

const debug = Debug('sfcc-docs:init')
const SEP = path.sep

export default (cli) => {
  if (cli.verbose) {
    debug(chalk.magenta.bold('CMD:'), 'init')
    debug(chalk.magenta.bold('VERSIONS:'), 'All')
  }

  // Make all the folders we're going to need
  if (!fs.existsSync(DATA_FOLDER)) fs.mkdirSync(DATA_FOLDER, { recursive: true })
  if (!fs.existsSync(DIFF_FOLDER)) fs.mkdirSync(DIFF_FOLDER, { recursive: true })
  if (!fs.existsSync(MARKDOWN_FOLDER)) fs.mkdirSync(MARKDOWN_FOLDER, { recursive: true })
  if (!fs.existsSync(PREP_FOLDER)) fs.mkdirSync(PREP_FOLDER, { recursive: true })
  if (!fs.existsSync(VERSIONS_FOLDER)) fs.mkdirSync(VERSIONS_FOLDER, { recursive: true })
  if (!fs.existsSync(SRC_DATA_FOLDER)) fs.mkdirSync(SRC_DATA_FOLDER, { recursive: true })

  // Get current supported versions
  let versions = SUPPORTED_VERSIONS

  // Download latest supported versions data
  if (!SUPPORTED_VERSIONS) {
    debug('Downloading Supported Versions Data...')

    if (downloadExternalFile('supported.json', SUPPORTED_VERSIONS_FILE)) {
      // Read File into variable
      const supportedVersionsFile = fs.readFileSync(SUPPORTED_VERSIONS_FILE, 'utf8')
      versions = JSON.parse(supportedVersionsFile)
    }
  } else {
    debug(chalk.green('✔ Supported Versions Already Downloaded'))
  }

  // Check if we have any versions
  if (!versions) {
    debug(chalk.red.bold('✖ ERROR: Unable to download supported versions data'))
    process.exit(1)
  }

  // Create versions folder if needed
  if (!fs.existsSync(VERSIONS_FOLDER)) {
    fs.mkdirSync(VERSIONS_FOLDER, {
      recursive: true,
    })
  }

  // Track which versions we needed to download
  let downloaded = []

  // Download each version from our server if needed
  versions.forEach((version) => {
    debug(chalk.green.bold(`INITIALIZING: v${version.value}`))

    // Check if we already have the version
    if (!fs.existsSync(path.resolve(VERSIONS_FOLDER, version.value))) {
      // Download ZIP files containing data
      debug('› Downloading')

      if (downloadExternalFile(`${version.value}.zip`, path.resolve(VERSIONS_FOLDER, `${version.value}.zip`))) {
        // Extract Zip Files
        debug('› Unzipping')
        spawnSync('unzip', [`${path.resolve(VERSIONS_FOLDER, `${version.value}.zip`)}`, '-d', VERSIONS_FOLDER])

        downloaded.push(version.value)
      }
    } else {
      debug(chalk.dim('✔ Already Downloaded'))
    }

    // Cleanup
    if (fs.existsSync(path.resolve(VERSIONS_FOLDER, `${version.value}.zip`))) {
      debug('› Removing Zip File')
      spawnSync('rm', [path.resolve(VERSIONS_FOLDER, `${version.value}.zip`)])
    }
  })

  // Do some initial cleanup on the HTML files if we downloaded anything
  if (downloaded.length > 0) {
    debug(chalk.bold('CLEANING:'), `${downloaded.length} ${downloaded.length === 1 ? 'Version' : 'Versions ( this may take a while )'}`)

    // Get all HTML Files in Versions Folder
    const files = new Glob(`${VERSIONS_FOLDER}${SEP}**${SEP}*.html`, {})

    // Loop through HTML files
    for (const file of files) {
      // We can skip this file if it is not in one of the downloaded versions
      const fileVersion = file.replace(VERSIONS_FOLDER, '').split(SEP)[1]
      if (!downloaded.includes(fileVersion)) {
        continue
      }

      // Run Tidy on the file so DIFF's look better
      spawnSync('tidy', ['--tidy-mark', 'no', '-m', '-i', '-w', 0, file, '-errors'])

      // Read old file into memory so we can grab group info for sorting
      let html = fs.readFileSync(file)
      let $ = cheerio.load(html, { useHtmlParser2: true })
      let dom = parse($.html())

      // Remove stuff that is going to break our diffs
      dom.querySelectorAll('div:empty, link, script, meta, div.banner, div.copyright, img').forEach((x) => {
        x.remove()
      })

      // Write new HTML file back out after cleaning
      fs.writeFileSync(file, dom.toString())
    }
  }

  debug(chalk.green.bold('✅ ALL DONE (๑˃̵ᴗ˂̵)و '))
}
