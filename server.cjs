const dotenv = require('dotenv')
const cli = require('next/dist/cli/next-start')

dotenv.config()
cli.nextStart(['-p', process.env.PORT || 3000])
