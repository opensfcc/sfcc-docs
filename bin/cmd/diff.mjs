import chalk from 'chalk'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import { compareSync } from 'dir-compare'
import { Glob } from 'glob'
import { spawnSync } from 'child_process'

import { DATA_FOLDER, DIFF_FOLDER, SUPPORTED_VERSIONS, VERSIONS_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:diff')
const SEP = path.sep

const options = {
  compareSize: false,
  compareContent: true,
}

let diffVersions = []
let changeHistory = {}

export default (cli) => {
  if (cli.verbose) {
    debug(chalk.magenta.bold('CMD:'), 'diff')
    debug(chalk.magenta.bold('VERSIONS:'), cli.version ? cli.version.split(',').join(', ') : 'All')
  }

  // Remove old prep folder for version if it exists
  if (fs.existsSync(DIFF_FOLDER)) {
    spawnSync('rm', ['-fr', DIFF_FOLDER])
  }

  // Make Diff Directory since we just deleted it
  if (!fs.existsSync(DIFF_FOLDER)) {
    fs.mkdirSync(DIFF_FOLDER, { recursive: true })
  }

  // Get current supported versions
  const versions = Object.keys(SUPPORTED_VERSIONS)

  // Loop through supported versions
  versions.forEach((version, index) => {
    // Check if we should skip this version
    if (cli.version && !cli.version.split(',').includes(version)) {
      if (cli.verbose) {
        debug(chalk.dim(`SKIPPING: ${version}`))
      }

      return
    }

    // No need to run
    if (index === versions.length - 1) {
      return
    }

    diffVersions.push(version)

    const thisVersion = path.resolve(VERSIONS_FOLDER, version)
    const previousVersion = path.resolve(VERSIONS_FOLDER, versions[index + 1])
    const diffs = compareSync(thisVersion, previousVersion, options)

    debug(chalk.green.bold(`DIFF: v${version} <==> v${versions[index + 1]}`))

    if (!diffs.diffSet) {
      return
    }

    diffs.diffSet.forEach((dif) => {
      // We only care about files
      const isFile1 = dif.type1 === 'file' || dif.type1 === 'missing'
      const isFile2 = dif.type2 === 'file' || dif.type2 === 'missing'

      // If neither is a file, we don't care
      if (!isFile1 && !isFile2) {
        return
      }

      // Get file name from current version
      let fileName = dif.name1

      // If the file was deleted, let's get what it used to be called
      if (!fileName) {
        fileName = dif.name2
      }

      // Exit if this is not an HTML file
      if (!fileName.endsWith('.html')) {
        return
      }

      if (dif.state !== 'equal') {
        let diffOutput = null
        let diffPatchFile = null
        let status = null

        // Files exists in both versions
        if (dif.reason === 'different-content') {
          // Lets get the diff ( just the basic here )
          const gitDiff = spawnSync('git', ['diff', '--shortstat', '--no-index', `${dif.path1}${SEP}${dif.name1}`, `${dif.path2}${SEP}${dif.name2}`, '--ignore-all-space', '--ignore-blank-lines'])
          diffOutput = gitDiff.stdout ? gitDiff.stdout.toString().trim() : null

          // Now let's generate a complete diff file
          if (diffOutput) {
            status = 'modified'

            diffPatchFile = `${fileName.replace('.html', '')}-${version}.diff`
            spawnSync('git', [
              'diff',
              '--patch',
              '--no-index',
              `${dif.path1}${SEP}${dif.name1}`,
              `${dif.path2}${SEP}${dif.name2}`,
              '--output',
              `${DIFF_FOLDER}${SEP}${diffPatchFile}`,
              '--minimal',
              '--ignore-all-space',
              '--ignore-blank-lines',
            ])
          }
        } else if (dif.type1 === 'missing' && dif.type2 === 'file') {
          // File was there before and now it is not
          status = 'deleted'
        } else if (dif.type1 === 'file' && dif.type2 === 'missing') {
          // File was not there before and now it is
          status = 'added'
        }

        // If we got a change, lets add it to the change history
        if (status) {
          // Create change history object
          if (!changeHistory[fileName]) {
            changeHistory[fileName] = []
          }

          // Clean up diff output
          diffOutput = diffOutput ? diffOutput.replace('1 file changed, ', '') : null

          // Add to change history
          changeHistory[fileName].push({
            version,
            status,
            label: diffOutput,
            diff: diffPatchFile,
          })
        }
      }
    })

    // Make Data Directory if needed
    if (!fs.existsSync(DATA_FOLDER)) {
      fs.mkdirSync(DATA_FOLDER, { recursive: true })
    }

    // Write new HTML file back out after cleaning
    fs.writeFileSync(`${DATA_FOLDER}${SEP}diffs.json`, JSON.stringify(changeHistory, null, 2))

    // Do some initial cleanup on the HTML files
    const files = new Glob(`${DIFF_FOLDER}${SEP}*.diff`, {})
    for (const file of files) {
      // We can skip this file if it is not in one pf our versions
      let fileVersion = file.replace(DIFF_FOLDER, '').split(SEP)
      fileVersion = fileVersion[fileVersion.length - 1].split('-')[1]
      fileVersion = fileVersion.replace('.diff', '')

      if (!diffVersions.includes(fileVersion)) {
        continue
      }

      let diffFile = fs.readFileSync(file)
      diffFile = diffFile.toString()

      // Remove stuff that is going to break our diffs
      const re = new RegExp(`${VERSIONS_FOLDER}`, 'g')
      diffFile = diffFile.replace(re, '')

      // Write new HTML file back out after cleaning
      fs.writeFileSync(file, diffFile)
    }

    debug(chalk.dim(`✔ Complete`))
  })

  debug(chalk.green.bold('✅ ALL DONE (๑˃̵ᴗ˂̵)و '))
}
