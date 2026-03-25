const bcrypt = require('bcryptjs');
const { sql } = require('../config/db');
const { createDemoExamIfMissing } = require('./auth.controller');

const normalizeRole = (value) => (['admin', 'teacher', 'student'].includes(value) ? value : null);
const normalizeProfileMode = (value) => (value === 'independent' || value === 'academic' ? value : null);
const normalizeAccessMode = (value) => (value === 'link' ? 'link' : 'department');
const VALID_ATTEMPT_TIME_FILTER = `
    ea.start_time <= NOW()
    AND (ea.submit_time IS NULL OR ea.submit_time <= NOW())
    AND (e.start_date IS NULL OR ea.submit_time IS NULL OR ea.submit_time >= e.start_date)
`;

const hasColumn = async (tableName, columnName) => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_name = ${tableName}
          AND column_name = ${columnName}
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const hasTable = async (tableName) => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM information_schema.tables
        WHERE table_name = ${tableName}
          AND table_type = 'BASE TABLE'
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const getDepartmentHierarchy = async (departmentId, includeFaculty = true) => {
    if (!Number.isInteger(departmentId) || departmentId <= 0) return null;

    const canUseFaculty = includeFaculty && (await hasTable('faculties')) && (await hasColumn('departments', 'faculty_id'));
    const result = await sql.query(`
        SELECT d.id AS department_id,
               d.name AS department_name,
               d.branch_id,
               b.university_id,
               ${canUseFaculty ? 'd.faculty_id,' : 'CAST(NULL AS INT) AS faculty_id,'}
               ${canUseFaculty ? 'f.name AS faculty_name' : 'CAST(NULL AS TEXT) AS faculty_name'}
        FROM departments d
        JOIN branches b ON d.branch_id = b.id
        ${canUseFaculty ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
        WHERE d.id = ${departmentId}
    `);

    return result.recordset[0] || null;
};

const getFacultyRecord = async (facultyId) => {
    if (!Number.isInteger(facultyId) || facultyId <= 0) return null;
    if (!(await hasTable('faculties')) || !(await hasColumn('departments', 'faculty_id'))) return null;

    const result = await sql.query`
        SELECT id, branch_id, name
        FROM faculties
        WHERE id = ${facultyId}
    `;

    return result.recordset[0] || null;
};

const writeAuditLog = async (adminId, actionType, targetType, targetId, details) => {
    if (!(await hasTable('admin_audit_logs'))) return;

    await sql.query`
        INSERT INTO admin_audit_logs (admin_id, action_type, target_type, target_id, details)
        VALUES (${adminId}, ${actionType}, ${targetType}, ${targetId || null}, ${details || null})
    `;
};

const countBy = async (tableName, columnName, value) => {
    const result = await sql.query(`SELECT COUNT(*)::INT AS total FROM ${tableName} WHERE ${columnName} = $1`, value);
    return Number(result.recordset[0]?.total || 0);
};

const getExamAttemptStats = async (examId) => {
    if (!Number.isInteger(examId) || examId <= 0) return null;
    if (!(await hasTable('exam_attempts'))) return { total_attempts: 0, open_attempts: 0 };
    const result = await sql.query`
        SELECT
            COUNT(*)::INT AS total_attempts,
            SUM(CASE WHEN submit_time IS NULL THEN 1 ELSE 0 END)::INT AS open_attempts
        FROM exam_attempts
        WHERE exam_id = ${examId}
    `;
    return result.recordset[0] || { total_attempts: 0, open_attempts: 0 };
};

