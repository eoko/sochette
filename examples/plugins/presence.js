const Server = require('./../../src/Server');

module.exports = function presence(obj, opts = {}) {

  // This plugin will be used only for the server
  if (obj instanceof Server) {

    // We check that the "broadcast" and "ping" plugin are registered too
    if (!obj.registeredPlugin.includes('broadcast')) throw new Error('Broadcast plugin is required');
    if (!obj.registeredPlugin.includes('ping')) throw new Error('Ping plugin is required');

    // We subscribe to the event "pong"
    obj.subscribe('client.pong', (msg) => dispatch(obj, msg.uuid));

    // We Broadcast the presence to the other clients
    function dispatch(server, uuid) {
      server.broadcast('friend.new', `We have a new friend "${uuid}"!`);
    }
  }

  return obj;
};
