import { createContext, useContext, useState, useCallback } from 'react'
import { loginApi, logoutApi } from '../api/auth'
import logger from '../utils/logger'

const AuthContext = createContext(null)
const LS_USER  = 'dostracker_user'
const LS_TOKEN = 'dostracker_access_token'

/** Extrait les initiales depuis un nom complet */
function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

/** Couleur d'avatar par service_id */
const SERVICE_COLORS = { 1: 'orange', 2: 'blue', 3: 'green', 4: 'purple' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem(LS_USER)) ?? null
      if (storedUser) {
        logger.debug('Utilisateur restauré depuis localStorage', { username: storedUser.username })
        // Rétro-compatibilité : dériver les champs d'affichage s'ils manquent
        if (!storedUser.initials || !storedUser.color) {
          const displayName = storedUser.nom_complet || storedUser.username
          storedUser.label    = storedUser.label    ?? displayName
          storedUser.initials = getInitials(displayName)
          storedUser.color    = SERVICE_COLORS[storedUser.service_id] ?? 'orange'
          localStorage.setItem(LS_USER, JSON.stringify(storedUser))
        }
      }
      return storedUser
    }
    catch (e) {
      logger.error('Erreur lors de la restauration de l\'utilisateur depuis localStorage', e)
      return null
    }
  })

  const login = useCallback(async (username, password) => {
    logger.debug('Appel de loginApi', { username })
    try {
      const response = await loginApi(username, password)
      logger.debug('Réponse loginApi reçue', { response })
      
      // La réponse contient directement les données utilisateur et le token
      const displayName = response.nom_complet || response.username
      const userData = {
        user_id: response.user_id,
        username: response.username,
        nom_complet: response.nom_complet,
        service_id: response.service_id,
        service: response.service,
        label: displayName,
        initials: getInitials(displayName),
        color: SERVICE_COLORS[response.service_id] ?? 'orange',
      }
      
      logger.debug('Données utilisateur extraites', { username: userData.username })
      
      localStorage.setItem(LS_TOKEN, response.access_token)
      localStorage.setItem(LS_USER, JSON.stringify(userData))
      logger.debug('Données sauvegardées dans localStorage')
      
      setUser(userData)
      logger.info('Utilisateur connecté avec succès', { username: userData.username })
      return userData
    } catch (error) {
      logger.error('Erreur lors de l\'appel loginApi', {
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
      await logoutApi()
      logger.debug('Appel logoutApi réussi')
    } catch (e) { 
      logger.warn('Erreur lors de l\'appel logoutApi (ignorée)', e.message)
    }
    localStorage.removeItem(LS_TOKEN)
    localStorage.removeItem(LS_USER)
    setUser(null)
    logger.info('Utilisateur déconnecté')
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans <AuthProvider>')
  return ctx
}
