const { app, initDb } = require('../src/app');

let ready;
module.exports = async (req, res) => {
    const path = req?.url || '';
    const needsDb = path.startsWith('/api/');

    if (needsDb && !ready) {
        ready = initDb();
    }

    if (needsDb) {
        try {
            await ready;
        } catch (error) {
            return res.status(503).json({
                success: false,
                message: 'Database unavailable',
                detail: error.message
            });
        }
    }

    return app(req, res);
};
