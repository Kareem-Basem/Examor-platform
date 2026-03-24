const { Pool } = require('pg');

const useConnectionString = Boolean(process.env.DATABASE_URL);
const sslEnabled = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';

const config = useConnectionString
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'examor_user',
        password: process.env.DB_PASSWORD || 'Examor@2026',
        database: process.env.DB_NAME || 'examor_platform',
        max: 10,
        idleTimeoutMillis: 30000,
        ssl: sslEnabled ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(config);

const buildQuery = (strings, values) => {
    let text = '';
    const params = [];

    strings.forEach((chunk, idx) => {
        text += chunk;
        if (idx < values.length) {
            params.push(values[idx]);
            text += `$${params.length}`;
        }
    });

    return { text, values: params };
};

const compileNamedQuery = (text, paramsMap) => {
    const values = [];
    const seen = new Map();
    const compiled = String(text).replace(/@([A-Za-z0-9_]+)/g, (_, key) => {
        if (!seen.has(key)) {
            seen.set(key, values.length + 1);
            values.push(paramsMap[key]);
        }
        return `$${seen.get(key)}`;
    });
    return { text: compiled, values };
};

class Request {
    constructor(transaction) {
        this.params = {};
        this.client = transaction?.client || pool;
    }

    input(name, _type, value) {
        this.params[name] = value;
        return this;
    }

    async query(queryText, ...values) {
        let result;
        if (Array.isArray(queryText) && queryText.raw) {
            const built = buildQuery(queryText, values);
            result = await this.client.query(built.text, built.values);
        } else {
            const { text, values: namedValues } = compileNamedQuery(queryText, this.params);
            result = await this.client.query(text, namedValues);
        }
        if (result && !result.recordset) {
            result.recordset = result.rows || [];
        }
        if (result && !result.rowsAffected) {
            result.rowsAffected = [result.rowCount || 0];
        }
        return result;
    }
}

class Transaction {
    constructor() {
        this.client = null;
    }

    async begin() {
        if (this.client) return;
        this.client = await pool.connect();
        await this.client.query('BEGIN');
    }

    async commit() {
        if (!this.client) return;
        await this.client.query('COMMIT');
        this.client.release();
        this.client = null;
    }

    async rollback() {
        if (!this.client) return;
        await this.client.query('ROLLBACK');
        this.client.release();
        this.client = null;
    }
}

const sql = {
    query: async (strings, ...values) => {
        if (Array.isArray(strings) && strings.raw) {
            const { text, values: params } = buildQuery(strings, values);
            const result = await pool.query(text, params);
            if (result && !result.recordset) {
                result.recordset = result.rows || [];
            }
            if (result && !result.rowsAffected) {
                result.rowsAffected = [result.rowCount || 0];
            }
            return result;
        }
        const result = await pool.query(strings, values);
        if (result && !result.recordset) {
            result.recordset = result.rows || [];
        }
        if (result && !result.rowsAffected) {
            result.rowsAffected = [result.rowCount || 0];
        }
        return result;
    },
    Request,
    Transaction,
    Int: 'int',
    Bit: 'bool',
    Decimal: 'decimal',
    NVarChar: 'text',
    MAX: 'max'
};

const withTransaction = async (handler) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await handler({
            query: (strings, ...values) => {
                if (Array.isArray(strings) && strings.raw) {
                    const { text, values: params } = buildQuery(strings, values);
                    return client.query(text, params);
                }
                return client.query(strings, values);
            }
        });
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const connectDB = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('? Connected to PostgreSQL successfully');
    } catch (error) {
        console.error('? Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = { connectDB, sql, withTransaction, pool };
