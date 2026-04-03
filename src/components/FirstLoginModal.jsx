import { useState } from 'react'
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { changePassword, completeFirstLogin } from '../api/users'
import logger from '../utils/logger'

export default function FirstLoginModal({ isOpen, onClose, username }) {
  const [step, setStep] = useState('intro') // intro, change-password, success
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validatePasswords = () => {
    if (!formData.currentPassword) {
      setError('Veuillez entrer votre mot de passe actuel')
      return false
    }
    if (!formData.newPassword) {
      setError('Veuillez entrer un nouveau mot de passe')
      return false
    }
    if (formData.newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }
    return true
  }

  const handleChangePassword = async () => {
    if (!validatePasswords()) return

    setLoading(true)
    setError('')

    try {
      logger.info('Changement du mot de passe lors de la première connexion')
      await changePassword(formData.currentPassword, formData.newPassword)
      logger.info('Mot de passe changé avec succès')
      
      // Marquer la première connexion comme complétée
      await completeFirstLogin()
      logger.info('Première connexion marquée comme complétée')
      
      setStep('success')
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      logger.error('Erreur lors du changement de mot de passe', { error: err.message })
      setError(err.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    try {
      logger.info('Première connexion ignorée par l\'utilisateur')
      await completeFirstLogin()
      onClose()
    } catch (err) {
      logger.error('Erreur lors du marquage de la première connexion', { error: err.message })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Intro Step */}
        {step === 'intro' && (
          <>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mx-auto mb-4">
              <AlertCircle size={24} className="text-orange-600" />
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
              Bienvenue, {username}!
            </h2>
            
            <p className="text-center text-gray-600 mb-6">
              C'est votre première connexion. Pour sécuriser votre compte, nous vous recommandons de changer votre mot de passe dès maintenant.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setStep('change-password')}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
              >
                Changer mon mot de passe
              </button>
              
              <button
                onClick={handleSkip}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
              >
                Ignorer pour maintenant
              </button>
            </div>
          </>
        )}

        {/* Change Password Step */}
        {step === 'change-password' && (
          <>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4">
              <Lock size={24} className="text-blue-600" />
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
              Changer votre mot de passe
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Entrez votre mot de passe actuel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 caractères"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirmez votre nouveau mot de passe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
              >
                {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
              </button>
              
              <button
                onClick={() => setStep('intro')}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
              >
                Retour
              </button>
            </div>
          </>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
              <Lock size={24} className="text-green-600" />
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
              Succès!
            </h2>
            
            <p className="text-center text-gray-600 mb-6">
              Votre mot de passe a été changé avec succès. Votre compte est maintenant sécurisé.
            </p>

            <p className="text-center text-sm text-gray-500">
              Redirection en cours...
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
