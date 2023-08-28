#!/usr/bin/env node

import chalk from 'chalk'
import Debug from 'debug'
import yargs from 'yargs'

import { hideBin } from 'yargs/helpers'

const debug = Debug('sfcc-docs:cli')

const cli = yargs(hideBin(process.argv))
  .scriptName('sfcc-docs')
  .usage('Usage: sfcc-docs <command> --switches')
  .command('init', 'Initialize and Download Resources', {
    version: {
      alias: 'v',
      describe: 'Version',
      type: 'string',
    },
  })
  .command('prep', 'Cleanup HTML for Markdown', {
    version: {
      alias: 'v',
      describe: 'Version',
      type: 'string',
    },
  })
  .command('update-links', 'Update Anchor Tags in HTML', {
    version: {
      alias: 'v',
      describe: 'Version',
      type: 'string',
    },
  })
  .command('convert', 'Convert HTML to Markdown', {
    version: {
      alias: 'v',
      describe: 'Version',
      type: 'string',
    },
  })
  .command('build-nav', 'Build navigation for version', {
    version: {
      alias: 'v',
      describe: 'Version',
      type: 'string',
    },
  })
  .example('sfcc-docs init', 'Initialize and Download Resources')
  .example('sfcc-docs prep -v 23.8', 'Prepare v23.8 for this site')
  .example('sfcc-docs update-links -v 23.8', 'Update Anchor Tags for v23.8')
  .example('sfcc-docs convert -v 23.8', 'Convert HTML to Markdown for v23.8')
  .example('sfcc-docs build-nav -v 23.8', 'Generate Navigation for v23.8')
  .example(' ', ' ')
  .example('----------------------------------', '----------------------------------')
  .example('NEED MORE HELP ?', 'https://bit.ly/sfcc-docs-help')
  .example('----------------------------------', '----------------------------------')
  .demand(1)
  .help()
  .version(false).argv

const command = cli._[0]

try {
  const { default: cmd } = await import(`./cmd/${command}.mjs`)
  cmd(cli)
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log(chalk.red.bold(`\n✖ Command 'sfcc-docs ${command}' not recognized\n`))
    console.log('Use ' + chalk.cyan('sfcc-docs help') + ' for a list of commands\n')
  } else {
    throw err
  }
}
