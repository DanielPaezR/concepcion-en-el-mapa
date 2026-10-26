// utils/compartir.js
// Compartir con el menú nativo del teléfono; si no existe (computador o
// navegador viejo), abre WhatsApp con el texto listo.
export const urlInicio = () => `${window.location.origin}/landing`;

export async function compartir({ titulo, texto, url = urlInicio() }) {
  if (navigator.share) {
    try {
      await navigator.share({ title: titulo, text: texto, url });
      return true;
    } catch (e) {
      if (e?.name === 'AbortError') return false; // la persona canceló
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${texto}\n${url}`)}`, '_blank', 'noopener');
  return true;
}
