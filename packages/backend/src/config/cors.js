require('dotenv').config()

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
]

function parseAllowedOrigins() {
  const rawOrigins = process.env.FRONTEND_URLS || process.env.CORS_ORIGIN || ''

  if (!rawOrigins.trim()) {
    return DEFAULT_ALLOWED_ORIGINS
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

const allowedOrigins = parseAllowedOrigins()

function isAllowedOrigin(origin) {
  if (!origin) {
    return true
  }

  if (allowedOrigins.includes(origin)) {
    return true
  }

  if (origin.endsWith('.up.railway.app')) {
    return true
  }

  return false
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`))
  },
  credentials: true
}

module.exports = {
  allowedOrigins,
  corsOptions
}
