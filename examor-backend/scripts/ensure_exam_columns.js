const { connectDB, sql } = require('../src/config/db');

const ensureColumn = async (tableName, columnName, definition) => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = ${tableName}
          AND COLUMN_NAME = ${columnName}
    `;
    if (Number(result.recordset[0]?.total || 0) > 0) {
        return false;
    }
    await sql.query(`ALTER TABLE ${tableName} ADD ${columnName} ${definition}`);
    return true;
};

const run = async () => {
    await connectDB();
    const changes = [];
    changes.push(await ensureColumn('exams', 'proctoring_enabled', 'BIT NOT NULL CONSTRAINT DF_exams_proctoring_enabled DEFAULT(0)'));
    changes.push(await ensureColumn('exams', 'post_end_visibility_mode', "NVARCHAR(20) NOT NULL CONSTRAINT DF_exams_post_end_visibility_mode DEFAULT('hide')"));
    changes.push(await ensureColumn('exams', 'post_end_grace_minutes', 'INT NOT NULL CONSTRAINT DF_exams_post_end_grace_minutes DEFAULT(0)'));
    changes.push(await ensureColumn('exams', 'max_attempts_per_student', 'INT NOT NULL CONSTRAINT DF_exams_max_attempts_per_student DEFAULT(1)'));
    changes.push(await ensureColumn('exams', 'allow_custom_exam_code', 'BIT NOT NULL CONSTRAINT DF_exams_allow_custom_exam_code DEFAULT(0)'));
    changes.push(await ensureColumn('exams', 'screen_capture_protection', 'BIT NOT NULL CONSTRAINT DF_exams_screen_capture_protection DEFAULT(0)'));
    changes.push(await ensureColumn('exams', 'is_demo_exam', 'BIT NOT NULL CONSTRAINT DF_exams_is_demo_exam DEFAULT(0)'));

    const added = changes.filter(Boolean).length;
    console.log(`Exam columns ensured. Added: ${added}`);
    await sql.close();
};

run().catch((err) => {
    console.error('MIGRATION_ERROR', err.message);
    sql.close();
});
