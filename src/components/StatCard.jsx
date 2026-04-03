import { motion } from 'framer-motion'

/**
 * StatCard – carte statistique du tableau de bord
 * @param {ReactNode} icon
 * @param {string|number} value
 * @param {string} label
 * @param {string} sub – texte secondaire (tendance)
 * @param {'orange'|'green'|'blue'|'red'|'purple'} color
 * @param {boolean} showProgress - afficher une barre de progression
 * @param {number} progress - valeur de progression (0-100)
 */
export default function StatCard({ icon, value, label, sub, color = 'orange', showProgress = false, progress = 0 }) {
  const colors = {
    orange: { bg: 'var(--ci-orange-pale)', icon: 'var(--ci-orange)', sub: 'var(--ci-green)' },
    green:  { bg: 'var(--ci-green-pale)',  icon: 'var(--ci-green)',  sub: 'var(--ci-green)' },
    blue:   { bg: '#EFF6FF', icon: '#3B82F6', sub: '#3B82F6' },
    red:    { bg: '#FEF2F2', icon: '#EF4444', sub: '#EF4444' },
    purple: { bg: '#F5F3FF', icon: '#8B5CF6', sub: '#8B5CF6' },
  }[color] ?? {}

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: 'var(--shadow-md)' }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-lg p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 transition-shadow duration-200 cursor-pointer w-full max-w-full"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start justify-between">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
          style={{ background: colors.bg, color: colors.icon }}
        >
          {icon}
        </motion.div>
      </div>
      <div>
        <motion.p 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display font-bold text-lg sm:text-xl md:text-2xl text-neutral-900 leading-tight"
        >
          {value}
        </motion.p>
        <p className="text-xs text-neutral-500 mt-0.5 break-words">{label}</p>
      </div>
      {sub && (
        <p className="text-[0.7rem] font-semibold break-words" style={{ color: colors.sub }}>
          {sub}
        </p>
      )}
      
      {showProgress && (
        <div className="mt-1">
          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: colors.icon }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}
