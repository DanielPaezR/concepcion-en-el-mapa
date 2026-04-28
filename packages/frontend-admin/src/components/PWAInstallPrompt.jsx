import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó la instalación');
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-white rounded-2xl shadow-2xl border-2 border-green-500 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="bg-green-100 rounded-full p-2">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">📱 Instalar aplicación</h3>
            <p className="text-sm text-gray-600">Instala Concepción en el Mapa para acceder más rápido</p>
          </div>
          <button onClick={() => setShowPrompt(false)} className="text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
        >
          Instalar ahora
        </button>
      </motion.div>
    </AnimatePresence>
  );
}