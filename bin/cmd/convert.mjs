import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import markdownlint from 'markdownlint'
import path from 'path'
import turndownPluginGfm from 'turndown-plugin-gfm'
import TurndownService from 'turndown'

import { Glob } from 'glob'

import { getVersion } from '../utils.mjs'
import { DATA_FOLDER, MARKDOWN_FOLDER, PREP_FOLDER } from '../config.mjs'

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
  // Get Version
  let version = getVersion(cli)

  debug(chalk.green.bold(`CONVERTING: v${version}`))

  // Setup Paths
  const markdownFolder = path.resolve(MARKDOWN_FOLDER, version)
  const prepFolder = path.resolve(PREP_FOLDER, version)

  // Make sure version is valid
  if (!prepFolder) {
    debug(chalk.red.bold(`✖ ERROR: ${version} prep folder missing.`))
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
      if (cli.verbose) {
        debug(chalk.dim('='.repeat(80)))
        debug(chalk.green('PROCESSING:'), file.replace(prepFolder, ''))
      }

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

      // Add Front Matter for Markdown ( and escape single quotes )
      const mdTitle = `title: '${meta[metaKey].title.replace(/'/g, '&apos;')}'`
      const mdDescription = `description: '${meta[metaKey].description.replace(/'/g, '&apos;')}'`
      const mdKeywords = `keywords: '${meta[metaKey].keywords.join(', ').replace(/'/g, '&apos;')}'`
      const prefix = `---\n${mdTitle}\n${mdDescription}\n${mdKeywords}\n---`

      const md = `${prefix}\n\n${markdown}`

      filePath = filePath.replace('.html', '.md')
      fs.writeFileSync(filePath, md)

      // Lint & Fix Markdown
      const result = markdownlint.sync({
        files: [filePath],
      })

      if (cli.verbose) {
        if (result[filePath].length === 0) {
          debug(chalk.green.bold('PERFECTION !!! (๑˃̵ᴗ˂̵)و '))
        } else {
          result[filePath].forEach((error) => {
            debug(chalk.yellow('LINT ERROR:'), chalk.dim(`Line ${error.lineNumber}: ${error.ruleDescription} ( ${error.errorDetail || error.errorContext} )`))
          })
        }
      }
    }
  } else {
    debug(chalk.red.bold(`✖ ERROR: Missing Data or Files`))
    process.exit(1)
  }

  /*
    sfcc-docs:convert     {
  sfcc-docs:convert       lineNumber: 119,
  sfcc-docs:convert       ruleNames: [Array],
  sfcc-docs:convert       ruleDescription: 'Files should end with a single newline character',
  sfcc-docs:convert       ruleInformation: 'https://github.com/DavidAnson/markdownlint/blob/v0.30.0/doc/md047.md',
  sfcc-docs:convert       errorDetail: null,
  sfcc-docs:convert       errorContext: null,
  sfcc-docs:convert       errorRange: [Array],
  sfcc-docs:convert       fixInfo: [Object]
  sfcc-docs:convert     }
  */

  debug(chalk.green.bold('✅ ALL DONE (๑˃̵ᴗ˂̵)و '))
}
