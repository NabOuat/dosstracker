import axios from './axios'

/** GET /service-dashboard/overview – Aperçu du tableau de bord du service */
export async function getServiceDashboardOverview() {
  try {
    const response = await axios.get('/api/v1/service-dashboard/overview')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord du service:', error)
    throw error
  }
}

/** GET /service-dashboard/dossiers-par-region – Dossiers par région */
export async function getDossiersParRegion() {
  try {
    const response = await axios.get('/api/v1/service-dashboard/dossiers-par-region')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers par région:', error)
    throw error
  }
}

/** GET /service-dashboard/utilisateurs – Utilisateurs du service */
export async function getUtilisateursService() {
  try {
    const response = await axios.get('/api/v1/service-dashboard/utilisateurs')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs du service:', error)
    throw error
  }
}
