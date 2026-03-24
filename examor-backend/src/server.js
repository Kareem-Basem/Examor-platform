// Examor Platform
// Developed by Kareem Basem (KeMoO)
// Started: 10-03-2026
// Unauthorized use is prohibited

const { app, initDb } = require('./app');

const PORT = process.env.PORT || 5000;

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
