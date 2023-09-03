import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'
import turndownPluginGfm from 'turndown-plugin-gfm'
import TurndownService from 'turndown'

import { Glob } from 'glob'

import { DATA_FOLDER, MARKDOWN_FOLDER, PREP_FOLDER, SUPPORTED_VERSIONS } from '../config.mjs'

const debug = Debug('sfcc-docs:convert')
const SEP = path.sep

// Setup Markdown Converter
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '*',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  linkReferenceStyle: 'full',
  br: '  ',
})

// Enable GFM Plugin
const gfm = turndownPluginGfm.gfm
turndownService.use(gfm)

// Add Rule for Tables
turndownService.addRule('td-description', {
  filter: (node, options) => {
    return node.nodeName === 'TD' && node.classList.contains('description')
  },
  replacement: (content) => {
    return content.replace(/\n/g, ' ')
  },
})

// Add Rule for Code
turndownService.addRule('code', {
  filter: (node) => {
    return node.nodeName === 'CODE'
  },
  replacement: (content) => {
    let syntax = 'javascript'
    let code = content.replace(/\n    /g, '\n')
    code = code.trim()

    if (code.startsWith('<')) {
      return '\n```html\n' + code + '\n```\n'
    } else if (code.startsWith('{')) {
      return '\n```json\n' + code + '\n```\n'
    } else if (/^[A-Z0-9]/i.test(code)) {
      syntax = 'text'
      return ' `' + code + '`'
    }

    return '\n```javascript\n' + code + '\n```\n'
  },
})

export default (cli) => {
  if (cli.verbose) {
    debug(chalk.magenta.bold('CMD:'), 'convert')
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

    debug(chalk.green.bold(`CONVERTING: v${version}`))

    const markdownFolder = path.resolve(`${MARKDOWN_FOLDER}${SEP}${version}`)
    const prepFolder = path.resolve(`${PREP_FOLDER}${SEP}${version}`)

    // Make sure version is valid
    if (!prepFolder) {
      process.exit()
    }

    // Make markdown folder if needed
    if (!fs.existsSync(markdownFolder)) {
      fs.mkdirSync(markdownFolder, { recursive: true })
    }

    const files = new Glob(`${prepFolder}${SEP}**${SEP}*.html`, {})
    const metaFile = path.resolve(DATA_FOLDER, `meta-${version}.json`)

    let meta, metaKeys, metaText

    // Make Data Directory if needed
    if (fs.existsSync(metaFile)) {
      metaText = fs.readFileSync(metaFile)
      meta = JSON.parse(metaText)
      metaKeys = Object.keys(meta)
    }

    // Make sure we have everything we need
    if (files && meta) {
      // Loop through the files
      for (const file of files) {
        let metaKey = file.replace(PREP_FOLDER, '')
        metaKey = metaKey.replace('.html', '').replace(`${SEP}deprecated${SEP}`, SEP).replace(`${SEP}${version}${SEP}`, SEP)

        const html = fs.readFileSync(file)

        // Remove HTML Title from Markdown
        turndownService.remove('title')

        // Generate Markdown from HTML
        const markdown = turndownService.turndown(html.toString())

        // Create new folder path
        let filePath = file.replace(prepFolder, markdownFolder)
        const folder = path.dirname(filePath)

        // Make Directory
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true })
        }

        const prefix = `---\ntitle: "${meta[metaKey].title}"\ndescription: "${meta[metaKey].description}"\nkeywords: "${meta[metaKey].keywords.join(', ')}"\n---`

        filePath = filePath.replace('.html', '.md')
        fs.writeFileSync(filePath, `${prefix}\n\n${markdown}`)
      }
    } else {
      debug(chalk.red.bold(`✖ ERROR: Missing Data or Files`))
      process.exit(1)
    }

    debug(chalk.dim(`✔ Complete`))
  })

  debug(chalk.green.bold('✅ ALL DONE (๑˃̵ᴗ˂̵)و '))
}
