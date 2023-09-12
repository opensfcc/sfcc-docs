import { createLoader } from 'simple-functional-loader'
import { slugifyWithCounter } from '@sindresorhus/slugify'

import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'

import glob from 'fast-glob'
import Markdoc from '@markdoc/markdoc'

const __filename = url.fileURLToPath(import.meta.url)
const slugify = slugifyWithCounter()

function toString(node) {
  let str = node.type === 'text' && typeof node.attributes?.content === 'string' ? node.attributes.content : ''
  if ('children' in node) {
    for (let child of node.children) {
      str += toString(child)
    }
  }
  return str
}

function extractSections(node, sections, isRoot = true) {
  if (isRoot) {
    slugify.reset()
  }
  if (node.type === 'heading' || node.type === 'paragraph') {
    let content = toString(node).trim()
    if (node.type === 'heading' && node.attributes.level <= 2) {
      let hash = node.attributes?.id ?? slugify(content)
      sections.push([content, hash, []])
    } else {
      sections.at(-1)[2].push(content)
    }
  } else if ('children' in node) {
    for (let child of node.children) {
      extractSections(child, sections, false)
    }
  }
}

const search = function (nextConfig = {}) {
  let cache = new Map()
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.push({
        test: __filename,
        use: [
          createLoader(function () {
            let pagesDir = path.resolve('./src/pages')
            this.addContextDependency(pagesDir)

            let files = glob.sync('**/*.md', { cwd: pagesDir })
            let data = files.map((file) => {
              let url = file === 'index.md' ? '/' : `/${file.replace(/\.md$/, '')}`
              let md = fs.readFileSync(path.join(pagesDir, file), 'utf8')

              let sections

              if (cache.get(file)?.[0] === md) {
                sections = cache.get(file)[1]
              } else {
                let ast = Markdoc.parse(md)
                let title = ast.attributes?.frontmatter?.match(/^metaTitle:\s*(.*?)\s*$/m)?.[1]
                sections = [[title, null, []]]
                extractSections(ast, sections)
                cache.set(file, [md, sections])
              }

              return { url, sections }
            })

            // When this file is imported within the application
            // the following module is loaded:
            return `
              import FlexSearch from 'flexsearch'

              let sectionIndex = new FlexSearch.Document({
                document: {
                  id: 'url',
                  index: [{
                    field: 'title',
                    tokenize: 'full',
                    optimize: true,
                    resolution: 9
                  },{
                      field:  'content',
                      tokenize: 'full',
                      optimize: true,
                      resolution: 5,
                      minlength: 3,
                      context: {
                        depth: 1,
                        resolution: 3
                      }
                  }],
                  store: ['title', 'pageTitle'],
                }
              })

              let data = ${JSON.stringify(data)}

              for (let { url, sections } of data) {
                for (let [title, hash, content] of sections) {
                  sectionIndex.add({
                    url: url + (hash ? ('#' + hash) : ''),
                    title,
                    content: [title, ...content].join('\\n'),
                    pageTitle: hash ? sections[0][0] : undefined,
                  })
                }
              }

              export function search(query, options = {}) {
                let result = sectionIndex.search(query, {
                  ...options,
                  enrich: true,
                })
                if (result.length === 0) {
                  return []
                }

                const getScore = (query, item) => {
                  const keywords = query.split(' ')
                  const title = item.doc.title ? item.doc.title.toLowerCase() : null
                  const pageTitle = item.doc.pageTitle ? item.doc.pageTitle.toLowerCase() : null
                  const id = item.id ? item.id.toLowerCase() : null

                  let score = 0
                  let regX, result

                  keywords.forEach((keyword) => {
                    if (id && id.includes(keyword)) {
                      score += 1

                      regX = new RegExp(\`\$\{keyword\}\`, 'i')
                      result = id.match(regX)[0];

                      score += result ? (result.length / id.length) : 0
                    }
                    if (title && title.includes(keyword)) {
                      score += 1

                      regX = new RegExp(\`\$\{keyword\}\`, 'i')
                      result = title.match(regX)[0];

                      score += result ? (result.length / id.length) : 0
                    }
                    if (pageTitle && pageTitle.includes(keyword)) {
                      score += 1

                      regX = new RegExp(\`\$\{keyword\}\`, 'i')
                      result = pageTitle.match(regX)[0];

                      score += result ? (result.length / id.length) : 0
                    }
                  })

                  return score
                }

                const results = result[0].result.map((item) => ({
                  url: item.id,
                  title: item.doc.title,
                  pageTitle: item.doc.pageTitle,
                  score: getScore(query, item)
                }))

                results.sort((a, b) => b.score - a.score)

                return results
              }
            `
          }),
        ],
      })

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}

export default search
