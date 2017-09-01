const socketClient = require('../../index').socketClient;
const path         = '/tmp/sample.sock';

// Start the socket client
socketClient({ path }, ['log'])

  // Only subscribe for event "sample.one"
  .then(client => client.subscribe('sample.one', (e, v) => console.log(`Receiving "${e}" with value "${JSON.stringify(v, true, 2)}"`,)))
  .catch(console.error);