import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import * as cheerio from 'cheerio'

import { Glob } from 'glob'
import { parse } from 'node-html-parser'
import { spawnSync } from 'child_process'

import { SUPPORTED_VERSIONS, VERSIONS_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:init')
const SEP = path.sep

export default (cli) => {
  if (cli.verbose) {
    debug(chalk.magenta.bold('CMD:'), 'init')
    debug(chalk.magenta.bold('VERSIONS:'), cli.version ? cli.version.split(',').join(', ') : 'All')
  }

  // Create versions folder if needed
  if (!fs.existsSync(VERSIONS_FOLDER)) {
    fs.mkdirSync(VERSIONS_FOLDER, {
      recursive: true,
    })
  }

  // Get current supported versions
  const versions = Object.keys(SUPPORTED_VERSIONS)

  // Track which versions we needed to download
  let downloaded = []

  // Download each version from our server if needed
  versions.forEach((version) => {
    // Check if we should skip this version
    if (cli.version && !cli.version.split(',').includes(version)) {
      if (cli.verbose) {
        debug(chalk.dim(`SKIPPING: ${version}`))
      }

      return
    }

    debug(chalk.green.bold(`INITIALIZING: v${version}`))

    // Check if we already have the version
    if (!fs.existsSync(`${VERSIONS_FOLDER}/${version}`)) {
      // Download ZIP files containing data
      debug('› Downloading')

      // NOTE: Here we are just downloading packaged versions to our machine.
      //       Our saved packages help avoid hitting SFCC servers too much.
      //       Auth headers prevent random bots from hitting our server.
      //       It is not to protect any data, this stuff was public.
      try {
        // Fetch Zip Files
        // prettier-ignore
        const response_code = spawnSync('curl', [
          '--silent', '--write-out', '%{response_code}',
          `https://docs.sfccdocs.com/${version}.zip`,
          '-H', `${atob('QXV0aG9yaXphdGlvbjogQmFzaWMgYzJaalkyUmxkbTl3Y3pwelptTmpMV1J2WTNNPQ==')}`,
          '-L', '-o', `${VERSIONS_FOLDER}/${version}.zip`
        ])

        // Check HTTP Response Code
        const http_response = response_code.stdout.toString()
        if (http_response !== '200') {
          debug(chalk.red.bold(`✖ ERROR: Download Failed for ${version} - Receive HTTP Error Code ${http_response}`))
          debug(chalk.red.bold(`✖        Receive HTTP Error Code ${http_response}`))
          process.exit(1)
        } else {
          // Extract Zip Files
          debug('› Unzipping')
          spawnSync('unzip', [`${VERSIONS_FOLDER}/${version}.zip`, '-d', VERSIONS_FOLDER])

          downloaded.push(version)
        }
      } catch (error) {
        debug(chalk.red.bold(`✖ ERROR: Download Failed for ${version}`))
        debug(chalk.red.bold(`✖        ${error.message}`))
        process.exit(1)
      }
    } else {
      debug(chalk.dim('✔ Already Downloaded'))
    }

    // Cleanup
    if (fs.existsSync(`${VERSIONS_FOLDER}/${version}.zip`)) {
      debug('› Removing Zip File')
      spawnSync('rm', [`${VERSIONS_FOLDER}/${version}.zip`])
    }
  })

  // Do some initial cleanup on the HTML files if we downloaded anything
  if (downloaded.length > 0) {
    debug(chalk.bold('CLEANING:'), `${downloaded.length === 1 ? 'Version' : 'Versions'} ${downloaded.join(', ')} ...${downloaded.length > 1 ? ' ( this may take a while )' : ''}`)

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
