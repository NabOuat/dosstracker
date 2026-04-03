import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react'
import { validateResetTokenApi, resetPasswordApi } from '../api/auth'
import Logo from '../components/ui/Logo'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [username, setUsername] = useState('')

  // Valider le token au chargement de la page
  useEffect(() => {
    const validateToken = async () => {
      try {
        const result = await validateResetTokenApi(token)
        setTokenValid(true)
        setUsername(result.username)
      } catch (err) {
        setError(err.message || 'Token invalide ou expiré.')
        setTokenValid(false)
      } finally {
        setValidatingToken(false)
      }
    }

    if (token) {
      validateToken()
    } else {
      setError('Token manquant.')
      setValidatingToken(false)
      setTokenValid(false)
    }
  }, [token])

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    
    // Validation des champs
    if (!form.password) {
      setError('Veuillez saisir un nouveau mot de passe.')
      return
    }
    
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const result = await resetPasswordApi(token, form.password)
      setSuccess(result.message || 'Mot de passe réinitialisé avec succès.')
      setForm({ password: '', confirmPassword: '' })
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.')
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
              Réinitialisation du mot de passe
            </h1>
            {tokenValid && username && (
              <p className="text-sm text-neutral-400 mt-1">
                Pour le compte <span className="font-semibold">{username}</span>
              </p>
            )}
          </div>

          {/* Chargement */}
          {validatingToken && (
            <div className="flex flex-col items-center py-4">
              <div className="w-8 h-8 border-2 border-neutral-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-neutral-500">Vérification du token...</p>
            </div>
          )}

          {/* Erreur ou succès */}
          {error && <Alert variant="error">{error}</Alert>}
          {success && (
            <Alert variant="success" className="flex items-center gap-2">
              <Check size={16} className="flex-shrink-0" />
              <span>{success}</span>
            </Alert>
          )}

          {/* Formulaire */}
          {!validatingToken && tokenValid && !success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {/* Nouveau mot de passe */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.78rem] font-bold text-neutral-700">
                  Nouveau mot de passe <span style={{ color: 'var(--ci-orange)' }}>*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="input-field pl-9 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Minimum 8 caractères
                </p>
              </div>

              {/* Confirmation du mot de passe */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.78rem] font-bold text-neutral-700">
                  Confirmer le mot de passe <span style={{ color: 'var(--ci-orange)' }}>*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
                    Réinitialisation...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>
          )}

          {/* Retour à la connexion */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mt-2"
          >
            <ArrowLeft size={14} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
