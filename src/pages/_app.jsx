import 'dotenv/config'

import Head from 'next/head'
import { useRouter } from 'next/router'
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
  const router = useRouter()

  const baseURL = process.env.SITE_URL || 'https://sfccdocs.com'

  const metaTitle = pageProps.markdoc?.frontmatter.metaTitle
  const metaDescription = pageProps.markdoc?.frontmatter.metaDescription
  const metaKeywords = pageProps.markdoc?.frontmatter.metaKeywords
  const metaURL = `${baseURL}${router.pathname}`

  const tableOfContents = pageProps.markdoc?.content ? collectHeadings(pageProps.markdoc.content) : []

  return (
    <>
      <Head>
        {/* Content Settings */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />

        <title>{metaTitle}</title>

        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />

        {/* Bot Settings */}
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="robots" content="noodp,noydir" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* PWA Settings */}
        <meta name="application-name" content="SFCC Docs" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0f162a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

        {/* Microsoft App Settings */}
        <meta name="msapplication-config" content="none" />
        <meta name="msapplication-square70x70logo" content="/assets/icons/icon-70x70.png" />
        <meta name="msapplication-square150x150logo" content="/assets/icons/icon-15x150.png" />
        <meta name="msapplication-square310x310logo" content="/assets/icons/icon-310x310.png" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="msapplication-TileColor" content="#0f162a" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-TileColor" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="msapplication-wide310x150logo" content="/assets/icons/icon-310x50.png" />

        {/* Apple Settings */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SFCC Docs" />

        {/* Twitter Schema */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@mrmidi" />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={`${baseURL}/assets/website-card.png`} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:url" content={metaURL} />

        {/* Open Graph Schema */}
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={`${baseURL}/assets/website-card.png`} />
        <meta property="og:site_name" content="SFCC Docs" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={metaURL} />

        {/* Icons */}
        <link rel="apple-touch-icon" href="/assets/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/assets/icons/icon-167x167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/icon-180x180.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="mask-icon" href="/assets/icons/mask-icon.png" color="#0f162a" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.webmanifest" />
      </Head>
      <Layout title={metaTitle} tableOfContents={tableOfContents} isMarkdoc={Boolean(pageProps.markdoc)}>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
