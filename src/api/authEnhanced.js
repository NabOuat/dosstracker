/**
 * API Auth Améliorée - Authentification avec refresh tokens et 2FA
 */
import axios from './axios'
import logger from '../utils/logger'

/**
 * POST /auth/login - Connexion avec refresh token
 */
export async function loginEnhanced(username, password) {
  logger.debug('loginEnhanced appelée', { username })
  try {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    
    logger.debug('Envoi de la requête POST /api/v1/auth/login', { username })
    const response = await axios.post('/api/v1/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    
    logger.info('Réponse réussie de /api/v1/auth/login', { 
      username,
      userId: response.data.user_id 
    })
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Nom d\'utilisateur ou mot de passe incorrect.'
    logger.error('Erreur lors de loginEnhanced', {
      username,
      status: error.response?.status,
      message: errorMessage,
      fullError: error.message
    })
    throw new Error(errorMessage)
  }
}

/**
 * POST /auth/refresh-token - Rafraîchir le token d'accès
 */
export async function refreshAccessToken(refreshToken) {
  logger.debug('refreshAccessToken appelée')
  try {
    logger.debug('Envoi de la requête POST /api/v1/auth/refresh-token')
    const response = await axios.post('/api/v1/auth/refresh-token', {
      refresh_token: refreshToken
    })
    
    logger.info('Token rafraîchi avec succès')
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Erreur lors du rafraîchissement du token.'
    logger.error('Erreur lors de refreshAccessToken', {
      status: error.response?.status,
      message: errorMessage
    })
    throw new Error(errorMessage)
  }
}

/**
 * POST /auth/logout - Déconnexion avec invalidation de session
 */
export async function logoutEnhanced() {
  logger.debug('logoutEnhanced appelée')
  try {
    logger.debug('Envoi de la requête POST /api/v1/auth/logout')
    const response = await axios.post('/api/v1/auth/logout')
    logger.info('Déconnexion réussie')
    return response.data
  } catch (error) {
    logger.warn('Erreur lors de la déconnexion (ignorée)', {
      status: error.response?.status,
      message: error.message
    })
    return { ok: true }
  }
}

/**
 * GET /auth/sessions - Récupérer les sessions actives
 */
export async function getActiveSessions() {
  logger.debug('getActiveSessions appelée')
  try {
    logger.debug('Envoi de la requête GET /api/v1/auth/sessions')
    const response = await axios.get('/api/v1/auth/sessions')
    logger.info('Sessions actives récupérées', { count: response.data.total })
    return response.data
  } catch (error) {
    logger.error('Erreur lors de la récupération des sessions', {
      status: error.response?.status,
      message: error.message
    })
    throw new Error('Erreur lors de la récupération des sessions')
  }
}

/**
 * POST /auth/2fa/send - Envoyer un code 2FA
 */
export async function send2FACode() {
  logger.debug('send2FACode appelée')
  try {
    logger.debug('Envoi de la requête POST /api/v1/auth/2fa/send')
    const response = await axios.post('/api/v1/auth/2fa/send')
    logger.info('Code 2FA envoyé avec succès')
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Erreur lors de l\'envoi du code 2FA.'
    logger.error('Erreur lors de send2FACode', {
      status: error.response?.status,
      message: errorMessage
    })
    throw new Error(errorMessage)
  }
}

/**
 * POST /auth/2fa/verify - Vérifier un code 2FA
 */
export async function verify2FACode(code) {
  logger.debug('verify2FACode appelée')
  try {
    logger.debug('Envoi de la requête POST /api/v1/auth/2fa/verify')
    const response = await axios.post('/api/v1/auth/2fa/verify', null, {
      params: { code }
    })
    logger.info('Code 2FA vérifié avec succès')
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Code 2FA invalide.'
    logger.error('Erreur lors de verify2FACode', {
      status: error.response?.status,
      message: errorMessage
    })
    throw new Error(errorMessage)
  }
}
