const sql = require('mssql');

const config = {
    user: process.env.DB_USER || 'examor_user',
    password: process.env.DB_PASSWORD || 'Examor@2026',
    server: process.env.DB_SERVER || 'DESKTOP-ACOJ155',
    database: process.env.DB_NAME || 'examor_platform',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: String(process.env.DB_ENCRYPT || 'false').toLowerCase() === 'true',
        trustServerCertificate: String(process.env.DB_TRUST || 'true').toLowerCase() === 'true',
        enableArithAbort: true
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('✅ Connected to SQL Server successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = { connectDB, sql };
