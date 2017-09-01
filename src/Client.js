const debug     = require('debug')('pubsub:client');
const uuidV4    = require('uuid').v4;
const events    = require('./events');
const Pluggable = require('./Pluggable');

class Client extends Pluggable {

  constructor(uuid, client, opts) {
    super(opts);

    this.uuid   = uuid;
    this.client = client;
    this.status = { uuid };

    this.after.push(() => {
      process.stdin.resume();
      process.on('exit', this.exit.bind(this));
      process.on('SIGINT', this.sigint.bind(this));
    })
  }

  sigint() {
    this.publish(events.CLIENT_SIGINT, { client: this.status });
    process.exit(0);
  }

  exit(code) {
    this.publish(events.CLIENT_EXIT, { client: this.status, exitCode: code });
    process.exit(code);
  }

  publish(eventName, data, ack = false, timeout = 1000) {
    let promise = null;

    if (ack) {
      const sourceUuid = uuidV4();
      debug(`Publish event "${eventName}" with ack on "${sourceUuid}"`, data);

      promise = new Promise((resolve, reject) => {
        const wait = setTimeout(() => {
          debug(`No ack ${sourceUuid} for event "${eventName}"`, data);

          this.unsubscribe(sourceUuid);
          clearTimeout(wait);
          reject(new Error('no answer'));
        }, timeout);

        this.subscribe(sourceUuid, (msg) => {
          debug(`Ack ${sourceUuid} for event "${eventName}"`, msg);

          this.unsubscribe(sourceUuid);
          clearTimeout(wait);
          resolve(msg);
        });

        this.client.emit(eventName, { uuid: this.uuid, source_uuid: sourceUuid, data });
      });
    } else {
      debug(`Publish event "${eventName}"`, data);
      promise = Promise.resolve(this.client.emit(eventName, { uuid: this.uuid, data }));
    }

    return promise;
  }

  subscribe(event, handler) {
    if (event === '*') {
      this.client.on(event, handler);
    } else {
      this.client.on(event, (v) => handler(event, v));
    }
  }

  unsubscribe(event, handler = '*') {
    this.client.off(event, handler);
  }
}

module.exports = Client;