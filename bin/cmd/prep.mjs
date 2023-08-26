import chalk from 'chalk'
import Debug from 'debug'
import path from 'path'
import fs from 'fs'
import * as cheerio from 'cheerio'

import { Glob } from 'glob'
import { minify } from 'html-minifier-terser'
import { parse } from 'node-html-parser'
import { spawnSync } from 'child_process'

import { isHelpfulFile, getVersionFolder, prepURI } from '../utils.mjs'
import { DOCS_FOLDER, PREP_FOLDER, VERSIONS_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:prep')

export default async (cli) => {
  // Make sure we have a version
  if (!cli.version) {
    debug(chalk.red.bold(`✖ ERROR: Please specify a version`))
    process.exit(1)
  }

  const versionFolder = getVersionFolder(cli.version, VERSIONS_FOLDER)
  debug(`Loading HTML from ${versionFolder.replace(DOCS_FOLDER, '.b2c-dev-doc')}`)

  // Make sure version is valid
  if (!versionFolder) {
    process.exit()
  }

  // Remove old prep folder for version if it exists
  if (fs.existsSync(`${PREP_FOLDER}/${cli.version}`)) {
    spawnSync('rm', ['-fr', `${PREP_FOLDER}/${cli.version}`])
  }

  const files = new Glob(`${versionFolder}/**/*.html`, {})

  // Now do the actual work
  for await (const file of files) {
    // Make sure HTML file contains content that is helpful
    if (!isHelpfulFile(file)) {
      debug(chalk.gray(`SKIPPING: ${file.replace(DOCS_FOLDER, '')}`))
      continue
    }

    // Set a new file name for prepped HTML file
    const newFile = prepURI(file, cli.version)

    // Set new file path
    let newFilePath = `${DOCS_FOLDER}${newFile}`

    // Set new folder path
    let folder = path.dirname(newFilePath)

    // Make Directory if needed
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }

    debug(chalk.green(`PREPPING: ${file.replace(DOCS_FOLDER, '')} => ${newFilePath.replace(DOCS_FOLDER, '')}`))

    // Copy file to new location
    spawnSync('cp', ['-fi', file, newFilePath])

    // Run TIDY on new HTML file ( this is required because some of the HTML is ... not great )
    spawnSync('tidy', ['--tidy-mark', 'no', '-m', '-w', 0, newFilePath, '-errors'])

    // Read new HTML file we just tidy'd up so we can parse it and make changes
    let html = fs.readFileSync(newFilePath)
    let $ = cheerio.load(html, { useHtmlParser2: true })
    let dom = parse($.html())

    // Check if this file indicates is is deprecated and relocate it
    if (dom.querySelector('div.className.dep')) {
      const oldPath = newFilePath

      // Delete the current file
      spawnSync('rm', ['-f', newFilePath])

      // Change the file name to indicate it is deprecated
      newFilePath = newFilePath.replace(`/${cli.version}/`, `/${cli.version}/deprecated/`)

      // Update new folder path
      let folder = path.dirname(newFilePath)

      // Make Directory if needed
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
      }

      debug(chalk.red(`DEPRECATED: ${oldPath.replace(DOCS_FOLDER, '')} => ${newFilePath.replace(DOCS_FOLDER, '')}`))
    }

    // Remove body attributes
    dom.querySelector('body').removeAttribute('onload')

    // Remove elements that are not helpful for search indexer of markdown conversion
    dom.querySelectorAll('div:empty, a:empty, link, script, meta, div.copyright, div.banner, img').forEach((x) => {
      x.remove()
    })

    // Remove last HR
    const hr = dom.querySelector('div.section:last-of-type hr:last-of-type')
    if (hr) {
      hr.remove()
    }

    // Generate H1 Tags
    const h1 = dom.querySelectorAll('div.className')
    if (h1) {
      h1.forEach((x) => {
        x.tagName = 'h1'
      })
    }

    // Generate H2 Tags
    const h2 = dom.querySelectorAll('div.section div.header')
    if (h2) {
      h2.forEach((x) => {
        x.tagName = 'h2'
      })
    }

    // Generate H3 Tags
    const h3 = dom.querySelectorAll('div.section div.subHeader, div.detailName')
    if (h3) {
      h3.forEach((x) => {
        x.tagName = 'h3'
      })
    }

    // Generate H4 Tags
    const h4 = dom.querySelectorAll('div.summaryItem span.parameterTitle')
    if (h4) {
      h4.forEach((x) => {
        x.tagName = 'h4'
      })
    }

    // Generate Description Blockquote Tags
    const description = dom.querySelectorAll('div.topLevelDescription, div.description')
    if (description) {
      description.forEach((x) => {
        x.tagName = 'blockquote'
      })
    }

    // Convert list elements to list
    const list = dom.querySelectorAll('div.parameters')
    if (list) {
      list.forEach((x) => {
        x.tagName = 'ul'
      })
    }

    // Covert elements to bold
    const bold = dom.querySelectorAll('span.emphasis')
    if (bold) {
      bold.forEach((x) => {
        x.tagName = 'strong'
      })
    }

    // Covert elements to code
    const code = dom.querySelectorAll('div.parameterDetail')
    if (code) {
      code.forEach((x) => {
        x.tagName = 'code'
      })
    }

    // Fix Hierarchy
    const hierarchy = dom.querySelector('div.hierarchy')
    if (hierarchy) {
      hierarchy.tagName = 'ul'
    }

    // Convert Hierarchy to proper nested set of ULs ( everything in original code was on the same level with CSS styling to indent )
    const hierarchyItem = dom.querySelectorAll('ul.hierarchy div')
    if (hierarchy && hierarchyItem) {
      let $ul = $(hierarchy[0])

      hierarchyItem.forEach((x) => {
        let style = x.getAttribute('style')
        if (style) {
          const percent = style.match(/left:([0-9]+)%/)
          let child1 = hierarchy.querySelector('li:first-child ul')
          let child2 = hierarchy.querySelector('ul li:first-child ul')
          let child3 = hierarchy.querySelector('ul ul li:first-child ul')
          let child4 = hierarchy.querySelector('ul ul ul li:first-child ul')
          let child5 = hierarchy.querySelector('ul ul ul ul li:first-child ul')
          let child6 = hierarchy.querySelector('ul ul ul ul ul li:first-child ul')
          let child7 = hierarchy.querySelector('ul ul ul ul ul ul li:first-child ul')

          if (percent[1] === '3') {
            if (!child1) {
              hierarchy.querySelector('li:first-child').appendChild(parse(`<ul></ul>`))
              child1 = hierarchy.querySelector('li:first-child ul')
            }

            child1.appendChild(parse(`<li>${x.innerHTML}</li>`))
          } else if (percent[1] === '5') {
            if (!child2) {
              hierarchy.querySelector('ul li:first-child').appendChild(parse(`<ul></ul>`))
              child2 = hierarchy.querySelector('ul li:first-child ul')
            }

            child2.appendChild(parse(`<li>${x.innerHTML}</li>`))
          } else if (percent[1] === '7') {
            if (!child3) {
              hierarchy.querySelector('ul ul li:first-child').appendChild(parse(`<ul></ul>`))
              child3 = hierarchy.querySelector('ul ul li:first-child ul')
            }

            child3.appendChild(parse(`<li>${x.innerHTML}</li>`))
          } else if (percent[1] === '9') {
            if (!child4) {
              hierarchy.querySelector('ul ul ul li:first-child').appendChild(parse(`<ul></ul>`))
              child4 = hierarchy.querySelector('ul ul ul li:first-child ul')
            }

            child4.appendChild(parse(`<li>${x.innerHTML}</li>`))
          } else if (percent[1] === '11') {
            if (!child5) {
              hierarchy.querySelector('ul ul ul ul li:first-child').appendChild(parse(`<ul></ul>`))
              child5 = hierarchy.querySelector('ul ul ul ul li:first-child ul')
            }

            child5.appendChild(parse(`<li>${x.innerHTML}</li>`))
          } else if (percent[1] === '13') {
            if (!child6) {
              hierarchy.querySelector('ul ul ul ul ul li:first-child').appendChild(parse(`<ul></ul>`))
              child6 = hierarchy.querySelector('ul ul ul ul ul li:first-child ul')
            }

            child6.appendChild(parse(`<li>${x.innerHTML}</li>`))
          } else if (percent[1] === '15') {
            if (!child7) {
              hierarchy.querySelector('ul ul ul ul ul ul li:first-child').appendChild(parse(`<ul></ul>`))
              child7 = hierarchy.querySelector('ul ul ul ul ul ul li:first-child ul')
            }

            child7.appendChild(parse(`<li>${x.innerHTML}</li>`))
          }
        } else {
          hierarchy.appendChild(parse(`<li>${x.innerHTML}</li>`))
        }

        x.remove()
      })
    }

    // Update links to point to new location

    // Convert HTML to String
    let newHTML = dom.toString()

    // Fix Line Issues with Params
    newHTML = newHTML.replace(
      /<strong class="parameterTitle">([^<]+)<\/strong>/g,
      '<strong class="parameterTitle">$1</strong><br>'
    )

    // Wrap parameters in list items
    newHTML = newHTML.replace(
      /<span class="parameterTitle">([^<]+)<\/span>\s?<code class="parameterDetail">([^<]+)<\/code>/gi,
      '<li><strong class="parameterTitle">$1</strong> <code class="parameterDetail">$2</code></li>'
    )

    // Mark Required as Code
    newHTML = newHTML.replace(/\(Required\)/g, '<code>Required</code>')
    newHTML = newHTML.replace(/\(Read Only\)/g, '<code>Read Only</code>')

    // Fix weird HTML for Constants
    newHTML = newHTML.replace(
      /<span>([A-Z_]+)\s?:\s?<a href="([^"]+)"><span class="">([^<]+)<\/span><\/a>=([^<]+)<\/span>/g,
      '<p><strong>$1</strong> : <a href="$2">$3</a></p><p><pre><code>$4</code></pre></p>'
    )

    // Give a bit more emphasis to the title of the constant
    newHTML = newHTML.replace(/<span>([^\s]+) : <a/g, '<span><strong>$1</strong> : <a')

    // Remove lingering characters that break markdown
    newHTML = newHTML.replace(/&nbsp;/g, '')
    newHTML = newHTML.replace(/<\/h4> : /g, '</h4> ')

    // Write new HTML file back out after cleaning
    fs.writeFileSync(newFilePath, newHTML)

    // Clean it one more time ( yes, it's horribly inefficient to do this twice but it'll help with markdown )
    spawnSync('tidy', ['--tidy-mark', 'no', '-m', '-i', '-w', 0, newFilePath, '-errors'])
  }

  // spinner.succeed('All Done!')
  process.exit(0)
}
