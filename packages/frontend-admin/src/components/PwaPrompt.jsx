import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-white rounded-2xl shadow-2xl border-2 border-green-500 p-4"
      >
        <div className="flex gap-3">
          <div className="bg-green-100 rounded-full p-2">📱</div>
          <div className="flex-1">
            <h3 className="font-bold">Instalar aplicación</h3>
            <p className="text-sm text-gray-600">Accede más rápido desde tu pantalla de inicio</p>
          </div>
        </div>
        <button
          onClick={handleInstall}
          className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
        >
          Instalar ahora
        </button>
      </motion.div>
    </AnimatePresence>
  );
}