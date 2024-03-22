import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import { getVersion } from '../utils.mjs'
import { DATA_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:build-nav')

export default (cli) => {
  // Get Version
  const version = getVersion(cli)

  debug(chalk.green.bold(`BUILDING NAV: v${version}`))

  const metaFile = path.resolve(DATA_FOLDER, `meta-${version}.json`)

  let meta, metaKeys, metaText
  let nav = []

  // Make Data Directory if needed
  if (fs.existsSync(metaFile)) {
    metaText = fs.readFileSync(metaFile)
    meta = JSON.parse(metaText)
    metaKeys = Object.keys(meta)
  } else {
    debug(chalk.red.bold(`✖ ERROR: ${version} meta data missing.`))
    process.exit()
  }

  // First pass to create parents
  metaKeys.forEach((key) => {
    // Check for existing primary nav
    const idx = nav.findIndex((parent) => parent.title.trim() === meta[key]?.nav.parent.trim())

    // Make new nav group if necessary
    if (idx < 0) {
      nav.push({
        title: meta[key].nav.parent.trim(),
        alt: `Choose a ${meta[key].nav.parent.trim()}`,
        href: '#',
        links: [],
      })
    }
  })

  // Second Pass to create groups within parents
  metaKeys.forEach((key) => {
    // Check for existing primary nav
    const idx = nav.findIndex((parent) => parent.title.trim() === meta[key]?.nav.parent.trim())
    const groupIdx = nav[idx].links.findIndex((group) => group.title.trim() === meta[key]?.nav.child.trim())

    // Make new nav group if necessary
    if (groupIdx < 0) {
      nav[idx].links.push({
        title: meta[key].nav.child.trim(),
        alt: `${meta[key]?.nav.parent.trim()} › ${meta[key].nav.child.trim()}`,
        href: '#',
        children: [],
      })
    }
  })

  // Last pass to create links within groups
  metaKeys.forEach((key) => {
    // Check for existing primary nav
    const idx = nav.findIndex((parent) => parent.title.trim() === meta[key]?.nav.parent.trim())
    const groupIdx = nav[idx].links.findIndex((group) => group.title.trim() === meta[key]?.nav.child.trim())

    if (idx > -1 && groupIdx > -1) {
      nav[idx].links[groupIdx].children.push({
        title: meta[key].nav.title.trim(),
        alt: meta[key].nav.alt.trim(),
        href: meta[key].deprecated ? `/deprecated${key}` : key,
        deprecated: meta[key].deprecated,
      })
    }
  })

  // Sort all the things
  nav.sort((a, b) => (a.title.trim() > b.title.trim() ? 1 : -1))
  nav.forEach((page) => page.links.sort((a, b) => (a.title.trim() > b.title.trim() ? 1 : -1)))
  nav.forEach((page) =>
    page.links.forEach((sub) => {
      if (sub.children) {
        sub.children.sort((a, b) => (a.title.trim() > b.title.trim() ? 1 : -1))
      }
    })
  )

  fs.writeFileSync(path.resolve(DATA_FOLDER, `nav-${version}.json`), JSON.stringify(nav, null, 2))
  debug(chalk.dim(`✔ Complete`))

  debug(chalk.green.bold('✅ ALL DONE (๑˃̵ᴗ˂̵)و '))
}
