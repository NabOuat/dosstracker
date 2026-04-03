import { useState, useEffect } from 'react'
import { Upload, X, File, Trash2, AlertCircle } from 'lucide-react'
import { uploadPieceJointe, getPiecesJointesDossier, deletePieceJointe } from '../api/piecesJointes'
import Button from './ui/Button'
import Alert from './ui/Alert'
import { motion, AnimatePresence } from 'framer-motion'

export default function FileUploadModal({ dossierId, isOpen, onClose }) {
  const [files, setFiles] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isOpen && dossierId) {
      loadPiecesJointes()
    }
  }, [isOpen, dossierId])

  const loadPiecesJointes = async () => {
    try {
      const pieces = await getPiecesJointesDossier(dossierId)
      setUploadedFiles(pieces || [])
    } catch (err) {
      console.error('Erreur lors du chargement des pièces jointes:', err)
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase()
      const validExts = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp']
      if (!validExts.includes(ext)) {
        setError(`Format non autorisé: ${file.name}`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`Fichier trop volumineux: ${file.name} (max 10 MB)`)
        return false
      }
      return true
    })
    setFiles(prev => [...prev, ...validFiles])
    setError('')
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      for (const file of files) {
        await uploadPieceJointe(dossierId, file)
      }
      setSuccess(`✅ ${files.length} fichier(s) uploadé(s) avec succès`)
      setFiles([])
      await loadPiecesJointes()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erreur lors de l\'upload'
      setError(`❌ ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFile = async (pieceId) => {
    setDeleting(pieceId)
    try {
      await deletePieceJointe(pieceId)
      setSuccess('✅ Fichier supprimé avec succès')
      await loadPiecesJointes()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erreur lors de la suppression'
      setError(`❌ ${errorMsg}`)
    } finally {
      setDeleting(null)
    }
  }

  const removeFileFromList = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Upload size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-neutral-900">Joindre des fichiers</h2>
              <p className="text-xs text-neutral-500">PDFs et images (max 10 MB par fichier)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Zone d'upload */}
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <label className="cursor-pointer block">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Upload size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Cliquez pour sélectionner</p>
                  <p className="text-sm text-neutral-500">ou glissez-déposez vos fichiers</p>
                </div>
              </div>
            </label>
          </div>

          {/* Fichiers en attente d'upload */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900 text-sm">Fichiers à uploader ({files.length})</h3>
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File size={16} className="text-neutral-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900 truncate">{file.name}</p>
                        <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFileFromList(idx)}
                      className="p-1 rounded hover:bg-neutral-200 transition-colors flex-shrink-0"
                    >
                      <X size={16} className="text-neutral-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fichiers uploadés */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900 text-sm">Fichiers uploadés ({uploadedFiles.length})</h3>
              <div className="space-y-2">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File size={16} className="text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900 truncate">{file.nom_original}</p>
                        <p className="text-xs text-neutral-500">{formatFileSize(file.taille_octets)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={deleting === file.id}
                      className="p-1 rounded hover:bg-red-100 transition-colors flex-shrink-0 disabled:opacity-50"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedFiles.length === 0 && files.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              <p className="text-sm">Aucun fichier uploadé pour ce dossier</p>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6 flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
          {files.length > 0 && (
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={loading}
            >
              <Upload size={15} /> {loading ? 'Upload en cours…' : `Uploader ${files.length} fichier(s)`}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
