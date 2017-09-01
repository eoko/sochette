const debug  = require('debug')('pubsub:server');
const events = require('./events');
const Pluggable = require('./Pluggable');

class Server extends Pluggable{

  constructor(server, opts) {
    super(opts);
    this.server  = server;
  }

  subscribe(eventName, handler) {
    debug(`Subscribe to ${eventName}`, handler);

    this.server.on(eventName, (e, msg, socket) => {
      Promise.resolve(handler(msg)).then(res => {
        if (msg.source_uuid) {
          this.server.emit(socket, msg.source_uuid, res)
        }
      })
    });
  }

  unsubscribe(eventName, handler) {
    debug(`Unsubscribe to ${eventName}`, handler);
    this.server.off(eventName, handler);
  }
}

module.exports = Server;