import { Glob } from 'glob'
import { parse } from 'node-html-parser'
import * as cheerio from 'cheerio'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import { DATA_FOLDER, PREP_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:update-links')
const SEP = path.sep

export default async (cli) => {
  debug('CMD: update-links', cli.version)

  // Make sure we have a version
  if (!cli.version) {
    debug(chalk.red.bold(`✖ ERROR: Please specify a version`))
    process.exit(1)
  }

  const versionFolder = path.resolve(`${PREP_FOLDER}${SEP}${cli.version}`)

  if (cli.verbose) {
    debug(`Loading HTML from ${versionFolder.replace(PREP_FOLDER, '.b2c-dev-doc')}`)
  }

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
    for await (const file of files) {
      if (cli.verbose) {
        debug(`LOADING: ${file.replace(PREP_FOLDER, '')}`)
      }

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
              updatedURL = `/${cli.version}${key}`
              return
            }
          })

          // Update the URL
          if (updatedURL) {
            if (cli.verbose) {
              debug(`UPDATING URL: ${url} => ${updatedURL}`)
            }
            link.setAttribute('href', updatedURL)
          }

          // Update hash if we had one
          if (!updatedURL && hash) {
            let updatedHash = hash.replace(/%20/g, '-').replace(/_/g, '-').replace('/', '').toLowerCase()

            if (updatedHash.startsWith('#category-')) {
              updatedHash = updatedHash.replace('category-', '')
              updatedHash = `${updatedHash}-category`

              if (cli.verbose) {
                debug(`UPDATING HASH: ${hash} => ${updatedHash}`)
              }
            }

            link.setAttribute('href', updatedHash)
          }
        }
      })

      // Save the new HTML
      fs.writeFileSync(file, dom.toString())
    }
  }
}
