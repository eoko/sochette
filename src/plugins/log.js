module.exports = function ping(obj, opts = {}) {
  obj.subscribe('*', listenAll);

  function listenAll (e,d) {
    console.log(`New event "${e}"`, d || '')
  }

  return obj;
};