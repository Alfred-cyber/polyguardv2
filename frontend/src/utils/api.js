import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(new Error(err.response?.data?.detail || err.message || 'An error occurred'))
)

export const assessQuick  = (payload) => api.post('/assess/quick', payload).then(r => r.data)
export const assessFull   = (payload) => api.post('/assess/full', payload).then(r => r.data)
export const searchDrugs  = (q)       => api.get('/drugs/search', { params: { q } }).then(r => r.data.matches)
export const getDrugInfo  = (name)    => api.get(`/drugs/info/${name}`).then(r => r.data)
export const getTimingRules = (name)  => api.get(`/drugs/timing-rules/${name}`).then(r => r.data)
export const getHealth    = ()        => api.get('/health').then(r => r.data)

export default api
