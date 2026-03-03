const { Client } = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres123',
  database: 'concepcion_mapa',
  ssl: false,
  connectionTimeoutMillis: 5000,
  idle_in_transaction_session_timeout: 0,
  keepAlive: false
};

console.log('🔧 Configuración:', {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
  ssl: config.ssl
});

const client = new Client(config);

client.connect()
  .then(() => {
    console.log('✅ Conectado a PostgreSQL!');
    return client.query('SELECT NOW() as tiempo, current_database() as db, current_user as usuario');
  })
  .then(res => {
    console.log('✅ Información del servidor:');
    console.log('   Tiempo:', res.rows[0].tiempo);
    console.log('   Base de datos:', res.rows[0].db);
    console.log('   Usuario:', res.rows[0].usuario);
    return client.end();
  })
  .catch(err => {
    console.error('❌ Error detallado:');
    console.error('  Código:', err.code);
    console.error('  Mensaje:', err.message);
    console.error('  Stack:', err.stack);
    
    // Intentar con 127.0.0.1 en lugar de localhost
    if (config.host === 'localhost') {
      console.log('\n🔄 Intentando con 127.0.0.1...');
      config.host = '127.0.0.1';
      const client2 = new Client(config);
      client2.connect()
        .then(() => {
          console.log('✅ Conectado con 127.0.0.1!');
          return client2.end();
        })
        .catch(err2 => {
          console.error('❌ También falló con 127.0.0.1:', err2.message);
        });
    }
  });