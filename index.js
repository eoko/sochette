const debug = require('debug')('pubsub:internal');
const IPC   = require('node-ipc').IPC;

const Client = require('./src/Client');
const Server = require('./src/Server');

const uuidv4 = require('uuid').v4;

module.exports = {
  socketServer: (opts, plugins, ipc) => connect(getSocketServer, opts, plugins, ipc),
  netServer: (opts, plugins, ipc) => connect(getNetServer, opts, plugins, ipc),
  socketClient: (opts, plugins, ipc) => connect(getSocketClient, opts, plugins, ipc),
  netClient: (opts, plugins, ipc) => connect(getNetClient, opts, plugins, ipc),
};

function connect(fn, opts = {}, plugins = null, ipc = null) {
  const uuid = uuidv4();

  const cp = plugins || ['broadcast', 'client', 'ping'];
  const customIpc     = ipc || new IPC;
  const promise       = fn(opts, customIpc, uuid);

  const customPlugins = cp.map(plugin => {
    if (typeof plugin === 'string' || plugin instanceof String) {
      try {
        return require(`./src/plugins/${plugin}`);
      } catch(e) {
        debug(`"${plugin}" does not exist and it is ignored`);
        return null;
      }
    }
    return plugin;
  });

  customIpc.config.logger = debug.bind(debug);

  return promise
    .then(obj => {
      let promise = Promise.resolve(obj);
      customPlugins.forEach(plugin => promise = promise.then(obj => obj.use(plugin)));
      return promise;
    })
    .then(obj => obj.start());
}

/**
 * @param opts
 * @param ipc
 * @param uuid
 * @return {Promise}
 */
function getSocketClient(opts, ipc, uuid) {
  return new Promise(res => ipc.connectTo(uuid, opts.path, () => res(new Client(uuid, ipc.of[uuid]))));
}

/**
 * @param opts
 * @param ipc
 * @param uuid
 * @return {Promise}
 */
function getNetClient(opts, ipc, uuid) {
  /**
   * @param path string
   * @return {Promise.<Client>}
   */
  return new Promise(res => ipc.connectToNet(uuid, opts.host, opts.port, opts.UDPType, () => res(new Client(uuid, ipc.of[uuid]))));
}

/**
 * @param opts
 * @param ipc
 * @return {Promise}
 */
function getSocketServer(opts, ipc) {
  ipc.serve(opts.path);
  ipc.server.start();
  return new Promise((res, rej) => ipc.server.on('start', () => res(new Server(ipc.server))));
}

/**
 * @param opts
 * @param ipc
 * @return {Promise}
 */
function getNetServer(opts, ipc) {
  ipc.serve(opts.host, opts.port, opts.UDPType);
  ipc.server.start();
  return new Promise((res, rej) => ipc.server.on('start', () => res(new Server(ipc.server))));
}