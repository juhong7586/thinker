const path = require('path')
module.exports = {
  outputFileTracingRoot: path.join(__dirname, '.'),
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true } // optional to avoid ESLint blocking export
}
