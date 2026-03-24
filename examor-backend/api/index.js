const { app, initDb } = require('../src/app');

let ready;
module.exports = async (req, res) => {
    if (!ready) {
        ready = initDb();
    }
    await ready;
    return app(req, res);
};
