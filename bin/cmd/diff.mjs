import { compareSync } from 'dir-compare'
import fs from 'fs'
import path from 'path'
import Debug from 'debug'
import { spawnSync } from 'child_process'
import { Glob } from 'glob'

import { DATA_FOLDER, DIFF_FOLDER, SUPPORTED_VERSIONS, VERSIONS_FOLDER } from '../config.mjs'

const debug = Debug('sfcc-docs:diff')
const SEP = path.sep

const options = {
  compareSize: false,
  compareContent: true,
}

let changeHistory = {}

export default async () => {
  debug('CMD: diff')

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

  // Loop through supported versions and compare to previous version
  versions.forEach((version, index) => {
    if (index === versions.length - 1) {
      return
    }

    const thisVersion = path.resolve(VERSIONS_FOLDER, version)
    const previousVersion = path.resolve(VERSIONS_FOLDER, versions[index + 1])

    debug(`Comparing ${version} <==> ${versions[index + 1]}`)
    const diffs = compareSync(thisVersion, previousVersion, options)

    if (!diffs.diffSet) {
      debug('No Changes Between Versions:', version, versions[index + 1])
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
            debug('MODIFIED:', version, fileName)
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
          debug('DELETED:', version, fileName)
          // File was there before and now it is not
          status = 'deleted'
        } else if (dif.type1 === 'file' && dif.type2 === 'missing') {
          debug('ADDED:', version, fileName)
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
  })

  // Make Data Directory if needed
  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER, { recursive: true })
  }

  // // Write new HTML file back out after cleaning
  fs.writeFileSync(`${DATA_FOLDER}${SEP}diffs.json`, JSON.stringify(changeHistory, null, 2))

  // Do some initial cleanup on the HTML files
  debug('Cleaning DIFF Files... ( this may take a while )')
  const files = new Glob(`${DIFF_FOLDER}${SEP}*.diff`, {})
  for await (const file of files) {
    let diffFile = fs.readFileSync(file)
    diffFile = diffFile.toString()

    // Remove stuff that is going to break our diffs
    const re = new RegExp(`${VERSIONS_FOLDER}`, 'g')
    diffFile = diffFile.replace(re, '')

    // Write new HTML file back out after cleaning
    fs.writeFileSync(file, diffFile)
  }
}
