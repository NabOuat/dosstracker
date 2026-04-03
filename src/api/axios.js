import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attache le token d'accès à chaque requête
api.interceptors.request.use(config => {
  const token = localStorage.getItem('dostracker_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('Aucun token trouvé dans localStorage')
  }
  return config
})

// Gère l'expiration de session et le rafraîchissement automatique
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('dostracker_refresh_token')
        if (!refreshToken) {
          throw new Error('Refresh token manquant')
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/v1/auth/refresh-token`,
          { refresh_token: refreshToken }
        )

        const { access_token } = response.data
        localStorage.setItem('dostracker_access_token', access_token)

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`
        originalRequest.headers.Authorization = `Bearer ${access_token}`

        processQueue(null, access_token)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('dostracker_access_token')
        localStorage.removeItem('dostracker_refresh_token')
        localStorage.removeItem('dostracker_user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export default api
