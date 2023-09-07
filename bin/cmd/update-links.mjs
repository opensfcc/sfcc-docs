import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import * as cheerio from 'cheerio'

import { Glob } from 'glob'
import { parse } from 'node-html-parser'

import { getVersion } from '../utils.mjs'
import { DATA_FOLDER, PREP_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:update-links')
const SEP = path.sep

export default (cli) => {
  // Get Version
  let version = getVersion(cli)

  debug(chalk.green.bold(`UPDATING LINKS: v${version}`))

  const versionFolder = path.resolve(PREP_FOLDER, version)

  // Make sure version is valid
  if (!versionFolder) {
    process.exit()
  }

  const files = new Glob(`${versionFolder}${SEP}**${SEP}*.html`, {})
  const mappingFile = path.resolve(DATA_FOLDER, 'mapping.json')

  let mapping, mappingKeys, mappingText

  // Load Mapping Data
  if (fs.existsSync(mappingFile)) {
    mappingText = fs.readFileSync(mappingFile)
    mapping = JSON.parse(mappingText)
    mappingKeys = Object.keys(mapping)
  }

  // Make sure we have everything we need
  if (files && mapping) {
    // Loop through the files
    for (const file of files) {
      // Get the HTML from the file
      let html = fs.readFileSync(file)
      let $ = cheerio.load(html, { useHtmlParser2: true })
      let dom = parse($.html())

      if (cli.verbose) {
        debug(chalk.dim('='.repeat(80)))
        debug(chalk.green('PROCESSING:'))
        debug('› FILE:', chalk.dim(file))
      }

      // Loop through all the links
      dom.querySelectorAll('a').forEach((link) => {
        // Get the href
        let href = link.getAttribute('href')
        let parts = []
        let url, hash

        // Make sure we have a href
        if (href) {
          // Split the URL and Hash based on where it is
          if (href.startsWith('#')) {
            hash = href
          } else if (href.includes('#')) {
            parts = href.split('#')
            url = parts[0]
            hash = parts[1]
          } else {
            url = href
          }

          // Get Mapped URL
          let updatedURL = null
          mappingKeys.forEach((key) => {
            if (mapping[key] === url) {
              updatedURL = key
              return
            }
          })

          // Update the URL
          if (updatedURL && url !== updatedURL) {
            if (cli.verbose) {
              debug('› URL:', chalk.dim(url), '=>', chalk.dim(updatedURL))
            }

            link.setAttribute('href', updatedURL)
          }

          // Update hash if we had one
          if (!updatedURL && hash) {
            let updatedHash = `#${link.innerText.replace(/%20/g, '-').replace(/_/g, '-').replace('/', '').toLowerCase()}`

            if (hash !== updatedHash) {
              if (cli.verbose) {
                debug('› HASH:', chalk.dim(hash), '=>', chalk.dim(updatedHash))
              }

              link.setAttribute('href', updatedHash)
            }
          }
        }
      })

      // Save the new HTML
      fs.writeFileSync(file, dom.toString())
    }
  }

  debug(chalk.green.bold('✅ ALL DONE (๑˃̵ᴗ˂̵)و '))
}
