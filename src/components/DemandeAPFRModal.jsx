import { useState } from 'react'
import { X, FileText, CheckCircle } from 'lucide-react'
import { createDemandeAPFR } from '../api/apfr'
import Button from './ui/Button'
import Alert from './ui/Alert'

export default function DemandeAPFRModal({ dossiers, currentUserId, onClose, onSuccess }) {
  const [numeroDemande, setNumeroDemande] = useState('')
  const [selectedDossiers, setSelectedDossiers] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleDossier = (dossierId) => {
    setSelectedDossiers(prev =>
      prev.includes(dossierId)
        ? prev.filter(id => id !== dossierId)
        : [...prev, dossierId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!numeroDemande.trim()) {
      setError('Veuillez entrer un numéro de demande.')
      return
    }

    if (selectedDossiers.length === 0) {
      setError('Veuillez sélectionner au moins un dossier.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await createDemandeAPFR(numeroDemande, currentUserId, selectedDossiers)
      onSuccess(`Demande APFR créée avec ${selectedDossiers.length} dossier(s).`)
      setNumeroDemande('')
      setSelectedDossiers([])
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
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--ci-blue-pale)' }}>
              <FileText size={20} style={{ color: 'var(--ci-blue)' }} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-neutral-900">Demande de Signature APFR</h2>
              <p className="text-sm text-neutral-500">Grouper plusieurs dossiers pour signature</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Numéro de demande *
            </label>
            <input
              type="text"
              value={numeroDemande}
              onChange={(e) => setNumeroDemande(e.target.value)}
              placeholder="ex : APFR-2026-001"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Sélectionner les dossiers ({selectedDossiers.length} sélectionné(s)) *
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto border border-neutral-200 rounded-lg p-3">
              {dossiers.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">
                  Aucun dossier disponible pour cette demande
                </p>
              ) : (
                dossiers.map(dossier => (
                  <label key={dossier.id} className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDossiers.includes(dossier.id)}
                      onChange={() => toggleDossier(dossier.id)}
                      className="w-4 h-4 rounded border-neutral-300"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">{dossier.numero_dossier}</p>
                      <p className="text-sm text-neutral-500">{dossier.demandeur}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={saving || selectedDossiers.length === 0}>
              <CheckCircle size={16} />
              {saving ? 'Création en cours...' : `Créer la demande (${selectedDossiers.length})`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
