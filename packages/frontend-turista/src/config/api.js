import axios from 'axios'
import { API_URL } from './runtime'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
