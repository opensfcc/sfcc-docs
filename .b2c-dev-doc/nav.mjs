// TODO: Move this to CLI and delete file

import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_FOLDER = path.resolve(__dirname, 'data')
const META_FILE = path.resolve(__dirname, 'data/meta.json')

const metaText = fs.readFileSync(META_FILE)
const meta = JSON.parse(metaText)
const metaKeys = Object.keys(meta)

let nav = []

// First Pass main sections and parent only for non-deprecated
metaKeys.forEach((key) => {
  if (!meta[key].deprecated) {
    // Check for existing primary nav
    const idx = nav.findIndex((section) => section.title === meta[key].nav.parent)
    let curIdx = idx

    // Make new nav group if necessary
    if (idx < 0) {
      nav.push({
        title: meta[key].nav.parent,
        alt: `Group: ${meta[key].nav.parent}`,
        href: '#',
        links: [],
      })

      curIdx = nav.length - 1
    }

    if (!meta[key].nav.child) {
      nav[curIdx].links.push({
        title: meta[key].nav.label,
        alt: `View: ${meta[key].nav.parent} › ${meta[key].nav.label}`,
        href: key,
      })
    }
  }
})

// Backfill any main elements that are deprecated
metaKeys.forEach((key) => {
  if (meta[key].deprecated) {
    // Check for existing primary nav
    const idx = nav.findIndex((section) => section.title === meta[key].nav.parent)
    let curIdx = idx

    // Make new nav group if necessary
    if (idx < 0) {
      nav.push({
        title: meta[key].nav.parent,
        alt: `View: ${meta[key].nav.parent} › ${meta[key].nav.label}`,
        href: key,
        links: [],
      })

      curIdx = nav.length - 1
    }

    if (!meta[key].nav.child) {
      nav[curIdx].links.push({
        title: meta[key].nav.label,
        alt: `View: [DEPRECATED] ${meta[key].nav.parent} › ${meta[key].nav.label.replace(' [D]', '')}`,
        href: key,
      })
    }
  }
})

// Nested children that might not have had parents
metaKeys.forEach((key) => {
  // Check for existing primary nav
  const idx = nav.findIndex((section) => section.title === meta[key].nav.parent)

  if (meta[key].nav.child) {
    const subIdx = nav[idx].links.findIndex((sub) => sub.title === meta[key].nav.child)
    let curIdx = subIdx

    if (subIdx < 0) {
      nav[idx].links.push({
        title: meta[key].nav.child,
        alt: `Group: ${meta[key].nav.parent} › ${meta[key].nav.child}`,
        href: '#',
        children: [],
      })

      curIdx = nav[idx].links.length - 1
    }

    if (!nav[idx].links[curIdx].children) {
      nav[idx].links[curIdx].children = []
    }

    nav[idx].links[curIdx].children.push({
      title: `› ${meta[key].nav.label}`,
      alt: `View: ${meta[key].nav.parent} › ${meta[key].nav.child} › ${meta[key].nav.label}`,
      href: key,
    })
  }
})

// Sort all the things
nav.sort((a, b) => (a.title > b.title ? 1 : -1))
nav.forEach((page) => page.links.sort((a, b) => (a.title > b.title ? 1 : -1)))
nav.forEach((page) =>
  page.links.forEach((sub) => {
    if (sub.children) {
      sub.children.sort((a, b) => (a.title > b.title ? 1 : -1))
    }
  })
)

fs.writeFileSync(path.resolve(DATA_FOLDER, 'nav.json'), JSON.stringify(nav, null, 2))

console.log('\nAll Done!')
process.exit(0)
