import { AlertTriangle, User } from 'lucide-react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

/**
 * Modal affiché quand un contact existe déjà avec un nom différent.
 * Propose à l'agent de choisir comment résoudre le conflit.
 */
export default function ProprietaireConflictModal({ existing, entered, contact, onEcraser, onGarder, onAnnuler }) {
  return createPortal(
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 2000 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onAnnuler} />

      {/* Panneau */}
      <motion.div
        className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        transition={{ duration: 0.18 }}
      >
        {/* En-tête */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-100"
          style={{ background: '#FFFBEB' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: '#FEF3C7' }}>
            <AlertTriangle size={20} style={{ color: '#D97706' }} />
          </div>
          <div>
            <p className="font-display font-bold text-neutral-800">Contact déjà enregistré</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Le numéro <strong>{contact}</strong> correspond à une personne différente.
            </p>
          </div>
        </div>

        {/* Corps — comparaison */}
        <div className="px-6 py-5 space-y-3">
          {/* Existant */}
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#DBEAFE' }}>
              <User size={15} style={{ color: '#1D4ED8' }} />
            </div>
            <div className="min-w-0">
              <p className="text-[0.7rem] font-bold uppercase tracking-wide text-blue-400">En base de données</p>
              <p className="text-sm font-semibold text-blue-800 truncate">{existing.nom_complet}</p>
            </div>
          </div>

          {/* Saisi maintenant */}
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#FFEDD5' }}>
              <User size={15} style={{ color: '#C2410C' }} />
            </div>
            <div className="min-w-0">
              <p className="text-[0.7rem] font-bold uppercase tracking-wide text-orange-400">Saisi maintenant</p>
              <p className="text-sm font-semibold text-orange-800 truncate">{entered}</p>
            </div>
          </div>

          <p className="text-xs text-neutral-500 text-center pt-1">
            Ces noms sont différents. Que souhaitez-vous faire ?
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={onEcraser}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'var(--ci-orange, #F47920)' }}
          >
            Remplacer par « {entered} »
          </button>
          <button
            onClick={onGarder}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all"
          >
            Garder « {existing.nom_complet} » et continuer
          </button>
          <button
            onClick={onAnnuler}
            className="w-full py-2 px-4 rounded-xl text-sm text-neutral-400 hover:text-neutral-600 transition-all"
          >
            Annuler — corriger le formulaire
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}
