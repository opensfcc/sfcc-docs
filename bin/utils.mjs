import Debug from 'debug'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

import { CURRENT_VERSION, DOCS_FOLDER, SUPPORTED_VERSIONS } from './config.mjs'

const debug = Debug('sfcc-docs:utils')
const SEP = path.sep

export function getVersion(cli) {
  let version = CURRENT_VERSION

  // Make sure we have a supported version
  if (cli.version && SUPPORTED_VERSIONS.find((version) => version.value === cli.version)) {
    version = cli.version
  } else if (cli.version) {
    debug(chalk.red.bold(`✖ ERROR: ${cli.version} is not a supported version.`))
    debug('SUPPORTED VERSION:')
    debug(SUPPORTED_VERSIONS.map((version) => version.value).join(', '))
    process.exit(1)
  }

  return version
}

export function getVersionFolder(version, folder) {
  // Make sure we have a version
  if (!version) {
    return false
  }

  const versionFolder = path.resolve(folder, version)

  // Make sure version is valid
  if (!fs.existsSync(versionFolder)) {
    debug(chalk.red.bold(`✖ ERROR: ${version} does not exist at ${folder.replace(DOCS_FOLDER, '.b2c-dev-doc')}${SEP}${version}`))

    return false
  }

  return versionFolder
}

export function isEmptyDir(path) {
  const files = fs.readdirSync(path)
  return files && files.length === 0
}

export function isHelpfulFile(string) {
  const uri = string.toLowerCase()
  return (
    typeof uri === 'string' &&
    !uri.endsWith(`${SEP}classlist.html`) &&
    !uri.endsWith(`${SEP}grouplist.html`) &&
    !uri.endsWith(`${SEP}jobstepapi${SEP}html${SEP}index.html`) &&
    !uri.endsWith(`${SEP}jobsteplist.html`) &&
    !uri.endsWith(`${SEP}overview.html`) &&
    !uri.endsWith(`${SEP}packagelist.html`) &&
    !uri.endsWith(`${SEP}pipeletapi${SEP}html${SEP}index.html`) &&
    !uri.endsWith(`${SEP}pipeletlist.html`) &&
    !uri.endsWith(`${SEP}scriptapi${SEP}html${SEP}index.html`) &&
    !uri.endsWith('deprecated.html') &&
    !uri.endsWith('versioning.html') &&
    !uri.includes(`${SEP}compareapi${SEP}`) &&
    !uri.includes(`${SEP}content${SEP}`) &&
    !uri.includes(`${SEP}pipeletapi${SEP}html${SEP}api${SEP}group.`) &&
    !uri.includes(`${SEP}scriptapi${SEP}html${SEP}api${SEP}package_`) &&
    !uri.includes(`${SEP}xsd${SEP}`) &&
    uri.endsWith('.html')
  )
}

