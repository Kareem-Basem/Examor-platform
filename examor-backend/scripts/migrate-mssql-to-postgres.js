/* eslint-disable no-console */
require('dotenv').config();

const mssql = require('mssql');
const { Pool } = require('pg');

const MSSQL_SCHEMA = process.env.MSSQL_SCHEMA || 'dbo';

const TABLES_IN_ORDER = [
    'universities',
    'branches',
    'faculties',
    'departments',
    'courses',
    'users',
    'exams',
    'exam_attempts',
    'questions',
    'options',
    'answers',
    'proctoring_violations',
    'question_bank',
    'question_bank_options',
    'admin_audit_logs'
];

const quoteIdent = (name) => `"${String(name).replace(/"/g, '""')}"`;
const quoteMssqlIdent = (name) => `[${String(name).replace(/]/g, ']]')}]`;

const buildPgConfig = () => {
    const sslEnabled = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: sslEnabled ? { rejectUnauthorized: false } : false
        };
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'postgres',
        ssl: sslEnabled ? { rejectUnauthorized: false } : false
    };
};

const buildMssqlConfig = () => ({
    server: process.env.MSSQL_SERVER,
    port: Number(process.env.MSSQL_PORT || 1433),
    database: process.env.MSSQL_DATABASE,
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    options: {
        encrypt: String(process.env.MSSQL_ENCRYPT || 'false').toLowerCase() === 'true',
        trustServerCertificate: String(process.env.MSSQL_TRUST_CERT || 'true').toLowerCase() === 'true'
    }
});

const mustEnv = (name) => {
    const value = process.env[name];
    if (!value || !String(value).trim()) {
        throw new Error(`Missing required env var: ${name}`);
    }
};

const getTargetColumns = async (pg, tableName) => {
    const result = await pg.query(
        `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
        `,
        [tableName]
    );
    return result.rows.map((row) => row.column_name);
};

const getSourceTables = async (sourcePool) => {
    const req = sourcePool.request();
    req.input('schemaName', mssql.NVarChar(200), MSSQL_SCHEMA);
    const result = await req.query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
    `);
    return (result.recordset || []).map((row) => row.TABLE_NAME);
};

const getTargetTables = async (pg) => {
    const result = await pg.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `);
    return result.rows.map((row) => row.table_name);
};

