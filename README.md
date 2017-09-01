Sochette
========

(WIP-Exploration) Pluggable client/server over socket (unix socket, tcp, udp...).

Sample code (see `/examples` for more)
--------------------------------------

# Raw code
By default, the server will broadcast a ping to all client and they answer with a `pong`. 

In that usage, we use the `pong` to notify client presence from the server.

```javascript
// examples/basic/client.js
const socketClient = require('./index').socketClient;
const path = '/tmp/sample.sock';

socketClient({ path }, ['log','ping']).catch(console.error);
```

```javascript
// examples/basic/server.js
const socketServer = require('./index').socketServer;
const path         = '/tmp/sample.sock';

function dispatch(server, uuid) {
  server.broadcast('friend.new', `We have a new friend "${uuid}"!`);
}

socketServer({ path })
  .then(server => server.subscribe('client.pong', (msg) => dispatch(server, msg.uuid)))
  .catch(console.error);

```

# With a custom plugin
You can also create a plugin for that. It's reusable :D.

```javascript
// examples/plugins/presence.js
const debug  = require('debug')('pubsub:plugin:presence');

const Client = require('./src/Client');
const Server = require('./src/Server');

module.exports = function presence(obj, opts = {}) {
  
  // This plugin will be used only for the server
  if (obj instanceof Server) {

    // We check that the "broadcast" and "ping" plugin are registered too
    if (!obj.registeredPlugin.includes('broadcast')) throw new Error('Broadcast plugin is required');
    if (!obj.registeredPlugin.includes('ping')) throw new Error('Ping plugin is required');

    // We subscribe to the event "pong"
    obj.subscribe('client.pong', (msg) => dispatch(server, msg.uuid));
    
    // We Broadcast the presence to the other clients
    function dispatch(server, uuid) {
      server.broadcast('friend.new', `We have a new friend "${uuid}"!`);
    }
  }

  return obj;
}
```

```javascript
// examples/basic/serverWithPlugin.js
const socketServer = require('../../index').socketServer;
const presence     = require('./../plugins/presence');
const path         = '/tmp/sample.sock';

function dispatch(server, uuid) {
  server.broadcast('friend.new', `We have a new friend "${uuid}"!`);
}

socketServer({ path }, ['broadcast', 'ping', presence])
  .then(server => server.subscribe('client.pong', (msg) => dispatch(server, msg.uuid)))
  .catch(console.error);

```
```javascript
// presence plugin
const debug  = require('debug')('pubsub:plugin:presence');

const Client = require('./src/Client');
const Server = require('./src/Server');

module.exports = function presence(obj, opts = {}) {
  
  // This plugin will be used only for the server
  if (obj instanceof Server) {

    // We check that the "broadcast" and "ping" plugin are registered too
    if (!obj.registeredPlugin.includes('broadcast')) throw new Error('Broadcast plugin is required');
    if (!obj.registeredPlugin.includes('ping')) throw new Error('Ping plugin is required');

    // We subscribe to the event "pong"
    obj.subscribe('client.pong', (msg) => dispatch(server, msg.uuid));
    
    // We Broadcast the presence to the other clients
    function dispatch(server, uuid) {
      server.broadcast('friend.new', `We have a new friend "${uuid}"!`);
    }
  }

  return obj;
}
```

```javascript
// examples/basic/client.js
const socketClient = require('./index').socketClient;
const path = '/tmp/sample.sock';

socketClient({ path }, ['log','ping']).catch(console.error);
```