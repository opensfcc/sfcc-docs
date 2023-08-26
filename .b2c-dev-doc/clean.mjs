// TODO: Move this to CLI and delete file

import fs from 'fs'
import { Glob } from 'glob'
import { parse } from 'node-html-parser'
import * as cheerio from 'cheerio'
import { minify } from 'html-minifier-terser'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import ora from 'ora'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOCS_FOLDER = path.resolve(__dirname, 'prep')
const DATA_FOLDER = path.resolve(__dirname, 'data')
const HTML_FOLDER = path.resolve(__dirname, 'clean')
const files = new Glob(`${DOCS_FOLDER}/**/*.html`, {})

const titleCase = (text, version) => {
  var i, j, v, str, lowers, uppers
  str = text.replace(/([^\W_]+[^\s-]*) */g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })

  v = version ? version[0].toUpperCase() + version.substring(1) : ''
  lowers = [
    'A',
    'An',
    'The',
    'And',
    'But',
    'Or',
    'For',
    'Nor',
    'As',
    'At',
    'By',
    'For',
    'From',
    'In',
    'Into',
    'Near',
    'Of',
    'On',
    'Onto',
    'To',
    'With',
    v,
  ]
  for (i = 0, j = lowers.length; i < j; i++) {
    str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), (txt) => {
      return txt.toLowerCase()
    })
  }

  uppers = ['Api', 'B2c', 'Cms', 'Dw', 'Html', 'Id', 'Io', 'Js', 'Rpc', 'Sfra', 'Svc', 'Ws', 'Xsd']
  for (i = 0, j = uppers.length; i < j; i++) {
    str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'), uppers[i].toUpperCase())
  }

  // Few custom fixes
  str = str.replace(/Applepay/g, 'ApplePay')
  str = str.replace(/Compareapi/g, 'CompareAPI')
  str = str.replace(/Jobstepapi/g, 'JobStepAPI')
  str = str.replace(/Jobstep/g, 'JobStep')
  str = str.replace(/Jsdoc/g, 'JSDoc')
  str = str.replace(/Oauth/g, 'OAuth')
  str = str.replace(/Paymentapi/g, 'PaymentAPI')
  str = str.replace(/Pipeletapi/g, 'PipeletAPI')
  str = str.replace(/Scriptapi/g, 'ScriptAPI')
  str = str.replace(/Sfrajsdoc/g, 'SFRA JSDoc')
  str = str.replace(/Javascript/g, 'JavaScript')
  str = str.replace(/Sitegenesis/g, 'SiteGenesis')

  // Remove some other weird stuff
  str = str.replace(/ Whatsnew/g, '')
  str = str.replace(/^Deprecated /g, '[DEPRECATED] ')

  return str
}

// Create HTML Folder if Missing
if (!fs.existsSync(HTML_FOLDER)) {
  fs.mkdirSync(HTML_FOLDER)
}

let count = 0
let total = 0
for await (const file of files) {
  total++
}

let percent = 0
const spinner = ora('Cleaning HTML: 0% Complete').start()

let meta = {}

