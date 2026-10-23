// scripts/crear-superadmin.js
// Crea la cuenta de superadmin o convierte una existente. El rol superadmin
// no se puede asignar desde la API a propósito: solo con este script, que
// necesita acceso directo a la base de datos.
//
// Uso (desde packages/backend):
//   node scripts/crear-superadmin.js correo@ejemplo.com "Tu Nombre" "contraseñaSegura"
// Si el correo ya existe, se convierte en superadmin (la contraseña es opcional
// y, si se da, se actualiza). Para producción, define DATABASE_URL antes.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

(async () => {
    const [email, nombre, password] = process.argv.slice(2);
    if (!email) {
        console.log('Uso: node scripts/crear-superadmin.js correo "Nombre" "contraseña"');
        process.exit(1);
    }
    try {
        const existe = await db.query('SELECT id, rol FROM usuarios WHERE LOWER(email) = LOWER($1)', [email]);
        if (existe.rows[0]) {
            const hash = password ? await bcrypt.hash(password, 10) : null;
            await db.query(
                `UPDATE usuarios SET rol = 'superadmin', anonimo = false, email_verificado = true,
                        password_hash = COALESCE($2, password_hash), nombre = COALESCE($3, nombre)
                 WHERE id = $1`,
                [existe.rows[0].id, hash, nombre || null]
            );
            console.log(`✅ ${email} ahora es superadmin (antes: ${existe.rows[0].rol})`);
        } else {
            if (!password || password.length < 8) {
                console.log('❌ Para crear la cuenta da una contraseña de al menos 8 caracteres');
                process.exit(1);
            }
            await db.query(
                `INSERT INTO usuarios (email, nombre, password_hash, rol, anonimo, email_verificado)
                 VALUES ($1, $2, $3, 'superadmin', false, true)`,
                [email, nombre || 'Superadmin', await bcrypt.hash(password, 10)]
            );
            console.log(`✅ Cuenta superadmin creada: ${email}`);
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
