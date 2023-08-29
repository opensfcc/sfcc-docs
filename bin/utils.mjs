import Debug from 'debug'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

import { DOCS_FOLDER } from './config.mjs'

const debug = Debug('sfcc-docs:utils')

export function getVersionFolder(version, folder) {
  // Make sure we have a version
  if (!version) {
    return false
  }

  const versionFolder = path.resolve(folder, version)

  // Make sure version is valid
  if (!fs.existsSync(versionFolder)) {
    debug(chalk.red.bold(`✖ ERROR: ${version} does not exist at ${folder.replace(DOCS_FOLDER, '.b2c-dev-doc')}/${version}`))

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
    !uri.endsWith('/classlist.html') &&
    !uri.endsWith('/grouplist.html') &&
    !uri.endsWith('/jobstepapi/html/index.html') &&
    !uri.endsWith('/jobsteplist.html') &&
    !uri.endsWith('/overview.html') &&
    !uri.endsWith('/packagelist.html') &&
    !uri.endsWith('/pipeletapi/html/index.html') &&
    !uri.endsWith('/pipeletlist.html') &&
    !uri.endsWith('/scriptapi/html/index.html') &&
    !uri.endsWith('deprecated.html') &&
    !uri.endsWith('versioning.html') &&
    !uri.includes('/compareapi/') &&
    !uri.includes('/content/') &&
    !uri.includes('/pipeletapi/html/api/group.') &&
    !uri.includes('/scriptapi/html/api/package_') &&
    !uri.includes('/xsd/') &&
    uri.endsWith('.html')
  )
}

export function prepURI(uri, version, group) {
  // Do some fancy cleanup to file path to better organize content
  let pathName = uri.replace(`${DOCS_FOLDER}/versions/${version}`, '').trim()

  // Convert Camel Case to Snake Case ( but ignore multiple uppercase in a row )
  pathName = pathName.replace(/([A-Z])([a-z])/g, (_, upper, lower) => `-${upper.toLowerCase()}${lower}`)

  // Look for abbreviations in file name in all uppercase and split it to its own word
  pathName = pathName.replace(/[A-Z]{2,}/g, (match) => `-${match}`)

  // Fix misc file name issues
  pathName = pathName.replace(/[_.]/g, '-')
  pathName = pathName.replace(/--/g, '-')
  pathName = pathName.toLowerCase()

  // Fix issue where some URLs started with uppercase characters
  if (pathName.includes('/-')) {
    pathName = pathName.replace(/\/-([a-z])/g, '/$1')
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
    pathName = `/deprecated/${pathName.replace('(deprecated).html', '.html')}`
  }

  // Fix issues when Class Files and Namespaces with the same name
  if (pathName.endsWith('-.html')) {
    pathName = pathName.replace('-.html', '-class.html')
  }

  // Shorten long file names
  if (pathName.includes('/app-storefront-base-cartridge-')) {
    pathName = pathName.replace('/app-storefront-base-cartridge-', '/')
  }
  if (pathName.includes('/app-storefront-controllers-cartridge-')) {
    pathName = pathName.replace('/app-storefront-controllers-cartridge-', '/')
  }

  // Final Cleanup of Path Name
  pathName = pathName.replace('/dist/js/', '/')
  pathName = pathName.replace('/js/', '/')
  pathName = pathName.replace('/html/api/', '/')
  pathName = pathName.replace('/html/', '/')
  pathName = pathName.replace('/jobstepapi/', '/jobstep/')
  pathName = pathName.replace('/pipeletapi/', '/pipelet/')
  pathName = pathName.replace('/scriptapi/', '/script/')
  pathName = pathName.replace('/jobstep/job-step-', '/jobstep/')
  pathName = pathName.replace('/jobstep/jobstep-', '/jobstep/')
  pathName = pathName.replace('/pipelet/pipelet-', '/pipelet/')

  // Sort Pipelets into Groups
  if (group && pathName.includes('/pipelet/')) {
    pathName = pathName.replace('/pipelet/', `/pipelet/${group.toLowerCase().replace(/ /g, '-')}/`)
  }

  // Organize Job Steps into Groups
  if (group && pathName.includes('/jobstep/')) {
    pathName = pathName.replace('/jobstep/', `/jobstep/${group.toLowerCase().replace(/ /g, '-')}/`)
  }

  // Organize Script API into Groups
  pathName = pathName.replace('/script/class-top-level-', '/script/top-level/')
  pathName = pathName.replace('/script/class-dw-alert-', '/script/dw.alert/')
  pathName = pathName.replace('/script/class-dw-campaign-', '/script/dw.campaign/')
  pathName = pathName.replace('/script/class-dw-catalog-', '/script/dw.catalog/')
  pathName = pathName.replace('/script/class-dw-content-', '/script/dw.content/')
  pathName = pathName.replace('/script/class-dw-crypto-', '/script/dw.crypto/')
  pathName = pathName.replace('/script/class-dw-customer-', '/script/dw.customer/')
  pathName = pathName.replace('/script/class-dw-experience-', '/script/dw.experience/')
  pathName = pathName.replace('/script/class-dw-extensions-', '/script/dw.extensions/')
  pathName = pathName.replace('/script/class-dw-io-', '/script/dw.io/')
  pathName = pathName.replace('/script/class-dw-job-job-', '/script/dw.job/')
  pathName = pathName.replace('/script/class-dw-net-', '/script/dw.net/')
  pathName = pathName.replace('/script/class-dw-object-', '/script/dw.object/')
  pathName = pathName.replace('/script/class-dw-order-', '/script/dw.order/')
  pathName = pathName.replace('/script/class-dw-rpc-', '/script/dw.rpc/')
  pathName = pathName.replace('/script/class-dw-sitemap-sitemap-', '/script/dw.sitemap/')
  pathName = pathName.replace('/script/class-dw-suggest-', '/script/dw.suggest/')
  pathName = pathName.replace('/script/class-dw-svc-', '/script/dw.svc/')
  pathName = pathName.replace('/script/class-dw-system-', '/script/dw.system/')
  pathName = pathName.replace('/script/class-dw-template-', '/script/dw.template/')
  pathName = pathName.replace('/script/class-dw-util-', '/script/dw.util/')
  pathName = pathName.replace('/script/class-dw-value-', '/script/dw.value/')
  pathName = pathName.replace('/script/class-dw-web-', '/script/dw.web/')
  pathName = pathName.replace('/script/class-dw-ws-', '/script/dw.ws/')

  return `/prep/${version}${pathName}`
}
