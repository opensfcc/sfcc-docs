// TODO: Move this to CLI and delete file

import fs from 'fs'
import { Glob } from 'glob'
import TurndownService from 'turndown'
import turndownPluginGfm from 'turndown-plugin-gfm'
import { fileURLToPath } from 'url'
import path from 'path'
import ora from 'ora'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const HTML_FOLDER = path.resolve(__dirname, 'clean')
const MARKDOWN_FOLDER = path.resolve(__dirname, 'markdown')
const META_FILE = path.resolve(__dirname, 'data/meta.json')

const files = new Glob(`${HTML_FOLDER}/**/*.html`, {})
const gfm = turndownPluginGfm.gfm

const metaText = fs.readFileSync(META_FILE)
const meta = JSON.parse(metaText)
const metaKeys = Object.keys(meta)

// Create Markdown Folder if Missing
if (!fs.existsSync(MARKDOWN_FOLDER)) {
  fs.mkdirSync(MARKDOWN_FOLDER)
}

let count = 0
let total = 0
for await (const file of files) {
  total++
}

let percent = 0
const spinner = ora('HTML => MD: 0% Complete').start()

for await (const file of files) {
  count++
  percent = Math.round((count / total) * 100)

  let metaKey = file.replace(`${__dirname}/clean`, '')
  metaKey = metaKey.replace('.html', '')

  spinner.text = `HTML => MD: ${percent}% Complete | FILE: ${metaKey}`
  spinner.render()

  try {
    if (fs.existsSync(file)) {
      // DO THE THING
      let html = fs.readFileSync(file)
      var turndownService = new TurndownService()
      turndownService.use(gfm)

      // Convert .className to H1
      turndownService.addRule('h1', {
        filter: (node, options) => {
          return node.nodeName === 'DIV' && node.classList.contains('className')
        },
        replacement: (content) => {
          return '# ' + content
        },
      })

      // Convert .className to H1
      turndownService.addRule('h2', {
        filter: (node, options) => {
          return node.nodeName === 'DIV' && node.classList.contains('header')
        },
        replacement: (content) => {
          return '## ' + content
        },
      })

      turndownService.addRule('param-title', {
        filter: (node, options) => {
          return node.nodeName === 'SPAN' && node.classList.contains('parameterTitle')
        },
        replacement: (content) => {
          return '`' + content + '`'
        },
      })

      turndownService.addRule('param-details', {
        filter: (node, options) => {
          return node.nodeName === 'DIV' && node.classList.contains('parameterDetail')
        },
        replacement: (content) => {
          return ' _' + content + '_\n'
        },
      })

      turndownService.addRule('description', {
        filter: (node, options) => {
          return node.nodeName === 'DIV' && node.classList.contains('description')
        },
        replacement: (content) => {
          let text = content.replace(/\b[A-Z][A-Z0-9_-]{2,}\b/g, '`$&`')
          text = text.replace(/^\n\n/, '')
          return '\n> ' + text
        },
      })

      turndownService.addRule('td-description', {
        filter: (node, options) => {
          return node.nodeName === 'TD' && node.classList.contains('description')
        },
        replacement: (content) => {
          return content.replace(/\n/g, ' ')
        },
      })

      turndownService.addRule('code', {
        filter: (node, options) => {
          return node.nodeName === 'PRE'
        },
        replacement: (content) => {
          let code = content.replace(/\n    /g, '\n')
          code = code.trim()
          return '\n```javascript\n' + code + '\n```\n'
        },
      })

      // Generate Markdown from HTML
      var markdown = turndownService.turndown(html.toString())

      // Create new folder path
      let filePath = file.replace(HTML_FOLDER, MARKDOWN_FOLDER)
      const folder = path.dirname(filePath)

      // Make Directory
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
      }

      const prefix = `---\ntitle: "${meta[metaKey].meta.title}"\ndescription: "${
        meta[metaKey].meta.description
      }"\nkeywords: "${meta[metaKey].meta.keywords.join(', ')}"\n---`

      filePath = filePath.replace('.html', '.md')
      fs.writeFileSync(filePath, `${prefix}\n\n${markdown}`)
    }
  } catch (err) {
    console.log(`ERROR: ${file}`)
    console.error(err)
  }
}

console.log('\nAll Done!')
process.exit(0)
