// data/comercios.js
// Categorías de los comercios aliados (para la landing y Mis cupones)
export const CATEGORIA_COMERCIO = {
  tienda: { label: 'Tienda', emoji: '🛍️' },
  restaurante: { label: 'Restaurante', emoji: '🍽️' },
  cafe: { label: 'Café', emoji: '☕' },
  artesanias: { label: 'Artesanías', emoji: '🧺' },
  hospedaje: { label: 'Hospedaje', emoji: '🛏️' },
  otro: { label: 'Comercio', emoji: '🏪' },
};

export const categoriaComercio = (clave) => CATEGORIA_COMERCIO[clave] || CATEGORIA_COMERCIO.otro;
