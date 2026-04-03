import { useState } from 'react'
import { ChevronLeft, Save } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Alert } from '../components/ui'
import { createDossier } from '../api/dossiers'

export default function NouveauDossier() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ 
    demandeur: '', 
    contact: '', 
    region: '', 
    prefecture: '', 
    sous_prefecture: '', 
    village: '', 
    departement: '',
    numero_demande: '',
    numero_cf: '',
    date_enregistrement: new Date().toISOString().slice(0, 10)
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    
    try {
      await createDossier({
        numero: form.numero_demande || `DOS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        demandeur: form.demandeur,
        contact: form.contact,
        date_enregistrement: form.date_enregistrement,
        region: form.region,
        prefecture: form.prefecture,
        sous_prefecture: form.sous_prefecture,
        village: form.village,
        departement: form.departement,
        numero_cf: form.numero_cf
      })
      setSaved(true)
      setTimeout(() => navigate('/dossiers'), 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erreur lors de la création du dossier'
      if (errorMsg.includes('existe déjà')) {
        setError('DOUBLON: Un dossier avec ce numéro de demande existe déjà. Veuillez utiliser un numéro différent.')
      } else if (errorMsg.includes('Propriétaire')) {
        setError('ERREUR: Propriétaire non trouvé. Vérifiez le contact.')
      } else {
        setError(`ERREUR: ${errorMsg}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-8">

      {/* Retour */}
      <Link to="/dossiers" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-orange mb-6 no-underline transition-colors" style={{ '--tw-text-opacity': 1 }}>
        <ChevronLeft size={16} />
        Retour aux dossiers
      </Link>

      <span className="section-label">Création</span>
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-neutral-900 mb-2">
        Nouveau <span style={{ color: 'var(--ci-orange)' }}>dossier</span>
      </h1>
      <p className="text-neutral-500 text-sm mb-8">
        Remplissez les informations pour créer un nouveau dossier.
      </p>

      {saved && (
        <Alert variant="success" className="mb-6">
          Dossier créé avec succès ! Redirection en cours...
        </Alert>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            className="mb-6 p-4 rounded-lg border-l-4"
            style={{
              background: '#FEE2E2',
              borderColor: '#DC2626',
              borderLeft: '4px solid #DC2626'
            }}
          >
            <p style={{ color: '#991B1B', fontWeight: '600', fontSize: '0.95rem' }}>
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 sm:p-8 flex flex-col gap-5" style={{ boxShadow: 'var(--shadow-md)' }}>

        <Input
          label="N° de dossier"
          name="numero_demande"
          placeholder="ex : DOS-2026-0001"
          hint="Laissez vide pour générer automatiquement"
          value={form.numero_demande}
          onChange={handleChange}
        />

        <Input
          label="Date d'enregistrement"
          name="date_enregistrement"
          type="date"
          required
          value={form.date_enregistrement}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Nom du demandeur"
            name="demandeur"
            required
            placeholder="Nom Prénom"
            value={form.demandeur}
            onChange={handleChange}
          />
          <Input
            label="Contact (téléphone)"
            name="contact"
            required
            placeholder="07XXXXXXXX"
            value={form.contact}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Région"
            name="region"
            required
            placeholder="ex : Lagunes"
            value={form.region}
            onChange={handleChange}
          />
          <Input
            label="Département"
            name="departement"
            placeholder="ex : Abidjan 1"
            value={form.departement}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Préfecture"
            name="prefecture"
            placeholder="ex : Abidjan"
            value={form.prefecture}
            onChange={handleChange}
          />
          <Input
            label="Sous-préfecture"
            name="sous_prefecture"
            placeholder="ex : Cocody"
            value={form.sous_prefecture}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Village"
            name="village"
            placeholder="ex : Riviera"
            value={form.village}
            onChange={handleChange}
          />
          <Input
            label="Numéro du CF"
            name="numero_cf"
            placeholder="ex : CF-2026-0001"
            value={form.numero_cf || ''}
            onChange={e => setForm(f => ({ ...f, numero_cf: e.target.value }))}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            type="submit" 
            variant="primary" 
            className="flex-1 justify-center"
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Enregistrement...' : 'Enregistrer le dossier'}
          </Button>
          <Link to="/dossiers" className="flex-1 sm:flex-none">
            <Button type="button" variant="ghost" className="w-full justify-center" disabled={saving}>
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
