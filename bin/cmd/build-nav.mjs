import Debug from 'debug'
import fs from 'fs'
import path from 'path'
import { DATA_FOLDER, SUPPORTED_VERSIONS } from '../config.mjs'

const debug = Debug('sfcc-docs:build-nav')
const SEP = path.sep

export default (cli) => {
  debug('CMD: build-nav', cli.version)

  // Get current supported versions
  const versions = Object.keys(SUPPORTED_VERSIONS)

  // Loop through supported versions and compare to previous version
  versions.forEach((version) => {
    const metaFile = path.resolve(DATA_FOLDER, `meta-${version}.json`)

    let meta, metaKeys, metaText
    let nav = []

    // Make Data Directory if needed
    if (fs.existsSync(metaFile)) {
      metaText = fs.readFileSync(metaFile)
      meta = JSON.parse(metaText)
      metaKeys = Object.keys(meta)
    }

    // First pass to create parents
    metaKeys.forEach((key) => {
      // Check for existing primary nav
      const idx = nav.findIndex((parent) => parent.title === meta[key]?.nav.parent)

      // Make new nav group if necessary
      if (idx < 0) {
        nav.push({
          title: meta[key].nav.parent,
          alt: `Choose a ${meta[key].nav.parent}`,
          href: '#',
          links: [],
        })
      }
    })

    // Second Pass to create groups within parents
    metaKeys.forEach((key) => {
      // Check for existing primary nav
      const idx = nav.findIndex((parent) => parent.title === meta[key]?.nav.parent)
      const groupIdx = nav[idx].links.findIndex((group) => group.title === meta[key]?.nav.child)

      // Make new nav group if necessary
      if (groupIdx < 0) {
        nav[idx].links.push({
          title: meta[key].nav.child,
          alt: `${meta[key]?.nav.parent} › ${meta[key].nav.child}`,
          href: '#',
          children: [],
        })
      }
    })

    // Last pass to create links within groups
    metaKeys.forEach((key) => {
      // Check for existing primary nav
      const idx = nav.findIndex((parent) => parent.title === meta[key]?.nav.parent)
      const groupIdx = nav[idx].links.findIndex((group) => group.title === meta[key]?.nav.child)

      if (idx > -1 && groupIdx > -1) {
        nav[idx].links[groupIdx].children.push({
          title: meta[key].nav.title,
          alt: meta[key].nav.alt,
          href: meta[key].deprecated ? `/${version}/deprecated${key}` : `/${version}${key}`,
          deprecated: meta[key].deprecated,
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

    fs.writeFileSync(path.resolve(DATA_FOLDER, `nav-${version}.json`), JSON.stringify(nav, null, 2))
  })
}
