import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PwaPrompt() {
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
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[5000] bg-white rounded-2xl shadow-2xl p-4 border border-green-100 ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Instalar ConceMap</h4>
            <p className="text-xs text-gray-500">Accede más rápido y sin conexión</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPrompt(false)} className="p-2 text-gray-400">
            <X className="w-5 h-5" />
          </button>
          <button onClick={handleInstall} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-green-200">
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}