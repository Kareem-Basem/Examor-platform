const { connectDB, sql } = require('../src/config/db');
const { createDemoExamIfMissing } = require('../src/controllers/auth.controller');

const run = async () => {
    await connectDB();
    const users = await sql.query`
        SELECT id, name, role
        FROM users
        WHERE role IN ('student', 'teacher', 'doctor')
        ORDER BY id
    `;

    for (const user of users.recordset || []) {
        await createDemoExamIfMissing({
            userId: user.id,
            role: user.role,
            userName: user.name || 'User'
        });
    }

    console.log(`Backfill complete. Users processed: ${users.recordset?.length || 0}`);
    await sql.close();
};

run().catch((err) => {
    console.error('BACKFILL_ERROR', err.message);
    sql.close();
});
