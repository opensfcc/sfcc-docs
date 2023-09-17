import Head from 'next/head'
import { slugifyWithCounter } from '@sindresorhus/slugify'

import { Layout } from '@/components/Layout'

import 'focus-visible'
import '@/styles/tailwind.css'
import '@/styles/diff.css'

function getNodeText(node) {
  let text = ''
  for (let child of node.children ?? []) {
    if (typeof child === 'string') {
      text += child
    }
    text += getNodeText(child)
  }
  return text
}

function collectHeadings(nodes, slugify = slugifyWithCounter()) {
  let sections = []
  let excludeList = ['Method Detail']
  for (let node of nodes) {
    if (node.name === 'h2' || node.name === 'h3') {
      let title = getNodeText(node)
      if (title && !excludeList.includes(title)) {
        let id = slugify(title)
        node.attributes.id = id
        if (id.endsWith('-2') || id.endsWith('-3') || id.endsWith('-4') || id.endsWith('-5') || id.endsWith('-6') || id.endsWith('-7') || id.endsWith('-8')) {
          continue
        }
        if (node.name === 'h3') {
          if (!sections[sections.length - 1]) {
            throw new Error('Cannot add `h3` to table of contents without a preceding `h2`')
          }
          sections[sections.length - 1].children.push({
            ...node.attributes,
            title,
          })
        } else {
          sections.push({ ...node.attributes, title, children: [] })
        }
      }
    }

    sections.push(...collectHeadings(node.children ?? [], slugify))
  }

  return sections
}

export default function App({ Component, pageProps }) {
  let metaTitle = pageProps.markdoc?.frontmatter.metaTitle
  let metaDescription = pageProps.markdoc?.frontmatter.metaDescription
  let metaKeywords = pageProps.markdoc?.frontmatter.metaKeywords

  let tableOfContents = pageProps.markdoc?.content ? collectHeadings(pageProps.markdoc.content) : []

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      </Head>
      <Layout title={metaTitle} tableOfContents={tableOfContents} isMarkdoc={Boolean(pageProps.markdoc)}>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
