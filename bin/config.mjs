import path from 'path'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const DOCS_FOLDER = path.resolve(__dirname, '../.b2c-dev-doc')
export const DATA_FOLDER = path.resolve(DOCS_FOLDER, 'data')
export const DIFF_FOLDER = path.resolve(DOCS_FOLDER, 'diff')
export const MARKDOWN_FOLDER = path.resolve(DOCS_FOLDER, 'markdown')
export const PREP_FOLDER = path.resolve(DOCS_FOLDER, 'prep')
export const VERSIONS_FOLDER = path.resolve(DOCS_FOLDER, 'versions')

// prettier-ignore
export const SUPPORTED_VERSIONS = {
  '23.9': {
    release: 'upcoming',
  },
  '23.8': {
    release: 'current',
  },
  '23.6': {
    release: 'previous',
  },
  '23.1': {
    release: 'previous',
  },
  '22.10': {
    release: 'previous',
  },
  '22.8': {
    release: 'previous',
  },
  '22.7': {
    release: 'previous',
  },
  '22.6': {
    release: 'previous',
  },
  '22.4': {
    release: 'previous',
  },
  '22.3': {
    release: 'previous',
  },
  '21.9': {
    release: 'previous',
  },
  '20.8': {
    release: 'previous',
  },
  '20.1': {
    release: 'previous',
  },
  '19.10': {
    release: 'previous',
  },
  '19.8': {
    release: 'previous',
  },
  '19.6': {
    release: 'previous',
  },
  '19.4': {
    release: 'previous',
  },
  '18.9': {
    release: 'previous',
  },
  '18.8': {
    release: 'previous',
  },
  '18.7': {
    release: 'previous',
  },
}
