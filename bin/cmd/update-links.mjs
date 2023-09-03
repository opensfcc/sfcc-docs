import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import * as cheerio from 'cheerio'

import { Glob } from 'glob'
import { parse } from 'node-html-parser'

import { DATA_FOLDER, PREP_FOLDER, SUPPORTED_VERSIONS } from '../config.mjs'

const debug = Debug('sfcc-docs:update-links')
const SEP = path.sep

export default (cli) => {
  if (cli.verbose) {
    debug(chalk.magenta.bold('CMD:'), 'update-links')
    debug(chalk.magenta.bold('VERSIONS:'), cli.version ? cli.version.split(',').join(', ') : 'All')
  }

  // Get current supported versions
  const versions = Object.keys(SUPPORTED_VERSIONS)

  // Loop through supported versions
  versions.forEach((version) => {
    // Check if we should skip this version
    if (cli.version && !cli.version.split(',').includes(version)) {
      if (cli.verbose) {
        debug(chalk.dim(`SKIPPING: ${version}`))
      }

      return
    }

    debug(chalk.green.bold(`UPDATING LINKS: v${version}`))

    const versionFolder = path.resolve(`${PREP_FOLDER}${SEP}${version}`)

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
                updatedURL = `/${version}${key}`
                return
              }
            })

            // Update the URL
            if (updatedURL) {
              link.setAttribute('href', updatedURL)
            }

            // Update hash if we had one
            if (!updatedURL && hash) {
              let updatedHash = hash.replace(/%20/g, '-').replace(/_/g, '-').replace('/', '').toLowerCase()

              if (updatedHash.startsWith('#category-')) {
                updatedHash = updatedHash.replace('category-', '')
                updatedHash = `${updatedHash}-category`
              }

              link.setAttribute('href', updatedHash)
            }
          }
        })

        // Save the new HTML
        fs.writeFileSync(file, dom.toString())
      }
    }

    debug(chalk.dim(`✔ Complete`))
  })

  debug(chalk.green.bold('✅ ALL DONE (๑˃̵ᴗ˂̵)و '))
}
