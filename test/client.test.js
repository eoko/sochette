require('chai').should();

const IPC = require('node-ipc').IPC;

const socketServer = require('./../index').socketServer;
const socketClient = require('./../index').socketClient;

describe('Client', function () {
  let server = null;
  let client = null;

  before((done) => {
    const path = '/tmp/test';

    socketServer({ path })
      .then(s => {
        server = s;
        return socketClient({ path })
      })
      .then(c => client = c)
      .then(() => done())
      .catch(console.error)
  });

  describe('Publish', () => {
    it('Should be able to publish an event', (done) => {
      server.subscribe('test', () => done());
      client.publish('test');
    });

    it('Should be able to publish an event with ack', (done) => {
      server.subscribe('test2', () => Promise.resolve());

      client
        .publish('test2', null, true)
        .then(() => done());
    });

    it('Should be able to publish an event with response', (done) => {
      const expectedResult = 'hello';

      server.subscribe('test3', (msg) => msg.data);

      client
        .publish('test3', expectedResult, true)
        .then(data => {
          data.should.be.deep.equal(expectedResult);
          done();
        });
    });


    it('Should be able to publish an event with a delayed response', (done) => {
      const expectedResult = 'hello';

      server.subscribe('test4', (msg) => new Promise(res => setTimeout(() => {
        res(msg.data)
      }, 500)));

      client
        .publish('test4', expectedResult, true)
        .then(data => {
          data.should.be.deep.equal(expectedResult);
          done();
        });
    });

    it('Should be able to reject delayed response', (done) => {
      const expectedResult = 'hello';

      server.subscribe('test5', (msg) => new Promise(res => setTimeout(() => {
        res(msg.data)
      }, 1200)));

      client
        .publish('test5', expectedResult, true)
        .catch(() => done());
    });

    it('Should be able to accept custom delayed response', (done) => {
      const expectedResult = 'hello';

      server.subscribe('test6', (msg) => new Promise(res => setTimeout(() => {
        res(msg.data)
      }, 100)));

      client
        .publish('test6', expectedResult, true, 500)
        .then(() => done());
    });

    it('Should be able to reject custom delayed response', (done) => {
      const expectedResult = 'hello';

      server.subscribe('test7', (msg) => new Promise(res => setTimeout(() => {
        res(msg.data)
      }, 1000)));

      client
        .publish('test7', expectedResult, true, 500)
        .catch(() => done());
    });

    it('Should handle concurrency without ack', (done) => {
      const promises = [];

      server.subscribe('test8', (msg) => {
        if (msg.data === 50) done()
      });

      for (i = 0; i < 51; i++) {
        promises.push(
          Promise
            .resolve(i)
            .then(j => client.publish('test8', j)),
        );
      }
      Promise.all(promises);
    });

    it('Should handle concurrency with ack', (done) => {
      const promises = [];

      server.subscribe('test8', (msg) => Promise.resolve(msg.data));

      for (i = 0; i < 50; i++) {
        promises.push(
          Promise
            .resolve(i)
            .then(j => client
              .publish('test8', j, true, 1000)
              .then(data => data.should.be.equal(data, j)),
            ),
        );
      }

      Promise.all(promises).then(() => done());
    });
  })
});