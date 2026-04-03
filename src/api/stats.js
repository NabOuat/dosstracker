import axios from './axios'

// Les filtres par service sont maintenant gérés côté backend

/** GET /stats – statistiques globales du tableau de bord */
export async function getStats() {
  try {
    const response = await axios.get('/api/v1/stats')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    throw error
  }
}


/** GET /stats/performance – statistiques de performance par service */
export async function getPerformanceStats() {
  try {
    const response = await axios.get('/api/v1/stats/performance')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de performance:', error)
    throw error
  }
}

