const debug  = require('debug')('pubsub:plugin:client');
const events = require('./../events');
const Server = require('./../Server');
const Client = require('./../Client');

module.exports = function client(obj, opts = {}) {
  if (obj instanceof Server) {
    obj.clients = {};

    obj.updateClient = function (client) {
      debug(`Update client ${client.uuid}`);
      this.clients[client.uuid] = client;
    };

    obj.newClient = function (client) {
      debug(`New client ${client.uuid}`);
      this.clients[client.uuid] = client;
    };

    obj.removeClient = function (msg) {
      debug(`Remove client "${msg.uuid}" with code ${msg.exitCode}`, msg);
      delete this.clients[msg.uuid];
      this.broadcast(events.CLIENT_EXIT, msg.data);
    };

    obj.sigintClient = function (msg) {
      debug(`Sigint client "${msg.uuid}"`, msg);
      this.broadcast(events.CLIENT_SIGINT, msg.data);
    };

    obj.before.push(function () {
      this.server.on(events.CLIENT_NEW, (client) => this.newClient(client));
      this.server.on(events.CLIENT_EXIT, (data) => this.removeClient(data));
      this.server.on(events.CLIENT_SIGINT, (data) => this.sigintClient(data));
      this.server.on(events.CLIENT_PONG, (client) => this.updateClient(client));
    });
  }

  if (obj instanceof Client) {
    obj.after.push(function () {
      this.publish(events.CLIENT_NEW, this.status)
    });
  }

  return obj;
};