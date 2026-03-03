const net = require('net');

const TEST_IPS = [
  '172.19.0.2',
  'localhost',
  '127.0.0.1',
  'host.docker.internal'
];

async function testConnection(host, port = 5432) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({ host, port, success: false, error: 'timeout' });
    }, 3000);

    socket.connect(port, host, () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({ host, port, success: true });
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      resolve({ host, port, success: false, error: err.message });
    });
  });
}

async function runTests() {
  console.log('🔍 Probando conectividad a PostgreSQL...\n');
  
  for (const host of TEST_IPS) {
    const result = await testConnection(host);
    if (result.success) {
      console.log(`✅ ${host}:5432 - CONEXIÓN EXITOSA`);
    } else {
      console.log(`❌ ${host}:5432 - Falló: ${result.error}`);
    }
  }
}

runTests();