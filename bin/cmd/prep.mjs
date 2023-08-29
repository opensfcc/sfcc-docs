import chalk from 'chalk'
import Debug from 'debug'
import path from 'path'
import fs from 'fs'
import * as cheerio from 'cheerio'

import { Glob } from 'glob'
import { parse } from 'node-html-parser'
import { spawnSync } from 'child_process'

import { isEmptyDir, isHelpfulFile, getVersionFolder, prepURI } from '../utils.mjs'
import { DATA_FOLDER, DOCS_FOLDER, PREP_FOLDER, VERSIONS_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:prep')

// Store some Mappings of File Data
let mapping = {}

// Create META data for site usage
let meta = {}

export default async (cli) => {
  if (cli.verbose) {
    debug('CMD: prep', cli.version)
  }

  // Make sure we have a version
  if (!cli.version) {
    debug(chalk.red.bold(`✖ ERROR: Please specify a version`))
    process.exit(1)
  }

  const versionFolder = getVersionFolder(cli.version, VERSIONS_FOLDER)
  if (cli.verbose) {
    debug(`Loading HTML from ${versionFolder.replace(DOCS_FOLDER, '.b2c-dev-doc')}`)
  }

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
      if (cli.verbose) {
        debug(chalk.gray(`SKIPPING: ${file.replace(DOCS_FOLDER, '')}`))
      }
      continue
    }

    // Get original file info
    const fileKey = file.split('/').slice(-1)

    // Check if this file is not unique
    if (typeof mapping[fileKey] !== 'undefined') {
      debug(chalk.red(`ALREADY FOUND: ${fileKey}`))
    }

    // Add some meta data for this file
    mapping[fileKey] = {
      deprecated: false,
      path: file.replace(VERSIONS_FOLDER, '').replace(`/${cli.version}/`, '/'),
    }

    // Read old file into memory so we can grab group info for sorting
    let oldHtml = fs.readFileSync(file)
    let _$ = cheerio.load(oldHtml, { useHtmlParser2: true })
    let oldDOM = parse(_$.html())

    let isGroup = oldDOM.querySelector('.parameterTitle:first-of-type')?.innerText.trim() === 'Group:'
    let groupTitle = isGroup ? oldDOM.querySelector('.parameterDetail:first-of-type')?.innerText.trim() : null

    if (!isGroup) {
      isGroup = oldDOM.querySelector('.parameterTitle:nth-of-type(2)')?.innerText.trim() === 'Group:'
      groupTitle = isGroup ? oldDOM.querySelector('.parameterDetail:nth-of-type(2)')?.innerText.trim() : null
    }

    if (!isGroup) {
      isGroup = oldDOM.querySelector('.parameterTitle:first-of-type')?.innerText.trim() === 'Execution Context:'
      groupTitle = isGroup ? oldDOM.querySelector('.parameterDetail:first-of-type')?.innerText.trim() : null
    }

    if (!isGroup) {
      isGroup = oldDOM.querySelector('.parameterTitle:nth-of-type(2)')?.innerText.trim() === 'Execution Context:'
      groupTitle = isGroup ? oldDOM.querySelector('.parameterDetail:nth-of-type(2)')?.innerText.trim() : null
    }

    if (groupTitle && groupTitle.includes('deprecated')) {
      groupTitle = groupTitle.replace(' (deprecated)', '')
    }

    // Set a new file name for prepped HTML file
    const newFile = prepURI(file, cli.version, groupTitle)

    // Free up some memory
    oldHtml = null
    _$ = null
    oldDOM = null

    // Set new file path
    let newFilePath = `${DOCS_FOLDER}${newFile}`

    // Set new folder path
    let folder = path.dirname(newFilePath)

    // Make Directory if needed
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }

    if (cli.verbose) {
      debug(chalk.green(`PREPPING: ${file.replace(DOCS_FOLDER, '')} => ${newFilePath.replace(DOCS_FOLDER, '')}`))
    }

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
      mapping[fileKey].deprecated = true

      // Delete the current file
      spawnSync('rm', ['-f', newFilePath])

      const oldPath = newFilePath
      const oldFolder = path.dirname(oldPath)

      // Check if old directory is now empty
      if (isEmptyDir(oldFolder)) {
        // Delete empty folder
        spawnSync('rm', ['-fr', oldFolder])
      }

      // Change the file name to indicate it is deprecated
      newFilePath = newFilePath.replace(`/${cli.version}/`, `/${cli.version}/deprecated/`)

      // Store folder paths
      let folder = path.dirname(newFilePath)

      // Make Directory if needed
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
      }

      if (cli.verbose) {
        debug(chalk.red(`DEPRECATED: ${oldPath.replace(DOCS_FOLDER, '')} => ${newFilePath.replace(DOCS_FOLDER, '')}`))
      }
    }

    // Remove body attributes
    dom.querySelector('body').removeAttribute('onload')

    // Remove elements that are not helpful for search indexer of markdown conversion
    dom.querySelectorAll('div:empty, a:empty, link, script, meta, div.copyright, div.banner, img').forEach((x) => {
      x.remove()
    })

    // Remove last HR
    const $hr = dom.querySelector('div.section:last-of-type hr:last-of-type')
    if ($hr) {
      $hr.remove()
    }

    // Generate H1 Tags
    const $h1 = dom.querySelectorAll('div.className, span.newTitle')
    if ($h1) {
      $h1.forEach((x) => {
        x.tagName = 'h1'
      })
    }

    // Generate H2 Tags
    const $h2 = newFilePath.includes('/quota/') ? dom.querySelectorAll('div.section div.header, p b') : dom.querySelectorAll('div.section div.header')
    if ($h2) {
      $h2.forEach((x) => {
        x.tagName = 'h2'
      })
    }

    // Generate H3 Tags
    const $h3 = dom.querySelectorAll('div.section div.subHeader, div.detailName')
    if ($h3) {
      $h3.forEach((x) => {
        x.tagName = 'h3'
      })
    }

    // Generate H4 Tags
    const $h4 = dom.querySelectorAll('div.summaryItem span.parameterTitle')
    if ($h4) {
      $h4.forEach((x) => {
        x.tagName = 'h4'
      })
    }

    // Generate Description Blockquote Tags
    const $description = dom.querySelectorAll('div.topLevelDescription, div.description')
    if ($description) {
      $description.forEach((x) => {
        x.tagName = 'blockquote'
      })
    }

    // Convert list elements to list
    const $list = dom.querySelectorAll('div.parameters')
    if ($list) {
      $list.forEach((x) => {
        x.tagName = 'ul'
      })
    }

    // Covert elements to bold
    const $bold = dom.querySelectorAll('span.emphasis')
    if ($bold) {
      $bold.forEach((x) => {
        x.tagName = 'strong'
      })
    }

    // Covert elements to code
    const $code = dom.querySelectorAll('div.parameterDetail')
    if ($code) {
      $code.forEach((x) => {
        x.tagName = 'code'
      })
    }

    // Fix Hierarchy
    const $hierarchy = dom.querySelector('div.hierarchy')
    if ($hierarchy) {
      $hierarchy.tagName = 'ul'
    }

    let hierarchy = []

    // Convert Hierarchy to proper nested set of ULs ( everything in original code was on the same level with CSS styling to indent )
    const $hierarchyItem = dom.querySelectorAll('ul.hierarchy div')
    if ($hierarchy && $hierarchyItem) {
      $hierarchyItem.forEach((x) => {
        let style = x.getAttribute('style')
        if (style) {
          const percent = style.match(/left:([0-9]+)%/)
          let $child1 = $hierarchy.querySelector('li:first-child ul')
          let $child2 = $hierarchy.querySelector('ul li:first-child ul')
          let $child3 = $hierarchy.querySelector('ul ul li:first-child ul')
          let $child4 = $hierarchy.querySelector('ul ul ul li:first-child ul')
          let $child5 = $hierarchy.querySelector('ul ul ul ul li:first-child ul')
          let $child6 = $hierarchy.querySelector('ul ul ul ul ul li:first-child ul')
          let $child7 = $hierarchy.querySelector('ul ul ul ul ul ul li:first-child ul')

          if (percent[1] === '3') {
            if (!$child1) {
              $hierarchy.querySelector('li:first-child').appendChild(parse(`<ul></ul>`))
              $child1 = $hierarchy.querySelector('li:first-child ul')
            }

            $child1.appendChild(parse(`<li>${x.innerHTML}</li>`))
            hierarchy[0].children.push({
              title: x.innerText,
              href: x.firstChild?.getAttribute ? x.firstChild.getAttribute('href') : null,
              level: 2,
              alt: `Hierarchy for ${x.innerText}`,
              children: [],
            })
          } else if (percent[1] === '5') {
            if (!$child2) {
              $hierarchy.querySelector('ul li:first-child').appendChild(parse(`<ul></ul>`))
              $child2 = $hierarchy.querySelector('ul li:first-child ul')
            }

            $child2.appendChild(parse(`<li>${x.innerHTML}</li>`))
            hierarchy[0].children[0].children.push({
              title: x.innerText,
              href: x.firstChild?.getAttribute ? x.firstChild.getAttribute('href') : null,
              level: 3,
              children: [],
            })
          } else if (percent[1] === '7') {
            if (!$child3) {
              $hierarchy.querySelector('ul ul li:first-child').appendChild(parse(`<ul></ul>`))
              $child3 = $hierarchy.querySelector('ul ul li:first-child ul')
            }

            $child3.appendChild(parse(`<li>${x.innerHTML}</li>`))
            hierarchy[0].children[0].children[0].children.push({
              title: x.innerText,
              href: x.firstChild?.getAttribute ? x.firstChild.getAttribute('href') : null,
              level: 4,
              children: [],
            })
          } else if (percent[1] === '9') {
            if (!$child4) {
              $hierarchy.querySelector('ul ul ul li:first-child').appendChild(parse(`<ul></ul>`))
              $child4 = $hierarchy.querySelector('ul ul ul li:first-child ul')
            }

            $child4.appendChild(parse(`<li>${x.innerHTML}</li>`))
            hierarchy[0].children[0].children[0].children[0].children.push({
              title: x.innerText,
              href: x.firstChild?.getAttribute ? x.firstChild.getAttribute('href') : null,
              level: 5,
              children: [],
            })
          } else if (percent[1] === '11') {
            if (!$child5) {
              $hierarchy.querySelector('ul ul ul ul li:first-child').appendChild(parse(`<ul></ul>`))
              $child5 = $hierarchy.querySelector('ul ul ul ul li:first-child ul')
            }

            $child5.appendChild(parse(`<li>${x.innerHTML}</li>`))
            hierarchy[0].children[0].children[0].children[0].children[0].children.push({
              title: x.innerText,
              href: x.firstChild?.getAttribute ? x.firstChild.getAttribute('href') : null,
              level: 6,
              children: [],
            })
          } else if (percent[1] === '13') {
            if (!$child6) {
              $hierarchy.querySelector('ul ul ul ul ul li:first-child').appendChild(parse(`<ul></ul>`))
              $child6 = $hierarchy.querySelector('ul ul ul ul ul li:first-child ul')
            }

            $child6.appendChild(parse(`<li>${x.innerHTML}</li>`))
            hierarchy[0].children[0].children[0].children[0].children[0].children[0].children.push({
              title: x.innerText,
              href: x.firstChild?.getAttribute ? x.firstChild.getAttribute('href') : null,
              level: 7,
              children: [],
            })
          } else if (percent[1] === '15') {
            if (!$child7) {
              $hierarchy.querySelector('ul ul ul ul ul ul li:first-child').appendChild(parse(`<ul></ul>`))
              $child7 = $hierarchy.querySelector('ul ul ul ul ul ul li:first-child ul')
            }

            $child7.appendChild(parse(`<li>${x.innerHTML}</li>`))
            hierarchy[0].children[0].children[0].children[0].children[0].children[0].children[0].children.push({
              title: x.innerText,
              href: x.firstChild?.getAttribute ? x.firstChild.getAttribute('href') : null,
              level: 8,
              alt: `Hierarchy for ${x.innerText}`,
              children: [],
            })
          }
        } else {
          $hierarchy.appendChild(parse(`<li>${x.innerHTML}</li>`))
          hierarchy.push({
            title: x.innerText,
            href: x.firstChild?.getAttribute ? x.firstChild.getAttribute('href') : null,
            level: 1,
            alt: `Hierarchy for ${x.innerText}`,
            children: [],
          })
        }

        x.remove()
      })
    }

    // Convert HTML to String
    let newHTML = dom.toString()

    // Fix Line Issues with Params
    newHTML = newHTML.replace(/<strong class="parameterTitle">([^<]+)<\/strong>/g, '<strong class="parameterTitle">$1</strong><br>')

    // Wrap parameters in list items
    newHTML = newHTML.replace(/<span class="parameterTitle">([^<]+)<\/span>\s?<code class="parameterDetail">([^<]+)<\/code>/gi, '<li><strong class="parameterTitle">$1</strong> <code class="parameterDetail">$2</code></li>')

    // Mark Required as Code
    newHTML = newHTML.replace(/\(Optional\)/g, '<code>Optional</code>')
    newHTML = newHTML.replace(/\(Required\)/g, '<code>Required</code>')
    newHTML = newHTML.replace(/\(Read Only\)/g, '<code>Read Only</code>')

    // Fix weird HTML for Constants
    newHTML = newHTML.replace(/<span>([A-Z_]+)\s?:\s?<a href="([^"]+)"><span class="">([^<]+)<\/span><\/a>=([^<]+)<\/span>/g, '<p><strong>$1</strong> : <a href="$2">$3</a></p><p><pre><code>$4</code></pre></p>')
    newHTML = newHTML.replace(/<span><h4 class="parameterTitle">([^<]+)<\/h4>[\n\s\t]+:[\n\s\t]+([A-Za-z]+)[\n\s\t]+<code>([^<]+)<\/code>[\n\s\t]+<\/span>/g, '<h4 class="parameterTitle">$1</h4> $2 <code>$3</code>')

    // Give a bit more emphasis to the title of the constant
    newHTML = newHTML.replace(/<span>([^\s]+) : <a/g, '<span><strong>$1</strong> : <a')

    // Remove lingering characters that break markdown
    newHTML = newHTML.replace(/&nbsp;/g, '')
    newHTML = newHTML.replace(/<\/h4> : /g, '</h4> ')

    // Write new HTML file back out after cleaning
    fs.writeFileSync(newFilePath, newHTML)

    // Clean it one more time ( yes, it's horribly inefficient to do this twice but it'll help with markdown )
    spawnSync('tidy', ['--tidy-mark', 'no', '-m', '-i', '-w', 0, newFilePath, '-errors'])

    // Update DOM
    $ = cheerio.load(newHTML, { useHtmlParser2: true })
    dom = parse($.html())

    // Prep additional info
    let parent = ''
    let title = dom.querySelector('title')?.innerText.replace(/\n/g, ' ').trim() || null
    let description = dom.querySelector('blockquote.topLevelDescription')?.innerText.replace(/\n/g, ' ').trim() || null
    let url = newFilePath.replace(PREP_FOLDER, '')
    url = url.replace('.html', '')

    if (!groupTitle) {
      const splitGroup = newFilePath.match(/script\/([^\/]+)/)
      groupTitle = splitGroup ? splitGroup[1] : null
    }

    if (groupTitle && (groupTitle === 'top-level' || groupTitle === 'TopLevel')) {
      groupTitle = 'Top Level'
    }

    // Check if we got a description, if not try another place
    if (!description) {
      description = dom.querySelector('.classSummary .classSummaryDetail .description')?.innerText.replace(/\n/g, ' ').trim() || null
    }

    // Set initial keywords for page
    let keywords = ['salesforce', 'commerce cloud', 'b2c', 'sfra', 'developer', 'documentation', `v${cli.version}`]
    const fileKeywords = file.replace(VERSIONS_FOLDER, '').replace('/html/', '/').replace('/api/', '/').replace(`/${cli.version}/`, '').replace(/^\//, '').replace(/-/g, ' ').split('/')
    keywords = keywords.concat(fileKeywords)

    // Slice of the last element as it's the HTML file and we're going to clean that up a bit
    let last = keywords.slice(-1)
    last = last.toString().replace('.html', '').replace('pipelet.', '').replace('jobstep.', '').split('_')
    keywords.pop()
    keywords = keywords.concat(last)

    if (mapping[fileKey].deprecated) {
      keywords.push('deprecated')
    }

    // Add Parent Info
    if (newFilePath.includes('/jobstep/')) {
      parent = 'Job Step'
    } else if (newFilePath.includes('/pipelet/')) {
      title = title !== groupTitle ? title.replace('Pipelet ', `${groupTitle} `) : title.replace('Pipelet ', '')
      parent = 'Pipelet'
    } else if (newFilePath.includes('/quota/')) {
      parent = 'Quota'
    } else if (newFilePath.includes('/script/')) {
      title = title.replace('Class ', groupTitle === 'Top Level' ? `Class ${groupTitle} ` : `Class ${groupTitle}.`)
      parent = 'Script'
    }

    // Update Mapping
    mapping[fileKey].parent = parent
    mapping[fileKey].group = groupTitle
    mapping[fileKey].title = mapping[fileKey].deprecated ? `[DEPRECATED] ${parent}: ${title}` : `${parent}: ${title}`
    mapping[fileKey].description = mapping[fileKey].deprecated ? `[DEPRECATED] ${description}` : description
    mapping[fileKey].url = url
    mapping[fileKey].keywords = keywords
    mapping[fileKey].hierarchy = hierarchy

    // Update Meta Data
    meta[url] = mapping[fileKey]
  }

  // Make Data Directory if needed
  if (!fs.existsSync(`${DATA_FOLDER}/${cli.version}`)) {
    fs.mkdirSync(`${DATA_FOLDER}/${cli.version}`, { recursive: true })
  }

  // Write mappings file to data folder
  fs.writeFileSync(`${DATA_FOLDER}/${cli.version}/mapping.json`, JSON.stringify(mapping, null, 2))
  fs.writeFileSync(`${DATA_FOLDER}/${cli.version}/meta.json`, JSON.stringify(meta, null, 2))

  process.exit(0)
}
