require('chai').should();

const socketServer = require('./../index').socketServer;
const socketClient = require('./../index').socketClient;

const Server = require('../src/Server');
const Client = require('../src/Client');
const events = require('../src/events');

const IPC = require('node-ipc').IPC;

const path = '/tmp/test.socket';

describe('IPC', function () {
  describe('Server', () => {
    it('Should bind a Unix Socket', (done) => {
      socketServer({ path })
        .then(server => (server instanceof Server).should.be.equal(true))
        .then(() => done())
    });

    it('Should broadcast ping', done => {
      socketServer({ path }, [])
        .then(server => {
          server.subscribe(events.CLIENT_PONG, (msg) => {
            msg.data.should.be.an('object');
            msg.data.uuid.should.be.a('string');
            done();
          });

          return socketClient({ path });
        });
    });

    it('Should be aware of new client', done => {
      socketServer({ path })
        .then(server => {
          const path = server.server.path;

          server.server.on(events.CLIENT_NEW, (msg) => {
            msg.data.should.be.an('object');
            msg.data.uuid.should.be.a('string');
            done();
          });

          return socketClient({ path });
        })
    });
  });

  describe('Client', () => {
    it('Should bind a Unix Socket', (done) => {
      socketServer({ path })
        .then(server => {
          const path = server.server.path;

          return socketClient({ path })
            .then(server => (server instanceof Client).should.be.equal(true))
            .then(() => done());
        })
    });

    it('Should bind a Unix Socket', (done) => {
      socketServer({ path })
        .then(server => {
          const path = server.server.path;

          return socketClient({ path })
            .then(client => (client instanceof Client).should.be.equal(true))
            .then(() => done());
        })
    })
  })
});