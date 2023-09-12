import 'dotenv/config'
import fs from 'fs'
import path from 'path'

import { fileURLToPath } from 'url'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Docs Folders
export const DOCS_FOLDER = path.resolve(__dirname, '../.b2c-dev-doc')
export const DATA_FOLDER = path.resolve(DOCS_FOLDER, 'data')
export const DIFF_FOLDER = path.resolve(DOCS_FOLDER, 'diff')
export const MARKDOWN_FOLDER = path.resolve(DOCS_FOLDER, 'markdown')
export const PREP_FOLDER = path.resolve(DOCS_FOLDER, 'prep')
export const TEMP_FOLDER = path.resolve(DOCS_FOLDER, 'temp')
export const VERSIONS_FOLDER = path.resolve(DOCS_FOLDER, 'versions')

// Source Folders
export const SRC_FOLDER = path.resolve(__dirname, '../src')
export const SRC_DATA_FOLDER = path.resolve(SRC_FOLDER, 'data')
export const SRC_JSON_FOLDER = path.resolve(SRC_DATA_FOLDER, 'json')
export const SRC_PAGES_FOLDER = path.resolve(SRC_FOLDER, 'pages')

// Public Folders
export const PUBLIC_FOLDER = path.resolve(__dirname, '../public')
export const PUBLIC_JSON_FOLDER = path.resolve(PUBLIC_FOLDER, 'json')

// Supported Versions
export const SUPPORTED_VERSIONS_FILE = path.resolve(DATA_FOLDER, 'supported.json')

// Read supported versions from file
let supportedVersions = null
if (fs.existsSync(SUPPORTED_VERSIONS_FILE)) {
  const supportedVersionsFile = fs.readFileSync(SUPPORTED_VERSIONS_FILE, 'utf8')
  supportedVersions = JSON.parse(supportedVersionsFile)
}

// Export version information
export const SUPPORTED_VERSIONS = supportedVersions
export const UPCOMING_VERSION = supportedVersions ? supportedVersions.find((version) => version.release === 'upcoming').value : null
export const CURRENT_VERSION = supportedVersions ? supportedVersions.find((version) => version.release === 'current').value : null
export const SELECTED_VERSION = process.env.SELECTED_VERSION && supportedVersions ? supportedVersions.find((version) => version.value === process.env.SELECTED_VERSION.toString()).value : CURRENT_VERSION
