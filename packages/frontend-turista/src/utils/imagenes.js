// Las fotos se guardan en Cloudinary en su tamaño original (a veces varios MB)
// y el mapa las muestra en círculos de 40 px o tarjetas de 240 px. Cloudinary
// puede entregarlas ya reducidas y en el formato más liviano que soporte el
// teléfono (WebP/AVIF), lo que con mala señal hace mucha diferencia.
export const imagenLigera = (url, ancho = 480) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  // Si ya trae transformaciones, se deja como está
  if (/\/upload\/[a-z]{1,2}_[^/]*\//.test(url)) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${ancho}/`);
};
