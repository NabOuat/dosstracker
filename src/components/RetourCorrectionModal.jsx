import { useState } from 'react'
import { X, AlertCircle, Send } from 'lucide-react'
import { createCorrection } from '../api/corrections'
import Button from './ui/Button'
import Alert from './ui/Alert'

export default function RetourCorrectionModal({ dossier, currentUserId, onClose, onSuccess }) {
  const [elementTransmis, setElementTransmis] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!elementTransmis.trim()) {
      setError('Veuillez décrire les éléments à corriger.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await createCorrection(dossier.id, currentUserId, elementTransmis)
      onSuccess('Retour de correction créé avec succès. SMS envoyé au propriétaire.')
      setElementTransmis('')
      onClose()
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erreur inconnue'
      setError(`Erreur: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--ci-red-pale)' }}>
              <AlertCircle size={20} style={{ color: 'var(--ci-red)' }} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-neutral-900">Retour de Correction</h2>
              <p className="text-sm text-neutral-500">{dossier.numero_dossier}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Dossier
            </label>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="font-semibold text-neutral-900">{dossier.numero_dossier}</p>
              <p className="text-sm text-neutral-500">{dossier.demandeur}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Éléments à corriger *
            </label>
            <textarea
              value={elementTransmis}
              onChange={(e) => setElementTransmis(e.target.value)}
              placeholder="Décrivez les éléments qui doivent être corrigés et les motifs de non-conformité..."
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={6}
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Minimum 10 caractères. Cette description sera envoyée au propriétaire via SMS.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              <Send size={16} />
              {saving ? 'Envoi en cours...' : 'Créer le retour et envoyer SMS'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
