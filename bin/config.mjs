import fs from 'fs'
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

export const SRC_FOLDER = path.resolve(__dirname, '../src')
export const SRC_DATA_FOLDER = path.resolve(SRC_FOLDER, 'data')
export const SRC_JSON_FOLDER = path.resolve(SRC_DATA_FOLDER, 'json')
export const SRC_PAGES_FOLDER = path.resolve(SRC_FOLDER, 'pages')

export const SUPPORTED_VERSIONS_FILE = path.resolve(DATA_FOLDER, 'supported.json')

let supportedVersions = null
if (fs.existsSync(SUPPORTED_VERSIONS_FILE)) {
  const supportedVersionsFile = fs.readFileSync(SUPPORTED_VERSIONS_FILE, 'utf8')
  supportedVersions = JSON.parse(supportedVersionsFile)
}

export const SUPPORTED_VERSIONS = supportedVersions
export const CURRENT_VERSION = supportedVersions ? supportedVersions.find((version) => version.release === 'current').value : null
