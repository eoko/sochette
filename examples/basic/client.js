const socketClient = require('../../index').socketClient;
const path = '/tmp/sample.sock';

// Start the socket client
socketClient(
  { path },
  [
    'log', // log everything
    'ping', // answer to "ping" with "pong"
  ]
).catch(console.error);