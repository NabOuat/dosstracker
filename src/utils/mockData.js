// ─── Données de démonstration ─────────────────────────────────────────────

export const STATUTS = {
  COURRIER:     { label: 'Reçu – Courrier',       color: 'blue',   step: 1 },
  SPFEI_ADMIN:  { label: 'Contrôle Administratif', color: 'orange', step: 2 },
  SCVAA:        { label: 'Contrôle Technique',     color: 'purple', step: 3 },
  NON_CONFORME: { label: 'Non Conforme',           color: 'red',    step: 3 },
  SPFEI_TITRE:  { label: 'Attribution Titre',      color: 'orange', step: 4 },
  CONSERVATION: { label: 'Archivé – Conservation', color: 'green',  step: 5 },
}

export const MOTIFS_INCONFORMITE = [
  'Limites non bornées',
  'Plan cadastral incomplet',
  'Superficie non conforme',
  'Chevauchement de parcelles',
  'Documents justificatifs manquants',
  'Erreur de coordonnées GPS',
  'Non-respect du plan d\'urbanisme',
  'Litige foncier en cours',
]

let _nextId = 8

export let MOCK_DOSSIERS = [
  {
    id: 1,
    numero: 'DOS-2026-0001',
    demandeur: 'Kouassi Emmanuel',
    contact: '0700000001',
    region: 'Abidjan',
    prefecture: 'Cocody',
    sous_prefecture: 'Bingerville',
    village: 'Anoumabo',
    numero_cf: 'CF-2026-001',
    date_enregistrement: '2026-01-10',
    statut: 'CONSERVATION',
    // SPFEI Admin
    nationalite: 'Ivoirienne', genre: 'M', type_cf: 'Rural',
    date_enquete: '2026-01-15', date_validation_enquete: '2026-01-20',
    date_etablissement_cf: '2026-01-25', date_demande_immatriculation: '2026-01-30',
    // SCVAA
    superficie: 2.5, date_bornage: '2026-02-01',
    geometre: 'Yao Brou Sylvain', contact_geometre: '0708080808',
    decision: 'CONFORME', motifs: [],
    // SPFEI Titre
    conservation: 'Conservation d\'Abidjan', numero_tf: 'TF-2026-0001',
  },
  {
    id: 2,
    numero: 'DOS-2026-0002',
    demandeur: 'Diallo Fatoumata',
    contact: '0700000002',
    region: 'Bouaké',
    prefecture: 'Bouaké',
    sous_prefecture: 'Broukro',
    village: 'Kpankou',
    numero_cf: 'CF-2026-002',
    date_enregistrement: '2026-01-15',
    statut: 'SPFEI_TITRE',
    nationalite: 'Ivoirienne', genre: 'F', type_cf: 'Urbain',
    date_enquete: '2026-01-20', date_validation_enquete: '2026-01-25',
    date_etablissement_cf: '2026-01-28', date_demande_immatriculation: '2026-02-01',
    superficie: 1.2, date_bornage: '2026-02-05',
    geometre: 'Koné Adama', contact_geometre: '0709090909',
    decision: 'CONFORME', motifs: [],
    conservation: '', numero_tf: '',
  },
  {
    id: 3,
    numero: 'DOS-2026-0003',
    demandeur: 'Traoré Mariam',
    contact: '0700000003',
    region: 'Yamoussoukro',
    prefecture: 'Yamoussoukro',
    sous_prefecture: 'Attiégouakro',
    village: 'Gnagbasso',
    numero_cf: 'CF-2026-003',
    date_enregistrement: '2026-01-20',
    statut: 'SCVAA',
    nationalite: 'Ivoirienne', genre: 'F', type_cf: 'Rural',
    date_enquete: '2026-01-25', date_validation_enquete: '2026-01-28',
    date_etablissement_cf: '', date_demande_immatriculation: '',
    superficie: '', date_bornage: '', geometre: '', contact_geometre: '',
    decision: '', motifs: [],
    conservation: '', numero_tf: '',
  },
  {
    id: 4,
    numero: 'DOS-2026-0004',
    demandeur: 'Bamba Sékou',
    contact: '0700000004',
    region: 'San-Pédro',
    prefecture: 'San-Pédro',
    sous_prefecture: 'Méagui',
    village: 'Zragbi',
    numero_cf: 'CF-2026-004',
    date_enregistrement: '2026-01-22',
    statut: 'NON_CONFORME',
    nationalite: 'Ivoirienne', genre: 'M', type_cf: 'Rural',
    date_enquete: '2026-01-27', date_validation_enquete: '2026-01-30',
    date_etablissement_cf: '', date_demande_immatriculation: '',
    superficie: 3.8, date_bornage: '2026-02-03',
    geometre: 'Aka Kouamé', contact_geometre: '0710101010',
    decision: 'NON_CONFORME', motifs: ['Chevauchement de parcelles', 'Documents justificatifs manquants'],
    conservation: '', numero_tf: '',
  },
  {
    id: 5,
    numero: 'DOS-2026-0005',
    demandeur: 'Coulibaly Aminata',
    contact: '0700000005',
    region: 'Korhogo',
    prefecture: 'Korhogo',
    sous_prefecture: 'Karakoro',
    village: 'Pignona',
    numero_cf: 'CF-2026-005',
    date_enregistrement: '2026-01-28',
    statut: 'SPFEI_ADMIN',
    nationalite: 'Ivoirienne', genre: 'F', type_cf: 'Rural',
    date_enquete: '', date_validation_enquete: '', date_etablissement_cf: '', date_demande_immatriculation: '',
    superficie: '', date_bornage: '', geometre: '', contact_geometre: '',
    decision: '', motifs: [],
    conservation: '', numero_tf: '',
  },
  {
    id: 6,
    numero: 'DOS-2026-0006',
    demandeur: 'Touré Ibrahim',
    contact: '0700000006',
    region: 'Man',
    prefecture: 'Man',
    sous_prefecture: 'Logoualé',
    village: 'Sémien',
    numero_cf: '',
    date_enregistrement: '2026-02-05',
    statut: 'COURRIER',
    nationalite: '', genre: '', type_cf: '', date_enquete: '', date_validation_enquete: '',
    date_etablissement_cf: '', date_demande_immatriculation: '',
    superficie: '', date_bornage: '', geometre: '', contact_geometre: '',
    decision: '', motifs: [],
    conservation: '', numero_tf: '',
  },
  {
    id: 7,
    numero: 'DOS-2026-0007',
    demandeur: 'Aka Essi Prudence',
    contact: '0700000007',
    region: 'Abidjan',
    prefecture: 'Yopougon',
    sous_prefecture: 'Yopougon',
    village: '',
    numero_cf: 'CF-2026-007',
    date_enregistrement: '2026-02-10',
    statut: 'COURRIER',
    nationalite: '', genre: '', type_cf: '', date_enquete: '', date_validation_enquete: '',
    date_etablissement_cf: '', date_demande_immatriculation: '',
    superficie: '', date_bornage: '', geometre: '', contact_geometre: '',
    decision: '', motifs: [],
    conservation: '', numero_tf: '',
  },
]

