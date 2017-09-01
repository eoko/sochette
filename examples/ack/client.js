const socketClient = require('../../index').socketClient;
const path         = '/tmp/sample.sock';

// Start the socket client
socketClient({ path }, ['log'])

  // Publish and wait for and answer as a promise :)
  .then(client => client

    // "10000" is the value for the ack timeout. Put it to "0" for a timeout
    .publish('sample.ack', {}, true, 10000)
    .catch(console.error)
  )
  .catch(console.error);