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
    debug(
      chalk.red.bold(
        `✖ ERROR: ${version} does not exist at ${folder.replace(
          DOCS_FOLDER,
          '.b2c-dev-doc'
        )}/${version}`
      )
    )

    return false
  }

  debug(`Using version ${version} at ${versionFolder}`)

  return versionFolder
}

export function isHelpfulFile(uri) {
  return (
    typeof uri === 'string' &&
    !uri.endsWith('/classList.html') &&
    !uri.endsWith('/jobstepapi/html/index.html') &&
    !uri.endsWith('/jobStepList.html') &&
    !uri.endsWith('/overview.html') &&
    !uri.endsWith('/packageList.html') &&
    !uri.endsWith('/pipeletapi/html/index.html') &&
    !uri.endsWith('/pipeletList.html') &&
    !uri.endsWith('/scriptapi/html/index.html') &&
    !uri.includes('/compareapi/') &&
    !uri.includes('/content/') &&
    !uri.includes('/pipeletapi/html/api/group.') &&
    !uri.includes('/scriptapi/html/api/package_') &&
    !uri.includes('/xsd/') &&
    uri.endsWith('.html')
  )
}

export function prepURI(uri, version) {
  // Do some fancy cleanup to file path to better organize content
  let pathName = uri.replace(`${DOCS_FOLDER}/versions/${version}`, '').trim()

  // Convert Camel Case to Snake Case ( but ignore multiple uppercase in a row )
  pathName = pathName.replace(
    /([A-Z])([a-z])/g,
    (_, upper, lower) => `-${upper.toLowerCase()}${lower}`
  )

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
  pathName = pathName.replace('/class-top-level-', '/class-')

  // Organize Job Steps into Groups
  pathName = pathName.replace('/jobstep/execute-', '/jobstep/execute/')
  pathName = pathName.replace('/jobstep/export-', '/jobstep/export/')
  pathName = pathName.replace('/jobstep/import-', '/jobstep/import/')

  // Organize Pipelets into Groups
  pathName = pathName.replace('/pipelet/add-', '/pipelet/add/')
  pathName = pathName.replace('/pipelet/create-', '/pipelet/create/')
  pathName = pathName.replace('/pipelet/export-', '/pipelet/export/')
  pathName = pathName.replace('/pipelet/get-', '/pipelet/get/')
  pathName = pathName.replace('/pipelet/import-', '/pipelet/import/')
  pathName = pathName.replace('/pipelet/remove-', '/pipelet/remove/')
  pathName = pathName.replace('/pipelet/search-', '/pipelet/search/')
  pathName = pathName.replace('/pipelet/set-', '/pipelet/set/')
  pathName = pathName.replace('/pipelet/update-', '/pipelet/update/')
  pathName = pathName.replace('/pipelet/validate-', '/pipelet/validate/')
  pathName = pathName.replace('/pipelet/verify-', '/pipelet/verify/')

  return `/prep/${version}${pathName}`
}
