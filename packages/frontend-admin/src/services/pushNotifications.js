import api from './api';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const isPushSupported = () => {
  return ('serviceWorker' in navigator) && ('PushManager' in window) && ('Notification' in window);
};

const getSWRegistration = async () => {
  if (!('serviceWorker' in navigator)) return null;
  return await navigator.serviceWorker.ready;
};

export const getPublicVapidKey = async () => {
  const response = await api.get('/push/public-key');
  return response.data.publicKey;
};

export const subscribeUser = async () => {
  if (!isPushSupported()) {
    console.warn('⚠️ Notificaciones push no soportadas en este navegador');
    return null;
  }

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission !== 'granted') {
    console.warn('⚠️ Permiso de notificaciones no concedido');
    return null;
  }

  const registration = await getSWRegistration();
  if (!registration) {
    console.warn('⚠️ Service Worker no está listo para suscripción push');
    return null;
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const publicKey = await getPublicVapidKey();
    if (!publicKey) {
      console.error('❌ Clave VAPID pública no disponible');
      return null;
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
  }

  try {
    await api.post('/push/subscribe', { subscription });
    console.log('✅ Suscripción push registrada en el servidor');
  } catch (error) {
    console.error('❌ Error registrando suscripción push en el servidor', error.response?.data || error.message);
  }

  return subscription;
};

export const unsubscribeUser = async () => {
  if (!isPushSupported()) return null;

  const registration = await getSWRegistration();
  if (!registration) return null;

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    return null;
  }

  try {
    await api.post('/push/unsubscribe', { endpoint: subscription.endpoint });
    await subscription.unsubscribe();
    console.log('✅ Suscripción push cancelada');
  } catch (error) {
    console.error('❌ Error cancelando suscripción push', error.response?.data || error.message);
  }

  return subscription;
};

export const sendTestNotification = async () => {
  try {
    const response = await api.post('/push/test');
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando notificación de prueba', error.response?.data || error.message);
    return null;
  }
};