export function prepURI(uri, version, group) {
  // Do some fancy cleanup to file path to better organize content
  let pathName = uri.replace(`${DOCS_FOLDER}${SEP}versions${SEP}${version}`, '').trim()

  // Convert Camel Case to Snake Case ( but ignore multiple uppercase in a row )
  pathName = pathName.replace(/([A-Z])([a-z])/g, (_, upper, lower) => `-${upper.toLowerCase()}${lower}`)

  // Look for abbreviations in file name in all uppercase and split it to its own word
  pathName = pathName.replace(/[A-Z]{2,}/g, (match) => `-${match}`)

  // Fix misc file name issues
  pathName = pathName.replace(/[_.]/g, '-')
  pathName = pathName.replace(/--/g, '-')
  pathName = pathName.toLowerCase()

  // Fix issue where some URLs started with uppercase characters
  if (pathName.includes(`${SEP}-`)) {
    const re = new RegExp(`${SEP}-([a-z])`, 'g')
    pathName = pathName.replace(re, `${SEP}$1`)
  }

  // Fix possible file name issues after string replace
  if (pathName.endsWith('-html')) {
    pathName = pathName.replace(/-html$/, '.html')
  }
  if (pathName.includes('-imp-ex')) {
    pathName = pathName.replace('-imp-ex', '-impex')
  }
  if (pathName.includes('-veri-sign')) {
    pathName = pathName.replace('-veri-sign', '-verisign')
  }
  if (pathName.includes('-ur-ls')) {
    pathName = pathName.replace('-ur-ls', '-urls')
  }
  if (pathName.includes('-o-auth')) {
    pathName = pathName.replace('-o-auth', '-oauth')
  }
  if (pathName.includes('-pay-pal')) {
    pathName = pathName.replace('-pay-pal', '-paypal')
  }
  if (pathName.includes('-web-dav')) {
    pathName = pathName.replace('-web-dav', '-webdav')
  }

  // Move Deprecated content to a different folder
  if (pathName.endsWith('(deprecated).html')) {
    pathName = `${SEP}deprecated${SEP}${pathName.replace('(deprecated).html', '.html')}`
  }

  // Fix issues when Class Files and Namespaces with the same name
  if (pathName.endsWith('-.html')) {
    pathName = pathName.replace('-.html', '-class.html')
  }

  // Shorten long file names
  if (pathName.includes(`${SEP}app-storefront-base-cartridge-`)) {
    pathName = pathName.replace(`${SEP}app-storefront-base-cartridge-`, SEP)
  }
  if (pathName.includes(`${SEP}app-storefront-controllers-cartridge-`)) {
    pathName = pathName.replace(`${SEP}app-storefront-controllers-cartridge-`, SEP)
  }

  // Final Cleanup of Path Name
  pathName = pathName.replace(`${SEP}dist${SEP}js${SEP}`, SEP)
  pathName = pathName.replace(`${SEP}js${SEP}`, SEP)
  pathName = pathName.replace(`${SEP}html${SEP}api${SEP}`, SEP)
  pathName = pathName.replace(`${SEP}html${SEP}`, SEP)
  pathName = pathName.replace(`${SEP}jobstepapi${SEP}`, `${SEP}jobstep${SEP}`)
  pathName = pathName.replace(`${SEP}pipeletapi${SEP}`, `${SEP}pipelet${SEP}`)
  pathName = pathName.replace(`${SEP}scriptapi${SEP}`, `${SEP}script${SEP}`)
  pathName = pathName.replace(`${SEP}jobstep${SEP}job-step-`, `${SEP}jobstep${SEP}`)
  pathName = pathName.replace(`${SEP}jobstep${SEP}jobstep-`, `${SEP}jobstep${SEP}`)
  pathName = pathName.replace(`${SEP}pipelet${SEP}pipelet-`, `${SEP}pipelet${SEP}`)

  // Sort Pipelets into Groups
  if (group && pathName.includes(`${SEP}pipelet${SEP}`)) {
    pathName = pathName.replace(`${SEP}pipelet${SEP}`, `${SEP}pipelet${SEP}${group.toLowerCase().replace(/ /g, '-')}${SEP}`)
  }

  // Organize Job Steps into Groups
  if (group && pathName.includes(`${SEP}jobstep${SEP}`)) {
    pathName = pathName.replace(`${SEP}jobstep${SEP}`, `${SEP}jobstep${SEP}${group.toLowerCase().replace(/ /g, '-')}${SEP}`)
  }

  // Organize Script API into Groups
  pathName = pathName.replace(`${SEP}script${SEP}class-top-level-`, `${SEP}script${SEP}top-level${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-alert-`, `${SEP}script${SEP}dw.alert${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-campaign-`, `${SEP}script${SEP}dw.campaign${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-catalog-`, `${SEP}script${SEP}dw.catalog${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-content-`, `${SEP}script${SEP}dw.content${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-crypto-`, `${SEP}script${SEP}dw.crypto${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-customer-`, `${SEP}script${SEP}dw.customer${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-experience-`, `${SEP}script${SEP}dw.experience${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-extensions-`, `${SEP}script${SEP}dw.extensions${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-io-`, `${SEP}script${SEP}dw.io${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-job-job-`, `${SEP}script${SEP}dw.job${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-net-`, `${SEP}script${SEP}dw.net${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-object-`, `${SEP}script${SEP}dw.object${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-order-`, `${SEP}script${SEP}dw.order${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-rpc-`, `${SEP}script${SEP}dw.rpc${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-sitemap-sitemap-`, `${SEP}script${SEP}dw.sitemap${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-suggest-`, `${SEP}script${SEP}dw.suggest${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-svc-`, `${SEP}script${SEP}dw.svc${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-system-`, `${SEP}script${SEP}dw.system${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-template-`, `${SEP}script${SEP}dw.template${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-util-`, `${SEP}script${SEP}dw.util${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-value-`, `${SEP}script${SEP}dw.value${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-web-`, `${SEP}script${SEP}dw.web${SEP}`)
  pathName = pathName.replace(`${SEP}script${SEP}class-dw-ws-`, `${SEP}script${SEP}dw.ws${SEP}`)

  return `${SEP}prep${SEP}${version}${pathName}`
}
