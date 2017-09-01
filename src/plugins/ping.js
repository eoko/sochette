const debug  = require('debug')('pubsub:plugin:ping');
const events = require('./../events');

const Client = require('../Client');
const Server = require('../Server');

module.exports = function ping(obj, opts = {}) {
  if (obj instanceof Server) {
    if (!obj.registeredPlugin.includes('broadcast')) throw new Error('Broadcast plugin is required');

    obj.ping = function () {
      debug(`Ping clients`);
      this.server.broadcast(events.SERVER_PING);
    };

    obj.before.push(function () {
      this.server.on(events.CLIENT_PONG, () => debug('pong!'));
    });

    obj.after.push(function () {
      this.interval = setInterval(() => { this.ping() }, 1000);
    });
  }

  if (obj instanceof Client) {
    obj.before.push(function () {
      this.subscribe(events.SERVER_PING, () => this.publish(events.CLIENT_PONG, this.status));
    });
  }

  return obj;
};