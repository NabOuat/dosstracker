import { useEffect, useState } from 'react'
import {
  FolderOpen, Clock, CheckCircle, AlertCircle,
  MessageSquare, Inbox, BarChart2, Download, X, TrendingUp,
  ArrowRight
} from 'lucide-react'
import { getStats } from '../api/stats'
import { getDossiers } from '../api/dossiers'
import { checkFirstLogin } from '../api/users'
import StatCard from '../components/StatCard'
import DossierCard from '../components/DossierCard'
import DossierDetail from '../components/DossierDetail'
import ServiceDashboard from '../components/ServiceDashboard'
import FirstLoginModal from '../components/FirstLoginModal'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import logger from '../utils/logger'

const STAT_CARDS = (stats) => [
  {
    icon: <FolderOpen size={18} />,
    value: stats.total,
    label: 'Total dossiers',
    sub: `${stats.conservation} archivés`,
    color: 'orange',
    progress: Math.min(100, (stats.conservation / stats.total) * 100),
  },
  {
    icon: <Inbox size={18} />,
    value: stats.courrier + stats.spfei_admin,
    label: 'En traitement',
    sub: 'Courrier + SPFEI',
    color: 'blue',
    progress: Math.min(100, ((stats.courrier + stats.spfei_admin) / stats.total) * 100),
  },
  {
    icon: <Clock size={18} />,
    value: stats.scvaa + stats.spfei_titre,
    label: 'Contrôle en cours',
    sub: 'SCVAA + Titre',
    color: 'purple',
    progress: Math.min(100, ((stats.scvaa + stats.spfei_titre) / stats.total) * 100),
  },
  {
    icon: <AlertCircle size={18} />,
    value: stats.non_conforme,
    label: 'Non conformes',
    sub: 'À régulariser',
    color: 'red',
    progress: Math.min(100, (stats.non_conforme / stats.total) * 100),
  },
  {
    icon: <CheckCircle size={18} />,
    value: stats.conservation,
    label: 'Archivés',
    sub: 'Traitement terminé',
    color: 'green',
    progress: Math.min(100, (stats.conservation / stats.total) * 100),
  },
  {
    icon: <MessageSquare size={18} />,
    value: stats.sms_envoyes,
    label: 'SMS envoyés',
    sub: 'Notifications',
    color: 'blue',
    progress: Math.min(100, (stats.sms_envoyes / stats.total) * 100),
  },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats,    setStats]    = useState(null)
  const [recents,  setRecents]  = useState([])
  const [selected, setSelected] = useState(null)
  const [showGraphs, setShowGraphs]  = useState(false)
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false)

  useEffect(() => {
    checkFirstLogin()
      .then(r => { if (r.is_first_login) setShowFirstLoginModal(true) })
      .catch(() => {})

    getStats()
      .then(setStats)
      .catch(() => {})

    getDossiers()
      .then(all => setRecents(all?.slice(-5).reverse() || []))
      .catch(() => {})
  }, [])

  const exportStats = () => alert('Statistiques exportées avec succès')
  const toggleGraphs = () => setShowGraphs(p => !p)

  const conformiteRate = stats
    ? Math.round(((stats.total - stats.non_conforme) / stats.total) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="page"
    >
      <div className="page-inner">

        <FirstLoginModal
          isOpen={showFirstLoginModal}
          onClose={() => setShowFirstLoginModal(false)}
          username={user?.username}
        />

        <ServiceDashboard />

        {/* ─── En-tête ─── */}
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mt-8 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <span className="section-label">Tableau de bord</span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-neutral-900 leading-tight">
              Vue d'ensemble <span style={{ color: 'var(--ci-orange)' }}>des dossiers</span>
            </h1>
            <p style={{ color: 'var(--n-500)' }} className="text-sm mt-1">
              Suivi du circuit de traitement foncier
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline-orange" size="sm" onClick={exportStats}>
              <Download size={14} /> Exporter
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleGraphs}>
              <BarChart2 size={14} />
              {showGraphs ? 'Masquer graphiques' : 'Graphiques'}
            </Button>
          </div>
        </motion.div>

        {/* ─── Stats ─── */}
        {stats && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
          >
            {STAT_CARDS(stats).map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12 + i * 0.06 }}
              >
                <StatCard {...card} showProgress />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ─── Graphiques ─── */}
        <AnimatePresence>
          {showGraphs && stats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className="card-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-lg" style={{ color: 'var(--n-800)' }}>
                    Statistiques visuelles
                  </h2>
                  <button
                    onClick={() => setShowGraphs(false)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                    style={{ color: 'var(--n-400)' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Barres */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--n-400)' }}>
                      Répartition des dossiers
                    </p>
                    <div className="flex items-end gap-3 h-40">
                      {[
                        { label: 'Courrier', val: stats.courrier, color: '#3B82F6' },
                        { label: 'SPFEI',    val: stats.spfei_admin, color: 'var(--ci-orange)' },
                        { label: 'SCVAA',    val: stats.scvaa, color: 'var(--ci-green)' },
                        { label: 'Archivés', val: stats.conservation, color: '#8B5CF6' },
                      ].map(({ label, val, color }, i) => (
                        <div key={label} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-bold" style={{ color: 'var(--n-700)' }}>{val}</span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(8, (val / stats.total) * 130)}px` }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: 'backOut' }}
                            style={{ background: color, width: '100%', borderRadius: '6px 6px 0 0', minHeight: 8 }}
                          />
                          <span className="text-[0.65rem] text-center" style={{ color: 'var(--n-400)' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conformité */}
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--n-400)' }}>
                      Taux de conformité
                    </p>
                    <div className="relative w-36 h-36">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--n-150)" strokeWidth="12"/>
                        <motion.circle
                          cx="60" cy="60" r="48"
                          fill="none" stroke="var(--ci-green)" strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 48}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - conformiteRate / 100) }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display font-bold text-3xl" style={{ color: 'var(--n-800)' }}>
                          {conformiteRate}%
                        </span>
                        <span className="text-xs" style={{ color: 'var(--n-400)' }}>conformes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Dossiers récents ─── */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card-lg"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--n-800)' }}>
              Dossiers récents
            </h2>
            <Button variant="outline-orange" size="sm" onClick={() => navigate('/dossiers')}>
              Voir tout <ArrowRight size={13} />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {recents.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.25 + i * 0.07 }}
              >
                <DossierCard dossier={d} onClick={() => setSelected(d)} />
              </motion.div>
            ))}
            {recents.length === 0 && (
              <div className="empty-state">
                <p className="empty-state-icon">📂</p>
                <p className="empty-state-title">Aucun dossier</p>
                <p className="empty-state-sub">Les dossiers récents apparaîtront ici.</p>
              </div>
            )}
          </div>
        </motion.div>

        <DossierDetail dossier={selected} onClose={() => setSelected(null)} />
      </div>
    </motion.div>
  )
}