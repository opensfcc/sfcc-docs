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
      describe: 'Version(s)',
      type: 'string',
    },
    verbose: {
      describe: 'Verbose Output for More Debugging',
      type: 'boolean',
    },
  })
  .command('prep', 'Cleanup HTML for Markdown', {
    version: {
      alias: 'v',
      describe: 'Version(s)',
      type: 'string',
    },
    verbose: {
      describe: 'Verbose Output for More Debugging',
      type: 'boolean',
    },
  })
  .command('update-links', 'Update Anchor Tags in HTML', {
    version: {
      alias: 'v',
      describe: 'Version(s)',
      type: 'string',
    },
    verbose: {
      describe: 'Verbose Output for More Debugging',
      type: 'boolean',
    },
  })
  .command('convert', 'Convert HTML to Markdown', {
    version: {
      alias: 'v',
      describe: 'Version(s)',
      type: 'string',
    },
    verbose: {
      describe: 'Verbose Output for More Debugging',
      type: 'boolean',
    },
  })
  .command('diff', 'Build Version DIFFs', {
    version: {
      alias: 'v',
      describe: 'Version(s)',
      type: 'string',
    },
    verbose: {
      describe: 'Verbose Output for More Debugging',
      type: 'boolean',
    },
  })
  .command('build-nav', 'Build Site Navigation', {
    version: {
      alias: 'v',
      describe: 'Version(s)',
      type: 'string',
    },
    verbose: {
      describe: 'Verbose Output for More Debugging',
      type: 'boolean',
    },
  })
  .command('update-site', 'Update Site with New Content', {
    version: {
      alias: 'v',
      describe: 'Version(s)',
      type: 'string',
    },
    verbose: {
      describe: 'Verbose Output for More Debugging',
      type: 'boolean',
    },
  })
  .example('sfcc-docs init', 'Initialize and download all versions')
  .example('sfcc-docs init -v 23.9', 'Initialize and download only v23.9')
  .example('sfcc-docs prep', 'Prepare all versions for conversion')
  .example('sfcc-docs prep -v 23.8,23.9', 'Prepare v23.8 and v23.9 for conversion')
  .example('sfcc-docs update-links', 'Update anchor tags for all versions')
  .example('sfcc-docs update-links -v 23.8', 'Update anchor tags for v23.8')
  .example('sfcc-docs convert', 'Convert HTML to Markdown for all versions')
  .example('sfcc-docs convert -v 23.8', 'Convert HTML to Markdown for v23.8')
  .example('sfcc-docs diff', 'Generate DIFF files for all versions')
  .example('sfcc-docs diff -v 23.8,23.9', 'Generate DIFF for v23.8 and v23.9')
  .example('sfcc-docs update-site', 'Copy all generated files to site')
  .example('sfcc-docs update-site -v 23.8', 'Copy generated files for v23.8 to site')
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
