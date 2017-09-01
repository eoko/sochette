const socketServer = require('../../index').socketServer;
const path         = '/tmp/sample.sock';

// Start the socket server
socketServer({ path })

  // We subscribe to the "pong" event which is an answer by the client to a "ping"
  .then(server => setInterval(() => {
    server.broadcast('sample.one');
    server.broadcast('sample.two');
  }, 3000))

  // Never forget to catch error in promise ;)
  .catch(console.error);
