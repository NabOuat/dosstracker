import axios from './axios'

/** POST /pieces-jointes/upload – Upload un fichier (PDF/Image) */
export async function uploadPieceJointe(dossierId, file) {
  try {
    const formData = new FormData()
    formData.append('dossier_id', dossierId)
    formData.append('file', file)

    const response = await axios.post('/api/v1/pieces-jointes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error)
    throw error
  }
}

/** GET /pieces-jointes/dossier/{dossier_id} – Récupère les pièces jointes d'un dossier */
export async function getPiecesJointesDossier(dossierId) {
  try {
    const response = await axios.get(`/api/v1/pieces-jointes/dossier/${dossierId}`)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des pièces jointes:', error)
    throw error
  }
}

/** DELETE /pieces-jointes/{piece_id} – Supprime une pièce jointe */
export async function deletePieceJointe(pieceId) {
  try {
    const response = await axios.delete(`/api/v1/pieces-jointes/${pieceId}`)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la suppression de la pièce jointe:', error)
    throw error
  }
}
