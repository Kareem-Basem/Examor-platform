const { sql } = require('../config/db');
const normalizeAccessMode = (value) => (value === 'link' ? 'link' : 'department');
const normalizeQuestionType = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeVisibilityMode = (value) => (value === 'archive' ? 'archive' : 'hide');

const hasFacultyHierarchy = async () => {
    const facultyExists = await sql.query`
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'departments'
          AND COLUMN_NAME = 'faculty_id'
    `;

    return Number(facultyExists.recordset[0]?.total || 0) > 0;
};

const hasQuestionOrderColumn = async () => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'questions'
          AND COLUMN_NAME = 'question_order'
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const hasExamRandomizationColumns = async () => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'exams'
          AND COLUMN_NAME IN ('randomize_questions', 'randomize_options')
    `;

    return Number(result.recordset[0]?.total || 0) === 2;
};

const normalizeBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return ['true', '1', 'yes', 'on'].includes(normalized);
    }

    return false;
};

const hasUserColumn = async (columnName) => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'users'
          AND COLUMN_NAME = ${columnName}
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const ensureDepartmentExamAllowedForDoctor = async (doctorId) => {
    const [hasProfileModeColumn, hasAcademicVerifiedColumn] = await Promise.all([
        hasUserColumn('profile_mode'),
        hasUserColumn('academic_verified')
    ]);

    if (!hasProfileModeColumn && !hasAcademicVerifiedColumn) {
        return { ok: true };
    }

    const doctorResult = await sql.query(`
        SELECT TOP 1
            id,
            role,
            ${hasProfileModeColumn ? 'profile_mode' : 'CAST(NULL AS NVARCHAR(50)) AS profile_mode'},
            ${hasAcademicVerifiedColumn ? 'academic_verified' : 'CAST(1 AS bit) AS academic_verified'}
        FROM users
        WHERE id = ${doctorId}
    `);

    const doctor = doctorResult.recordset[0];
    if (!doctor) {
        return { ok: false, status: 404, message: 'User not found' };
    }

    const normalizedRole = String(doctor.role || '').toLowerCase();
    if (!['doctor', 'teacher'].includes(normalizedRole)) {
        return { ok: false, status: 403, message: 'Only teachers can create department exams' };
    }

    if (hasProfileModeColumn) {
        const profileMode = String(doctor.profile_mode || '').toLowerCase();
        if (profileMode !== 'academic') {
            return {
                ok: false,
                status: 403,
                message: 'Department exams are only available for academic doctor accounts'
            };
        }
    }

    if (hasAcademicVerifiedColumn && !doctor.academic_verified) {
        return {
            ok: false,
            status: 403,
            message: 'Your academic profile is pending verification by admin'
        };
    }

    return { ok: true };
};

const normalizeAttemptsLimit = (value) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) return 1;
    return Math.min(parsed, 20);
};

const randomExamCode = () => `EX-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

