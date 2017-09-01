const socketServer = require('../../index').socketServer;
const path         = '/tmp/sample.sock';

// Start the socket server
socketServer({ path }, ['log'])

  // We subscribe to the "pong" event which is an answer by the client to a "ping"
  .then(server => server.subscribe('sample.ack', () => {}))

  // Never forget to catch error in promise ;)
  .catch(console.error);
