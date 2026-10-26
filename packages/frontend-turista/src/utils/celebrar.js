// utils/celebrar.js
// Celebraciones de los momentos importantes (descubrir un lugar, acertar un
// reto, subir de nivel, ganar un cupón). La gente recuerda una experiencia
// sobre todo por sus mejores momentos, así que esos se marcan con confeti,
// una vibración corta y, si la persona lo activa, un sonido.
// Uso: celebrar('normal') o celebrar('grande'). <Celebracion /> lo dibuja.

const CLAVE_SONIDO = 'cem_sonido';

export const sonidoActivo = () => {
  try { return localStorage.getItem(CLAVE_SONIDO) === '1'; } catch { return false; }
};

export const activarSonido = (activo) => {
  try { localStorage.setItem(CLAVE_SONIDO, activo ? '1' : '0'); } catch { /* sin almacenamiento */ }
};

export function celebrar(tipo = 'normal') {
  window.dispatchEvent(new CustomEvent('cem-celebrar', { detail: { tipo } }));
}
