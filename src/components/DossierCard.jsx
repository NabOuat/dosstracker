import { ChevronRight, Phone, MapPin, Calendar, User } from 'lucide-react'
import WorkflowBadge from './WorkflowBadge'
import { motion } from 'framer-motion'

/**
 * DossierCard – carte résumée d'un dossier dans une liste
 * @param {object} dossier
 * @param {function} onClick
 * @param {ReactNode} action – bouton d'action optionnel
 */
export default function DossierCard({ dossier, onClick, action }) {
  // Déterminer la couleur de la bordure en fonction du statut
  const getBorderColor = () => {
    switch (dossier.statut) {
      case 'scvaa': return 'var(--ci-green)';
      case 'spfei': return 'var(--ci-orange)';
      case 'nonconforme': return '#EF4444';
      case 'termine': return '#22C55E';
      case 'conservation': return '#8B5CF6';
      default: return 'var(--ci-orange)';
    }
  };

  return (
    <motion.div
      whileHover={onClick ? { x: 5, boxShadow: 'var(--shadow-md)' } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`bg-white rounded-md px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ boxShadow: 'var(--shadow-sm)', borderLeft: `4px solid ${getBorderColor()}` }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Infos principales */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <motion.span
            className="font-display font-bold text-sm text-neutral-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {dossier.numero_dossier || dossier.numero}
          </motion.span>
          <WorkflowBadge statut={dossier.statut} size="sm" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-neutral-400" />
            <p className="text-sm font-semibold text-neutral-700 truncate">{dossier.demandeur}</p>
          </div>
        </motion.div>
        
        <div className="flex flex-wrap gap-3 mt-2">
          {dossier.region && (
            <motion.span 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-1 text-[0.7rem] text-neutral-400"
            >
              <MapPin size={11} /> {dossier.region}
            </motion.span>
          )}
          {(dossier.contact_demandeur || dossier.contact) && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="flex items-center gap-1 text-[0.7rem] text-neutral-400"
            >
              <Phone size={11} /> {dossier.contact_demandeur || dossier.contact}
            </motion.span>
          )}
          {(dossier.date_enregistrement || dossier.created_at || dossier.date_creation) && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center gap-1 text-[0.7rem] text-neutral-400"
            >
              <Calendar size={11} /> {dossier.date_enregistrement || (dossier.created_at || dossier.date_creation || '').slice(0, 10)}
            </motion.span>
          )}
        </div>
      </div>

      {/* Action + chevron */}
      <div className="flex items-center gap-2 shrink-0">
        {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
        {onClick && (
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          >
            <ChevronRight size={16} className="text-neutral-400" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
