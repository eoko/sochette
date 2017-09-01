const socketServer = require('../../index').socketServer;
const presence     = require('./../plugins/presence');
const path         = '/tmp/sample.sock';

socketServer({ path }, ['broadcast', 'ping', presence]).catch(console.error);
