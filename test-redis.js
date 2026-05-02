const net = require('net');
const client = net.createConnection({ port: 6379, host: '127.0.0.1' }, () => {
  console.log('Connected to Redis!');
  process.exit(0);
});
client.on('error', (err) => {
  console.error('Connection failed:', err.message);
  process.exit(1);
});
