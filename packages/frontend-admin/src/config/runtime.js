const DEFAULT_API_URL = 'http://localhost:5000/api'

function normalizeApiUrl(url) {
  const trimmedUrl = (url || DEFAULT_API_URL).trim().replace(/\/+$/, '')
  return trimmedUrl.endsWith('/api') ? trimmedUrl : `${trimmedUrl}/api`
}

function getSocketUrl(apiUrl) {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim()

  if (explicitSocketUrl) {
    return explicitSocketUrl.replace(/\/+$/, '')
  }

  return apiUrl.replace(/\/api$/, '')
}

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL)
export const SOCKET_URL = getSocketUrl(API_URL)