export const MOCK_SMS = [
  {
    id: 1, date: '2026-02-03T10:30:00',
    destinataire: 'Bamba Sékou', contact: '0700000004',
    dossier: 'DOS-2026-0004', type: 'NON_CONFORME',
    contenu: 'Dossier N° DOS-2026-0004 : Votre dossier a été jugé NON CONFORME. Motifs : Chevauchement de parcelles, Documents justificatifs manquants. Veuillez vous rapprocher du SERVICE SCVAA.',
  },
  {
    id: 2, date: '2026-01-31T14:15:00',
    destinataire: 'Kouassi Emmanuel', contact: '0700000001',
    dossier: 'DOS-2026-0001', type: 'FINALISE',
    contenu: 'Dossier N° DOS-2026-0001 : Votre dossier foncier a été finalisé avec succès. Titre Foncier N° TF-2026-0001. Votre dossier est désormais enregistré à la Conservation Foncière.',
  },
]

// Simuler ajout/mise à jour en mémoire
export function addDossier(data) {
  const nouveau = { 
    ...data, 
    id: _nextId++, 
    statut: 'COURRIER',
    created_at: new Date().toISOString(),
    can_edit_until: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
  }
  MOCK_DOSSIERS = [...MOCK_DOSSIERS, nouveau]
  return nouveau
}

export function updateDossier(id, updates) {
  MOCK_DOSSIERS = MOCK_DOSSIERS.map(d => d.id === id ? { ...d, ...updates } : d)
  return MOCK_DOSSIERS.find(d => d.id === id)
}

export function addSms(entry) {
  MOCK_SMS.unshift({ ...entry, id: MOCK_SMS.length + 1, date: new Date().toISOString() })
}
