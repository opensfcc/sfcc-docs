import withMarkdoc from '@markdoc/next.js'
import nextPWA from 'next-pwa'
import runtimeCaching from 'next-pwa/cache.js'
import withSearch from './src/markdoc/search.mjs'

const withPWA = nextPWA({
  dest: 'public',
  runtimeCaching,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  pageExtensions: ['js', 'jsx', 'md'],
}

export default withSearch(withMarkdoc({ schemaPath: './src/markdoc' })(withPWA(nextConfig)))
