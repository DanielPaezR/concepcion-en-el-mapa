// services/emailService.js
// Envío de correos (códigos de verificación y avisos al superadmin) por SMTP.
// Se activa al definir SMTP_HOST, SMTP_USER y SMTP_PASS (por ejemplo, Gmail
// con una "contraseña de aplicación"). Sin esas variables:
//   - no se envían correos (solo se registran en consola), y
//   - el registro funciona sin código de verificación, como antes.
// En desarrollo, VERIFICACION_DEV=1 activa la verificación e imprime el
// código en la consola en vez de enviarlo.
const nodemailer = require('nodemailer');

let transporter = null;

const smtpConfigurado = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const verificacionActiva = () => smtpConfigurado() || process.env.VERIFICACION_DEV === '1';

function obtenerTransporter() {
    if (!transporter) {
        const port = parseInt(process.env.SMTP_PORT || '587', 10);
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure: port === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
    }
    return transporter;
}

async function enviarCorreo({ para, asunto, html, texto }) {
    if (!smtpConfigurado()) {
        console.log(`✉️  [correo no configurado] Para: ${para} | ${asunto}${texto ? ` | ${texto}` : ''}`);
        return false;
    }
    try {
        await obtenerTransporter().sendMail({
            from: process.env.EMAIL_FROM || `Concepción en el Mapa <${process.env.SMTP_USER}>`,
            to: para,
            subject: asunto,
            text: texto,
            html,
        });
        return true;
    } catch (error) {
        console.error('❌ Error enviando correo:', error.message);
        return false;
    }
}

const marco = (contenido) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px">
    <h2 style="color:#15803d;margin:0 0 12px">🗺️ Concepción en el Mapa</h2>
    ${contenido}
    <p style="color:#9ca3af;font-size:12px;margin-top:24px">Concepción, Antioquia</p>
  </div>`;

async function enviarCodigoVerificacion(email, codigo, nombre) {
    return enviarCorreo({
        para: email,
        asunto: `Tu código de verificación: ${codigo}`,
        texto: `Tu código de verificación es ${codigo}. Vence en 15 minutos.`,
        html: marco(`
          <p>Hola${nombre ? ` ${nombre}` : ''}, usa este código para confirmar tu cuenta:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;background:#f0fdf4;border-radius:12px;padding:16px">${codigo}</p>
          <p style="color:#6b7280">Vence en 15 minutos. Si no fuiste tú, ignora este correo.</p>`),
    });
}

module.exports = { smtpConfigurado, verificacionActiva, enviarCorreo, enviarCodigoVerificacion, marco };
