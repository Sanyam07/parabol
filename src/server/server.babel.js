require('./babelRegister')

// for sentry
global.__rootdir__ = __dirname || process.cwd()

const ignorePatterns = [
  '\\/\\.',
  '~$',
  '\\.json$',
  'src/server/database/migrations/.*$',
  'src/server/billing/.*$',
  '__tests__*$'
]

const ignoreRegexp = new RegExp(ignorePatterns.join('|'), 'i')
if (process.env.NODE_ENV !== 'production') {
  const hasChanged = require('piping')({
    // eslint-disable-line
    hook: false,
    ignore: ignoreRegexp
  })
  if (!hasChanged) {
    return
  }
}
require('./server')
