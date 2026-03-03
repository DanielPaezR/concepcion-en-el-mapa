const pgp = require('pg-promise')({
  // Configuración adicional si es necesaria
});

const cn = {
  host: 'localhost',
  port: 5432,
  database: 'concepcion_mapa',
  user: 'app_user',
  password: 'app_password',
  ssl: false,
  connectionTimeoutMillis: 5000
};

const db = pgp(cn);

async function testConnection() {
  try {
    console.log('🔌 Intentando conectar con pg-promise...');
    const result = await db.one('SELECT NOW() as time, current_user as user');
    console.log('✅ Conectado!');
    console.log('📊 Resultado:', result);
    
    const lugares = await db.any('SELECT * FROM lugares');
    console.log('📍 Lugares encontrados:', lugares.length);
    console.log('📋 Primer lugar:', lugares[0]);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Detalle:', err);
  } finally {
    pgp.end();
  }
}

testConnection();