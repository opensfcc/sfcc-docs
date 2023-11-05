import 'dotenv/config'

/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://sfccdocs.com',
  generateRobotsTxt: true,
  sitemapSize: 1000,
  changefreq: 'weekly',
}
