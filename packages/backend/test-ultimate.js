const { Client } = require('pg');

async function testWithClient() {
  const client = new Client({
    host: '172.19.0.2',  // IP del contenedor
    port: 5432,
    user: 'app_user',
    password: 'app_password',
    database: 'concepcion_mapa',
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('🔌 Intentando conectar con IP del contenedor...');
    await client.connect();
    console.log('✅ Conectado!');
    
    const res = await client.query('SELECT NOW() as time, current_user as user');
    console.log('📊 Resultado:', res.rows[0]);
    
    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Código:', err.code);
  }
}

testWithClient();