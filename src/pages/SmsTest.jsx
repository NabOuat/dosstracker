import { useState } from 'react';
import { 
  sendSms, 
  sendVerificationCode, 
  checkVerificationCode, 
  sendNonConformeNotification, 
  sendFinaliseNotification 
} from '../api/sms';
import Button from '../components/ui/Button';
import { AlertCircle, CheckCircle, Send, Loader } from 'lucide-react';

export default function SmsTest() {
  // États pour le SMS simple
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  
  // États pour la vérification
  const [verificationPhone, setVerificationPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationStep, setVerificationStep] = useState('send'); // 'send' ou 'check'
  
  // États pour les notifications
  const [notificationType, setNotificationType] = useState('non_conforme');
  const [notificationPhone, setNotificationPhone] = useState('');
  const [dossierNumber, setDossierNumber] = useState('');
  const [titreNumber, setTitreNumber] = useState('');
  const [motifs, setMotifs] = useState(['Limites non bornées', 'Plan cadastral incomplet']);
  const [notificationSending, setNotificationSending] = useState(false);
  const [notificationResult, setNotificationResult] = useState(null);

  // Gérer l'envoi d'un SMS simple
  const handleSendSms = async (e) => {
    e.preventDefault();
    if (!phoneNumber || !message) return;
    
    setSending(true);
    setResult(null);
    
    try {
      // Simuler l'envoi d'un SMS (dans une implémentation réelle, vous utiliseriez l'API)
      const response = await sendSms({
        numero_destinataire: phoneNumber,
        contenu_message: message,
        type_sms: 'TEST',
        dossier_id: null,
        proprietaire_id: null
      });
      
      setResult({
        success: true,
        message: 'SMS envoyé avec succès',
        data: response
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Erreur lors de l\'envoi du SMS',
        error
      });
    } finally {
      setSending(false);
    }
  };
  
  // Gérer l'envoi d'un code de vérification
  const handleSendVerification = async (e) => {
    e.preventDefault();
    if (!verificationPhone) return;
    
    setVerificationSending(true);
    setVerificationResult(null);
    
    try {
      const response = await sendVerificationCode(verificationPhone);
      
      setVerificationResult({
        success: true,
        message: 'Code de vérification envoyé avec succès',
        data: response
      });
      
      setVerificationStep('check');
    } catch (error) {
      setVerificationResult({
        success: false,
        message: error.response?.data?.detail || 'Erreur lors de l\'envoi du code de vérification',
        error
      });
    } finally {
      setVerificationSending(false);
    }
  };
  
  // Gérer la vérification d'un code
  const handleCheckVerification = async (e) => {
    e.preventDefault();
    if (!verificationPhone || !verificationCode) return;
    
    setVerificationSending(true);
    setVerificationResult(null);
    
    try {
      const response = await checkVerificationCode(verificationPhone, verificationCode);
      
      setVerificationResult({
        success: true,
        message: 'Code de vérification validé avec succès',
        data: response
      });
    } catch (error) {
      setVerificationResult({
        success: false,
        message: error.response?.data?.detail || 'Code de vérification invalide',
        error
      });
    } finally {
      setVerificationSending(false);
    }
  };
  
  // Gérer l'envoi d'une notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notificationPhone || !dossierNumber) return;
    
    setNotificationSending(true);
    setNotificationResult(null);
    
    try {
      let response;
      
      if (notificationType === 'non_conforme') {
        response = await sendNonConformeNotification(notificationPhone, dossierNumber, motifs);
      } else if (notificationType === 'finalise') {
        if (!titreNumber) {
          throw new Error('Le numéro de titre est requis pour une notification de finalisation');
        }
        response = await sendFinaliseNotification(notificationPhone, dossierNumber, titreNumber);
      }
      
      setNotificationResult({
        success: true,
        message: 'Notification envoyée avec succès',
        data: response
      });
    } catch (error) {
      setNotificationResult({
        success: false,
        message: error.response?.data?.detail || error.message || 'Erreur lors de l\'envoi de la notification',
        error
      });
    } finally {
      setNotificationSending(false);
    }
  };
  
  // Gérer les motifs d'inconformité
  const handleMotifChange = (motif) => {
    setMotifs(prev => {
      if (prev.includes(motif)) {
        return prev.filter(m => m !== motif);
      } else {
        return [...prev, motif];
      }
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-2xl text-neutral-900 mb-6">
        Test d'intégration <span style={{ color: 'var(--ci-orange)' }}>SMS</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test d'envoi de SMS simple */}
        <div className="bg-white rounded-lg p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
          <h2 className="font-display font-bold text-lg text-neutral-800 mb-4">
            Envoi de SMS simple
          </h2>
          
          <form onSubmit={handleSendSms} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+2250576610155"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre message..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows="3"
                required
              ></textarea>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              disabled={sending}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Envoyer le SMS
                </>
              )}
            </Button>
          </form>
          
          {result && (
            <div className={`mt-4 p-3 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle size={18} className="text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-red-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{result.message}</p>
                  {result.data && (
                    <pre className="mt-2 text-xs overflow-auto max-h-32 p-2 bg-white/50 rounded">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Test de vérification */}
        <div className="bg-white rounded-lg p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
          <h2 className="font-display font-bold text-lg text-neutral-800 mb-4">
            Vérification de numéro
          </h2>
          
          {verificationStep === 'send' ? (
            <form onSubmit={handleSendVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Numéro à vérifier
                </label>
                <input
                  type="tel"
                  value={verificationPhone}
                  onChange={(e) => setVerificationPhone(e.target.value)}
                  placeholder="+2250576610155"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <Button
                type="submit"
                variant="primary"
                disabled={verificationSending}
                className="w-full"
              >
                {verificationSending ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Envoyer le code
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCheckVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setVerificationStep('send')}
                  disabled={verificationSending}
                >
                  Retour
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  disabled={verificationSending}
                  className="flex-1"
                >
                  {verificationSending ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Vérifier le code
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
          
          {verificationResult && (
            <div className={`mt-4 p-3 rounded-md ${verificationResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-start gap-2">
                {verificationResult.success ? (
                  <CheckCircle size={18} className="text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-red-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{verificationResult.message}</p>
                  {verificationResult.data && (
                    <pre className="mt-2 text-xs overflow-auto max-h-32 p-2 bg-white/50 rounded">
                      {JSON.stringify(verificationResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Test de notifications */}
        <div className="bg-white rounded-lg p-6 md:col-span-2" style={{ boxShadow: 'var(--shadow-md)' }}>
          <h2 className="font-display font-bold text-lg text-neutral-800 mb-4">
            Notifications prédéfinies
          </h2>
          
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Type de notification
                </label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="non_conforme">Non conforme</option>
                  <option value="finalise">Finalisation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={notificationPhone}
                  onChange={(e) => setNotificationPhone(e.target.value)}
                  placeholder="+2250576610155"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Numéro de dossier
                </label>
                <input
                  type="text"
                  value={dossierNumber}
                  onChange={(e) => setDossierNumber(e.target.value)}
                  placeholder="DOS-2026-0001"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            </div>
            
            {notificationType === 'finalise' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Numéro de titre foncier
                </label>
                <input
                  type="text"
                  value={titreNumber}
                  onChange={(e) => setTitreNumber(e.target.value)}
                  placeholder="TF-2026-0001"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            )}
            
            {notificationType === 'non_conforme' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Motifs d'inconformité
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {[
                    'Limites non bornées',
                    'Plan cadastral incomplet',
                    'Superficie non conforme',
                    'Chevauchement de parcelles',
                    'Documents justificatifs manquants',
                    'Erreur de coordonnées GPS',
                    'Non-respect du plan d\'urbanisme',
                    'Litige foncier en cours'
                  ].map(motif => (
                    <label key={motif} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={motifs.includes(motif)}
                        onChange={() => handleMotifChange(motif)}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      {motif}
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              variant="primary"
              disabled={notificationSending}
              className="w-full"
            >
              {notificationSending ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Envoyer la notification
                </>
              )}
            </Button>
          </form>
          
          {notificationResult && (
            <div className={`mt-4 p-3 rounded-md ${notificationResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-start gap-2">
                {notificationResult.success ? (
                  <CheckCircle size={18} className="text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-red-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{notificationResult.message}</p>
                  {notificationResult.data && (
                    <pre className="mt-2 text-xs overflow-auto max-h-32 p-2 bg-white/50 rounded">
                      {JSON.stringify(notificationResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
