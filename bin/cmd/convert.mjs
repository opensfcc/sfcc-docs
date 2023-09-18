import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import markdownlint from 'markdownlint'
import path from 'path'
import turndownPluginGfm from 'turndown-plugin-gfm'
import TurndownService from 'turndown'

import { Glob } from 'glob'
import { minify } from 'html-minifier'
import { spawnSync } from 'child_process'

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
  filter: (node) => {
    return node.nodeName === 'TD' && node.classList.contains('description')
  },
  replacement: (content) => {
    return content.replace(/\n/g, ' ')
  },
})

// Add styling for Required Fields
turndownService.addRule('required', {
  filter: (node) => {
    return node.nodeName === 'STRONG' && node.classList.contains('description')
  },
  replacement: (content) => {
    return content.replace(/\n/g, ' ')
  },
})

export default (cli) => {
  // Get Version
  const version = getVersion(cli)

  debug(chalk.green.bold(`CONVERTING: v${version}`))

  // Setup Paths
  const markdownFolder = path.resolve(MARKDOWN_FOLDER, version)
  const prepFolder = path.resolve(PREP_FOLDER, version)

  // Make sure version is valid
  if (!prepFolder) {
    debug(chalk.red.bold(`✖ ERROR: ${version} prep folder missing.`))
    process.exit()
  }

  // Remove old prep folder for version if it exists
  if (fs.existsSync(markdownFolder)) {
    spawnSync('rm', ['-fr', markdownFolder])
  }

  // Recreate Markdown folder
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
      let markdown = turndownService.turndown(minify(html.toString(), { collapseWhitespace: true }))

      // Create new folder path
      let filePath = file.replace(prepFolder, markdownFolder)
      const folder = path.dirname(filePath)

      // Make Directory
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
      }

      // Add Front Matter for Markdown ( and escape single quotes )
      const mdTitle = `metaTitle: '${meta[metaKey].title.replace(/'/g, '&apos;')}'`
      const mdDescription = `metaDescription: '${meta[metaKey].description.replace(/'/g, '&apos;')}'`
      const mdKeywords = `metaKeywords: '${meta[metaKey].keywords.join(', ').replace(/'/g, '&apos;')}'`
      const prefix = `---\n${mdTitle}\n${mdDescription}\n${mdKeywords}\n---`

      const md = `${prefix}\n\n${markdown}\n`

      filePath = filePath.replace('.html', '.md')

      if (cli.verbose) {
        debug(chalk.dim('='.repeat(80)))
        debug(chalk.green('PROCESSING:'))
        debug('› OLD:', chalk.dim(file))
        debug('› NEW:', chalk.dim(filePath))
      }

      fs.writeFileSync(filePath, md)

      // Lint & Fix Markdown
      const results = markdownlint.sync({
        files: [filePath],
        config: {
          default: true,
          MD003: { style: 'atx' },
          MD007: { indent: 2 },
          'no-emphasis-as-header': false,
          'no-hard-tabs': false,
          whitespace: false,
          'line-length': false,
          'ul-indent': false,
        },
      })

      if (cli.verbose) {
        if (results[filePath].length === 0) {
          debug(chalk.green.bold('PERFECTION !!! (๑˃̵ᴗ˂̵)و '))
        } else {
          results[filePath].forEach((result) => {
            debug(chalk.yellow('LINT ERROR:'), chalk.dim(`Line ${result.lineNumber}: ${result.ruleDescription} ( ${result.errorDetail || result.errorContext} )`))
          })
        }
      }
    }
  } else {
    debug(chalk.red.bold(`✖ ERROR: Missing Data or Files`))
    process.exit(1)
  }

  debug(chalk.green.bold('✅ ALL DONE (๑˃̵ᴗ˂̵)و '))
}
