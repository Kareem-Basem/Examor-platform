const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sql } = require('../config/db');

const looksLikeBcryptHash = (value) =>
    typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
const normalizeProfileMode = (value) =>
    value === 'independent' || value === 'academic' ? value : null;
const ACCOUNT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const hasIsActiveColumn = async () => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'is_active'
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const hasFacultyHierarchy = async () => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_name = 'departments'
          AND column_name = 'faculty_id'
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const hasUserColumn = async (columnName) => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = ${columnName}
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const hasExamColumn = async (columnName) => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_name = 'exams'
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

const hasColumn = async (tableName, columnName) => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_name = ${tableName}
          AND column_name = ${columnName}
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const hasQuestionOrderColumn = async () => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_name = 'questions'
          AND column_name = 'question_order'
    `;

    return Number(result.recordset[0]?.total || 0) > 0;
};

const normalizePhone = (value) => {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized ? normalized.slice(0, 30) : null;
};

const normalizeAcademicYear = (value) => {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized ? normalized.slice(0, 100) : null;
};

const normalizeBio = (value) => {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized ? normalized.slice(0, 2000) : null;
};

const createSessionId = () => crypto.randomBytes(24).toString('hex');

const looksAcademicEmail = (email) => {
    if (typeof email !== 'string') return false;
    const normalized = email.trim().toLowerCase();
    return /@.+(\.edu(\.[a-z]{2,})?|\.(ac)\.[a-z]{2,})$/.test(normalized) || normalized.endsWith('.edu');
};

const getDepartmentHierarchy = async (departmentId) => {
    const result = await sql.query`
        SELECT
            d.id AS department_id,
            d.branch_id,
            b.university_id
        FROM departments d
        JOIN branches b ON d.branch_id = b.id
        WHERE d.id = ${departmentId}
    `;

    return result.recordset[0] || null;
};

const getUserProfileById = async (userId) => {
    const [
        activeColumnExists,
        hasFaculties,
        hasPhoneColumn,
        hasAcademicYearColumn,
        hasBioColumn,
        hasAcademicVerifiedColumn,
        hasAcademicEmailConfirmedColumn
    ] = await Promise.all([
        hasIsActiveColumn(),
        hasFacultyHierarchy(),
        hasUserColumn('phone_number'),
        hasUserColumn('academic_year'),
        hasUserColumn('bio'),
        hasUserColumn('academic_verified'),
        hasUserColumn('academic_email_confirmed')
    ]);

    const profileResult = await sql.query(`
        SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.profile_mode,
            u.university_id,
            u.department_id,
            ${activeColumnExists ? 'u.is_active' : 'CAST(TRUE AS BOOLEAN) AS is_active'},
            ${hasPhoneColumn ? 'u.phone_number' : 'CAST(NULL AS TEXT) AS phone_number'},
            ${hasAcademicYearColumn ? 'u.academic_year' : 'CAST(NULL AS TEXT) AS academic_year'},
            ${hasBioColumn ? 'u.bio' : 'CAST(NULL AS TEXT) AS bio'},
            ${hasAcademicVerifiedColumn ? 'u.academic_verified' : 'CAST(FALSE AS BOOLEAN) AS academic_verified'},
            ${hasAcademicEmailConfirmedColumn ? 'u.academic_email_confirmed' : 'CAST(FALSE AS BOOLEAN) AS academic_email_confirmed'},
            un.name AS university_name,
            b.name AS branch_name,
            d.name AS department_name,
            ${hasFaculties ? 'f.name AS faculty_name' : 'CAST(NULL AS TEXT) AS faculty_name'}
        FROM users u
        LEFT JOIN universities un ON u.university_id = un.id
        LEFT JOIN departments d ON u.department_id = d.id
        ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id LEFT JOIN branches b ON d.branch_id = b.id' : 'LEFT JOIN branches b ON d.branch_id = b.id'}
        WHERE u.id = ${userId}
    `);

    const profile = profileResult.recordset[0];
    if (!profile) return null;

    return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        profile_mode: profile.profile_mode || null,
        university_id: profile.university_id || null,
        department_id: profile.department_id || null,
        university_name: profile.university_name || null,
        branch_name: profile.branch_name || null,
        faculty_name: profile.faculty_name || null,
        department_name: profile.department_name || null,
        phone_number: profile.phone_number || null,
        academic_year: profile.academic_year || null,
        bio: profile.bio || null,
        academic_verified: Boolean(profile.academic_verified),
        academic_email_confirmed: Boolean(profile.academic_email_confirmed),
        is_active: activeColumnExists ? profile.is_active !== false : true
    };
};

const createAuthSessionAndToken = async (user) => {
    const [hasSessionIdColumn, hasSessionLastSeenColumn] = await Promise.all([
        hasUserColumn('active_session_id'),
        hasUserColumn('active_session_last_seen')
    ]);

    let sessionId = null;
    if (hasSessionIdColumn && hasSessionLastSeenColumn) {
        const previousSessionId = typeof user.active_session_id === 'string' ? user.active_session_id : null;
        const previousLastSeen = user.active_session_last_seen ? new Date(user.active_session_last_seen).getTime() : null;
        const sessionFresh = Boolean(previousSessionId) && Boolean(previousLastSeen) && ((Date.now() - previousLastSeen) / 1000) < ACCOUNT_SESSION_TTL_SECONDS;

        if (sessionFresh) {
            return { ok: false, status: 409, message: 'This account is already logged in on another device. Please log out first.' };
        }

        sessionId = createSessionId();
        await sql.query`
            UPDATE users
            SET
                active_session_id = ${sessionId},
                active_session_last_seen = NOW()
            WHERE id = ${user.id}
        `;
    }

    const token = jwt.sign(
        { id: user.id, role: user.role, sid: sessionId || null },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const profile = await getUserProfileById(user.id);
    return { ok: true, token, sessionId, profile };
};

const verifyGoogleCredential = async (credential) => {
    if (typeof credential !== 'string' || !credential.trim()) {
        throw new Error('Missing Google credential');
    }

    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential.trim())}`;
    const response = await fetch(tokenInfoUrl);
    if (!response.ok) {
        throw new Error('Invalid Google credential');
    }

    const tokenData = await response.json();
    const expectedAudience = process.env.GOOGLE_CLIENT_ID ? String(process.env.GOOGLE_CLIENT_ID).trim() : '';
    if (expectedAudience && tokenData.aud !== expectedAudience) {
        throw new Error('Google client mismatch');
    }

    if (!tokenData.email || String(tokenData.email_verified).toLowerCase() !== 'true') {
        throw new Error('Google email is not verified');
    }

    return {
        email: String(tokenData.email).trim().toLowerCase(),
        name: String(tokenData.name || tokenData.given_name || 'Google User').trim(),
    };
};

