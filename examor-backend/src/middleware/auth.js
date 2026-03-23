const jwt = require('jsonwebtoken');
const { sql } = require('../config/db');

const hasIsActiveColumn = async () => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'users'
          AND COLUMN_NAME = 'is_active'
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const activeColumnExists = await hasIsActiveColumn();
        const [hasSessionIdColumn, hasSessionLastSeenColumn] = await Promise.all([
            sql.query`
                SELECT COUNT(*) AS total
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'users'
                  AND COLUMN_NAME = 'active_session_id'
            `,
            sql.query`
                SELECT COUNT(*) AS total
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'users'
                  AND COLUMN_NAME = 'active_session_last_seen'
            `
        ]);
        const sessionColumnsExist = Number(hasSessionIdColumn.recordset[0]?.total || 0) > 0 && Number(hasSessionLastSeenColumn.recordset[0]?.total || 0) > 0;
        const userResult = activeColumnExists
            ? await sql.query`
                SELECT id, role, is_active,
                       ${sessionColumnsExist ? 'active_session_id, active_session_last_seen' : 'CAST(NULL AS NVARCHAR(128)) AS active_session_id, CAST(NULL AS DATETIME) AS active_session_last_seen'}
                FROM users
                WHERE id = ${decoded.id}
            `
            : await sql.query`
                SELECT id, role,
                       ${sessionColumnsExist ? 'active_session_id, active_session_last_seen' : 'CAST(NULL AS NVARCHAR(128)) AS active_session_id, CAST(NULL AS DATETIME) AS active_session_last_seen'}
                FROM users
                WHERE id = ${decoded.id}
            `;

        const currentUser = userResult.recordset[0];
        if (!currentUser || currentUser.is_active === false) {
            return res.status(401).json({
                success: false,
                message: 'This account is inactive.'
            });
        }

        if (sessionColumnsExist) {
            const dbSessionId = currentUser.active_session_id || null;
            const tokenSessionId = decoded.sid || null;

            if (dbSessionId && dbSessionId !== tokenSessionId) {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please login again.'
                });
            }

            if (!dbSessionId && tokenSessionId) {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please login again.'
                });
            }

            if (dbSessionId && tokenSessionId && dbSessionId === tokenSessionId) {
                await sql.query`
                    UPDATE users
                    SET active_session_last_seen = GETDATE()
                    WHERE id = ${currentUser.id}
                `;
            }
        }

        req.user = {
            id: currentUser.id,
            role: currentUser.role,
            sid: decoded.sid || null
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

module.exports = { verifyToken };