const generateUniqueExamCode = async () => {
    let attempts = 0;
    while (attempts < 10) {
        const generated = randomExamCode();
        const existing = await sql.query`
            SELECT TOP 1 id
            FROM exams
            WHERE exam_code = ${generated}
        `;
        if (existing.recordset.length === 0) return generated;
        attempts += 1;
    }

    return `EX-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
};

const validateQuestionPayload = ({ question_text, question_type, marks, correct_answer, options }) => {
    const normalizedType = normalizeQuestionType(question_type);

    if (!question_text || !normalizedType || !marks) {
        return { ok: false, status: 400, message: 'Please provide all required fields' };
    }

    if (normalizedType === 'MCQ') {
        const validOptions = Array.isArray(options)
            ? options.filter((option) => String(option?.option_text || '').trim() !== '')
            : [];
        const correctOptions = validOptions.filter((option) => Boolean(option?.is_correct));

        if (validOptions.length < 2 || correctOptions.length !== 1) {
            return {
                ok: false,
                status: 400,
                message: 'MCQ questions must have at least two options and exactly one correct answer'
            };
        }
    }

    if (normalizedType === 'TrueFalse') {
        const normalizedAnswer = String(correct_answer || '').trim().toLowerCase();
        if (!['true', 'false'].includes(normalizedAnswer)) {
            return {
                ok: false,
                status: 400,
                message: 'True/False questions must use "true" or "false" as the correct answer'
            };
        }
    }

    return { ok: true, normalizedType };
};

const getExamState = async (examId, doctorId) => {
    const result = await sql.query`
        SELECT
            e.id,
            e.start_date,
            e.end_date,
            CAST(CASE WHEN e.start_date IS NOT NULL AND e.start_date <= GETDATE() THEN 1 ELSE 0 END AS bit) AS has_started,
            ISNULL(question_stats.questions_count, 0) AS questions_count,
            ISNULL(attempts.total_attempts, 0) AS total_attempts,
            ISNULL(attempts.open_attempts, 0) AS open_attempts
        FROM exams e
        OUTER APPLY (
            SELECT COUNT(*) AS questions_count
            FROM questions q
            WHERE q.exam_id = e.id
        ) question_stats
        OUTER APPLY (
            SELECT
                COUNT(*) AS total_attempts,
                SUM(CASE WHEN ea.submit_time IS NULL THEN 1 ELSE 0 END) AS open_attempts
            FROM exam_attempts ea
            WHERE ea.exam_id = e.id
              AND ISNULL(e.is_demo_exam, 0) = 0
              AND ea.start_time <= GETDATE()
              AND (ea.submit_time IS NULL OR ea.submit_time <= GETDATE())
              AND (e.start_date IS NULL OR ea.submit_time IS NULL OR ea.submit_time >= e.start_date)
        ) attempts
        WHERE e.id = ${examId}
          AND e.created_by = ${doctorId}
    `;

    return result.recordset[0] || null;
};

const ensureExamEditable = async (examId, doctorId) => {
    const examState = await getExamState(examId, doctorId);

    if (!examState) {
        return { ok: false, status: 404, message: 'Exam not found' };
    }

    if ((examState.has_started || Number(examState.total_attempts) > 0) && Number(examState.questions_count || 0) > 0) {
        return {
            ok: false,
            status: 409,
            message: 'This exam can no longer be modified because it has already started or has student attempts'
        };
    }

    return { ok: true, examState };
};

// ================================
// Get Doctor Courses
// ================================
const getCourses = async (req, res) => {
    try {
        const hasFaculties = await hasFacultyHierarchy();
        const result = await sql.query(`
            SELECT c.*, d.name AS department_name, b.name AS branch_name, u.name AS university_name,
                   ${hasFaculties ? 'f.name AS faculty_name' : 'CAST(NULL AS NVARCHAR(255)) AS faculty_name'}
            FROM courses c
            JOIN departments d ON c.department_id = d.id
            JOIN branches b ON d.branch_id = b.id
            JOIN universities u ON b.university_id = u.id
            JOIN users doctor_user ON doctor_user.department_id = d.id
            ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
            WHERE doctor_user.id = ${req.user.id}
            ORDER BY u.name, b.name, ${hasFaculties ? 'f.name,' : ''} d.name, c.level, c.name
        `);
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Create Exam
// ================================
const createExam = async (req, res) => {
    try {
        const {
            title, course_id, duration,
            total_marks, exam_code,
            start_date, end_date,
            access_mode,
            randomize_questions,
            randomize_options,
            exam_code_mode,
            proctoring_enabled,
            post_end_visibility_mode,
            post_end_grace_minutes,
            max_attempts_per_student,
            screen_capture_protection,
            is_demo_exam
        } = req.body;
        const accessMode = normalizeAccessMode(access_mode);
        const codeMode = String(exam_code_mode || '').toLowerCase() === 'auto' ? 'auto' : 'manual';
        const randomizationEnabled = await hasExamRandomizationColumns();
        const randomizeQuestions = normalizeBoolean(randomize_questions);
        const randomizeOptions = normalizeBoolean(randomize_options);
        const proctoringEnabled = normalizeBoolean(proctoring_enabled ?? true);
        const visibilityMode = normalizeVisibilityMode(post_end_visibility_mode);
        const graceMinutes = Math.max(0, Number(post_end_grace_minutes) || 0);
        const maxAttempts = normalizeAttemptsLimit(max_attempts_per_student);
        const screenProtection = normalizeBoolean(screen_capture_protection);
        const demoExam = normalizeBoolean(is_demo_exam);
        let examCode = typeof exam_code === 'string' ? exam_code.trim() : '';

        if (!title || !duration || !total_marks) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (codeMode === 'auto') {
            examCode = await generateUniqueExamCode();
        }

        if (!examCode) {
            return res.status(400).json({
                success: false,
                message: 'Exam code is required'
            });
        }

        if (accessMode === 'department' && !course_id) {
            return res.status(400).json({
                success: false,
                message: 'Department exams must be linked to a course'
            });
        }

        if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        if (!Number.isFinite(graceMinutes) || graceMinutes < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post-end grace period'
            });
        }

        if (accessMode === 'department') {
            const eligibility = await ensureDepartmentExamAllowedForDoctor(req.user.id);
            if (!eligibility.ok) {
                return res.status(eligibility.status).json({
                    success: false,
                    message: eligibility.message
                });
            }

            const course = await sql.query`
                SELECT c.id
                FROM courses c
                JOIN users u ON u.id = ${req.user.id}
                WHERE c.id = ${course_id}
                  AND u.department_id IS NOT NULL
                  AND c.department_id = u.department_id
            `;

            if (course.recordset.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only create department exams for your own department courses'
                });
            }
        }

        const duplicateCode = await sql.query`
            SELECT id
            FROM exams
            WHERE exam_code = ${examCode}
        `;

        if (duplicateCode.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Exam code already exists'
            });
        }

        const insertResult = randomizationEnabled
            ? await sql.query`
                INSERT INTO exams 
                (title, course_id, created_by, duration, total_marks, exam_code, start_date, end_date, access_mode, randomize_questions, randomize_options, proctoring_enabled, post_end_visibility_mode, post_end_grace_minutes, max_attempts_per_student, allow_custom_exam_code, screen_capture_protection, is_demo_exam)
                VALUES (
                    ${title}, ${accessMode === 'department' ? course_id : null}, ${req.user.id},
                    ${duration}, ${total_marks}, ${examCode},
                    ${start_date}, ${end_date}, ${accessMode}, ${randomizeQuestions}, ${randomizeOptions},
                    ${proctoringEnabled}, ${visibilityMode}, ${graceMinutes}, ${maxAttempts}, ${codeMode === 'manual' ? 1 : 0}, ${screenProtection}, ${demoExam}
                )
                SELECT SCOPE_IDENTITY() AS id
            `
            : await sql.query`
                INSERT INTO exams 
                (title, course_id, created_by, duration, total_marks, exam_code, start_date, end_date, access_mode, proctoring_enabled, post_end_visibility_mode, post_end_grace_minutes, max_attempts_per_student, allow_custom_exam_code, screen_capture_protection, is_demo_exam)
                VALUES (
                    ${title}, ${accessMode === 'department' ? course_id : null}, ${req.user.id},
                    ${duration}, ${total_marks}, ${examCode},
                    ${start_date}, ${end_date}, ${accessMode},
                    ${proctoringEnabled}, ${visibilityMode}, ${graceMinutes}, ${maxAttempts}, ${codeMode === 'manual' ? 1 : 0}, ${screenProtection}, ${demoExam}
                )
                SELECT SCOPE_IDENTITY() AS id
            `;

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            data: {
                id: Number(insertResult.recordset[0]?.id),
                exam_code: examCode
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Get Exam by ID
// ================================
const getExam = async (req, res) => {
    try {
        const examId = Number(req.params.id);
        const hasFaculties = await hasFacultyHierarchy();
        const hasQuestionOrder = await hasQuestionOrderColumn();

        if (!Number.isInteger(examId) || examId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid exam id' });
        }

        const exam = await sql.query(`
            SELECT e.*, c.name AS course_name,
                   ${hasFaculties ? 'f.name AS faculty_name, b.name AS branch_name, u.name AS university_name,' : 'CAST(NULL AS NVARCHAR(255)) AS faculty_name, CAST(NULL AS NVARCHAR(255)) AS branch_name, CAST(NULL AS NVARCHAR(255)) AS university_name,'}
                   CAST(CASE WHEN e.start_date IS NOT NULL AND e.start_date <= GETDATE() THEN 1 ELSE 0 END AS bit) AS has_started,
                   ISNULL(attempts.total_attempts, 0) AS total_attempts,
                   ISNULL(attempts.open_attempts, 0) AS open_attempts
            FROM exams e
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN branches b ON d.branch_id = b.id
            LEFT JOIN universities u ON b.university_id = u.id
            ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
            OUTER APPLY (
                SELECT
                    COUNT(*) AS total_attempts,
                    SUM(CASE WHEN ea.submit_time IS NULL THEN 1 ELSE 0 END) AS open_attempts
                FROM exam_attempts ea
                WHERE ea.exam_id = e.id
                  AND ISNULL(e.is_demo_exam, 0) = 0
                  AND ea.start_time <= GETDATE()
                  AND (ea.submit_time IS NULL OR ea.submit_time <= GETDATE())
                  AND (e.start_date IS NULL OR ea.submit_time IS NULL OR ea.submit_time >= e.start_date)
            ) attempts
            WHERE e.id = ${examId} AND e.created_by = ${req.user.id}
        `);

        if (exam.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        const questions = await sql.query(`
            SELECT q.*,
            (SELECT * FROM options o
             WHERE o.question_id = q.id
             FOR JSON PATH) AS options
            FROM questions q
            WHERE q.exam_id = ${examId}
            ORDER BY ${hasQuestionOrder ? 'ISNULL(q.question_order, q.id), q.id' : 'q.id'}
        `);

        res.status(200).json({
            success: true,
            data: {
                ...exam.recordset[0],
                questions: questions.recordset
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Get All Doctor Exams
// ================================
const getExams = async (req, res) => {
    try {
        const hasFaculties = await hasFacultyHierarchy();
        const result = await sql.query(`
            SELECT 
                e.*, 
                c.name AS course_name, c.level,
                d.name AS department_name,
                ${hasFaculties ? 'f.name AS faculty_name, b.name AS branch_name, u.name AS university_name,' : 'CAST(NULL AS NVARCHAR(255)) AS faculty_name, CAST(NULL AS NVARCHAR(255)) AS branch_name, CAST(NULL AS NVARCHAR(255)) AS university_name,'}
                (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS questions_count,
                CAST(CASE WHEN e.start_date IS NOT NULL AND e.start_date <= GETDATE() THEN 1 ELSE 0 END AS bit) AS has_started,
                ISNULL(attempts.total_attempts, 0) AS total_attempts,
                ISNULL(attempts.open_attempts, 0) AS open_attempts
            FROM exams e
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN branches b ON d.branch_id = b.id
            LEFT JOIN universities u ON b.university_id = u.id
            ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
            OUTER APPLY (
                SELECT
                    COUNT(*) AS total_attempts,
                    SUM(CASE WHEN ea.submit_time IS NULL THEN 1 ELSE 0 END) AS open_attempts
                FROM exam_attempts ea
                WHERE ea.exam_id = e.id
                  AND ea.start_time <= GETDATE()
                  AND (ea.submit_time IS NULL OR ea.submit_time <= GETDATE())
                  AND (e.start_date IS NULL OR ea.submit_time IS NULL OR ea.submit_time >= e.start_date)
            ) attempts
            WHERE e.created_by = ${req.user.id}
        `);
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Add Question
// ================================
const addQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question_text, question_type, marks, correct_answer, options } = req.body;
        const validation = validateQuestionPayload({ question_text, question_type, marks, correct_answer, options });
        const hasQuestionOrder = await hasQuestionOrderColumn();

        if (!validation.ok) {
            return res.status(validation.status).json({
                success: false,
                message: validation.message
            });
        }
        const normalizedType = validation.normalizedType;

        // أضف السؤال
        const mutability = await ensureExamEditable(Number(id), req.user.id);
        if (!mutability.ok) {
            return res.status(mutability.status).json({
                success: false,
                message: mutability.message
            });
        }

        const result = hasQuestionOrder
            ? await sql.query`
                INSERT INTO questions (exam_id, question_text, question_type, marks, correct_answer, question_order)
                OUTPUT INSERTED.id
                VALUES (
                    ${id},
                    ${question_text},
                    ${normalizedType},
                    ${marks},
                    ${correct_answer || null},
                    (
                        SELECT ISNULL(MAX(question_order), 0) + 1
                        FROM questions
                        WHERE exam_id = ${id}
                    )
                )
            `
            : await sql.query`
                INSERT INTO questions (exam_id, question_text, question_type, marks, correct_answer)
                OUTPUT INSERTED.id
                VALUES (${id}, ${question_text}, ${normalizedType}, ${marks}, ${correct_answer || null})
            `;

        const questionId = result.recordset[0].id;

        // لو MCQ أضف الخيارات
        if (normalizedType === 'MCQ' && options && options.length > 0) {
            for (const option of options) {
                await sql.query`
                    INSERT INTO options (question_id, option_text, is_correct)
                    VALUES (${questionId}, ${option.option_text}, ${option.is_correct})
                `;
            }
        }

        res.status(201).json({
            success: true,
            message: 'Question added successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Update Exam
// ================================
const updateExam = async (req, res) => {
    try {
        const examId = Number(req.params.id);
        const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
        let examCode = typeof req.body.exam_code === 'string' ? req.body.exam_code.trim() : '';
        const duration = Number(req.body.duration);
        const totalMarks = Number(req.body.total_marks);
        const startDate = req.body.start_date || null;
        const endDate = req.body.end_date || null;
        const accessMode = normalizeAccessMode(req.body.access_mode);
        const codeMode = String(req.body.exam_code_mode || '').toLowerCase() === 'auto' ? 'auto' : 'manual';
        const courseId = req.body.course_id ? Number(req.body.course_id) : null;
        const randomizationEnabled = await hasExamRandomizationColumns();
        const randomizeQuestions = normalizeBoolean(req.body.randomize_questions);
        const randomizeOptions = normalizeBoolean(req.body.randomize_options);
        const proctoringEnabled = normalizeBoolean(req.body.proctoring_enabled ?? true);
        const visibilityMode = normalizeVisibilityMode(req.body.post_end_visibility_mode);
        const graceMinutes = Math.max(0, Number(req.body.post_end_grace_minutes) || 0);
        const maxAttempts = normalizeAttemptsLimit(req.body.max_attempts_per_student);
        const screenProtection = normalizeBoolean(req.body.screen_capture_protection);
        const demoExam = normalizeBoolean(req.body.is_demo_exam);

        if (!Number.isInteger(examId) || examId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid exam id' });
        }

        if (!title || !Number.isFinite(duration) || duration <= 0 || !Number.isFinite(totalMarks) || totalMarks <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        if (codeMode === 'auto') {
            examCode = await generateUniqueExamCode();
        }

        if (!examCode) {
            return res.status(400).json({
                success: false,
                message: 'Exam code is required'
            });
        }

        const existing = await sql.query`
            SELECT id, course_id
            FROM exams
            WHERE id = ${examId}
              AND created_by = ${req.user.id}
        `;

        if (existing.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        const mutability = await ensureExamEditable(examId, req.user.id);
        if (!mutability.ok) {
            return res.status(mutability.status).json({
                success: false,
                message: mutability.message
            });
        }

        const duplicateCode = await sql.query`
            SELECT id
            FROM exams
            WHERE exam_code = ${examCode}
              AND id <> ${examId}
        `;

        if (duplicateCode.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Exam code already exists'
            });
        }

        let nextCourseId = null;
        if (accessMode === 'department') {
            const eligibility = await ensureDepartmentExamAllowedForDoctor(req.user.id);
            if (!eligibility.ok) {
                return res.status(eligibility.status).json({
                    success: false,
                    message: eligibility.message
                });
            }

            if (!courseId || !Number.isInteger(courseId) || courseId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Department exams must be linked to a course'
                });
            }

            const course = await sql.query`
                SELECT c.id
                FROM courses c
                JOIN users u ON u.id = ${req.user.id}
                WHERE c.id = ${courseId}
                  AND u.department_id IS NOT NULL
                  AND c.department_id = u.department_id
            `;

            if (course.recordset.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only assign department exams to your own department courses'
                });
            }

            nextCourseId = courseId;
        }

        if (randomizationEnabled) {
            await sql.query`
                UPDATE exams
                SET
                    title = ${title},
                    exam_code = ${examCode},
                    duration = ${duration},
                    total_marks = ${totalMarks},
                    start_date = ${startDate},
                    end_date = ${endDate},
                    access_mode = ${accessMode},
                    course_id = ${accessMode === 'department' ? nextCourseId : null},
                    randomize_questions = ${randomizeQuestions},
                    randomize_options = ${randomizeOptions},
                    proctoring_enabled = ${proctoringEnabled},
                    post_end_visibility_mode = ${visibilityMode},
                    post_end_grace_minutes = ${graceMinutes},
                    max_attempts_per_student = ${maxAttempts},
                    allow_custom_exam_code = ${codeMode === 'manual' ? 1 : 0},
                    screen_capture_protection = ${screenProtection},
                    is_demo_exam = ${demoExam}
                WHERE id = ${examId}
                  AND created_by = ${req.user.id}
            `;
        } else {
            await sql.query`
                UPDATE exams
                SET
                    title = ${title},
                    exam_code = ${examCode},
                    duration = ${duration},
                    total_marks = ${totalMarks},
                    start_date = ${startDate},
                    end_date = ${endDate},
                    access_mode = ${accessMode},
                    course_id = ${accessMode === 'department' ? nextCourseId : null},
                    proctoring_enabled = ${proctoringEnabled},
                    post_end_visibility_mode = ${visibilityMode},
                    post_end_grace_minutes = ${graceMinutes},
                    max_attempts_per_student = ${maxAttempts},
                    allow_custom_exam_code = ${codeMode === 'manual' ? 1 : 0},
                    screen_capture_protection = ${screenProtection},
                    is_demo_exam = ${demoExam}
                WHERE id = ${examId}
                  AND created_by = ${req.user.id}
            `;
        }

        res.status(200).json({
            success: true,
            message: 'Exam updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Delete Exam
// ================================
const deleteExam = async (req, res) => {
    let transaction;

    try {
        const examId = Number(req.params.id);
        const forceDelete = String(req.query.force || '').toLowerCase() === 'true';
        if (!Number.isInteger(examId) || examId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid exam id' });
        }

        const examState = await getExamState(examId, req.user.id);
        if (!examState) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        if (!forceDelete && (Number(examState.total_attempts || 0) > 0 || Number(examState.open_attempts || 0) > 0)) {
            return res.status(409).json({
                success: false,
                message: 'This exam already has student attempts. Confirm deletion again to remove the exam and all related attempts.'
            });
        }

        transaction = new sql.Transaction();
        await transaction.begin();

        await new sql.Request(transaction).query`
            DELETE FROM proctoring_violations
            WHERE attempt_id IN (
                SELECT id
                FROM exam_attempts
                WHERE exam_id = ${examId}
            )
        `;

        await new sql.Request(transaction).query`
            DELETE FROM answers
            WHERE attempt_id IN (
                SELECT id
                FROM exam_attempts
                WHERE exam_id = ${examId}
            )
            OR question_id IN (
                SELECT id
                FROM questions
                WHERE exam_id = ${examId}
            )
        `;

        await new sql.Request(transaction).query`
            DELETE FROM exam_attempts
            WHERE exam_id = ${examId}
        `;

        await new sql.Request(transaction).query`
            DELETE o
            FROM options o
            JOIN questions q ON q.id = o.question_id
            WHERE q.exam_id = ${examId}
        `;

        await new sql.Request(transaction).query`
            DELETE FROM questions
            WHERE exam_id = ${examId}
        `;

        await new sql.Request(transaction).query`
            DELETE FROM exams
            WHERE id = ${examId}
              AND created_by = ${req.user.id}
        `;

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: forceDelete
                ? 'Exam and all related attempts were deleted successfully'
                : 'Exam deleted successfully'
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {}
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Update Question
// ================================
const updateQuestion = async (req, res) => {
    let transaction;

    try {
        const { id, questionId } = req.params;
        const { question_text, question_type, marks, correct_answer, options } = req.body;
        const validation = validateQuestionPayload({ question_text, question_type, marks, correct_answer, options });

        if (!validation.ok) {
            return res.status(validation.status).json({
                success: false,
                message: validation.message
            });
        }

        const mutability = await ensureExamEditable(Number(id), req.user.id);
        if (!mutability.ok) {
            return res.status(mutability.status).json({
                success: false,
                message: mutability.message
            });
        }

        const normalizedType = validation.normalizedType;
        const questionOwnership = await sql.query`
            SELECT q.id
            FROM questions q
            JOIN exams e ON e.id = q.exam_id
            WHERE q.id = ${questionId}
              AND q.exam_id = ${id}
              AND e.created_by = ${req.user.id}
        `;

        if (questionOwnership.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        transaction = new sql.Transaction();
        await transaction.begin();

        await new sql.Request(transaction).query`
            UPDATE questions
            SET
                question_text = ${question_text},
                question_type = ${normalizedType},
                marks = ${marks},
                correct_answer = ${normalizedType === 'MCQ' ? null : (correct_answer || null)}
            WHERE id = ${questionId}
        `;

        await new sql.Request(transaction).query`
            DELETE FROM options
            WHERE question_id = ${questionId}
        `;

        if (normalizedType === 'MCQ') {
            const validOptions = Array.isArray(options)
                ? options.filter((option) => String(option?.option_text || '').trim() !== '')
                : [];

            for (const option of validOptions) {
                await new sql.Request(transaction).query`
                    INSERT INTO options (question_id, option_text, is_correct)
                    VALUES (${questionId}, ${option.option_text}, ${option.is_correct})
                `;
            }
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Question updated successfully'
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {}
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Delete Question
// ================================
const deleteQuestion = async (req, res) => {
    let transaction;

    try {
        const { id, questionId } = req.params;

        const mutability = await ensureExamEditable(Number(id), req.user.id);
        if (!mutability.ok) {
            return res.status(mutability.status).json({
                success: false,
                message: mutability.message
            });
        }

        const questionOwnership = await sql.query`
            SELECT q.id
            FROM questions q
            JOIN exams e ON e.id = q.exam_id
            WHERE q.id = ${questionId}
              AND q.exam_id = ${id}
              AND e.created_by = ${req.user.id}
        `;

        if (questionOwnership.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        transaction = new sql.Transaction();
        await transaction.begin();

        await new sql.Request(transaction).query`
            DELETE FROM answers
            WHERE question_id = ${questionId}
        `;

        await new sql.Request(transaction).query`
            DELETE FROM options
            WHERE question_id = ${questionId}
        `;

        await new sql.Request(transaction).query`
            DELETE FROM questions
            WHERE id = ${questionId}
        `;

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {}
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Question Bank
// ================================
const getQuestionBank = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT
                qb.*,
                (
                    SELECT option_text, is_correct
                    FROM question_bank_options qbo
                    WHERE qbo.bank_question_id = qb.id
                    ORDER BY qbo.id
                    FOR JSON PATH
                ) AS options
            FROM question_bank qb
            WHERE qb.doctor_id = ${req.user.id}
            ORDER BY qb.created_at DESC, qb.id DESC
        `;

        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const saveQuestionToBank = async (req, res) => {
    let transaction;

    try {
        const examId = Number(req.params.id);
        const questionId = Number(req.params.questionId);

        const sourceQuestion = await sql.query`
            SELECT q.*
            FROM questions q
            JOIN exams e ON e.id = q.exam_id
            WHERE q.id = ${questionId}
              AND q.exam_id = ${examId}
              AND e.created_by = ${req.user.id}
        `;

        if (sourceQuestion.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const sourceOptions = await sql.query`
            SELECT option_text, is_correct
            FROM options
            WHERE question_id = ${questionId}
            ORDER BY id
        `;

        transaction = new sql.Transaction();
        await transaction.begin();

        const inserted = await new sql.Request(transaction).query`
            INSERT INTO question_bank (doctor_id, question_text, question_type, marks, correct_answer)
            OUTPUT INSERTED.id
            VALUES (
                ${req.user.id},
                ${sourceQuestion.recordset[0].question_text},
                ${sourceQuestion.recordset[0].question_type},
                ${sourceQuestion.recordset[0].marks},
                ${sourceQuestion.recordset[0].correct_answer}
            )
        `;

        const bankQuestionId = inserted.recordset[0].id;

        for (const option of sourceOptions.recordset) {
            await new sql.Request(transaction).query`
                INSERT INTO question_bank_options (bank_question_id, option_text, is_correct)
                VALUES (${bankQuestionId}, ${option.option_text}, ${option.is_correct})
            `;
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Question saved to bank successfully'
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {}
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const insertQuestionFromBank = async (req, res) => {
    let transaction;

    try {
        const examId = Number(req.params.id);
        const bankQuestionId = Number(req.params.bankQuestionId);
        const hasQuestionOrder = await hasQuestionOrderColumn();

        const mutability = await ensureExamEditable(examId, req.user.id);
        if (!mutability.ok) {
            return res.status(mutability.status).json({
                success: false,
                message: mutability.message
            });
        }

        const bankQuestion = await sql.query`
            SELECT *
            FROM question_bank
            WHERE id = ${bankQuestionId}
              AND doctor_id = ${req.user.id}
        `;

        if (bankQuestion.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Question bank item not found' });
        }

        const bankOptions = await sql.query`
            SELECT option_text, is_correct
            FROM question_bank_options
            WHERE bank_question_id = ${bankQuestionId}
            ORDER BY id
        `;

        transaction = new sql.Transaction();
        await transaction.begin();

        const insertedQuestion = hasQuestionOrder
            ? await new sql.Request(transaction).query`
                INSERT INTO questions (exam_id, question_text, question_type, marks, correct_answer, question_order)
                OUTPUT INSERTED.id
                VALUES (
                    ${examId},
                    ${bankQuestion.recordset[0].question_text},
                    ${bankQuestion.recordset[0].question_type},
                    ${bankQuestion.recordset[0].marks},
                    ${bankQuestion.recordset[0].correct_answer},
                    (
                        SELECT ISNULL(MAX(question_order), 0) + 1
                        FROM questions
                        WHERE exam_id = ${examId}
                    )
                )
            `
            : await new sql.Request(transaction).query`
                INSERT INTO questions (exam_id, question_text, question_type, marks, correct_answer)
                OUTPUT INSERTED.id
                VALUES (
                    ${examId},
                    ${bankQuestion.recordset[0].question_text},
                    ${bankQuestion.recordset[0].question_type},
                    ${bankQuestion.recordset[0].marks},
                    ${bankQuestion.recordset[0].correct_answer}
                )
            `;

        const newQuestionId = insertedQuestion.recordset[0].id;

        for (const option of bankOptions.recordset) {
            await new sql.Request(transaction).query`
                INSERT INTO options (question_id, option_text, is_correct)
                VALUES (${newQuestionId}, ${option.option_text}, ${option.is_correct})
            `;
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Question added from bank successfully'
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {}
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBankQuestion = async (req, res) => {
    try {
        const bankQuestionId = Number(req.params.bankQuestionId);
        if (!Number.isInteger(bankQuestionId) || bankQuestionId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid question bank id' });
        }

        const result = await sql.query`
            DELETE FROM question_bank
            WHERE id = ${bankQuestionId}
              AND doctor_id = ${req.user.id}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Question bank item not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Question removed from bank successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Duplicate Question
// ================================
const duplicateQuestion = async (req, res) => {
    let transaction;

    try {
        const examId = Number(req.params.id);
        const questionId = Number(req.params.questionId);
        const hasQuestionOrder = await hasQuestionOrderColumn();

        const mutability = await ensureExamEditable(examId, req.user.id);
        if (!mutability.ok) {
            return res.status(mutability.status).json({
                success: false,
                message: mutability.message
            });
        }

        const sourceQuestion = await sql.query`
            SELECT q.*
            FROM questions q
            JOIN exams e ON e.id = q.exam_id
            WHERE q.id = ${questionId}
              AND q.exam_id = ${examId}
              AND e.created_by = ${req.user.id}
        `;

        if (sourceQuestion.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const sourceOptions = await sql.query`
            SELECT option_text, is_correct
            FROM options
            WHERE question_id = ${questionId}
            ORDER BY id
        `;

        transaction = new sql.Transaction();
        await transaction.begin();

        const insertQuestion = hasQuestionOrder
            ? await new sql.Request(transaction).query`
                INSERT INTO questions (exam_id, question_text, question_type, marks, correct_answer, question_order)
                OUTPUT INSERTED.id
                VALUES (
                    ${examId},
                    ${sourceQuestion.recordset[0].question_text},
                    ${sourceQuestion.recordset[0].question_type},
                    ${sourceQuestion.recordset[0].marks},
                    ${sourceQuestion.recordset[0].correct_answer},
                    (
                        SELECT ISNULL(MAX(question_order), 0) + 1
                        FROM questions
                        WHERE exam_id = ${examId}
                    )
                )
            `
            : await new sql.Request(transaction).query`
                INSERT INTO questions (exam_id, question_text, question_type, marks, correct_answer)
                OUTPUT INSERTED.id
                VALUES (
                    ${examId},
                    ${sourceQuestion.recordset[0].question_text},
                    ${sourceQuestion.recordset[0].question_type},
                    ${sourceQuestion.recordset[0].marks},
                    ${sourceQuestion.recordset[0].correct_answer}
                )
            `;

        const duplicatedQuestionId = insertQuestion.recordset[0].id;

        for (const option of sourceOptions.recordset) {
            await new sql.Request(transaction).query`
                INSERT INTO options (question_id, option_text, is_correct)
                VALUES (${duplicatedQuestionId}, ${option.option_text}, ${option.is_correct})
            `;
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Question duplicated successfully'
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {}
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Reorder Question
// ================================
const reorderQuestion = async (req, res) => {
    let transaction;

    try {
        const examId = Number(req.params.id);
        const questionId = Number(req.params.questionId);
        const direction = String(req.body.direction || '').toLowerCase();
        const hasQuestionOrder = await hasQuestionOrderColumn();

        if (!['up', 'down'].includes(direction)) {
            return res.status(400).json({ success: false, message: 'Invalid reorder direction' });
        }

        if (!hasQuestionOrder) {
            return res.status(409).json({
                success: false,
                message: 'Question ordering requires the question_order migration to be applied first'
            });
        }

        const mutability = await ensureExamEditable(examId, req.user.id);
        if (!mutability.ok) {
            return res.status(mutability.status).json({
                success: false,
                message: mutability.message
            });
        }

        const orderedQuestions = await sql.query`
            SELECT q.id, ISNULL(q.question_order, q.id) AS question_order
            FROM questions q
            JOIN exams e ON e.id = q.exam_id
            WHERE q.exam_id = ${examId}
              AND e.created_by = ${req.user.id}
            ORDER BY ISNULL(q.question_order, q.id), q.id
        `;

        const questionIndex = orderedQuestions.recordset.findIndex((question) => Number(question.id) === questionId);
        if (questionIndex === -1) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const swapIndex = direction === 'up' ? questionIndex - 1 : questionIndex + 1;
        if (swapIndex < 0 || swapIndex >= orderedQuestions.recordset.length) {
            return res.status(200).json({ success: true, message: 'Question order unchanged' });
        }

        const currentQuestion = orderedQuestions.recordset[questionIndex];
        const swapQuestion = orderedQuestions.recordset[swapIndex];

        transaction = new sql.Transaction();
        await transaction.begin();

        await new sql.Request(transaction).query`
            UPDATE questions
            SET question_order = -1
            WHERE id = ${currentQuestion.id}
        `;

        await new sql.Request(transaction).query`
            UPDATE questions
            SET question_order = ${currentQuestion.question_order}
            WHERE id = ${swapQuestion.id}
        `;

        await new sql.Request(transaction).query`
            UPDATE questions
            SET question_order = ${swapQuestion.question_order}
            WHERE id = ${currentQuestion.id}
        `;

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Question order updated successfully'
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {}
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Get Exam Results
// ================================
const getExamResults = async (req, res) => {
    try {
        const { id } = req.params;
        const hasFaculties = await hasFacultyHierarchy();

        const result = await sql.query(`
            SELECT 
                u.name AS student_name,
                u.email AS student_email,
                ea.start_time,
                ea.submit_time,
                ea.score,
                e.total_marks,
                e.title AS exam_title,
                c.name AS course_name,
                c.level,
                d.name AS department_name,
                b.name AS branch_name,
                u2.name AS university_name,
                ${hasFaculties ? 'f.name AS faculty_name,' : 'CAST(NULL AS NVARCHAR(255)) AS faculty_name,'}
                CAST(ea.score * 100.0 / e.total_marks AS DECIMAL(5,2)) AS percentage,
                ea.forced_submit,
                ISNULL(v.total_violations, 0) AS violations_count,
                ISNULL(v.violation_summary, '') AS violation_summary,
                CASE
                    WHEN essay_progress.pending_essay_answers > 0 THEN 'Pending Review'
                    WHEN ea.forced_submit = 1 THEN 'Terminated'
                    ELSE 'Completed'
                END AS status
            FROM exam_attempts ea
            JOIN users u ON ea.student_id = u.id
            JOIN exams e ON ea.exam_id = e.id
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN branches b ON d.branch_id = b.id
            LEFT JOIN universities u2 ON b.university_id = u2.id
            ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
            OUTER APPLY (
                SELECT
                    ISNULL(SUM(pv.count), 0) AS total_violations,
                    ISNULL(STRING_AGG(CONCAT(pv.violation_type, ': ', pv.count), ', '), '') AS violation_summary
                FROM proctoring_violations pv
                WHERE pv.attempt_id = ea.id
            ) v
            OUTER APPLY (
                SELECT COUNT(*) AS pending_essay_answers
                FROM answers a
                JOIN questions q ON q.id = a.question_id
                WHERE a.attempt_id = ea.id
                  AND UPPER(LTRIM(RTRIM(ISNULL(q.question_type, '')))) IN ('ESSAY', 'SHORTANSWER', 'WRITTEN')
                  AND a.reviewed_at IS NULL
            ) essay_progress
            WHERE ea.exam_id = ${id}
              AND e.created_by = ${req.user.id}
              AND ISNULL(e.is_demo_exam, 0) = 0
              AND ea.start_time <= GETDATE()
              AND (ea.submit_time IS NULL OR ea.submit_time <= GETDATE())
              AND (e.start_date IS NULL OR ea.submit_time IS NULL OR ea.submit_time >= e.start_date)
            ORDER BY ea.score DESC
        `);

        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAttemptReview = async (req, res) => {
    try {
        const attemptId = Number(req.params.attemptId);
        if (!Number.isInteger(attemptId) || attemptId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid attempt id' });
        }

        const attemptResult = await sql.query`
            SELECT
                ea.id,
                ea.exam_id,
                ea.score,
                ea.forced_submit,
                ea.submit_time,
                e.title AS exam_title,
                e.total_marks,
                u.name AS student_name,
                u.email AS student_email
            FROM exam_attempts ea
            JOIN exams e ON e.id = ea.exam_id
            JOIN users u ON u.id = ea.student_id
            WHERE ea.id = ${attemptId}
              AND e.created_by = ${req.user.id}
              AND ISNULL(e.is_demo_exam, 0) = 0
        `;

        const attempt = attemptResult.recordset[0];
        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        const answersResult = await sql.query`
            SELECT
                a.id AS answer_id,
                a.question_id,
                a.selected_option_id,
                a.text_answer,
                a.awarded_marks,
                a.review_feedback,
                a.reviewed_at,
                reviewer.name AS reviewer_name,
                q.question_text,
                q.question_type,
                q.marks,
                q.correct_answer
            FROM answers a
            JOIN questions q ON q.id = a.question_id
            LEFT JOIN users reviewer ON reviewer.id = a.reviewed_by
            WHERE a.attempt_id = ${attemptId}
            ORDER BY q.id
        `;

        res.status(200).json({
            success: true,
            data: {
                ...attempt,
                answers: answersResult.recordset
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const submitAttemptReview = async (req, res) => {
    let transaction;

    try {
        const attemptId = Number(req.params.attemptId);
        const reviews = Array.isArray(req.body.reviews) ? req.body.reviews : [];

        if (!Number.isInteger(attemptId) || attemptId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid attempt id' });
        }

        const attemptResult = await sql.query`
            SELECT
                ea.id,
                ea.exam_id
            FROM exam_attempts ea
            JOIN exams e ON e.id = ea.exam_id
            WHERE ea.id = ${attemptId}
              AND e.created_by = ${req.user.id}
              AND ISNULL(e.is_demo_exam, 0) = 0
              AND ea.submit_time IS NOT NULL
              AND ea.start_time <= GETDATE()
              AND ea.submit_time <= GETDATE()
              AND (e.start_date IS NULL OR ea.submit_time >= e.start_date)
        `;

        const attempt = attemptResult.recordset[0];
        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        transaction = new sql.Transaction();
        await transaction.begin();

        for (const review of reviews) {
            const answerId = Number(review?.answer_id);
            const awardedMarks = Number(review?.awarded_marks);
            const reviewFeedback = typeof review?.review_feedback === 'string' ? review.review_feedback.trim() : null;

            if (!Number.isInteger(answerId) || answerId <= 0 || !Number.isFinite(awardedMarks) || awardedMarks < 0) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Invalid review payload' });
            }

            const ownershipCheck = await new sql.Request(transaction).query`
                SELECT q.marks
                FROM answers a
                JOIN questions q ON q.id = a.question_id
                WHERE a.id = ${answerId}
                  AND a.attempt_id = ${attemptId}
                  AND UPPER(LTRIM(RTRIM(ISNULL(q.question_type, '')))) IN ('ESSAY', 'SHORTANSWER', 'WRITTEN')
            `;

            const ownedAnswer = ownershipCheck.recordset[0];
            if (!ownedAnswer) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Invalid answer review target' });
            }

            const maxMarks = Number(ownedAnswer.marks) || 0;
            if (awardedMarks > maxMarks) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Awarded marks cannot exceed question marks' });
            }

            await new sql.Request(transaction).query`
                UPDATE answers
                SET
                    awarded_marks = ${awardedMarks},
                    review_feedback = ${reviewFeedback},
                    reviewed_by = ${req.user.id},
                    reviewed_at = GETDATE()
                WHERE id = ${answerId}
                  AND attempt_id = ${attemptId}
            `;
        }

        const totalScoreResult = await new sql.Request(transaction).query`
            SELECT ISNULL(SUM(
                CASE
                    WHEN UPPER(LTRIM(RTRIM(ISNULL(q.question_type, '')))) IN ('ESSAY', 'SHORTANSWER', 'WRITTEN')
                        THEN ISNULL(a.awarded_marks, 0)
                    WHEN UPPER(LTRIM(RTRIM(ISNULL(q.question_type, '')))) = 'MCQ' AND o.is_correct = 1
                        THEN q.marks
                    WHEN UPPER(LTRIM(RTRIM(ISNULL(q.question_type, '')))) IN ('TRUEFALSE', 'TRUE_FALSE', 'TRUE-FALSE')
                        AND LOWER(LTRIM(RTRIM(ISNULL(a.text_answer, '')))) = LOWER(LTRIM(RTRIM(ISNULL(q.correct_answer, ''))))
                        THEN q.marks
                    ELSE 0
                END
            ), 0) AS total_score
            FROM questions q
            LEFT JOIN answers a
                ON a.question_id = q.id
               AND a.attempt_id = ${attemptId}
            LEFT JOIN options o
                ON o.id = a.selected_option_id
            WHERE q.exam_id = ${attempt.exam_id}
        `;

        await new sql.Request(transaction).query`
            UPDATE exam_attempts
            SET score = ${totalScoreResult.recordset[0]?.total_score || 0}
            WHERE id = ${attemptId}
        `;

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Attempt review saved successfully'
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {}
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Live Monitor
// ================================
const getLiveMonitor = async (req, res) => {
    try {
        const hasFaculties = await hasFacultyHierarchy();
        const result = await sql.query`
            SELECT
                ea.id AS attempt_id,
                e.id AS exam_id,
                e.title AS exam_title,
                e.exam_code,
                c.name AS course_name,
                c.level,
                d.name AS department_name,
                b.name AS branch_name,
                u2.name AS university_name,
                ${hasFaculties ? 'f.name AS faculty_name,' : 'CAST(NULL AS NVARCHAR(255)) AS faculty_name,'}
                u.name AS student_name,
                u.email AS student_email,
                ea.start_time,
                ea.session_last_seen,
                DATEDIFF(SECOND, ea.session_last_seen, GETDATE()) AS last_seen_seconds,
                ISNULL(v.total_violations, 0) AS violations_count,
                ISNULL(v.violation_summary, '') AS violation_summary
            FROM exam_attempts ea
            JOIN exams e ON e.id = ea.exam_id
            JOIN users u ON u.id = ea.student_id
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN branches b ON d.branch_id = b.id
            LEFT JOIN universities u2 ON b.university_id = u2.id
            ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
            OUTER APPLY (
                SELECT
                    ISNULL(SUM(pv.count), 0) AS total_violations,
                    ISNULL(STRING_AGG(CONCAT(pv.violation_type, ': ', pv.count), ', '), '') AS violation_summary
                FROM proctoring_violations pv
                WHERE pv.attempt_id = ea.id
            ) v
            WHERE e.created_by = ${req.user.id}
              AND ISNULL(e.is_demo_exam, 0) = 0
              AND ea.submit_time IS NULL
              AND ea.start_time <= GETDATE()
              AND (ea.submit_time IS NULL OR ea.submit_time <= GETDATE())
              AND (e.start_date IS NULL OR ea.submit_time IS NULL OR ea.submit_time >= e.start_date)
            ORDER BY ea.start_time DESC, ea.id DESC
        `;

        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getCourses,
    getQuestionBank,
    saveQuestionToBank,
    insertQuestionFromBank,
    deleteBankQuestion,
    createExam,
    updateExam,
    deleteExam,
    getExam,
    getExams,
    addQuestion,
    updateQuestion,
    duplicateQuestion,
    reorderQuestion,
    deleteQuestion,
    getExamResults,
    getLiveMonitor,
    getAttemptReview,
    submitAttemptReview,
    getQuestionBank,
    saveQuestionToBank,
    insertQuestionFromBank,
    deleteBankQuestion
};
