import { useEffect, useState } from 'react'
import { BarChart3, Users, TrendingUp, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { getServiceDashboardOverview, getDossiersParRegion, getUtilisateursService } from '../api/serviceDashboard'
import Alert from './ui/Alert'
import { motion } from 'framer-motion'

export default function ServiceDashboardOverview() {
  const [overview, setOverview] = useState(null)
  const [regions, setRegions] = useState([])
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [overviewData, regionsData, utilisateursData] = await Promise.all([
        getServiceDashboardOverview(),
        getDossiersParRegion(),
        getUtilisateursService()
      ])
      
      setOverview(overviewData)
      setRegions(regionsData || [])
      setUtilisateurs(utilisateursData || [])
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erreur inconnue'
      setError(`Erreur: ${errorMsg}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-neutral-500">Chargement du tableau de bord...</p>
      </div>
    )
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>
  }

  if (!overview) {
    return <Alert variant="warning">Aucune donnée disponible</Alert>
  }

  return (
    <div className="space-y-6">
      {/* Onglets */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 font-semibold text-sm transition-colors ${
            activeTab === 'overview'
              ? 'text-neutral-900 border-b-2 border-blue-500'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Aperçu
        </button>
        <button
          onClick={() => setActiveTab('regions')}
          className={`px-4 py-3 font-semibold text-sm transition-colors ${
            activeTab === 'regions'
              ? 'text-neutral-900 border-b-2 border-blue-500'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Par Région
        </button>
        <button
          onClick={() => setActiveTab('utilisateurs')}
          className={`px-4 py-3 font-semibold text-sm transition-colors ${
            activeTab === 'utilisateurs'
              ? 'text-neutral-900 border-b-2 border-blue-500'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Utilisateurs ({overview.nombre_utilisateurs_actifs})
        </button>
      </div>

      {/* TAB: APERÇU */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 font-semibold">Total Dossiers</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">{overview.total_dossiers}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 font-semibold">Ce Mois</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">{overview.statistiques_dossiers.dossiers_ce_mois}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 font-semibold">Non Conformes</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">{overview.statistiques_dossiers.non_conformes}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 font-semibold">Taux Conformité</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">{overview.taux_conformite.pourcentage}%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={24} className="text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Statuts des dossiers */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="font-bold text-lg text-neutral-900 mb-4">Distribution par Statut</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(overview.dossiers_overview).map(([statut, count]) => (
                <div key={statut} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <p className="text-xs text-neutral-500 font-semibold uppercase">{statut}</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performances des utilisateurs */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Performances des Utilisateurs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Utilisateur</th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-700">Actions</th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-700">Positives</th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-700">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.performances_utilisateurs.map(perf => (
                    <tr key={perf.user_id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 font-semibold text-neutral-900">{perf.nom_complet}</td>
                      <td className="py-3 px-4 text-center text-neutral-600">{perf.total_actions}</td>
                      <td className="py-3 px-4 text-center text-green-600 font-semibold">{perf.actions_positives}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {perf.taux_reussite}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activités récentes */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2">
              <Users size={20} />
              Activités des Utilisateurs
            </h3>
            <div className="space-y-3">
              {overview.activites_utilisateurs.map(activite => (
                <div key={activite.user_id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-neutral-900">{activite.nom_complet}</p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {activite.dossiers_traites} dossier(s) traité(s) • {activite.dossiers_cette_semaine} cette semaine
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">Dernière action</p>
                      <p className="text-sm font-semibold text-neutral-900">
                        {activite.derniere_action ? new Date(activite.derniere_action).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB: PAR RÉGION */}
      {activeTab === 'regions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-6 border border-neutral-200"
        >
          <h3 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Répartition par Région
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Région</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">Terminés</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">Non Conformes</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">En Cours</th>
                </tr>
              </thead>
              <tbody>
                {regions.map(region => (
                  <tr key={region.region} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 font-semibold text-neutral-900">{region.region}</td>
                    <td className="py-3 px-4 text-center text-neutral-600">{region.total}</td>
                    <td className="py-3 px-4 text-center text-green-600 font-semibold">{region.termines}</td>
                    <td className="py-3 px-4 text-center text-red-600 font-semibold">{region.non_conformes}</td>
                    <td className="py-3 px-4 text-center text-blue-600 font-semibold">{region.en_cours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB: UTILISATEURS */}
      {activeTab === 'utilisateurs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-6 border border-neutral-200"
        >
          <h3 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2">
            <Users size={20} />
            Utilisateurs du Service
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Nom</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Email</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">Cette Semaine</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">Ce Mois</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map(user => (
                  <tr key={user.user_id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 font-semibold text-neutral-900">{user.nom_complet}</td>
                    <td className="py-3 px-4 text-neutral-600 text-xs">{user.email}</td>
                    <td className="py-3 px-4 text-center text-neutral-600">{user.dossiers_traites}</td>
                    <td className="py-3 px-4 text-center text-blue-600 font-semibold">{user.dossiers_semaine}</td>
                    <td className="py-3 px-4 text-center text-green-600 font-semibold">{user.dossiers_mois}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
