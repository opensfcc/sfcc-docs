import withMarkdoc from '@markdoc/next.js'

import withSearch from './src/markdoc/search.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  distDir: 'dist',
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md'],
}

export default withSearch(withMarkdoc({ schemaPath: './src/markdoc' })(nextConfig))