const getSourceColumns = async (sourcePool, tableName) => {
    const req = sourcePool.request();
    req.input('tableName', mssql.NVarChar(200), tableName);
    req.input('schemaName', mssql.NVarChar(200), MSSQL_SCHEMA);
    const result = await req.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @tableName
          AND TABLE_SCHEMA = @schemaName
        ORDER BY ORDINAL_POSITION
    `);
    return result.recordset.map((row) => row.COLUMN_NAME);
};

const toPgValue = (value) => {
    if (Buffer.isBuffer(value)) return value;
    return value;
};

const insertChunk = async (pg, tableName, columns, rows) => {
    if (rows.length === 0) return;

    const colSql = columns.map(quoteIdent).join(', ');
    const valueParams = [];
    const tuples = rows.map((row, rIdx) => {
        const placeholders = columns.map((col, cIdx) => {
            valueParams.push(toPgValue(row[col]));
            return `$${rIdx * columns.length + cIdx + 1}`;
        });
        return `(${placeholders.join(', ')})`;
    });

    const sql = `INSERT INTO ${quoteIdent(tableName)} (${colSql}) VALUES ${tuples.join(', ')}`;
    await pg.query(sql, valueParams);
};

const resetSequenceIfNeeded = async (pg, tableName, columns) => {
    if (!columns.includes('id')) return;
    const tableSql = quoteIdent(tableName);
    await pg.query(`
        SELECT setval(
            pg_get_serial_sequence('public.${tableName}', 'id'),
            COALESCE((SELECT MAX(id) FROM ${tableSql}), 0) + 1,
            false
        )
    `);
};

const migrateTable = async (sourcePool, pg, tableName) => {
    const [sourceCols, targetCols] = await Promise.all([
        getSourceColumns(sourcePool, tableName),
        getTargetColumns(pg, tableName)
    ]);

    if (targetCols.length === 0) {
        console.log(`- Skipped ${tableName}: target table not found`);
        return { tableName, inserted: 0, skipped: true };
    }

    const targetSet = new Set(targetCols.map((c) => c.toLowerCase()));
    const commonCols = sourceCols.filter((c) => targetSet.has(String(c).toLowerCase()));

    if (commonCols.length === 0) {
        console.log(`- Skipped ${tableName}: no matching columns`);
        return { tableName, inserted: 0, skipped: true };
    }

    const result = await sourcePool.request().query(`SELECT * FROM ${quoteMssqlIdent(MSSQL_SCHEMA)}.${quoteMssqlIdent(tableName)}`);
    const rows = result.recordset || [];
    if (rows.length === 0) {
        await resetSequenceIfNeeded(pg, tableName, targetCols);
        console.log(`- ${tableName}: no rows`);
        return { tableName, inserted: 0, skipped: false };
    }

    const CHUNK_SIZE = 300;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        await insertChunk(pg, tableName, commonCols, chunk);
        inserted += chunk.length;
    }

    await resetSequenceIfNeeded(pg, tableName, targetCols);
    console.log(`- ${tableName}: inserted ${inserted}`);
    return { tableName, inserted, skipped: false };
};

const truncateAll = async (pg) => {
    const tableSql = TABLES_IN_ORDER.map(quoteIdent).join(', ');
    await pg.query(`TRUNCATE TABLE ${tableSql} RESTART IDENTITY CASCADE`);
};

const main = async () => {
    mustEnv('MSSQL_SERVER');
    mustEnv('MSSQL_DATABASE');
    mustEnv('MSSQL_USER');
    mustEnv('MSSQL_PASSWORD');
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
        throw new Error('Provide PostgreSQL connection: DATABASE_URL or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME');
    }

    const sourcePool = new mssql.ConnectionPool(buildMssqlConfig());
    const pg = new Pool(buildPgConfig());

    try {
        console.log('Connecting to SQL Server...');
        await sourcePool.connect();
        console.log('Connecting to PostgreSQL...');
        await pg.query('SELECT 1');
        console.log('Connections OK.');

        const [sourceTables, targetTables] = await Promise.all([
            getSourceTables(sourcePool),
            getTargetTables(pg)
        ]);

        const sourceSet = new Set(sourceTables.map((t) => String(t).toLowerCase()));
        const targetSet = new Set(targetTables.map((t) => String(t).toLowerCase()));
        const orderedExisting = TABLES_IN_ORDER.filter((t) => sourceSet.has(t) && targetSet.has(t));
        const dynamicRemainder = sourceTables
            .map((t) => String(t).toLowerCase())
            .filter((t) => targetSet.has(t) && !orderedExisting.includes(t))
            .sort();

        const tablesToMigrate = [...orderedExisting, ...dynamicRemainder];
        const missingInTarget = sourceTables
            .map((t) => String(t).toLowerCase())
            .filter((t) => !targetSet.has(t));

        console.log(`Source tables: ${sourceTables.length}, target tables: ${targetTables.length}`);
        console.log(`Tables to migrate: ${tablesToMigrate.length}`);
        if (missingInTarget.length > 0) {
            console.log(`Source tables missing in PostgreSQL (${missingInTarget.length}): ${missingInTarget.join(', ')}`);
        }

        if (tablesToMigrate.length === 0) {
            throw new Error('No matching tables found between SQL Server and PostgreSQL');
        }

        console.log('Truncating target tables...');
        if (tablesToMigrate.length > 0) {
            const tableSql = tablesToMigrate.map(quoteIdent).join(', ');
            await pg.query(`TRUNCATE TABLE ${tableSql} RESTART IDENTITY CASCADE`);
        }
        console.log('Target tables truncated.');

        let totalInserted = 0;
        for (const tableName of tablesToMigrate) {
            const result = await migrateTable(sourcePool, pg, tableName);
            totalInserted += result.inserted || 0;
        }

        console.log(`Migration finished. Total inserted rows: ${totalInserted}`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    } finally {
        await sourcePool.close().catch(() => {});
        await pg.end().catch(() => {});
    }
};

main();
