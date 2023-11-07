import withMarkdoc from '@markdoc/next.js'
import nextPWA from 'next-pwa'
import runtimeCaching from 'next-pwa/cache.js'
import withSearch from './src/markdoc/search.mjs'

const getCorsHeaders = () => {
  const headers = {}

  headers['Access-Control-Allow-Origin'] = '*'
  headers['Access-Control-Allow-Credentials'] = 'true'
  headers['Access-Control-Allow-Methods'] = 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  headers['Access-Control-Allow-Headers'] = 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'

  return Object.entries(headers).map(([key, value]) => ({ key, value }))
}

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
  images: {
    unoptimized: true,
  },
  pageExtensions: ['js', 'jsx', 'md'],
  distDir: '_next',
  generateBuildId: async () => {
    if (process.env.BUILD_ID) {
      return process.env.BUILD_ID
    } else {
      return `${new Date().getTime()}`
    }
  },
  headers: async () => {
    return [
      {
        source: '/api/(.*)',
        headers: getCorsHeaders(),
      },
    ]
  },
}

export default withSearch(withMarkdoc({ schemaPath: './src/markdoc' })(withPWA(nextConfig)))
