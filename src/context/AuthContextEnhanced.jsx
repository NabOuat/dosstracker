import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { loginEnhanced, logoutEnhanced, refreshAccessToken } from '../api/authEnhanced'
import logger from '../utils/logger'

const AuthContext = createContext(null)
const LS_USER = 'dostracker_user'
const LS_ACCESS_TOKEN = 'dostracker_access_token'
const LS_REFRESH_TOKEN = 'dostracker_refresh_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem(LS_USER)) ?? null
      if (storedUser) {
        logger.debug('Utilisateur restauré depuis localStorage', { username: storedUser.username })
      }
      return storedUser
    } catch (e) {
      logger.error('Erreur lors de la restauration de l\'utilisateur depuis localStorage', e)
      return null
    }
  })

  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false)

  // Configurer un intervalle pour rafraîchir le token avant expiration
  useEffect(() => {
    if (!user) return

    const refreshInterval = setInterval(async () => {
      const refreshToken = localStorage.getItem(LS_REFRESH_TOKEN)
      if (!refreshToken) return

      try {
        logger.debug('Rafraîchissement automatique du token')
        const response = await refreshAccessToken(refreshToken)
        localStorage.setItem(LS_ACCESS_TOKEN, response.access_token)
        logger.debug('Token rafraîchi automatiquement')
      } catch (error) {
        logger.warn('Erreur lors du rafraîchissement automatique du token', error.message)
      }
    }, 25 * 60 * 1000) // Rafraîchir tous les 25 minutes (token expire après 30)

    return () => clearInterval(refreshInterval)
  }, [user])

  const login = useCallback(async (username, password) => {
    logger.debug('Appel de loginEnhanced', { username })
    try {
      const response = await loginEnhanced(username, password)
      logger.debug('Réponse loginEnhanced reçue', { response })

      // La réponse contient directement les données utilisateur et les tokens
      const userData = {
        user_id: response.user_id,
        username: response.username,
        nom_complet: response.nom_complet,
        service_id: response.service_id,
        service: response.service
      }

      logger.debug('Données utilisateur extraites', { username: userData.username })

      // Sauvegarder les tokens et les données
      localStorage.setItem(LS_ACCESS_TOKEN, response.access_token)
      localStorage.setItem(LS_REFRESH_TOKEN, response.refresh_token)
      localStorage.setItem(LS_USER, JSON.stringify(userData))
      logger.debug('Tokens et données sauvegardés dans localStorage')

      setUser(userData)
      logger.info('Utilisateur connecté avec succès', { username: userData.username })
      return userData
    } catch (error) {
      logger.error('Erreur lors de l\'appel loginEnhanced', {
        username,
        error: error.message,
        status: error.response?.status
      })
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    logger.info('Déconnexion de l\'utilisateur', { username: user?.username })
    try {
      await logoutEnhanced()
      logger.debug('Appel logoutEnhanced réussi')
    } catch (e) {
      logger.warn('Erreur lors de l\'appel logoutEnhanced (ignorée)', e.message)
    }
    localStorage.removeItem(LS_ACCESS_TOKEN)
    localStorage.removeItem(LS_REFRESH_TOKEN)
    localStorage.removeItem(LS_USER)
    setUser(null)
    logger.info('Utilisateur déconnecté')
  }, [user])

  const refreshToken = useCallback(async () => {
    if (isTokenRefreshing) return

    setIsTokenRefreshing(true)
    try {
      const refreshTokenValue = localStorage.getItem(LS_REFRESH_TOKEN)
      if (!refreshTokenValue) {
        throw new Error('Refresh token manquant')
      }

      logger.debug('Rafraîchissement manuel du token')
      const response = await refreshAccessToken(refreshTokenValue)
      localStorage.setItem(LS_ACCESS_TOKEN, response.access_token)
      logger.info('Token rafraîchi manuellement')
      return response.access_token
    } catch (error) {
      logger.error('Erreur lors du rafraîchissement du token', {
        error: error.message
      })
      // Si le refresh token est invalide, déconnecter l'utilisateur
      await logout()
      throw error
    } finally {
      setIsTokenRefreshing(false)
    }
  }, [logout, isTokenRefreshing])

  const getAccessToken = useCallback(() => {
    return localStorage.getItem(LS_ACCESS_TOKEN)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        refreshToken,
        getAccessToken,
        isTokenRefreshing
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans <AuthProvider>')
  return ctx
}
