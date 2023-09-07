import withMarkdoc from '@markdoc/next.js'

import withSearch from './src/markdoc/search.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true
  },
  pageExtensions: ['js', 'jsx', 'md'],
}

export default withSearch(withMarkdoc({ schemaPath: './src/markdoc' })(nextConfig))
