import path from 'path'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const DOCS_FOLDER = path.resolve(__dirname, '../.b2c-dev-doc')
export const PREP_FOLDER = path.resolve(DOCS_FOLDER, 'prep')
export const VERSIONS_FOLDER = path.resolve(DOCS_FOLDER, 'versions')

export const SUPPORTED_VERSIONS = {
  23.9: {
    release: 'upcoming',
  },
  23.8: {
    release: 'current',
  },
}
