import 'dotenv/config'
import fs from 'fs'
import md5 from 'md5'

import { getMeta } from '@/data/meta'
import { currentVersion } from '@/data/versions'

export default function handler(req, res) {
  // Setup Cache Key
  const hashKey = md5(`hash-${req.query.query}-${req.query.limit || 100}-${req.query.offset || 0}`)
  const cacheFile = process.cwd() + `/.cache/${hashKey}.json`

  if (fs.existsSync(cacheFile)) {
    try {
      const cachedJson = fs.readFileSync(cacheFile, 'utf8')
      res.setHeader('Cache-Control', 's-maxage=86400')
      res.status(200).json(JSON.parse(cachedJson))
    } catch (error) {
      // Return error
      res.status(400).json({ error: error.message, trace: error.stack })
    }
  } else {
    // Load Search Function
    import('@/markdoc/search.mjs').then(({ search }) => {
      try {
        // Perform Search
        const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sfccdocs.com'
        const results = search(req.query.query, {
          limit: req.query.limit ? parseInt(req.query.limit, 10) : 100,
          offset: req.query.offset ? parseInt(req.query.offset, 10) : 0,
        })

        // Loop through results
        results.map((result, index) => {
          // Add additional properties
          const parts = result.url ? result.url.split('#') : null
          const baseUri = parts[0]
          const anchor = parts.length > 1 ? `#${parts[1]}` : ''
          const deprecated = baseUri.startsWith('/deprecated/')
          const meta = getMeta(baseUri, deprecated)

          result.deprecated = deprecated
          result.title = meta.title
          result.description = meta.description
          result.keywords = meta.nav?.alt ? meta.nav.alt.split(' › ') : null
          result.url = `${baseURL}${result.url}`
          result.embed = `${baseURL}${baseUri}?embed=true${anchor}`
          result.content = result.content ? result.content.split('. ')[0] : null

          // Remove unneeded properties
          delete result.score

          if (result.pageTitle) {
            delete result.pageTitle
          }

          // Sort properties alphabetically for easier readability
          results[index] = Object.keys(result)
            .sort()
            .reduce((accumulator, key) => {
              accumulator[key] = result[key]

              return accumulator
            }, {})
        })

        const data = { total: results.length, results, version: currentVersion }
        fs.writeFileSync(cacheFile, JSON.stringify(data))

        // Return results
        res.setHeader('Cache-Control', 's-maxage=86400')
        res.status(200).json(data)
      } catch (error) {
        // Return error
        res.status(400).json({ error: error.message, trace: error.stack })
      }
    })
  }
}
