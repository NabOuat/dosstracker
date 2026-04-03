import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Mail, Phone, Shield, Save, User, Lock, Eye, EyeOff, Camera, Check } from 'lucide-react'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, updateUserProfile, changePassword, updateUserPreferences } from '../api/users'
import logger from '../utils/logger'

function Toggle({ checked, onChange, color = 'orange' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 99,
        background: checked
          ? (color === 'green' ? 'var(--ci-green)' : 'var(--ci-orange)')
          : 'var(--n-200)',
        position: 'relative', cursor: 'pointer',
        border: 'none', padding: 0, flexShrink: 0,
        transition: 'background 200ms ease',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 200ms cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </button>
  )
}

function SectionCard({ title, icon, color = 'orange', children }) {
  const colors = {
    orange: { bg: 'var(--ci-orange-pale)', color: 'var(--ci-orange-dark)' },
    green:  { bg: 'var(--ci-green-pale)',  color: 'var(--ci-green-dark)' },
    blue:   { bg: '#EFF6FF', color: '#1E40AF' },
    purple: { bg: '#F5F3FF', color: '#5B21B6' },
  }
  const c = colors[color] || colors.orange
  return (
    <div className="card-lg">
      <div className="flex items-center gap-3 mb-5">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <h2 className="font-display font-bold text-base" style={{ color: 'var(--n-800)' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function NotifRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid var(--n-100)' }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--n-800)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--n-400)' }}>{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

const TABS = [
  { id: 'profile',       label: 'Profil',         Icon: User },
  { id: 'connection',    label: 'Connexion',       Icon: Lock },
  { id: 'notifications', label: 'Notifications',   Icon: Bell },
  { id: 'security',      label: 'Sécurité',        Icon: Shield },
]

export default function Parametres() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false })

  const [settings, setSettings] = useState({
    notifications: {
      nouveauDossier: true,
      dossierNonConforme: true,
      dossierTransmis: true,
      maintenance: false,
    },
    channels: { app: true, email: false, sms: false },
    security: { twoFactor: false, sessionTimeout: 30 },
    profile: {
      nom: user?.nom_complet || 'Utilisateur',
      email: user?.email || '',
      telephone: user?.phone_number || '',
      service: user?.service || 'SERVICE',
      poste: 'Agent',
      avatar: user?.username?.charAt(0).toUpperCase() || 'U',
    },
    connection: {
      username: user?.username || '',
      password: '', newPassword: '', confirmPassword: '',
    },
  })

  useEffect(() => {
    getUserProfile().then(profile => {
      setSettings(prev => ({
        ...prev,
        profile: {
          nom: profile.nom_complet || prev.profile.nom,
          email: profile.email || prev.profile.email,
          telephone: profile.phone_number || prev.profile.telephone,
          service: profile.service || prev.profile.service,
          poste: 'Agent',
          avatar: profile.username?.charAt(0).toUpperCase() || prev.profile.avatar,
        },
        connection: { ...prev.connection, username: profile.username || prev.connection.username },
      }))
    }).catch(() => {})
  }, [])

  const set = (section, key, val) =>
    setSettings(prev => ({ ...prev, [section]: { ...prev[section], [key]: val } }))

  const toggle = (section, key) =>
    setSettings(prev => ({ ...prev, [section]: { ...prev[section], [key]: !prev[section][key] } }))

  const pwdMatch = settings.connection.newPassword === settings.connection.confirmPassword
  const canSave = activeTab === 'connection'
    ? !settings.connection.newPassword || pwdMatch
    : true

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess(false)
    try {
      if (activeTab === 'profile') {
        await updateUserProfile({
          nom_complet: settings.profile.nom,
          email: settings.profile.email,
          phone_number: settings.profile.telephone,
        })
      } else if (activeTab === 'connection' && settings.connection.newPassword) {
        if (!pwdMatch) { setError('Les mots de passe ne correspondent pas'); setLoading(false); return }
        await changePassword(settings.connection.password, settings.connection.newPassword)
        setSettings(prev => ({
          ...prev,
          connection: { ...prev.connection, password: '', newPassword: '', confirmPassword: '' }
        }))
      } else if (['notifications', 'security'].includes(activeTab)) {
        await updateUserPreferences({
          notifications: settings.notifications,
          channels: settings.channels,
          security: settings.security,
        })
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde')
    } finally { setLoading(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
      className="page"
    >
      <div className="page-inner" style={{ maxWidth: 860 }}>

        <span className="section-label">Préférences</span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1" style={{ color: 'var(--n-900)' }}>
          Paramètres <span style={{ color: 'var(--ci-orange)' }}>utilisateur</span>
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--n-400)' }}>
          Personnalisez votre expérience et gérez vos préférences.
        </p>

        {/* ─── Onglets ─── */}
        <div className="tab-bar mb-6">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`tab-item ${activeTab === id ? 'active' : ''}`}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ─── Alertes ─── */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg mb-5 text-sm font-medium"
              style={{ background: 'var(--ci-green-pale)', color: 'var(--ci-green-dark)', border: '1px solid #A7F3D0' }}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--ci-green)', color: 'white', flexShrink: 0 }}>
                <Check size={12} />
              </div>
              Paramètres enregistrés avec succès.
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="px-4 py-3 rounded-lg mb-5 text-sm font-medium"
              style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── TAB : PROFIL ─── */}
        {activeTab === 'profile' && (
          <SectionCard title="Profil utilisateur" icon={<User size={18} />} color="purple">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--ci-orange), var(--ci-orange-dark))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '2rem', fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                }}>
                  {settings.profile.avatar}
                </div>
                <button className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: 'var(--n-400)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--ci-orange)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--n-400)'}>
                  <Camera size={13} /> Changer
                </button>
              </div>

              <div className="flex-1 space-y-4">
                {[
                  { label: 'Nom complet',  key: 'nom',       type: 'text' },
                  { label: 'Email',        key: 'email',     type: 'email' },
                  { label: 'Téléphone',    key: 'telephone', type: 'tel' },
                ].map(({ label, key, type }) => (
                  <div key={key} className="form-group">
                    <label className="form-label">{label}</label>
                    <input type={type} value={settings.profile[key]}
                      onChange={e => set('profile', key, e.target.value)}
                      className="input-field" />
                  </div>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Service</label>
                    <select value={settings.profile.service}
                      onChange={e => set('profile', 'service', e.target.value)}
                      className="input-field">
                      <option value="COURRIER">Service Courrier</option>
                      <option value="SPFEI">SPFEI</option>
                      <option value="SCVAA">SCVAA</option>
                      <option value="CONSERVATION">Conservation Foncière</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Poste</label>
                    <input type="text" value={settings.profile.poste}
                      onChange={e => set('profile', 'poste', e.target.value)}
                      className="input-field" />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ─── TAB : CONNEXION ─── */}
        {activeTab === 'connection' && (
          <SectionCard title="Données de connexion" icon={<Lock size={18} />} color="green">
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Nom d'utilisateur</label>
                <input type="text" value={settings.connection.username}
                  onChange={e => set('connection', 'username', e.target.value)}
                  className="input-field" />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPwd.current ? 'text' : 'password'}
                    value={settings.connection.password}
                    onChange={e => set('connection', 'password', e.target.value)}
                    className="input-field pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--n-400)' }}>
                    {showPwd.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="divider" />
              <p className="text-sm font-semibold" style={{ color: 'var(--n-700)' }}>Changer le mot de passe</p>

              {['newPassword', 'confirmPassword'].map((key, i) => (
                <div key={key} className="form-group">
                  <label className="form-label">
                    {i === 0 ? 'Nouveau mot de passe' : 'Confirmer le nouveau mot de passe'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd[key] ? 'text' : 'password'}
                      value={settings.connection[key]}
                      onChange={e => set('connection', key, e.target.value)}
                      className={`input-field pr-10 ${
                        key === 'confirmPassword' && settings.connection.newPassword &&
                        settings.connection.confirmPassword && !pwdMatch ? 'error' : ''
                      }`}
                    />
                    <button type="button" onClick={() => setShowPwd(p => ({ ...p, [key]: !p[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--n-400)' }}>
                      {showPwd[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {key === 'confirmPassword' && settings.connection.newPassword &&
                    settings.connection.confirmPassword && !pwdMatch && (
                    <p className="form-error-text">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ─── TAB : NOTIFICATIONS ─── */}
        {activeTab === 'notifications' && (
          <SectionCard title="Notifications" icon={<Bell size={18} />} color="orange">
            <div className="-mt-2 mb-5">
              <NotifRow
                label="Nouveau dossier"
                desc="À la création d'un dossier"
                checked={settings.notifications.nouveauDossier}
                onChange={() => toggle('notifications', 'nouveauDossier')}
              />
              <NotifRow
                label="Dossier non conforme"
                desc="Quand un dossier est marqué non conforme"
                checked={settings.notifications.dossierNonConforme}
                onChange={() => toggle('notifications', 'dossierNonConforme')}
              />
              <NotifRow
                label="Dossier transmis"
                desc="Lors de la transmission d'un dossier"
                checked={settings.notifications.dossierTransmis}
                onChange={() => toggle('notifications', 'dossierTransmis')}
              />
              <NotifRow
                label="Maintenance système"
                desc="Pour les maintenances planifiées"
                checked={settings.notifications.maintenance}
                onChange={() => toggle('notifications', 'maintenance')}
              />
            </div>

            <div className="divider" />
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--n-700)' }}>Canaux de notification</p>
            <div className="space-y-2.5">
              {[
                { key: 'app',   label: 'Application', Icon: Bell },
                { key: 'email', label: 'Email',        Icon: Mail },
                { key: 'sms',   label: 'SMS',          Icon: Phone },
              ].map(({ key, label, Icon }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${settings.channels[key] ? 'var(--ci-orange)' : 'var(--n-300)'}`,
                    background: settings.channels[key] ? 'var(--ci-orange)' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 150ms ease',
                  }}
                    onClick={() => toggle('channels', key)}>
                    {settings.channels[key] && <Check size={11} color="white" strokeWidth={3} />}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--n-700)' }}>
                    <Icon size={14} style={{ color: 'var(--n-400)' }} />
                    {label}
                  </div>
                </label>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ─── TAB : SÉCURITÉ ─── */}
        {activeTab === 'security' && (
          <SectionCard title="Sécurité" icon={<Shield size={18} />} color="blue">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--n-800)' }}>
                    Authentification à deux facteurs
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--n-400)' }}>
                    Vérification en deux étapes pour plus de sécurité
                  </p>
                </div>
                <Toggle
                  checked={settings.security.twoFactor}
                  onChange={() => toggle('security', 'twoFactor')}
                />
              </div>

              <div className="divider" style={{ margin: '0' }} />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--n-800)' }}>
                      Délai d'expiration de session
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--n-400)' }}>
                      Déconnexion automatique après {settings.security.sessionTimeout} min d'inactivité
                    </p>
                  </div>
                  <span className="font-display font-bold text-lg" style={{ color: 'var(--ci-orange)' }}>
                    {settings.security.sessionTimeout} min
                  </span>
                </div>
                <input
                  type="range" min="5" max="120" step="5"
                  value={settings.security.sessionTimeout}
                  onChange={e => set('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--ci-orange) 0%, var(--ci-orange) ${(settings.security.sessionTimeout - 5) / 115 * 100}%, var(--n-200) ${(settings.security.sessionTimeout - 5) / 115 * 100}%, var(--n-200) 100%)`,
                    accentColor: 'var(--ci-orange)',
                  }}
                />
                <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--n-400)' }}>
                  <span>5 min</span><span>120 min</span>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ─── Boutons d'action ─── */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost">Annuler</Button>
          <Button variant="primary" onClick={handleSave} disabled={loading || !canSave}>
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} /> Enregistrement…</>
            ) : (
              <><Save size={15} /> Enregistrer</>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}