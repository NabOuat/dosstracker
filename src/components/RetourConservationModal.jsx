import { useState } from 'react'
import { X, Archive } from 'lucide-react'
import { createRetourConservation } from '../api/apfr'
import Button from './ui/Button'
import Input from './ui/Input'
import Alert from './ui/Alert'

export default function RetourConservationModal({ dossier, currentUserId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    num_titre_foncier: '',
    superficie: '',
    reference_courier: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.num_titre_foncier.trim()) {
      setError('Le numéro de titre foncier est obligatoire.')
      return
    }

    if (!form.superficie || parseFloat(form.superficie) <= 0) {
      setError('La superficie doit être un nombre positif.')
      return
    }

    if (!form.reference_courier.trim()) {
      setError('La référence du courrier est obligatoire.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await createRetourConservation(
        dossier.id,
        currentUserId,
        form.num_titre_foncier,
        parseFloat(form.superficie),
        form.reference_courier
      )
      onSuccess('Retour de conservation enregistré avec succès.')
      setForm({ num_titre_foncier: '', superficie: '', reference_courier: '' })
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
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--ci-green-pale)' }}>
              <Archive size={20} style={{ color: 'var(--ci-green)' }} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-neutral-900">Retour de Conservation</h2>
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

          <Input
            label="N° Titre Foncier *"
            name="num_titre_foncier"
            value={form.num_titre_foncier}
            onChange={handleChange}
            placeholder="ex : TF-2026-98765"
            required
          />

          <Input
            label="Superficie (ha) *"
            name="superficie"
            type="number"
            step="0.01"
            value={form.superficie}
            onChange={handleChange}
            placeholder="ex : 2.5"
            required
          />

          <Input
            label="Référence Courrier Conservation *"
            name="reference_courier"
            value={form.reference_courier}
            onChange={handleChange}
            placeholder="ex : CONS-2026-005678"
            required
          />

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💾 <strong>Note:</strong> Le PDF de la conservation doit être chargé séparément dans les pièces jointes du dossier.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              <Archive size={16} />
              {saving ? 'Enregistrement...' : 'Enregistrer le retour'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
