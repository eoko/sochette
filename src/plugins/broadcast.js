const Server   = require('./../Server');
module.exports = function broadcast(obj) {
  if (obj instanceof Server) {
    obj.broadcast = (eventName, data) => {
      obj.server.broadcast(eventName, data);
    };
  }
  return obj;
};