for await (const file of files) {
  count++
  percent = Math.round((count / total) * 100)

  spinner.text = `Cleaning HTML: ${percent}% Complete | FILE: .${file.replace(__dirname, '')}`
  spinner.render()

  const keyName = file.replace(DOCS_FOLDER, '')
  const version = [...keyName.matchAll(/\/v([0-9.]+)\//gi)][0][1] || null
  const uri = keyName.replace('.html', '').replace(`/v${version}/`, '/')

  // Set initial keywords for page
  let keywords = ['salesforce', 'commerce cloud', 'b2c', 'sfra', 'developer', 'documentation', `v${version}`]
  const fileKeywords = uri.replace(/^\//, '').replace(/-/g, ' ').split('/')
  keywords = keywords.concat(fileKeywords)

  // Slice of the last element as it's the HTML file and we're going to clean that up a bit
  let last = keywords.slice(-1)
  last = last.toString().split(' ')
  keywords.pop()
  keywords = keywords.concat(last)

  const parents = fileKeywords.slice(0, fileKeywords.length - 1)
  const metaKey = `/v${version}${uri}`

  // Create META Data structure
  meta[metaKey] = {
    api: version,
  }

  try {
    if (fs.existsSync(file)) {
      // Fix HTML
      spawnSync('tidy', ['-m', file, '-errors'])

      let html = fs.readFileSync(file)
      let $ = cheerio.load(html.toString(), null, false)
      let dom = parse($.html())

      let fallbackChild = null

      // Get the original URL from the DOM we injected earlier
      const sourceURL = dom.querySelector('div.sfcc-docs-url')
      const source = sourceURL ? sourceURL.innerText.trim() : null

      // Get Package Name
      const packageName = dom.querySelector('div.packageName')
      const packageNameText = packageName ? packageName.innerText.trim() : null

      const className = dom.querySelector('div.className')
      const classNameText = className ? className.innerText.trim().replace('\n', ' ').replace('Class ', '') : null

      // Get Object Info
      const hierarchyList = dom.querySelectorAll('div.hierarchy div:not(:first-child)')
      let packageLabel =
        !packageNameText && hierarchyList && hierarchyList.length > 0
          ? hierarchyList[hierarchyList.length - 1].innerText.trim()
          : packageNameText
          ? `${packageNameText}.${classNameText}`
          : null
      let hierarchy = []
      if (hierarchyList && hierarchyList.length > 0) {
        hierarchyList.forEach((h) => {
          hierarchy.push(h.innerText)
        })
      }

      // Get JSON+LD Markup
      const jsonLD = dom.querySelector('script[type="application/ld+json"]')
      if (jsonLD) {
        let data = JSON.parse(jsonLD.innerText)
        delete data['@context']
        delete data['@type']
        delete data.description

        // Fix some weir stuff specific to the original headline
        let headline = data.headline
        headline = headline.replace(' (deprecated)', '')
        headline = headline.replace('‘SiteGenesis', 'SiteGenesis')
        headline = headline.replace('Site Genesis', 'SiteGenesis')
        headline = headline.replace('‘SFRA’', 'SFRA')
        headline = headline.replace('‘SFRA', 'SFRA')
        headline = headline.replace(/Javascript/g, 'JavaScript')
        headline = headline.replace('JavaScript - Source', 'JavaScript')

        let tags = titleCase(parents.join(' '))
        tags = tags.split(' ')
        tags.push(`v${version}`)

        if (tags[0] === '[DEPRECATED]') {
          tags[0] = 'Deprecated'
        }

        // Check for Package Label
        if (packageLabel) {
          tags.push(packageLabel)
          keywords.push(packageLabel)
        }

        const isDeprecated = uri.includes('/deprecated/')

        // Content for Sorting and Organizing Pages
        meta[metaKey].deprecated = isDeprecated
        meta[metaKey].package = packageLabel
        meta[metaKey].hierarchy = hierarchy
        meta[metaKey].source = source ? source : data.url
        meta[metaKey].tags = tags
        meta[metaKey].type = isDeprecated ? tags[1] : tags[0]

        // Do some fun stuff with the title as it's currently not super helpful, and sometimes just straight up wrong
        let title = `${titleCase(parents.join(' '), `v${version}`)}: ${packageLabel ? packageLabel : headline}`
        if (metaKey.includes('/sfra/client/') || metaKey.includes('/sfra/server/')) {
          let words = fileKeywords.slice(-1)
          words = words.toString().split(' ')
          // words = words.filter((item, index) => words.indexOf(item) === index);
          fallbackChild = metaKey.includes('/sfra/client/') ? 'Client-side' : 'Server-side'
          headline = titleCase(words.join(' '))
          title = `${meta[metaKey].type} ${fallbackChild}: ${headline}`
        }
        if (metaKey.includes('/sitegenesis/server/')) {
          let words = fileKeywords.slice(-1)
          words = words.toString().split(' ')
          // words = words.filter((item, index) => words.indexOf(item) === index);
          switch (true) {
            case metaKey.includes('/sitegenesis/server/controllers-'):
              fallbackChild = 'Controllers'
              break

            case metaKey.includes('/sitegenesis/server/module-controllers-'):
              fallbackChild = 'Module Controllers'
              break

            case metaKey.includes('/sitegenesis/server/module-models-'):
              fallbackChild = 'Module Models'
              break

            case metaKey.includes('/sitegenesis/server/module-request-'):
              fallbackChild = 'Module Request'
              break

            case metaKey.includes('/sitegenesis/server/module-util-'):
              fallbackChild = 'Module Util'
              break

            case metaKey.includes('/sitegenesis/server/module-views-'):
              fallbackChild = 'Module Views'
              break

            case metaKey.includes('/sitegenesis/server/scripts-models-'):
              fallbackChild = 'Scripts Models'
              break

            case metaKey.includes('/sitegenesis/server/scripts-payment-processor-'):
              fallbackChild = 'Scripts Payment Processor'
              break

            case metaKey.includes('/sitegenesis/server/scripts-request-'):
              fallbackChild = 'Scripts Request'
              break

            case metaKey.includes('/sitegenesis/server/scripts-util-'):
              fallbackChild = 'Scripts Util'
              break

            case metaKey.includes('/sitegenesis/server/scripts-views-'):
              fallbackChild = 'Scripts Views'
              break
            case metaKey.includes('/sitegenesis/server/tutorial-'):
              fallbackChild = 'Tutorial'
              break
          }
          headline = titleCase(words.join(' '))
          title = `${meta[metaKey].type} ${fallbackChild}: ${headline}`
        }

        // Set Page Description
        const description = `${titleCase(keywords.slice(0, keywords.length - last.length).join(' '), `v${version}`)} ${
          packageLabel ? packageLabel : headline
        }`

        // Content for Rendered HTML
        meta[metaKey].meta = {
          title: isDeprecated ? `[DEPRECATED] ${title.replace(' Deprecated', '').replace('[DEPRECATED] ', '')}` : title,
          description: isDeprecated ? `[DEPRECATED] ${description.replace(' Deprecated', '')}` : description,
          keywords: keywords.filter((item, index) => keywords.indexOf(item) === index),
        }

        // Navigation Info
        const packageDetails = packageLabel ? packageLabel.split('.') : null
        const parentLabel = isDeprecated ? tags[1] : tags[0]
        const linkLabel = packageLabel ? packageDetails[packageDetails.length - 1] : headline

        let childLabel = packageLabel ? packageDetails.slice(0, packageDetails.length - 1).join('.') : fallbackChild

        let label = linkLabel.replace(`${parentLabel} `, '')
        label = label.replace(/^Package /, '')
        label = label.replace(/^Job Step /, '')
        label = label.replace(/^Controllers /, '')
        label = label.replace(/^Module Controllers /, '')
        label = label.replace(/^Module Models /, '')
        label = label.replace(/^Module Util /, '')
        label = label.replace(/^Module Views /, '')
        label = label.replace(/^Scripts Models /, '')
        label = label.replace(/^Scripts Payment Processor /, '')
        label = label.replace(/^Scripts Request /, '')
        label = label.replace(/^Scripts Util /, '')
        label = label.replace(/^Scripts Views /, '')
        label = label.replace(/^Tutorial /, '')

        if (parentLabel === 'JobStep') {
          if (label.startsWith('Execute')) {
            label = label.replace(/^Execute/, '')
            childLabel = 'Execute'
          }
          if (label.startsWith('Export')) {
            label = label.replace(/^Export/, '')
            childLabel = 'Export'
          }
          if (label.startsWith('Import')) {
            label = label.replace(/^Import/, '')
            childLabel = 'Import'
          }
        }

        if (parentLabel === 'Pipelet') {
          if (label.startsWith('Add')) {
            label = label.replace(/^Add/, '')
            childLabel = 'Add'
          }
          if (label.startsWith('Create')) {
            label = label.replace(/^/, 'Create')
            childLabel = 'Create'
          }
          if (label.startsWith('Export')) {
            label = label.replace(/^Export/, '')
            childLabel = 'Export'
          }
          if (label.startsWith('Get')) {
            label = label.replace(/^Get/, '')
            childLabel = 'Get'
          }
          if (label.startsWith('Group')) {
            label = label.replace(/^Group/, '')
            childLabel = 'Group'
          }
          if (label.startsWith('Import')) {
            label = label.replace(/^Import/, '')
            childLabel = 'Import'
          }
          if (label.startsWith('Remove')) {
            label = label.replace(/^Remove/, '')
            childLabel = 'Remove'
          }
          if (label.startsWith('Search')) {
            label = label.replace(/^Search/, '')
            childLabel = 'Search'
          }
          if (label.startsWith('Set')) {
            label = label.replace(/^Set/, '')
            childLabel = 'Set'
          }
          if (label.startsWith('Update')) {
            label = label.replace(/^Update/, '')
            childLabel = 'Update'
          }
          if (label.startsWith('Validate')) {
            label = label.replace(/^Validate/, '')
            childLabel = ''
          }
          if (label.startsWith('Verify')) {
            label = label.replace(/^Verify/, '')
            childLabel = 'Verify'
          }
        }

        meta[metaKey].nav = {
          parent: parentLabel,
          child: childLabel && childLabel !== '' ? childLabel : null,
          label: isDeprecated ? `${label} [D]` : label,
        }
      }

      // Clean Up HTML
      dom.querySelectorAll('#navigation').forEach((x) => x.remove())
      dom.querySelectorAll('br.clear').forEach((x) => x.remove())
      dom.querySelectorAll('div.banner').forEach((x) => x.remove())
      dom.querySelectorAll('div.hierarchy').forEach((x) => x.remove())
      dom.querySelectorAll('div.packageName').forEach((x) => x.remove())
      dom.querySelectorAll('footer').forEach((x) => x.remove())
      dom.querySelectorAll('h2.page-title').forEach((x) => x.remove())
      dom.querySelectorAll('head').forEach((x) => x.remove())
      dom.querySelectorAll('header').forEach((x) => x.remove())
      dom.querySelectorAll('input').forEach((x) => x.remove())
      dom.querySelectorAll('link').forEach((x) => x.remove())
      dom.querySelectorAll('meta').forEach((x) => x.remove())
      dom.querySelectorAll('script').forEach((x) => x.remove())
      dom.querySelectorAll('svg').forEach((x) => x.remove())
      dom.querySelectorAll('title').forEach((x) => x.remove())
      dom.querySelectorAll('div.sfcc-docs-url').forEach((x) => x.remove())

      // We'll add this back in later, but don't want it indexed by search engine since it's not content
      dom.querySelectorAll('div.copyright').forEach((x) => x.remove())

      // Create new folder path
      const filePath = file.replace(DOCS_FOLDER, HTML_FOLDER)
      const folder = path.dirname(filePath)

      // Make Directory
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
      }

      const minified = await minify(dom.toString(), {
        collapseWhitespace: true,
        preserveLineBreaks: false,
        removeEmptyElements: true,
        removeComments: true,
      })
      fs.writeFileSync(filePath, minified)
    }
  } catch (err) {
    console.log(`ERROR: ${file}`)
    console.error(err)
  }
}

// Save META Data
const sorted = Object.keys(meta)
  .sort()
  .reduce((obj, key) => {
    obj[key] = meta[key]
    return obj
  }, {})
fs.writeFileSync(path.resolve(DATA_FOLDER, 'meta.json'), JSON.stringify(sorted, null, 2))

spinner.succeed('All Done!')
process.exit(0)
