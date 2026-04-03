import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDefaultRoute } from '../utils/serviceRoutes'
import Logo from '../components/ui/Logo'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import logger from '../utils/logger'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    logger.debug('Tentative de connexion initiée', { username: form.username })
    
    if (!form.username.trim()) { 
      logger.warn('Validation échouée: nom d\'utilisateur vide')
      setError('Veuillez saisir votre nom d\'utilisateur.'); 
      return 
    }
    if (!form.password) {
      logger.warn('Validation échouée: mot de passe vide')
      setError('Veuillez saisir votre mot de passe.'); 
      return 
    }

    setLoading(true)
    logger.info(`Envoi des identifiants pour l'utilisateur: ${form.username}`)
    
    try {
      logger.debug('Appel de la fonction login...')
      const userData = await login(form.username, form.password)
      logger.info(`Connexion réussie pour l'utilisateur: ${userData.username}`, { 
        userId: userData.user_id,
        service: userData.service 
      })
      
      // Rediriger vers la page appropriée selon le service de l'utilisateur
      const defaultRoute = getDefaultRoute(userData.service)
      logger.debug(`Redirection vers: ${defaultRoute}`)
      navigate(defaultRoute, { replace: true })
    } catch (err) {
      const errorMessage = err.message ?? 'Erreur de connexion.'
      logger.error(`Erreur lors de la connexion pour ${form.username}`, {
        error: errorMessage,
        status: err.response?.status,
        details: err.response?.data
      })
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0F1923 0%, #1C2B3A 55%, #1a3020 100%)' }}
    >
      {/* Stripes CI */}
      <div
        aria-hidden
        className="absolute top-0 right-0 bottom-0 flex opacity-[0.06]"
        style={{ width: 160 }}
      >
        <div className="flex-1" style={{ background: 'var(--ci-orange)' }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ background: 'var(--ci-green)' }} />
      </div>

      {/* Halos */}
      <div aria-hidden className="absolute pointer-events-none" style={{
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(244,121,32,0.13) 0%, transparent 70%)',
        top: -130, right: -130, animation: 'pulse-glow 4s ease-in-out infinite',
      }} />
      <div aria-hidden className="absolute pointer-events-none" style={{
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(0,133,63,0.10) 0%, transparent 70%)',
        bottom: -80, left: -80, animation: 'pulse-glow 4s ease-in-out infinite 2s',
      }} />

      {/* Carte */}
      <div
        className="relative z-10 w-full max-w-sm bg-white rounded-xl overflow-hidden"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.35)', animation: 'slideUp 0.6s ease forwards' }}
      >
        {/* Bande CI */}
        <div className="ci-divider" />

        <div className="px-8 pt-8 pb-10 flex flex-col gap-6">

          {/* Logo */}
          <div className="flex flex-col items-center gap-1">
            <Logo size="md" dark />
            <p className="text-[0.7rem] text-neutral-400 tracking-[0.12em] uppercase mt-1">
              Système de Gestion Foncière
            </p>
          </div>

          {/* Titre */}
          <div className="text-center">
            <h1 className="font-display font-bold text-xl text-neutral-900">
              Connexion
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Accès réservé aux agents habilités
            </p>
          </div>

          {/* Erreur */}
          {error && <Alert variant="error">{error}</Alert>}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-[0.78rem] font-bold text-neutral-700">
                Nom d'utilisateur <span style={{ color: 'var(--ci-orange)' }}>*</span>
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="ex : spfei"
                  value={form.username}
                  onChange={handleChange}
                  className="input-field pl-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[0.78rem] font-bold text-neutral-700">
                  Mot de passe <span style={{ color: 'var(--ci-orange)' }}>*</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-[0.7rem] text-neutral-500 hover:text-orange-600 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Se connecter
                </>
              )}
            </Button>
          </form>

        </div>
      </div>
    </div>
  )
}