const getUniversities = async (_req, res) => {
    try {
        const result = await sql.query`
            SELECT *
            FROM universities
            ORDER BY name
        `;
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addUniversity = async (req, res) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const country = typeof req.body.country === 'string' ? req.body.country.trim() : '';
        if (!name || !country) {
            return res.status(400).json({ success: false, message: 'Please provide name and country' });
        }

        await sql.query`
            INSERT INTO universities (name, country)
            VALUES (${name}, ${country})
        `;

        await writeAuditLog(req.user.id, 'create_university', 'university', null, JSON.stringify({ name, country }));

        res.status(201).json({ success: true, message: 'University added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBranches = async (_req, res) => {
    try {
        const result = await sql.query`
            SELECT b.*, u.name AS university_name
            FROM branches b
            JOIN universities u ON b.university_id = u.id
            ORDER BY u.name, b.name
        `;
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getFaculties = async (_req, res) => {
    try {
        if (!(await hasTable('faculties')) || !(await hasColumn('departments', 'faculty_id'))) {
            return res.status(200).json({ success: true, data: [] });
        }

        const result = await sql.query`
            SELECT f.*, b.name AS branch_name, u.name AS university_name
            FROM faculties f
            JOIN branches b ON f.branch_id = b.id
            JOIN universities u ON b.university_id = u.id
            ORDER BY u.name, b.name, f.name
        `;
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addFaculty = async (req, res) => {
    try {
        const branchId = Number(req.body.branch_id);
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

        if (!(await hasTable('faculties')) || !(await hasColumn('departments', 'faculty_id'))) {
            return res.status(400).json({ success: false, message: 'Run the faculties migration first' });
        }
        if (!Number.isInteger(branchId) || branchId <= 0 || !name) {
            return res.status(400).json({ success: false, message: 'Please provide branch_id and name' });
        }

        await sql.query`
            INSERT INTO faculties (branch_id, name)
            VALUES (${branchId}, ${name})
        `;

        await writeAuditLog(req.user.id, 'create_faculty', 'faculty', null, JSON.stringify({ branchId, name }));
        res.status(201).json({ success: true, message: 'Faculty added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addBranch = async (req, res) => {
    try {
        const universityId = Number(req.body.university_id);
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const city = typeof req.body.city === 'string' ? req.body.city.trim() : '';
        if (!Number.isInteger(universityId) || universityId <= 0 || !name || !city) {
            return res.status(400).json({ success: false, message: 'Please provide university_id, name and city' });
        }

        await sql.query`
            INSERT INTO branches (university_id, name, city)
            VALUES (${universityId}, ${name}, ${city})
        `;

        await writeAuditLog(req.user.id, 'create_branch', 'branch', null, JSON.stringify({ universityId, name, city }));

        res.status(201).json({ success: true, message: 'Branch added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDepartments = async (_req, res) => {
    try {
        const hasFaculties = (await hasTable('faculties')) && (await hasColumn('departments', 'faculty_id'));
        const result = await sql.query(`
            SELECT d.*,
                   b.name AS branch_name,
                   u.name AS university_name,
                   ${hasFaculties ? 'f.name AS faculty_name' : 'CAST(NULL AS TEXT) AS faculty_name'}
            FROM departments d
            JOIN branches b ON d.branch_id = b.id
            JOIN universities u ON b.university_id = u.id
            ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
            ORDER BY u.name, b.name, ${hasFaculties ? 'f.name,' : ''} d.name
        `);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addDepartment = async (req, res) => {
    try {
        const hasFaculties = (await hasTable('faculties')) && (await hasColumn('departments', 'faculty_id'));
        const facultyId = req.body.faculty_id ? Number(req.body.faculty_id) : null;
        let branchId = Number(req.body.branch_id);
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

        if (hasFaculties && facultyId) {
            const faculty = await getFacultyRecord(facultyId);
            if (!faculty) {
                return res.status(404).json({ success: false, message: 'Faculty not found' });
            }
            if (Number.isInteger(branchId) && branchId > 0 && Number(faculty.branch_id) !== branchId) {
                return res.status(400).json({ success: false, message: 'Faculty does not belong to the selected branch' });
            }
            branchId = Number(faculty.branch_id);
        }

        if (!Number.isInteger(branchId) || branchId <= 0 || !name) {
            return res.status(400).json({ success: false, message: 'Please provide branch/faculty and name' });
        }

        if (hasFaculties) {
            await sql.query`
                INSERT INTO departments (branch_id, faculty_id, name)
                VALUES (${branchId}, ${facultyId}, ${name})
            `;
        } else {
            await sql.query`
                INSERT INTO departments (branch_id, name)
                VALUES (${branchId}, ${name})
            `;
        }

        await writeAuditLog(req.user.id, 'create_department', 'department', null, JSON.stringify({ branchId, facultyId, name }));

        res.status(201).json({ success: true, message: 'Department added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCourses = async (_req, res) => {
    try {
        const hasFaculties = (await hasTable('faculties')) && (await hasColumn('departments', 'faculty_id'));
        const result = await sql.query(`
            SELECT c.*,
                   d.name AS department_name,
                   b.name AS branch_name,
                   u.name AS university_name,
                   ${hasFaculties ? 'f.id AS faculty_id, f.name AS faculty_name' : 'CAST(NULL AS INT) AS faculty_id, CAST(NULL AS TEXT) AS faculty_name'}
            FROM courses c
            JOIN departments d ON c.department_id = d.id
            JOIN branches b ON d.branch_id = b.id
            JOIN universities u ON b.university_id = u.id
            ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
            ORDER BY u.name, b.name, ${hasFaculties ? 'f.name,' : ''} d.name, c.level, c.name
        `);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addCourse = async (req, res) => {
    try {
        const departmentId = Number(req.body.department_id);
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const level = typeof req.body.level === 'string' ? req.body.level.trim() : '';
        if (!Number.isInteger(departmentId) || departmentId <= 0 || !name || !level) {
            return res.status(400).json({ success: false, message: 'Please provide department_id, name and level' });
        }

        await sql.query`
            INSERT INTO courses (department_id, name, level)
            VALUES (${departmentId}, ${name}, ${level})
        `;

        await writeAuditLog(req.user.id, 'create_course', 'course', null, JSON.stringify({ departmentId, name, level }));

        res.status(201).json({ success: true, message: 'Course added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUniversity = async (req, res) => {
    try {
        const universityId = Number(req.params.id);
        if (!Number.isInteger(universityId) || universityId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid university id' });
        }

        if ((await hasTable('branches')) && (await hasColumn('branches', 'university_id'))) {
            const branchCount = await countBy('branches', 'university_id', universityId);
            if (branchCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete university while branches exist' });
            }
        }

        if ((await hasTable('users')) && (await hasColumn('users', 'university_id'))) {
            const userCount = await countBy('users', 'university_id', universityId);
            if (userCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete university while users are linked' });
            }
        }

        const result = await sql.query`
            DELETE FROM universities
            WHERE id = ${universityId}
        `;
        if ((result.rowsAffected?.[0] || 0) === 0) {
            return res.status(404).json({ success: false, message: 'University not found' });
        }

        await writeAuditLog(req.user.id, 'delete_university', 'university', universityId, null);
        res.status(200).json({ success: true, message: 'University deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBranch = async (req, res) => {
    try {
        const branchId = Number(req.params.id);
        if (!Number.isInteger(branchId) || branchId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid branch id' });
        }

        if ((await hasTable('departments')) && (await hasColumn('departments', 'branch_id'))) {
            const departmentCount = await countBy('departments', 'branch_id', branchId);
            if (departmentCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete branch while departments exist' });
            }
        }

        if ((await hasTable('faculties')) && (await hasColumn('faculties', 'branch_id'))) {
            const facultyCount = await countBy('faculties', 'branch_id', branchId);
            if (facultyCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete branch while faculties exist' });
            }
        }

        if ((await hasTable('users')) && (await hasColumn('users', 'branch_id'))) {
            const userCount = await countBy('users', 'branch_id', branchId);
            if (userCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete branch while users are linked' });
            }
        }

        const result = await sql.query`
            DELETE FROM branches
            WHERE id = ${branchId}
        `;
        if ((result.rowsAffected?.[0] || 0) === 0) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        await writeAuditLog(req.user.id, 'delete_branch', 'branch', branchId, null);
        res.status(200).json({ success: true, message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteFaculty = async (req, res) => {
    try {
        const facultyId = Number(req.params.id);
        if (!Number.isInteger(facultyId) || facultyId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid faculty id' });
        }
        if (!(await hasTable('faculties'))) {
            return res.status(400).json({ success: false, message: 'Faculties table not available' });
        }

        if ((await hasTable('departments')) && (await hasColumn('departments', 'faculty_id'))) {
            const departmentCount = await countBy('departments', 'faculty_id', facultyId);
            if (departmentCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete faculty while departments exist' });
            }
        }

        if ((await hasTable('users')) && (await hasColumn('users', 'faculty_id'))) {
            const userCount = await countBy('users', 'faculty_id', facultyId);
            if (userCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete faculty while users are linked' });
            }
        }

        const result = await sql.query`
            DELETE FROM faculties
            WHERE id = ${facultyId}
        `;
        if ((result.rowsAffected?.[0] || 0) === 0) {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }

        await writeAuditLog(req.user.id, 'delete_faculty', 'faculty', facultyId, null);
        res.status(200).json({ success: true, message: 'Faculty deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const departmentId = Number(req.params.id);
        if (!Number.isInteger(departmentId) || departmentId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid department id' });
        }

        if ((await hasTable('courses')) && (await hasColumn('courses', 'department_id'))) {
            const courseCount = await countBy('courses', 'department_id', departmentId);
            if (courseCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete department while courses exist' });
            }
        }

        if ((await hasTable('users')) && (await hasColumn('users', 'department_id'))) {
            const userCount = await countBy('users', 'department_id', departmentId);
            if (userCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete department while users are linked' });
            }
        }

        const result = await sql.query`
            DELETE FROM departments
            WHERE id = ${departmentId}
        `;
        if ((result.rowsAffected?.[0] || 0) === 0) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        await writeAuditLog(req.user.id, 'delete_department', 'department', departmentId, null);
        res.status(200).json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const courseId = Number(req.params.id);
        if (!Number.isInteger(courseId) || courseId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid course id' });
        }

        if ((await hasTable('exams')) && (await hasColumn('exams', 'course_id'))) {
            const examCount = await countBy('exams', 'course_id', courseId);
            if (examCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete course while exams exist' });
            }
        }

        const result = await sql.query`
            DELETE FROM courses
            WHERE id = ${courseId}
        `;
        if ((result.rowsAffected?.[0] || 0) === 0) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        await writeAuditLog(req.user.id, 'delete_course', 'course', courseId, null);
        res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUser = async (req, res) => {
    let transaction;
    try {
        const userId = Number(req.params.id);
        const forceDelete = String(req.query.force || '').toLowerCase() === 'true';
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }
        if (req.user.id === userId) {
            return res.status(409).json({ success: false, message: 'You cannot delete your own account' });
        }

        const userResult = await sql.query`
            SELECT id, role
            FROM users
            WHERE id = ${userId}
        `;
        const user = userResult.recordset[0];
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            const adminCount = await countBy('users', 'role', 'admin');
            if (adminCount <= 1) {
                return res.status(409).json({ success: false, message: 'Cannot delete the last admin account' });
            }
        }

        if ((await hasTable('exams')) && (await hasColumn('exams', 'created_by'))) {
            const createdExamCount = await countBy('exams', 'created_by', userId);
            if (createdExamCount > 0) {
                return res.status(409).json({ success: false, message: 'Cannot delete user while exams exist' });
            }
        }

        if ((await hasTable('exam_attempts')) && (await hasColumn('exam_attempts', 'student_id'))) {
            const attemptCount = await countBy('exam_attempts', 'student_id', userId);
            if (attemptCount > 0) {
                if (!forceDelete) {
                    return res.status(409).json({ success: false, message: 'Cannot delete user while attempts exist' });
                }
                transaction = new sql.Transaction();
                await transaction.begin();
                const tx = new sql.Request(transaction);

                {
                    const hasVerifiedBy = await hasColumn('users', 'academic_verified_by_admin_id');
                    const hasVerifiedAt = await hasColumn('users', 'academic_verified_at');
                    const hasVerified = await hasColumn('users', 'academic_verified');
                    const hasEmailConfirmed = await hasColumn('users', 'academic_email_confirmed');
                    if (hasVerifiedBy) {
                        const updates = [];
                        if (hasVerifiedBy) updates.push('academic_verified_by_admin_id = NULL');
                        if (hasVerifiedAt) updates.push('academic_verified_at = NULL');
                        if (hasVerified) updates.push('academic_verified = FALSE');
                        if (hasEmailConfirmed) updates.push('academic_email_confirmed = FALSE');
                        if (updates.length > 0) {
                            await tx.query(`
                                UPDATE users
                                SET ${updates.join(', ')}
                                WHERE academic_verified_by_admin_id = $1
                            `, userId);
                        }
                    }
                }

                if (await hasTable('admin_audit_logs')) {
                    await tx.query`
                        DELETE FROM admin_audit_logs
                        WHERE admin_id = ${userId}
                    `;
                }

                if (await hasTable('answers') && (await hasColumn('answers', 'reviewed_by'))) {
                    await tx.query`
                        UPDATE answers
                        SET reviewed_by = NULL,
                            reviewed_at = NULL
                        WHERE reviewed_by = ${userId}
                    `;
                }

                if (await hasTable('question_bank')) {
                    if (await hasTable('question_bank_options')) {
                        await tx.query`
                            DELETE FROM question_bank_options
                            WHERE bank_question_id IN (
                                SELECT id
                                FROM question_bank
                                WHERE doctor_id = ${userId}
                            )
                        `;
                    }
                    await tx.query`
                        DELETE FROM question_bank
                        WHERE doctor_id = ${userId}
                    `;
                }

                if (await hasTable('proctoring_violations')) {
                    await tx.query`
                        DELETE FROM proctoring_violations
                        WHERE attempt_id IN (
                            SELECT id
                            FROM exam_attempts
                            WHERE student_id = ${userId}
                        )
                    `;
                }
                if (await hasTable('answers')) {
                    await tx.query`
                        DELETE FROM answers
                        WHERE attempt_id IN (
                            SELECT id
                            FROM exam_attempts
                            WHERE student_id = ${userId}
                        )
                    `;
                }
                await tx.query`
                    DELETE FROM exam_attempts
                    WHERE student_id = ${userId}
                `;

                const deleteResult = await tx.query`
                    DELETE FROM users
                    WHERE id = ${userId}
                `;
                if ((deleteResult.rowsAffected?.[0] || 0) === 0) {
                    await transaction.rollback();
                    return res.status(404).json({ success: false, message: 'User not found' });
                }

                await transaction.commit();
                await writeAuditLog(req.user.id, 'force_delete_user', 'user', userId, JSON.stringify({ removedAttempts: attemptCount }));
                return res.status(200).json({ success: true, message: 'User deleted successfully' });
            }
        }

        const result = await sql.query`
            DELETE FROM users
            WHERE id = ${userId}
        `;
        if ((result.rowsAffected?.[0] || 0) === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await writeAuditLog(req.user.id, 'delete_user', 'user', userId, null);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Force delete user failed:', error);
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                // ignore rollback errors
            }
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteExamAdmin = async (req, res) => {
    let transaction;
    try {
        const examId = Number(req.params.id);
        const forceDelete = String(req.query.force || '').toLowerCase() === 'true';
        if (!Number.isInteger(examId) || examId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid exam id' });
        }

        const stats = await getExamAttemptStats(examId);
        if (!forceDelete && stats && (Number(stats.total_attempts || 0) > 0 || Number(stats.open_attempts || 0) > 0)) {
            return res.status(409).json({
                success: false,
                message: 'This exam has attempts. Use force delete to remove it.'
            });
        }

        transaction = new sql.Transaction();
        await transaction.begin();
        const tx = new sql.Request(transaction);

        if (await hasTable('proctoring_violations')) {
            await tx.query`
                DELETE FROM proctoring_violations
                WHERE attempt_id IN (
                    SELECT id
                    FROM exam_attempts
                    WHERE exam_id = ${examId}
                )
            `;
        }
        if (await hasTable('answers')) {
            await tx.query`
                DELETE FROM answers
                WHERE attempt_id IN (
                    SELECT id
                    FROM exam_attempts
                    WHERE exam_id = ${examId}
                )
            `;
        }
        if (await hasTable('exam_attempts')) {
            await tx.query`
                DELETE FROM exam_attempts
                WHERE exam_id = ${examId}
            `;
        }
        if (await hasTable('options')) {
            await tx.query`
                DELETE FROM options
                WHERE question_id IN (
                    SELECT id
                    FROM questions
                    WHERE exam_id = ${examId}
                )
            `;
        }
        if (await hasTable('questions')) {
            await tx.query`
                DELETE FROM questions
                WHERE exam_id = ${examId}
            `;
        }

        const deleteResult = await tx.query`
            DELETE FROM exams
            WHERE id = ${examId}
        `;
        if ((deleteResult.rowsAffected?.[0] || 0) === 0) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        await transaction.commit();
        await writeAuditLog(req.user.id, 'delete_exam', 'exam', examId, JSON.stringify({ forceDelete }));
        res.status(200).json({
            success: true,
            message: forceDelete ? 'Exam and attempts deleted successfully' : 'Exam deleted successfully'
        });
    } catch (error) {
        if (transaction) {
            try { await transaction.rollback(); } catch (_) {}
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const activeColumnExists = await hasColumn('users', 'is_active');
        const hasAcademicVerifiedColumn = await hasColumn('users', 'academic_verified');
        const hasAcademicEmailConfirmedColumn = await hasColumn('users', 'academic_email_confirmed');
        const hasFaculties = (await hasTable('faculties')) && (await hasColumn('departments', 'faculty_id'));

        const page = Math.max(1, Number(req.query.page) || 0);
        const pageSize = Math.min(200, Math.max(10, Number(req.query.pageSize) || 0));
        const usePaging = Number.isInteger(page) && page > 0 && Number.isInteger(pageSize) && pageSize > 0;
        const roleFilter = typeof req.query.role === 'string' && req.query.role.trim() ? req.query.role.trim() : null;
        const q = typeof req.query.q === 'string' && req.query.q.trim() ? req.query.q.trim().toLowerCase() : null;
        const academicFilter = typeof req.query.academic === 'string' && req.query.academic.trim()
            ? req.query.academic.trim().toLowerCase()
            : null;

        const conditions = [];
        const request = new sql.Request();

        if (roleFilter) {
            conditions.push('u.role = @role');
            request.input('role', sql.NVarChar, roleFilter);
        }

        if (q) {
            conditions.push('(LOWER(u.name) LIKE @q OR LOWER(u.email) LIKE @q)');
            request.input('q', sql.NVarChar, `%${q}%`);
        }

        const academicExpression = "(u.profile_mode = 'academic' OR (NULLIF(LTRIM(RTRIM(u.profile_mode)), '') IS NULL AND u.department_id IS NOT NULL))";

        if (academicFilter === 'academic') {
            conditions.push(academicExpression);
        }

        if (academicFilter === 'pending') {
            conditions.push(academicExpression);
            if (hasAcademicVerifiedColumn) {
                conditions.push('COALESCE(u.academic_verified, false) = false');
            }
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const baseSelect = `
                SELECT u.id, u.name, u.email, u.role, u.profile_mode, ${activeColumnExists ? 'u.is_active' : 'CAST(TRUE AS BOOLEAN) AS is_active'},
                       ${hasAcademicVerifiedColumn ? 'u.academic_verified' : 'CAST(FALSE AS BOOLEAN) AS academic_verified'},
                       ${hasAcademicEmailConfirmedColumn ? 'u.academic_email_confirmed' : 'CAST(FALSE AS BOOLEAN) AS academic_email_confirmed'},
                       u.university_id, u.department_id, u.created_at,
                       un.name AS university_name, d.name AS department_name,
                       ${hasFaculties ? 'b.id AS branch_id, f.id AS faculty_id, f.name AS faculty_name, b.name AS branch_name' : 'CAST(NULL AS INT) AS branch_id, CAST(NULL AS INT) AS faculty_id, CAST(NULL AS TEXT) AS faculty_name, CAST(NULL AS TEXT) AS branch_name'}
                FROM users u
                LEFT JOIN universities un ON u.university_id = un.id
                LEFT JOIN departments d ON u.department_id = d.id
                ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id LEFT JOIN branches b ON d.branch_id = b.id' : ''}
                ${whereClause}
        `;

        let total = null;
        if (usePaging) {
            const totalResult = await request.query(`
                SELECT COUNT(*) AS total
                FROM users u
                ${whereClause}
            `);
            total = Number(totalResult.recordset[0]?.total || 0);
            request.input('offset', sql.Int, (page - 1) * pageSize);
            request.input('limit', sql.Int, pageSize);
        }

        const result = await request.query(`
            ${baseSelect}
            ORDER BY u.created_at DESC, u.id DESC
            ${usePaging ? 'LIMIT @limit OFFSET @offset' : ''}
        `);

        if (usePaging) {
            return res.status(200).json({
                success: true,
                data: result.recordset,
                meta: { page, pageSize, total }
            });
        }

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const setUserAcademicVerification = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const academicVerified = req.body.academic_verified === true || req.body.academic_verified === 1 || req.body.academic_verified === '1';
        const [hasAcademicVerifiedColumn, hasAcademicEmailConfirmedColumn, hasAcademicVerifiedByColumn, hasAcademicVerifiedAtColumn] = await Promise.all([
            hasColumn('users', 'academic_verified'),
            hasColumn('users', 'academic_email_confirmed'),
            hasColumn('users', 'academic_verified_by_admin_id'),
            hasColumn('users', 'academic_verified_at')
        ]);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }

        if (!hasAcademicVerifiedColumn) {
            return res.status(400).json({ success: false, message: 'Run academic verification migration first' });
        }

        const targetUser = await sql.query`
            SELECT id, role
            FROM users
            WHERE id = ${userId}
        `;

        if (!targetUser.recordset[0]) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updates = ['academic_verified = @academic_verified'];
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('academic_verified', sql.Bit, academicVerified ? true : false);

        if (hasAcademicEmailConfirmedColumn) {
            updates.push('academic_email_confirmed = @academic_email_confirmed');
            request.input('academic_email_confirmed', sql.Bit, academicVerified ? true : false);
        }

        if (hasAcademicVerifiedByColumn) {
            updates.push('academic_verified_by_admin_id = @verified_by_admin_id');
            request.input('verified_by_admin_id', sql.Int, academicVerified ? req.user.id : null);
        }

        if (hasAcademicVerifiedAtColumn) {
            updates.push(`academic_verified_at = ${academicVerified ? 'NOW()' : 'NULL'}`);
        }

        await request.query(`
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = @userId
        `);

        await writeAuditLog(
            req.user.id,
            academicVerified ? 'verify_user_academic' : 'unverify_user_academic',
            'user',
            userId,
            JSON.stringify({ academicVerified })
        );

        res.status(200).json({
            success: true,
            message: academicVerified ? 'Academic verification enabled' : 'Academic verification removed'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addUser = async (req, res) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        const role = normalizeRole(req.body.role);
        const universityId = req.body.university_id ? Number(req.body.university_id) : null;
        const departmentId = req.body.department_id ? Number(req.body.department_id) : null;
        const requestedProfileMode = normalizeProfileMode(req.body.profile_mode);
        const derivedProfileMode = ['teacher', 'student'].includes(role)
            ? (requestedProfileMode || (departmentId ? 'academic' : 'independent'))
            : null;
        const departmentHierarchy = departmentId ? await getDepartmentHierarchy(departmentId, true) : null;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, password and role' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        }
        if (departmentId && !departmentHierarchy) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        if (departmentHierarchy && universityId && Number(departmentHierarchy.university_id) !== universityId) {
            return res.status(400).json({ success: false, message: 'Department does not belong to the selected university' });
        }
        if (!departmentId && universityId && derivedProfileMode === 'academic') {
            return res.status(400).json({ success: false, message: 'Please select a department for academic accounts' });
        }
        if (['teacher', 'student'].includes(role) && derivedProfileMode === 'academic' && !departmentId) {
            return res.status(400).json({
                success: false,
                message: role === 'teacher'
                    ? 'Academic teachers must be assigned to a department'
                    : 'Academic students must be assigned to a department'
            });
        }

        const existing = await sql.query`SELECT id FROM users WHERE email = ${email}`;
        if (existing.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await sql.query`
            INSERT INTO users (name, email, password, role, university_id, department_id, profile_mode)
            VALUES (${name}, ${email}, ${hashedPassword}, ${role}, ${universityId}, ${departmentId}, ${derivedProfileMode})
            RETURNING id
        `;
        const createdUserId = Number(result.recordset[0]?.id || 0);

        if (createdUserId > 0 && ['student', 'teacher'].includes(role)) {
            await createDemoExamIfMissing({
                userId: createdUserId,
                role,
                userName: name
            });
        }

        await writeAuditLog(req.user.id, 'create_user', 'user', createdUserId || null, JSON.stringify({ email, role }));

        res.status(201).json({ success: true, message: 'User added successfully', user_id: createdUserId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const backfillDemoExamsForUsers = async (req, res) => {
    try {
        const usersResult = await sql.query`
            SELECT id, name, role
            FROM users
            WHERE role IN ('student', 'teacher')
            ORDER BY id ASC
        `;

        let processed = 0;
        for (const user of usersResult.recordset || []) {
            await createDemoExamIfMissing({
                userId: user.id,
                role: user.role,
                userName: user.name
            });
            processed += 1;
        }

        await writeAuditLog(
            req.user.id,
            'backfill_demo_exams',
            'user',
            null,
            JSON.stringify({ processed })
        );

        res.status(200).json({
            success: true,
            message: 'Demo exams backfill completed',
            processed
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const role = normalizeRole(req.body.role);
        const universityId = req.body.university_id ? Number(req.body.university_id) : null;
        const departmentId = req.body.department_id ? Number(req.body.department_id) : null;
        const requestedProfileMode = normalizeProfileMode(req.body.profile_mode);
        const derivedProfileMode = ['teacher', 'student'].includes(role)
            ? (requestedProfileMode || (departmentId ? 'academic' : 'independent'))
            : null;
        const departmentHierarchy = departmentId ? await getDepartmentHierarchy(departmentId, true) : null;

        if (!Number.isInteger(userId) || userId <= 0 || !role) {
            return res.status(400).json({ success: false, message: 'Invalid user update payload' });
        }

        const existing = await sql.query`SELECT id FROM users WHERE id = ${userId}`;
        if (existing.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (departmentId && !departmentHierarchy) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        if (departmentHierarchy && universityId && Number(departmentHierarchy.university_id) !== universityId) {
            return res.status(400).json({ success: false, message: 'Department does not belong to the selected university' });
        }
        if (!departmentId && universityId && derivedProfileMode === 'academic') {
            return res.status(400).json({ success: false, message: 'Please select a department for academic accounts' });
        }
        if (['teacher', 'student'].includes(role) && derivedProfileMode === 'academic' && !departmentId) {
            return res.status(400).json({
                success: false,
                message: role === 'teacher'
                    ? 'Academic teachers must be assigned to a department'
                    : 'Academic students must be assigned to a department'
            });
        }

        await sql.query`
            UPDATE users
            SET role = ${role},
                university_id = ${universityId},
                department_id = ${departmentId},
                profile_mode = ${derivedProfileMode}
            WHERE id = ${userId}
        `;

        await writeAuditLog(req.user.id, 'update_user', 'user', userId, JSON.stringify({ role, universityId, departmentId, derivedProfileMode }));

        res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const resetUserPassword = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        if (!Number.isInteger(userId) || userId <= 0 || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await sql.query`
            UPDATE users
            SET password = ${hashedPassword}
            WHERE id = ${userId}
        `;
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await writeAuditLog(req.user.id, 'reset_password', 'user', userId, null);

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const setUserStatus = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const isActive = req.body.is_active === true || req.body.is_active === 1 || req.body.is_active === '1';
        const activeColumnExists = await hasColumn('users', 'is_active');

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }
        if (!activeColumnExists) {
            return res.status(400).json({ success: false, message: 'Run the latest admin user status migration first' });
        }
        if (req.user.id === userId && !isActive) {
            return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
        }

        const result = await sql.query`
            UPDATE users
            SET is_active = ${isActive ? 1 : 0}
            WHERE id = ${userId}
        `;
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await writeAuditLog(req.user.id, isActive ? 'activate_user' : 'deactivate_user', 'user', userId, null);

        res.status(200).json({ success: true, message: isActive ? 'User activated successfully' : 'User deactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const setUsersBulkStatus = async (req, res) => {
    try {
        const activeColumnExists = await hasColumn('users', 'is_active');
        const isActive = req.body.is_active === true || req.body.is_active === 1 || req.body.is_active === '1';
        const userIds = Array.isArray(req.body.user_ids)
            ? [...new Set(req.body.user_ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))]
            : [];

        if (!activeColumnExists) {
            return res.status(400).json({ success: false, message: 'Run the latest admin user status migration first' });
        }

        if (userIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide at least one valid user id' });
        }

        if (!isActive && userIds.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
        }

        const request = new sql.Request();
        const placeholders = userIds.map((id, index) => {
            request.input(`user_id_${index}`, sql.Int, id);
            return `@user_id_${index}`;
        }).join(', ');

        const result = await request.query(`
            UPDATE users
            SET is_active = ${isActive ? 1 : 0}
            WHERE id IN (${placeholders})
        `);

        await writeAuditLog(
            req.user.id,
            isActive ? 'bulk_activate_users' : 'bulk_deactivate_users',
            'user',
            null,
            JSON.stringify({ userIds, affected: result.rowCount || 0 })
        );

        res.status(200).json({
            success: true,
            message: isActive ? 'Users activated successfully' : 'Users deactivated successfully',
            affected: result.rowCount || 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const setUsersBulkAcademicVerification = async (req, res) => {
    try {
        const academicVerified = req.body.academic_verified === true || req.body.academic_verified === 1 || req.body.academic_verified === '1';
        const userIds = Array.isArray(req.body.user_ids)
            ? [...new Set(req.body.user_ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))]
            : [];

        const [hasAcademicVerifiedColumn, hasAcademicEmailConfirmedColumn, hasAcademicVerifiedByColumn, hasAcademicVerifiedAtColumn] = await Promise.all([
            hasColumn('users', 'academic_verified'),
            hasColumn('users', 'academic_email_confirmed'),
            hasColumn('users', 'academic_verified_by_admin_id'),
            hasColumn('users', 'academic_verified_at')
        ]);

        if (!hasAcademicVerifiedColumn) {
            return res.status(400).json({ success: false, message: 'Run academic verification migration first' });
        }

        if (userIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide at least one valid user id' });
        }

        const request = new sql.Request();
        const placeholders = userIds.map((id, index) => {
            request.input(`user_id_${index}`, sql.Int, id);
            return `@user_id_${index}`;
        }).join(', ');

        const updates = [`academic_verified = ${academicVerified ? 'TRUE' : 'FALSE'}`];
        if (hasAcademicEmailConfirmedColumn) {
            updates.push(`academic_email_confirmed = ${academicVerified ? 'TRUE' : 'FALSE'}`);
        }
        if (hasAcademicVerifiedByColumn) {
            updates.push(`academic_verified_by_admin_id = ${academicVerified ? req.user.id : 'NULL'}`);
        }
        if (hasAcademicVerifiedAtColumn) {
            updates.push(`academic_verified_at = ${academicVerified ? 'NOW()' : 'NULL'}`);
        }

        const result = await request.query(`
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id IN (${placeholders})
              AND (
                  profile_mode = 'academic'
                  OR (NULLIF(LTRIM(RTRIM(profile_mode)), '') IS NULL AND department_id IS NOT NULL)
              )
        `);

        await writeAuditLog(
            req.user.id,
            academicVerified ? 'bulk_verify_academic' : 'bulk_unverify_academic',
            'user',
            null,
            JSON.stringify({ userIds, affected: result.rowCount || 0 })
        );

        res.status(200).json({
            success: true,
            message: academicVerified ? 'Academic verification enabled for selected users' : 'Academic verification removed for selected users',
            affected: result.rowCount || 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getExams = async (_req, res) => {
    try {
        const hasFaculties = (await hasTable('faculties')) && (await hasColumn('departments', 'faculty_id'));
        const result = await sql.query(`
            SELECT e.id, e.title, e.exam_code, e.duration, e.total_marks, e.access_mode, e.start_date, e.end_date, e.created_at,
                   creator.name AS teacher_name, creator.email AS teacher_email,
                   c.name AS course_name, d.name AS department_name, u.name AS university_name,
                   ${hasFaculties ? 'f.name AS faculty_name, b.name AS branch_name,' : 'CAST(NULL AS TEXT) AS faculty_name, CAST(NULL AS TEXT) AS branch_name,'}
                   (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS questions_count,
                   (
                       SELECT COUNT(*)
                       FROM exam_attempts ea
                       WHERE ea.exam_id = e.id
                         AND ${VALID_ATTEMPT_TIME_FILTER}
                   ) AS attempts_count
            FROM exams e
            JOIN users creator ON e.created_by = creator.id
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN branches b ON d.branch_id = b.id
            LEFT JOIN universities u ON b.university_id = u.id
            ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
            ORDER BY e.created_at DESC, e.id DESC
        `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateExam = async (req, res) => {
    try {
        const examId = Number(req.params.id);
        const title = typeof req.body.title === 'string' ? req.body.title.trim() : null;
        const startDate = req.body.start_date || null;
        const endDate = req.body.end_date || null;
        const accessMode = normalizeAccessMode(req.body.access_mode);

        if (!Number.isInteger(examId) || examId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid exam id' });
        }

        const existing = await sql.query`SELECT id, title FROM exams WHERE id = ${examId}`;
        if (existing.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' });
        }

        await sql.query`
            UPDATE exams
            SET title = ${title || existing.recordset[0].title},
                start_date = ${startDate},
                end_date = ${endDate},
                access_mode = ${accessMode}
            WHERE id = ${examId}
        `;

        await writeAuditLog(req.user.id, 'update_exam', 'exam', examId, JSON.stringify({ title, startDate, endDate, accessMode }));

        res.status(200).json({ success: true, message: 'Exam updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAttempts = async (_req, res) => {
    try {
        const result = await sql.query(`
            SELECT ea.id, ea.exam_id, ea.student_id, ea.start_time, ea.submit_time, ea.score, ea.forced_submit,
                   e.title AS exam_title, e.exam_code, e.access_mode, e.total_marks,
                   student.name AS student_name, student.email AS student_email,
                   teacher.name AS teacher_name,
                   COALESCE(violations.total_violations, 0) AS violations_count
            FROM exam_attempts ea
            JOIN exams e ON ea.exam_id = e.id
            JOIN users student ON ea.student_id = student.id
            JOIN users teacher ON e.created_by = teacher.id
            LEFT JOIN LATERAL (
                SELECT COALESCE(SUM(pv.count), 0) AS total_violations
                FROM proctoring_violations pv
                WHERE pv.attempt_id = ea.id
            ) violations ON TRUE
            WHERE ${VALID_ATTEMPT_TIME_FILTER}
            ORDER BY ea.start_time DESC, ea.id DESC
        `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const forceSubmitAttempt = async (req, res) => {
    try {
        const attemptId = Number(req.params.id);
        if (!Number.isInteger(attemptId) || attemptId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid attempt id' });
        }

        const result = await sql.query`
            UPDATE exam_attempts
            SET submit_time = NOW(),
                score = COALESCE(score, 0),
                forced_submit = TRUE
            WHERE id = ${attemptId}
              AND submit_time IS NULL
        `;

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Open attempt not found' });
        }

        await sql.query`
            INSERT INTO proctoring_violations (attempt_id, violation_type, count, reason)
            SELECT ${attemptId}, 'admin_force_submit', 1, 'Attempt was force-submitted by admin'
            WHERE NOT EXISTS (
                SELECT 1
                FROM proctoring_violations
                WHERE attempt_id = ${attemptId}
                  AND violation_type = 'admin_force_submit'
            )
        `;

        await writeAuditLog(req.user.id, 'force_submit_attempt', 'attempt', attemptId, null);

        res.status(200).json({ success: true, message: 'Attempt force-submitted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const forceSubmitAttemptsBulk = async (req, res) => {
    try {
        const attemptIds = Array.isArray(req.body.attempt_ids)
            ? [...new Set(req.body.attempt_ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))]
            : [];

        if (attemptIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide at least one valid attempt id' });
        }

        const request = new sql.Request();
        const placeholders = attemptIds.map((id, index) => {
            request.input(`attempt_id_${index}`, sql.Int, id);
            return `@attempt_id_${index}`;
        }).join(', ');

        const result = await request.query(`
            UPDATE exam_attempts
            SET submit_time = NOW(),
                score = COALESCE(score, 0),
                forced_submit = TRUE
            WHERE id IN (${placeholders})
              AND submit_time IS NULL
        `);

        const violationRequest = new sql.Request();
        attemptIds.forEach((id, index) => {
            violationRequest.input(`violation_attempt_id_${index}`, sql.Int, id);
        });
        const violationPlaceholders = attemptIds.map((_, index) => `@violation_attempt_id_${index}`).join(', ');

        await violationRequest.query(`
            INSERT INTO proctoring_violations (attempt_id, violation_type, count, reason)
            SELECT ea.id, 'admin_force_submit', 1, 'Attempt was force-submitted by admin'
            FROM exam_attempts ea
            WHERE ea.id IN (${violationPlaceholders})
              AND NOT EXISTS (
                  SELECT 1
                  FROM proctoring_violations pv
                  WHERE pv.attempt_id = ea.id
                    AND pv.violation_type = 'admin_force_submit'
              )
        `);

        await writeAuditLog(
            req.user.id,
            'bulk_force_submit_attempts',
            'attempt',
            null,
            JSON.stringify({ attemptIds, affected: result.rowCount || 0 })
        );

        res.status(200).json({
            success: true,
            message: 'Attempts force-submitted successfully',
            affected: result.rowCount || 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getViolations = async (_req, res) => {
    try {
        const result = await sql.query(`
            SELECT pv.id, pv.attempt_id, pv.violation_type, pv.count, pv.reason, pv.created_at,
                   ea.exam_id, e.title AS exam_title, e.exam_code,
                   student.name AS student_name, student.email AS student_email
            FROM proctoring_violations pv
            JOIN exam_attempts ea ON pv.attempt_id = ea.id
            JOIN exams e ON ea.exam_id = e.id
            JOIN users student ON ea.student_id = student.id
            WHERE ${VALID_ATTEMPT_TIME_FILTER}
            ORDER BY pv.created_at DESC, pv.id DESC
        `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAuditLogs = async (_req, res) => {
    try {
        if (!(await hasTable('admin_audit_logs'))) {
            return res.status(200).json({ success: true, data: [] });
        }

        const result = await sql.query`
            SELECT l.id, l.action_type, l.target_type, l.target_id, l.details, l.created_at,
                   admin_user.name AS admin_name, admin_user.email AS admin_email
            FROM admin_audit_logs l
            JOIN users admin_user ON l.admin_id = admin_user.id
            ORDER BY l.created_at DESC, l.id DESC
        `;

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStatistics = async (_req, res) => {
    try {
        const hasDemoExamColumn = await hasColumn('exams', 'is_demo_exam');
        const demoExamWhere = hasDemoExamColumn ? 'WHERE COALESCE(is_demo_exam, FALSE) = FALSE' : '';
        const demoExamAnd = hasDemoExamColumn ? 'AND COALESCE(e.is_demo_exam, FALSE) = FALSE' : '';
        const [users, exams, universities, attempts, teachers, students, activeAttempts, forcedSubmits, violations] = await Promise.all([
            sql.query`SELECT COUNT(*) AS total FROM users`,
            sql.query(`
                SELECT COUNT(*) AS total
                FROM exams
                ${demoExamWhere}
            `),
            sql.query`SELECT COUNT(*) AS total FROM universities`,
            sql.query(`
                SELECT COUNT(*) AS total
                FROM exam_attempts ea
                JOIN exams e ON ea.exam_id = e.id
                WHERE ${VALID_ATTEMPT_TIME_FILTER}
                  ${demoExamAnd}
            `),
            sql.query`SELECT COUNT(*) AS total FROM users WHERE role = 'teacher'`,
            sql.query`SELECT COUNT(*) AS total FROM users WHERE role = 'student'`,
            sql.query(`
                SELECT COUNT(*) AS total
                FROM exam_attempts ea
                JOIN exams e ON ea.exam_id = e.id
                WHERE ea.submit_time IS NULL
                  AND ${VALID_ATTEMPT_TIME_FILTER}
                  ${demoExamAnd}
            `),
            sql.query(`
                SELECT COUNT(*) AS total
                FROM exam_attempts ea
                JOIN exams e ON ea.exam_id = e.id
                WHERE ea.forced_submit = TRUE
                  AND ${VALID_ATTEMPT_TIME_FILTER}
                  ${demoExamAnd}
            `),
            sql.query(`
                SELECT COUNT(*) AS total
                FROM proctoring_violations pv
                JOIN exam_attempts ea ON pv.attempt_id = ea.id
                JOIN exams e ON ea.exam_id = e.id
                WHERE ${VALID_ATTEMPT_TIME_FILTER}
                  ${demoExamAnd}
            `)
        ]);

        res.status(200).json({
            success: true,
            data: {
                total_users: users.recordset[0].total,
                total_exams: exams.recordset[0].total,
                total_universities: universities.recordset[0].total,
                total_attempts: attempts.recordset[0].total,
                total_teachers: teachers.recordset[0].total,
                total_students: students.recordset[0].total,
                active_attempts: activeAttempts.recordset[0].total,
                forced_submits: forcedSubmits.recordset[0].total,
                total_violations: violations.recordset[0].total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getUniversities,
    addUniversity,
    deleteUniversity,
    getBranches,
    addBranch,
    deleteBranch,
    getFaculties,
    addFaculty,
    deleteFaculty,
    getDepartments,
    addDepartment,
    deleteDepartment,
    getCourses,
    addCourse,
    deleteCourse,
    getUsers,
    addUser,
    backfillDemoExamsForUsers,
    updateUser,
    resetUserPassword,
    deleteUser,
    setUserAcademicVerification,
    setUserStatus,
    setUsersBulkStatus,
    setUsersBulkAcademicVerification,
    getExams,
    updateExam,
    deleteExamAdmin,
    getAttempts,
    forceSubmitAttempt,
    forceSubmitAttemptsBulk,
    getViolations,
    getAuditLogs,
    getStatistics
};



// Examor Platform
// Developed by Kareem Basem (KeMoO)
// Started: 10-03-2026
// Unauthorized use is prohibited
