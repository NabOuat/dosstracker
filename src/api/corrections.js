import axios from './axios'

/** POST /corrections – Créer un retour de correction */
export async function createCorrection(dossierId, agentId, elementTransmis) {
  try {
    const response = await axios.post('/api/v1/corrections/', {
      dossier_id: dossierId,
      agent_transmettant_id: agentId,
      elements_transmis: elementTransmis,
    })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la création de la correction:', error)
    throw error
  }
}

/** GET /corrections/dossier/:id – Récupérer les corrections d'un dossier */
export async function getCorrectionsDossier(dossierId) {
  try {
    const response = await axios.get(`/api/v1/corrections/dossier/${dossierId}`)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la récupération des corrections du dossier ${dossierId}:`, error)
    throw error
  }
}

/** GET /corrections/:id – Récupérer une correction spécifique */
export async function getCorrection(correctionId) {
  try {
    const response = await axios.get(`/api/v1/corrections/${correctionId}`)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la récupération de la correction ${correctionId}:`, error)
    throw error
  }
}

/** PUT /corrections/:id – Mettre à jour une correction */
export async function updateCorrection(correctionId, data) {
  try {
    const response = await axios.put(`/api/v1/corrections/${correctionId}`, data)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la correction ${correctionId}:`, error)
    throw error
  }
}

/** DELETE /corrections/:id – Supprimer un retour de correction */
export async function deleteCorrection(correctionId) {
  try {
    const response = await axios.delete(`/api/v1/corrections/${correctionId}`)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la suppression de la correction ${correctionId}:`, error)
    throw error
  }
}
