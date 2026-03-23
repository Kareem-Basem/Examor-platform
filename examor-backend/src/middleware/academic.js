const { sql } = require('../config/db');

const hasUserColumn = async (columnName) => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'users'
          AND COLUMN_NAME = ${columnName}
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const requireAcademicVerification = async (req, res, next) => {
    try {
        const role = String(req.user?.role || '').toLowerCase();
        if (!['doctor', 'teacher', 'student'].includes(role)) return next();

        const [hasProfileModeColumn, hasAcademicVerifiedColumn] = await Promise.all([
            hasUserColumn('profile_mode'),
            hasUserColumn('academic_verified')
        ]);

        if (!hasProfileModeColumn || !hasAcademicVerifiedColumn) return next();

        const result = await sql.query`
            SELECT TOP 1 profile_mode, academic_verified
            FROM users
            WHERE id = ${req.user.id}
        `;

        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const profileMode = String(user.profile_mode || '').toLowerCase();
        const academicVerified = Boolean(user.academic_verified);

        if (profileMode === 'academic' && !academicVerified) {
            return res.status(403).json({
                success: false,
                message: 'Your academic profile is pending verification by admin'
            });
        }

        return next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { requireAcademicVerification };
