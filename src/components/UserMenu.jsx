import React, { useState } from 'react'
import { LogOut, Shield, Settings, User } from 'lucide-react'
import { useAuth } from '../context/AuthContextEnhanced'
import { useNavigate } from 'react-router-dom'
import SessionManager from './SessionManager'
import logger from '../utils/logger'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showSessions, setShowSessions] = useState(false)

  const handleLogout = async () => {
    try {
      logger.info('Déconnexion initiée par l\'utilisateur')
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      logger.error('Erreur lors de la déconnexion', { error: error.message })
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* Bouton utilisateur */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700">{user.username}</span>
      </button>

      {/* Menu déroulant */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* En-tête */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">{user.nom_complet}</p>
            <p className="text-xs text-gray-500">{user.service}</p>
          </div>

          {/* Options */}
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                setShowSessions(true)
                setShowMenu(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              <Shield size={16} />
              Sessions actives
            </button>

            <button
              onClick={() => {
                navigate('/parametres')
                setShowMenu(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              <Settings size={16} />
              Paramètres
            </button>

            <hr className="my-2" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Modal Sessions */}
      {showSessions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Sessions Actives</h2>
            <SessionManager />
            <button
              onClick={() => setShowSessions(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
