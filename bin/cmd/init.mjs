import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'

import { spawnSync } from 'child_process'

import { SUPPORTED_VERSIONS, VERSIONS_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:init')

export default () => {
  // Create versions folder if needed
  if (!fs.existsSync(VERSIONS_FOLDER)) {
    fs.mkdirSync(VERSIONS_FOLDER, {
      recursive: true,
    })
  }

  // Get current supported versions
  const versions = Object.keys(SUPPORTED_VERSIONS)

  // Download each version from our server if needed
  versions.forEach((version) => {
    // Check if we already have the version
    if (!fs.existsSync(`${VERSIONS_FOLDER}/${version}`)) {
      // Download ZIP files containing data
      debug(`Downloading ${version}...`)

      // NOTE: Here we are just downloading packaged versions to our machine.
      //       Our saved packages help avoid hitting SFCC servers too much.
      //       Auth headers prevent random bots from hitting our server.
      //       It is not to protect any data, this stuff was public.
      try {
        // Fetch Zip Files
        // prettier-ignore
        const response_code = spawnSync('curl', [
          '--silent', '--write-out', '%{response_code}',
          `https://docs.sfccdocs.com/${version}.zip`,
          '-H', `${atob('QXV0aG9yaXphdGlvbjogQmFzaWMgYzJaalkyUmxkbTl3Y3pwelptTmpMV1J2WTNNPQ==')}`,
          '-L', '-o', `${VERSIONS_FOLDER}/${version}.zip`
        ])

        // Check HTTP Response Code
        const http_response = response_code.stdout.toString()
        if (http_response !== '200') {
          debug(chalk.red.bold(`✖ ERROR: Download Failed for ${version} - Receive HTTP Error Code ${http_response}`))
          debug(chalk.red.bold(`✖        Receive HTTP Error Code ${http_response}`))
        } else {
          // Extract Zip Files
          debug(`Unzipping ${version}...`)
          spawnSync('unzip', [`${VERSIONS_FOLDER}/${version}.zip`, '-d', VERSIONS_FOLDER])
        }
      } catch (error) {
        debug(chalk.red.bold(`✖ ERROR: Download Failed for ${version}`))
        debug(chalk.red.bold(`✖        ${error.message}`))
      }
    } else {
      debug(chalk.green.bold(`✔ Already Downloaded ${version}`))
    }

    // Cleanup
    if (fs.existsSync(`${VERSIONS_FOLDER}/${version}.zip`)) {
      debug(`Removing Zip File ${version}...`)
      spawnSync('rm', [`${VERSIONS_FOLDER}/${version}.zip`])
    }
  })
}