const getGoogleClientConfig = async (req, res) => {
    try {
        const googleClientId = process.env.GOOGLE_CLIENT_ID
            ? String(process.env.GOOGLE_CLIENT_ID).trim()
            : '';

        res.status(200).json({
            success: true,
            configured: Boolean(googleClientId),
            client_id: googleClientId || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createDemoExamIfMissing = async ({ userId, role, userName }) => {
    try {
        const numericUserId = Number(userId);
        if (!Number.isInteger(numericUserId) || numericUserId <= 0) return;
        const normalizedRole = String(role || '').toLowerCase();
        if (!['student', 'teacher', 'doctor'].includes(normalizedRole)) return;

        const [examColumnsResult, hasQuestionOrder, hasQuestionsTable, hasOptionsTable, hasAnswersTable, hasAttemptsTable] = await Promise.all([
            sql.query`
                SELECT COLUMN_NAME
                FROM information_schema.columns
                WHERE TABLE_NAME = 'exams'
            `,
            hasQuestionOrderColumn(),
            hasTable('questions'),
            hasTable('options'),
            hasTable('answers'),
            hasTable('exam_attempts')
        ]);

        const examColumnSet = new Set(
            (examColumnsResult.recordset || [])
                .map((row) => String(row.COLUMN_NAME || '').toLowerCase())
                .filter(Boolean)
        );
        const hasExamCol = (columnName) => examColumnSet.has(String(columnName).toLowerCase());
        if (!hasExamCol('is_demo_exam')) return;
        if (!hasQuestionsTable) return;

        const isTeacherLike = normalizedRole === 'teacher' || normalizedRole === 'doctor';
        const examPrefix = isTeacherLike ? 'TEACHER' : 'STUDENT';
        const examTitle = isTeacherLike
            ? 'Demo Exam (Teacher Onboarding)'
            : 'Demo Exam (Student Onboarding)';

        const existing = await sql.query`
            SELECT id, duration, total_marks
            FROM exams
            WHERE created_by = ${numericUserId}
              AND COALESCE(is_demo_exam, FALSE) = TRUE
              AND title = ${examTitle}
            ORDER BY id DESC
            LIMIT 1
        `;

        const examCode = `DEMO-${examPrefix}-${numericUserId}-${Date.now().toString(36).slice(-5).toUpperCase()}`;
        const safeName = typeof userName === 'string' && userName.trim() ? userName.trim() : 'User';
        const hasRandomizeQuestions = hasExamCol('randomize_questions');
        const hasRandomizeOptions = hasExamCol('randomize_options');
        const demoDuration = 10;
        const demoTotalMarks = 10;
        const demoMaxAttempts = 3;
        const demoProctoringEnabled = 1;
        const demoScreenProtection = 1;

        let demoExamId = Number(existing.recordset[0]?.id || 0);
        let needsQuestionReset = false;
        if (demoExamId > 0) {
            const currentDuration = Number(existing.recordset[0]?.duration || 0);
            const currentMarks = Number(existing.recordset[0]?.total_marks || 0);
            if (currentDuration !== demoDuration || currentMarks !== demoTotalMarks) {
                needsQuestionReset = true;
            }
            if (hasQuestionsTable) {
                const questionCountResult = await sql.query`
                    SELECT COUNT(*) AS total
                    FROM questions
                    WHERE exam_id = ${demoExamId}
                `;
                const questionCount = Number(questionCountResult.recordset[0]?.total || 0);
                if (questionCount !== 5) needsQuestionReset = true;
            }

            const updateRequest = new sql.Request();
            updateRequest.input('examId', sql.Int, demoExamId);
            updateRequest.input('title', sql.NVarChar(255), examTitle);
            updateRequest.input('duration', sql.Int, demoDuration);
            updateRequest.input('totalMarks', sql.Decimal(10, 2), demoTotalMarks);
            updateRequest.input('createdBy', sql.Int, numericUserId);
            updateRequest.input('accessMode', sql.NVarChar(20), 'link');
            updateRequest.input('postEndVisibilityMode', sql.NVarChar(20), 'archive');
            updateRequest.input('postEndGraceMinutes', sql.Int, 0);
            updateRequest.input('maxAttempts', sql.Int, demoMaxAttempts);

            const updates = [];
            if (hasExamCol('title')) updates.push('title = @title');
            if (hasExamCol('created_by')) updates.push('created_by = @createdBy');
            if (hasExamCol('duration')) updates.push('duration = @duration');
            if (hasExamCol('total_marks')) updates.push('total_marks = @totalMarks');
            if (hasExamCol('course_id')) updates.push('course_id = NULL');
            if (hasExamCol('start_date')) updates.push('start_date = NULL');
            if (hasExamCol('end_date')) updates.push('end_date = NULL');
            if (hasExamCol('access_mode')) updates.push('access_mode = @accessMode');
            if (hasExamCol('proctoring_enabled')) updates.push('proctoring_enabled = @proctoringEnabled');
            if (hasExamCol('post_end_visibility_mode')) updates.push('post_end_visibility_mode = @postEndVisibilityMode');
            if (hasExamCol('post_end_grace_minutes')) updates.push('post_end_grace_minutes = @postEndGraceMinutes');
            if (hasExamCol('max_attempts_per_student')) updates.push('max_attempts_per_student = @maxAttempts');
            if (hasExamCol('allow_custom_exam_code')) updates.push('allow_custom_exam_code = FALSE');
            if (hasExamCol('screen_capture_protection')) updates.push('screen_capture_protection = @screenProtection');
            if (hasExamCol('is_demo_exam')) updates.push('is_demo_exam = TRUE');
            if (hasRandomizeQuestions) updates.push('randomize_questions = TRUE');
            if (hasRandomizeOptions) updates.push('randomize_options = TRUE');

            if (updates.length > 0) {
                updateRequest.input('proctoringEnabled', sql.Bit, demoProctoringEnabled);
                updateRequest.input('screenProtection', sql.Bit, demoScreenProtection);
                await updateRequest.query(`
                    UPDATE exams
                    SET ${updates.join(', ')}
                    WHERE id = @examId
                `);
            }
        } else {
            const examInsertRequest = new sql.Request();
            examInsertRequest.input('title', sql.NVarChar(255), examTitle);
            examInsertRequest.input('createdBy', sql.Int, numericUserId);
            examInsertRequest.input('duration', sql.Int, demoDuration);
            examInsertRequest.input('totalMarks', sql.Decimal(10, 2), demoTotalMarks);
            examInsertRequest.input('examCode', sql.NVarChar(50), examCode);
            examInsertRequest.input('accessMode', sql.NVarChar(20), 'link');
            examInsertRequest.input('postEndVisibilityMode', sql.NVarChar(20), 'archive');
            examInsertRequest.input('postEndGraceMinutes', sql.Int, 0);
            examInsertRequest.input('maxAttempts', sql.Int, demoMaxAttempts);

            const examColumns = [];
            const examValues = [];

            if (hasExamCol('title')) { examColumns.push('title'); examValues.push('@title'); }
            if (hasExamCol('course_id')) { examColumns.push('course_id'); examValues.push('NULL'); }
            if (hasExamCol('created_by')) { examColumns.push('created_by'); examValues.push('@createdBy'); }
            if (hasExamCol('duration')) { examColumns.push('duration'); examValues.push('@duration'); }
            if (hasExamCol('total_marks')) { examColumns.push('total_marks'); examValues.push('@totalMarks'); }
            if (hasExamCol('exam_code')) { examColumns.push('exam_code'); examValues.push('@examCode'); }
            if (hasExamCol('start_date')) { examColumns.push('start_date'); examValues.push('NULL'); }
            if (hasExamCol('end_date')) { examColumns.push('end_date'); examValues.push('NULL'); }
            if (hasExamCol('access_mode')) { examColumns.push('access_mode'); examValues.push('@accessMode'); }
            if (hasExamCol('proctoring_enabled')) { examColumns.push('proctoring_enabled'); examValues.push('@proctoringEnabled'); }
            if (hasExamCol('post_end_visibility_mode')) { examColumns.push('post_end_visibility_mode'); examValues.push('@postEndVisibilityMode'); }
            if (hasExamCol('post_end_grace_minutes')) { examColumns.push('post_end_grace_minutes'); examValues.push('@postEndGraceMinutes'); }
            if (hasExamCol('max_attempts_per_student')) { examColumns.push('max_attempts_per_student'); examValues.push('@maxAttempts'); }
            if (hasExamCol('allow_custom_exam_code')) { examColumns.push('allow_custom_exam_code'); examValues.push('FALSE'); }
            if (hasExamCol('screen_capture_protection')) { examColumns.push('screen_capture_protection'); examValues.push('@screenProtection'); }
            if (hasExamCol('is_demo_exam')) { examColumns.push('is_demo_exam'); examValues.push('TRUE'); }
            if (hasRandomizeQuestions) { examColumns.push('randomize_questions'); examValues.push('TRUE'); }
            if (hasRandomizeOptions) { examColumns.push('randomize_options'); examValues.push('TRUE'); }

            if (examColumns.length === 0) return;

            examInsertRequest.input('proctoringEnabled', sql.Bit, demoProctoringEnabled);
            examInsertRequest.input('screenProtection', sql.Bit, demoScreenProtection);

            const examInsertQuery = `
                INSERT INTO exams (${examColumns.join(', ')})
                VALUES (${examValues.join(', ')})
                RETURNING id
            `;

            const examInsertResult = await examInsertRequest.query(examInsertQuery);
            demoExamId = Number(examInsertResult.recordset[0]?.id || 0);
            needsQuestionReset = true;
        }

        if (!demoExamId) return;

        const duplicateResult = await sql.query`
            SELECT id
            FROM exams
            WHERE created_by = ${numericUserId}
              AND COALESCE(is_demo_exam, FALSE) = TRUE
              AND title = ${examTitle}
              AND id <> ${demoExamId}
        `;
        for (const dup of duplicateResult.recordset || []) {
            const dupId = Number(dup.id || 0);
            if (!dupId) continue;
            if (hasAnswersTable) {
                await sql.query`
                    DELETE FROM answers a
                    USING exam_attempts ea
                    WHERE ea.id = a.attempt_id
                      AND ea.exam_id = ${dupId}
                `;
            }
            if (hasAttemptsTable) {
                await sql.query`
                    DELETE FROM exam_attempts
                    WHERE exam_id = ${dupId}
                `;
            }
            if (hasOptionsTable) {
                await sql.query`
                    DELETE FROM options o
                    USING questions q
                    WHERE q.id = o.question_id
                      AND q.exam_id = ${dupId}
                `;
            }
            await sql.query`
                DELETE FROM questions
                WHERE exam_id = ${dupId}
            `;
            await sql.query`
                DELETE FROM exams
                WHERE id = ${dupId}
            `;
        }

        if (!needsQuestionReset) return;

        if (hasAnswersTable) {
            await sql.query`
                DELETE FROM answers a
                USING exam_attempts ea
                WHERE ea.id = a.attempt_id
                  AND ea.exam_id = ${demoExamId}
            `;
        }

        if (hasAttemptsTable) {
            await sql.query`
                DELETE FROM exam_attempts
                WHERE exam_id = ${demoExamId}
            `;
        }

        if (hasOptionsTable) {
            await sql.query`
                DELETE FROM options o
                USING questions q
                WHERE q.id = o.question_id
                  AND q.exam_id = ${demoExamId}
            `;
        }

        await sql.query`
            DELETE FROM questions
            WHERE exam_id = ${demoExamId}
        `;

        const demoQuestions = [
            {
                text: `Welcome ${safeName}! Which action starts an exam?`,
                type: 'MCQ',
                marks: 2,
                answer: null,
                options: [
                    { text: 'Press "Start Exam"', isCorrect: 1 },
                    { text: 'Close the browser', isCorrect: 0 },
                    { text: 'Refresh the page repeatedly', isCorrect: 0 }
                ]
            },
            {
                text: 'True or False: Your answers are autosaved during the exam.',
                type: 'TrueFalse',
                marks: 2,
                answer: 'true',
                options: []
            },
            {
                text: 'Which action submits your attempt when you finish?',
                type: 'MCQ',
                marks: 2,
                answer: null,
                options: [
                    { text: 'Press "Submit Exam"', isCorrect: 1 },
                    { text: 'Close the tab', isCorrect: 0 },
                    { text: 'Wait until browser closes', isCorrect: 0 }
                ]
            },
            {
                text: 'True or False: Exiting fullscreen repeatedly may trigger proctoring violations.',
                type: 'TrueFalse',
                marks: 2,
                answer: 'true',
                options: []
            },
            {
                text: 'Write one short line describing your exam strategy.',
                type: 'Essay',
                marks: 2,
                answer: null,
                options: []
            }
        ];

        for (let i = 0; i < demoQuestions.length; i += 1) {
            const question = demoQuestions[i];
            const questionRequest = new sql.Request();
            questionRequest.input('examId', sql.Int, demoExamId);
            questionRequest.input('questionText', sql.NVarChar(sql.MAX), question.text);
            questionRequest.input('questionType', sql.NVarChar(50), question.type);
            questionRequest.input('marks', sql.Decimal(10, 2), question.marks);
            questionRequest.input('correctAnswer', sql.NVarChar(255), question.answer);
            if (hasQuestionOrder) {
                questionRequest.input('questionOrder', sql.Int, i + 1);
            }

            const questionInsertQuery = hasQuestionOrder
                ? `
                    INSERT INTO questions (exam_id, question_text, question_type, marks, correct_answer, question_order)
                    VALUES (@examId, @questionText, @questionType, @marks, @correctAnswer, @questionOrder)
                    RETURNING id
                `
                : `
                    INSERT INTO questions (exam_id, question_text, question_type, marks, correct_answer)
                    VALUES (@examId, @questionText, @questionType, @marks, @correctAnswer)
                    RETURNING id
                `;

            const questionInsertResult = await questionRequest.query(questionInsertQuery);
            const questionId = Number(questionInsertResult.recordset[0]?.id || 0);
            if (!hasOptionsTable || !questionId || !Array.isArray(question.options) || question.options.length === 0) continue;

            for (const option of question.options) {
                await sql.query`
                    INSERT INTO options (question_id, option_text, is_correct)
                    VALUES (${questionId}, ${option.text}, ${option.isCorrect ? 1 : 0})
                `;
            }
        }
    } catch (_) {
        // Do not block user registration/login if demo exam provisioning fails.
    }
};

// ================================
// Register
// ================================
const register = async (req, res) => {
    try {
        const { name, email, password, role, university_id, department_id, profile_mode } = req.body;
        const nameValue = typeof name === 'string' ? name.trim() : '';
        const emailValue = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const passwordValue = typeof password === 'string' ? password : '';
        const roleValue = ['student', 'teacher'].includes(role) ? role : null;
        const hasUniversitySelection = university_id !== undefined && university_id !== null && String(university_id).trim() !== '';
        const hasDepartmentSelection = department_id !== undefined && department_id !== null && String(department_id).trim() !== '';
        const universityId = hasUniversitySelection ? Number(university_id) : null;
        const departmentId = hasDepartmentSelection ? Number(department_id) : null;
        const requestedProfileMode = normalizeProfileMode(profile_mode);
        const derivedProfileMode = roleValue
            ? (requestedProfileMode || (departmentId ? 'academic' : 'independent'))
            : null;

        if (!nameValue || !emailValue || !passwordValue || !roleValue) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (passwordValue.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        if (hasUniversitySelection && (!Number.isInteger(universityId) || universityId <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid university selection'
            });
        }

        if (hasDepartmentSelection && (!Number.isInteger(departmentId) || departmentId <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department selection'
            });
        }

        const departmentHierarchy = departmentId ? await getDepartmentHierarchy(departmentId) : null;
        if (departmentId && !departmentHierarchy) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        if (departmentHierarchy && universityId && Number(departmentHierarchy.university_id) !== universityId) {
            return res.status(400).json({
                success: false,
                message: 'Department does not belong to the selected university'
            });
        }

        if (!departmentId && universityId && derivedProfileMode === 'academic') {
            return res.status(400).json({
                success: false,
                message: 'Please select a department for academic accounts'
            });
        }

        if (roleValue && derivedProfileMode === 'academic' && !departmentId) {
            return res.status(400).json({
                success: false,
                message: roleValue === 'teacher'
                    ? 'Academic teachers must be assigned to a department'
                    : 'Academic students must be assigned to a department'
            });
        }

        const checkUser = await sql.query`
            SELECT id FROM users WHERE email = ${emailValue}
        `;

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(passwordValue, 10);
        const normalizedUniversityId = departmentHierarchy ? Number(departmentHierarchy.university_id) : universityId;
        const [hasAcademicVerifiedColumn, hasAcademicEmailConfirmedColumn] = await Promise.all([
            hasUserColumn('academic_verified'),
            hasUserColumn('academic_email_confirmed')
        ]);

        const insertResult = await sql.query`
            INSERT INTO users (name, email, password, role, university_id, department_id, profile_mode)
            VALUES (${nameValue}, ${emailValue}, ${hashedPassword}, ${roleValue}, ${normalizedUniversityId || null}, ${departmentId || null}, ${derivedProfileMode})
            RETURNING id
        `;

        const insertedUserId = Number(insertResult.recordset[0]?.id || 0);
        const shouldAutoVerifyAcademic = roleValue === 'teacher' && derivedProfileMode === 'academic' && looksAcademicEmail(emailValue);

        if (insertedUserId > 0 && (hasAcademicVerifiedColumn || hasAcademicEmailConfirmedColumn)) {
            const request = new sql.Request();
            request.input('userId', sql.Int, insertedUserId);
            request.input('academicVerified', sql.Bit, shouldAutoVerifyAcademic ? true : false);
            request.input('academicEmailConfirmed', sql.Bit, shouldAutoVerifyAcademic ? true : false);

            const updates = [];
            if (hasAcademicVerifiedColumn) updates.push('academic_verified = @academicVerified');
            if (hasAcademicEmailConfirmedColumn) updates.push('academic_email_confirmed = @academicEmailConfirmed');

            if (updates.length > 0) {
                await request.query(`
                    UPDATE users
                    SET ${updates.join(', ')}
                    WHERE id = @userId
                `);
            }
        }

        await createDemoExamIfMissing({
            userId: insertedUserId,
            role: roleValue,
            userName: nameValue
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getPublicStats = async (_req, res) => {
    try {
        const hasDemoExamColumn = await hasExamColumn('is_demo_exam');
        const demoExamFilter = hasDemoExamColumn ? 'WHERE COALESCE(is_demo_exam, FALSE) = FALSE' : '';
        const attemptsDemoFilter = hasDemoExamColumn ? 'AND COALESCE(e.is_demo_exam, FALSE) = FALSE' : '';
        const [users, institutions, exams, completedAttempts] = await Promise.all([
            sql.query`SELECT COUNT(*) AS total FROM users`,
            sql.query`SELECT COUNT(*) AS total FROM universities`,
            sql.query(`
                SELECT COUNT(*) AS total
                FROM exams
                ${demoExamFilter}
            `),
            sql.query(`
                SELECT COUNT(*) AS total
                FROM exam_attempts ea
                JOIN exams e ON e.id = ea.exam_id
                WHERE ea.submit_time IS NOT NULL
                  AND ea.start_time <= NOW()
                  AND ea.submit_time <= NOW()
                  AND (e.start_date IS NULL OR ea.submit_time >= e.start_date)
                  ${attemptsDemoFilter}
            `)
        ]);

        res.status(200).json({
            success: true,
            data: {
                completed_attempts: Number(completedAttempts.recordset[0]?.total || 0),
                published_exams: Number(exams.recordset[0]?.total || 0),
                registered_users: Number(users.recordset[0]?.total || 0),
                institutions: Number(institutions.recordset[0]?.total || 0)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ================================
// Public institutions (register)
// ================================
const getPublicUniversities = async (_req, res) => {
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

const getPublicBranches = async (_req, res) => {
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

const getPublicFaculties = async (_req, res) => {
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

const getPublicDepartments = async (_req, res) => {
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

// ================================
// Login
// ================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailValue = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const passwordValue = typeof password === 'string' ? password : '';

        if (!emailValue || !passwordValue) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const result = await sql.query`
            SELECT * FROM users WHERE email = ${emailValue}
        `;

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = result.recordset[0];
        const activeColumnExists = await hasIsActiveColumn();

        if (activeColumnExists && user.is_active === false) {
            return res.status(403).json({
                success: false,
                message: 'This account is inactive'
            });
        }

        let isMatch = false;
        const storedPassword = typeof user.password === 'string' ? user.password : '';

        if (looksLikeBcryptHash(storedPassword)) {
            isMatch = await bcrypt.compare(passwordValue, storedPassword);
        } else {
            isMatch = passwordValue === storedPassword;

            if (isMatch) {
                const hashedPassword = await bcrypt.hash(passwordValue, 10);
                await sql.query`
                    UPDATE users
                    SET password = ${hashedPassword}
                    WHERE id = ${user.id}
                `;
                user.password = hashedPassword;
            }
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const authResult = await createAuthSessionAndToken(user);
        if (!authResult.ok) {
            return res.status(authResult.status).json({
                success: false,
                message: authResult.message
            });
        }

        await createDemoExamIfMissing({
            userId: user.id,
            role: user.role,
            userName: user.name
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: authResult.token,
            session_id: authResult.sessionId,
            user: authResult.profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { credential, role, profile_mode } = req.body || {};
        const googleUser = await verifyGoogleCredential(credential);
        const roleValue = ['student', 'teacher'].includes(role) ? role : 'student';
        const normalizedProfileMode = normalizeProfileMode(profile_mode);
        const teacherProfileMode = roleValue === 'teacher' ? (normalizedProfileMode || 'independent') : null;

        if (normalizedProfileMode === 'academic') {
            return res.status(400).json({
                success: false,
                message: 'Academic accounts require university and department details. Please register with email/password.'
            });
        }

        const activeColumnExists = await hasIsActiveColumn();
        let userResult = await sql.query`
            SELECT *
            FROM users
            WHERE email = ${googleUser.email}
        `;

        if (userResult.recordset.length === 0) {
            const randomPassword = createSessionId();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            const [hasAcademicVerifiedColumn, hasAcademicEmailConfirmedColumn] = await Promise.all([
                hasUserColumn('academic_verified'),
                hasUserColumn('academic_email_confirmed')
            ]);

            const insertResult = await sql.query`
                INSERT INTO users (name, email, password, role, profile_mode)
                VALUES (${googleUser.name}, ${googleUser.email}, ${hashedPassword}, ${roleValue}, ${teacherProfileMode})
                RETURNING id
            `;

            const insertedUserId = Number(insertResult.recordset[0]?.id || 0);
            const shouldAutoVerifyAcademic = roleValue === 'teacher' && teacherProfileMode === 'academic' && looksAcademicEmail(googleUser.email);

            if (insertedUserId > 0 && (hasAcademicVerifiedColumn || hasAcademicEmailConfirmedColumn)) {
                const request = new sql.Request();
                request.input('userId', sql.Int, insertedUserId);
                request.input('academicVerified', sql.Bit, shouldAutoVerifyAcademic ? true : false);
                request.input('academicEmailConfirmed', sql.Bit, shouldAutoVerifyAcademic ? true : false);

                const updates = [];
                if (hasAcademicVerifiedColumn) updates.push('academic_verified = @academicVerified');
                if (hasAcademicEmailConfirmedColumn) updates.push('academic_email_confirmed = @academicEmailConfirmed');
                if (updates.length > 0) {
                    await request.query(`
                        UPDATE users
                        SET ${updates.join(', ')}
                        WHERE id = @userId
                    `);
                }
            }

            await createDemoExamIfMissing({
                userId: insertedUserId,
                role: roleValue,
                userName: googleUser.name
            });

            userResult = await sql.query`
                SELECT *
                FROM users
                WHERE id = ${insertedUserId}
            `;
        }

        const user = userResult.recordset[0];
        if (!user) {
            return res.status(500).json({ success: false, message: 'Unable to create or load account' });
        }

        if (activeColumnExists && user.is_active === false) {
            return res.status(403).json({
                success: false,
                message: 'This account is inactive'
            });
        }

        const authResult = await createAuthSessionAndToken(user);
        if (!authResult.ok) {
            return res.status(authResult.status).json({
                success: false,
                message: authResult.message
            });
        }

        await createDemoExamIfMissing({
            userId: user.id,
            role: user.role,
            userName: user.name
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: authResult.token,
            session_id: authResult.sessionId,
            user: authResult.profile
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Google login failed'
        });
    }
};

const logout = async (req, res) => {
    try {
        const [hasSessionIdColumn, hasSessionLastSeenColumn] = await Promise.all([
            hasUserColumn('active_session_id'),
            hasUserColumn('active_session_last_seen')
        ]);

        if (hasSessionIdColumn || hasSessionLastSeenColumn) {
            const updates = [];
            if (hasSessionIdColumn) updates.push('active_session_id = NULL');
            if (hasSessionLastSeenColumn) updates.push('active_session_last_seen = NULL');

            await sql.query(`
                UPDATE users
                SET ${updates.join(', ')}
                WHERE id = ${req.user.id}
            `);
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const profile = await getUserProfileById(req.user.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyActivity = async (req, res) => {
    try {
        const role = req.user.role;
        let activities = [];

        if (role === 'student') {
            const result = await sql.query`
                SELECT *
                FROM (
                    SELECT
                        CAST('exam_started' AS TEXT) AS activity_type,
                        ea.start_time AS occurred_at,
                        e.title AS subject_title,
                        e.exam_code AS exam_code,
                        CAST(NULL AS TEXT) AS extra_text
                    FROM exam_attempts ea
                    JOIN exams e ON e.id = ea.exam_id
                    WHERE ea.student_id = ${req.user.id}
                      AND ea.start_time IS NOT NULL
                      AND ea.start_time <= NOW()

                    UNION ALL

                    SELECT
                        CASE
                            WHEN ea.forced_submit = TRUE THEN 'exam_force_submitted'
                            ELSE 'exam_submitted'
                        END AS activity_type,
                        ea.submit_time AS occurred_at,
                        e.title AS subject_title,
                        e.exam_code AS exam_code,
                        CAST(
                            CASE
                                WHEN ea.score IS NULL THEN NULL
                                ELSE CONCAT(CAST(CAST(ea.score AS DECIMAL(10,2)) AS TEXT), ' / ', CAST(CAST(e.total_marks AS DECIMAL(10,2)) AS TEXT))
                            END
                        AS TEXT) AS extra_text
                    FROM exam_attempts ea
                    JOIN exams e ON e.id = ea.exam_id
                    WHERE ea.student_id = ${req.user.id}
                      AND ea.submit_time IS NOT NULL
                      AND ea.submit_time <= NOW()
                      AND (e.start_date IS NULL OR ea.submit_time >= e.start_date)
                ) activity_feed
                ORDER BY occurred_at DESC
                LIMIT 20
            `;

            activities = result.recordset;
        } else if (role === 'teacher') {
            const result = await sql.query`
                SELECT *
                FROM (
                    SELECT
                        CAST('exam_created' AS TEXT) AS activity_type,
                        e.created_at AS occurred_at,
                        e.title AS subject_title,
                        e.exam_code AS exam_code,
                        CAST(
                            CASE
                                WHEN e.access_mode = 'link' THEN 'link'
                                ELSE 'department'
                            END
                        AS TEXT) AS extra_text
                    FROM exams e
                    WHERE e.created_by = ${req.user.id}
                      AND e.created_at IS NOT NULL

                    UNION ALL

                    SELECT
                        CAST('question_saved_to_bank' AS TEXT) AS activity_type,
                        qb.created_at AS occurred_at,
                        LEFT(qb.question_text, 140) AS subject_title,
                        CAST(NULL AS TEXT) AS exam_code,
                        CAST(qb.question_type AS TEXT) AS extra_text
                    FROM question_bank qb
                    WHERE qb.doctor_id = ${req.user.id}
                      AND qb.created_at IS NOT NULL

                    UNION ALL

                    SELECT
                        CASE
                            WHEN ea.forced_submit = TRUE THEN 'attempt_force_submitted'
                            ELSE 'attempt_submitted'
                        END AS activity_type,
                        ea.submit_time AS occurred_at,
                        e.title AS subject_title,
                        e.exam_code AS exam_code,
                        CAST(student_user.name AS TEXT) AS extra_text
                    FROM exam_attempts ea
                    JOIN exams e ON e.id = ea.exam_id
                    JOIN users student_user ON student_user.id = ea.student_id
                    WHERE e.created_by = ${req.user.id}
                      AND ea.submit_time IS NOT NULL
                      AND ea.submit_time <= NOW()
                      AND (e.start_date IS NULL OR ea.submit_time >= e.start_date)
                ) activity_feed
                ORDER BY occurred_at DESC
                LIMIT 20
            `;

            activities = result.recordset;
        }

        res.status(200).json({
            success: true,
            data: activities.map((item, index) => ({
                id: `${item.activity_type}-${item.exam_code || 'none'}-${item.occurred_at ? new Date(item.occurred_at).getTime() : index}-${index}`,
                activity_type: item.activity_type,
                occurred_at: item.occurred_at,
                subject_title: item.subject_title || null,
                exam_code: item.exam_code || null,
                extra_text: item.extra_text || null
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const nameValue = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const phoneValue = normalizePhone(req.body.phone_number);
        const academicYearValue = normalizeAcademicYear(req.body.academic_year);
        const bioValue = normalizeBio(req.body.bio);

        if (!nameValue) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        const [hasPhoneColumn, hasAcademicYearColumn, hasBioColumn] = await Promise.all([
            hasUserColumn('phone_number'),
            hasUserColumn('academic_year'),
            hasUserColumn('bio')
        ]);

        const updates = ['name = @name'];
        const request = new sql.Request();
        request.input('name', sql.NVarChar(255), nameValue);
        request.input('userId', sql.Int, req.user.id);

        if (hasPhoneColumn) {
            updates.push('phone_number = @phone_number');
            request.input('phone_number', sql.NVarChar(30), phoneValue);
        }

        if (hasAcademicYearColumn) {
            updates.push('academic_year = @academic_year');
            request.input('academic_year', sql.NVarChar(100), academicYearValue);
        }

        if (hasBioColumn) {
            updates.push('bio = @bio');
            request.input('bio', sql.NVarChar(sql.MAX), bioValue);
        }

        await request.query(`
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = @userId
        `);

        const profile = await getUserProfileById(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const changeMyPassword = async (req, res) => {
    try {
        const currentPassword = typeof req.body.current_password === 'string' ? req.body.current_password : '';
        const newPassword = typeof req.body.new_password === 'string' ? req.body.new_password : '';

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        const result = await sql.query`
            SELECT password
            FROM users
            WHERE id = ${req.user.id}
        `;

        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const storedPassword = typeof user.password === 'string' ? user.password : '';
        let isMatch = false;

        if (looksLikeBcryptHash(storedPassword)) {
            isMatch = await bcrypt.compare(currentPassword, storedPassword);
        } else {
            isMatch = currentPassword === storedPassword;
        }

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await sql.query`
            UPDATE users
            SET password = ${hashedPassword}
            WHERE id = ${req.user.id}
        `;

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    login,
    googleLogin,
    getGoogleClientConfig,
    logout,
    getPublicStats,
    getPublicUniversities,
    getPublicBranches,
    getPublicFaculties,
    getPublicDepartments,
    getMyProfile,
    getMyActivity,
    updateMyProfile,
    changeMyPassword,
    createDemoExamIfMissing
};
