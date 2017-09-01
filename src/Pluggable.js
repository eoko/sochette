class Pluggable {


  constructor(opts) {
    this.opts             = opts;
    this.before           = [];
    this.after            = [];
    this.registeredPlugin = [];
  }

  start() {
    const before = [];
    const after  = [];

    this.before.forEach(b => before.push(b.call(this, {})));

    return Promise
      .all(before)
      .then(() => this.after.forEach(a => after.push(a.call(this, {}))))
      .then(() => Promise.all(after))
      .then(() => this);
  }

  use(plugin) {
    if (plugin) {
      if (plugin.name !== '') {
        this.registeredPlugin.push(plugin.name)
      }
      return Promise.resolve(plugin(this, this.opts));
    }
    return Promise.resolve(this);
  }
}

module.exports = Pluggable;