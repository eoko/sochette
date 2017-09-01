const socketServer = require('../../index').socketServer;
const path         = '/tmp/sample.sock';

// Simple function that broadcast message "new friend"
function dispatch(server, uuid) {
  server.broadcast('friend.new', `We have a new friend "${uuid}"!`);
}

// Start the socket server
socketServer({ path })

  // We subscribe to the "pong" event which is an answer by the client to a "ping"
  .then(server => server.subscribe('client.pong', (msg) => dispatch(server, msg.uuid)))

  // Never forget to catch error in promise ;)
  .catch(console.error);
