const { sql } = require('../config/db');
const { createDemoExamIfMissing } = require('./auth.controller');

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeTrueFalse = (value) => {
    const normalized = normalizeText(value).toLowerCase();

    if (['true', '1', 'yes'].includes(normalized)) return 'true';
    if (['false', '0', 'no'].includes(normalized)) return 'false';

    return normalized;
};

const questionTypeUpper = (value) => normalizeText(value).toUpperCase();
const isNotStarted = (exam) => Boolean(exam?.start_date) && new Date(exam.start_date) > new Date();
const isEnded = (exam) => Boolean(exam?.end_date) && new Date(exam.end_date) < new Date();
const isExamClosedForStudents = (exam) => {
    if (!exam?.end_date) return false;
    const endDate = new Date(exam.end_date);
    const now = new Date();
    if (endDate >= now) return false;

    const visibilityMode = String(exam.post_end_visibility_mode || 'hide').toLowerCase();
    if (visibilityMode === 'archive') return false;

    const graceMinutes = Number(exam.post_end_grace_minutes || 0);
    if (graceMinutes > 0) {
        const graceEndsAt = new Date(endDate.getTime() + graceMinutes * 60 * 1000);
        if (graceEndsAt >= now) return false;
    }

    return true;
};
const createTxRequest = (transaction) => new sql.Request(transaction);
const SESSION_TTL_SECONDS = 45;
const hasFacultyHierarchy = async () => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'departments'
          AND COLUMN_NAME = 'faculty_id'
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

const hasAttemptRandomizationColumns = async () => {
    const result = await sql.query`
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'exam_attempts'
          AND COLUMN_NAME IN ('question_order_json', 'option_order_json')
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

const parseJsonArray = (value) => {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const parseJsonObject = (value) => {
    if (!value) return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
};

const shuffleArray = (items) => {
    const copy = [...items];

    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
};

const orderByIdSequence = (items, orderedIds, idKey = 'id') => {
    if (!Array.isArray(items) || items.length === 0 || !Array.isArray(orderedIds) || orderedIds.length === 0) {
        return items;
    }

    const rank = new Map(orderedIds.map((id, index) => [String(id), index]));

    return [...items].sort((left, right) => {
        const leftRank = rank.has(String(left[idKey])) ? rank.get(String(left[idKey])) : Number.MAX_SAFE_INTEGER;
        const rightRank = rank.has(String(right[idKey])) ? rank.get(String(right[idKey])) : Number.MAX_SAFE_INTEGER;
        return leftRank - rightRank;
    });
};

const loadExamQuestionsWithOptions = async (examId) => {
    const questionsResult = await sql.query`
        SELECT
            q.id,
            q.question_text,
            q.question_type,
            q.marks
        FROM questions q
        WHERE q.exam_id = ${examId}
        ORDER BY q.id
    `;

    const questions = questionsResult.recordset;

    for (const question of questions) {
        if (questionTypeUpper(question.question_type) === 'MCQ') {
            const options = await sql.query`
                SELECT id, option_text
                FROM options
                WHERE question_id = ${question.id}
                ORDER BY id
            `;
            question.options = options.recordset;
        } else {
            question.options = [];
        }
    }

    return questions;
};

const buildAttemptRandomizationState = (questions, settings) => {
    const randomizeQuestions = normalizeBoolean(settings?.randomize_questions);
    const randomizeOptions = normalizeBoolean(settings?.randomize_options);

    const questionOrder = randomizeQuestions
        ? shuffleArray(questions.map((question) => question.id))
        : [];

    const optionOrder = {};
    if (randomizeOptions) {
        for (const question of questions) {
            if (questionTypeUpper(question.question_type) !== 'MCQ') continue;
            if (!Array.isArray(question.options) || question.options.length < 2) continue;
            optionOrder[String(question.id)] = shuffleArray(question.options.map((option) => option.id));
        }
    }

    return {
        question_order_json: questionOrder.length > 0 ? JSON.stringify(questionOrder) : null,
        option_order_json: Object.keys(optionOrder).length > 0 ? JSON.stringify(optionOrder) : null,
    };
};

const getExamMeta = async (code, studentId) => {
    const examRandomizationEnabled = await hasExamRandomizationColumns();
    const attemptRandomizationEnabled = await hasAttemptRandomizationColumns();
    const request = new sql.Request();
    request.input('studentId', sql.Int, studentId);
    request.input('examCode', sql.NVarChar(50), code);

    const query = `
        WITH candidate_exams AS (
            SELECT
                e.id, e.title, e.duration,
                e.total_marks, e.exam_code,
                e.start_date, e.end_date,
                e.access_mode,
                ISNULL(e.max_attempts_per_student, 1) AS max_attempts_per_student,
                ISNULL(e.proctoring_enabled, 1) AS proctoring_enabled,
                ISNULL(e.screen_capture_protection, 0) AS screen_capture_protection,
                ISNULL(e.post_end_visibility_mode, 'hide') AS post_end_visibility_mode,
                ISNULL(e.post_end_grace_minutes, 0) AS post_end_grace_minutes,
                ISNULL(e.is_demo_exam, 0) AS is_demo_exam,
                ${examRandomizationEnabled ? 'e.randomize_questions, e.randomize_options,' : 'CAST(0 AS bit) AS randomize_questions, CAST(0 AS bit) AS randomize_options,'}
                c.name AS course_name,
                ongoing_attempt.id AS current_attempt_id,
                ongoing_attempt.start_time AS current_attempt_start_time,
                ${attemptRandomizationEnabled ? 'ongoing_attempt.question_order_json AS current_question_order_json, ongoing_attempt.option_order_json AS current_option_order_json,' : 'CAST(NULL AS NVARCHAR(MAX)) AS current_question_order_json, CAST(NULL AS NVARCHAR(MAX)) AS current_option_order_json,'}
                completed_attempt.id AS completed_attempt_id,
                completed_attempt.total_completed_attempts AS total_completed_attempts
            FROM exams e
            LEFT JOIN courses c ON e.course_id = c.id
            JOIN users student ON student.id = @studentId
            OUTER APPLY (
                SELECT TOP 1 ea.id, ea.start_time
                       ${attemptRandomizationEnabled ? ', ea.question_order_json, ea.option_order_json' : ''}
                FROM exam_attempts ea
                WHERE ea.exam_id = e.id
                  AND ea.student_id = @studentId
                  AND ea.submit_time IS NULL
                  AND ea.start_time <= GETDATE()
                ORDER BY ea.start_time DESC, ea.id DESC
            ) ongoing_attempt
            OUTER APPLY (
                SELECT TOP 1
                       ea.id,
                       completed_stats.total_completed_attempts
                FROM exam_attempts ea
                CROSS APPLY (
                    SELECT COUNT(*) AS total_completed_attempts
                    FROM exam_attempts ea_count
                    WHERE ea_count.exam_id = e.id
                      AND ea_count.student_id = @studentId
                      AND ea_count.submit_time IS NOT NULL
                      AND (e.start_date IS NULL OR ea_count.submit_time >= e.start_date)
                      AND ea_count.submit_time <= GETDATE()
                ) completed_stats
                WHERE ea.exam_id = e.id
                  AND ea.student_id = @studentId
                  AND ea.submit_time IS NOT NULL
                  AND (e.start_date IS NULL OR ea.submit_time >= e.start_date)
                  AND ea.submit_time <= GETDATE()
                ORDER BY ea.submit_time DESC, ea.id DESC
            ) completed_attempt
            WHERE e.exam_code = @examCode
              AND student.role = 'student'
              AND (
                  (
                      ISNULL(e.is_demo_exam, 0) = 1
                      AND e.created_by = student.id
                  )
                  OR (
                      ISNULL(e.is_demo_exam, 0) = 0
                      AND (
                          e.access_mode = 'link'
                          OR (
                              e.access_mode = 'department'
                              AND student.department_id IS NOT NULL
                              AND c.department_id = student.department_id
                          )
                      )
                  )
              )
        )
        SELECT TOP 1 *
        FROM candidate_exams
        ORDER BY
            CASE
                WHEN current_attempt_id IS NOT NULL THEN 0
                WHEN completed_attempt_id IS NULL THEN 1
                ELSE 2
            END,
            CASE
                WHEN end_date IS NULL THEN 0
                WHEN end_date >= GETDATE() THEN 0
                ELSE 1
            END,
            CASE
                WHEN start_date IS NULL THEN 0
                WHEN start_date <= GETDATE() THEN 0
                ELSE 1
            END,
            id DESC
    `;

    const result = await request.query(query);

    return result.recordset[0] || null;
};

const getOpenAttemptSessionState = async (attemptId) => {
    const result = await sql.query`
        SELECT
            session_token,
            session_last_seen,
            DATEDIFF(SECOND, session_last_seen, GETDATE()) AS session_age_seconds
        FROM exam_attempts
        WHERE id = ${attemptId}
          AND submit_time IS NULL
    `;

    return result.recordset[0] || null;
};

const getDoctorExamState = async (examId, doctorId) => {
    const result = await sql.query`
        SELECT
            e.id,
            e.start_date,
            CASE
                WHEN e.start_date IS NOT NULL AND e.start_date <= GETDATE() THEN CAST(1 AS bit)
                ELSE CAST(0 AS bit)
            END AS has_started,
            stats.total_attempts,
            stats.open_attempts
        FROM exams e
        OUTER APPLY (
            SELECT
                COUNT(*) AS total_attempts,
                SUM(CASE WHEN ea.submit_time IS NULL THEN 1 ELSE 0 END) AS open_attempts
            FROM exam_attempts ea
            WHERE ea.exam_id = e.id
              AND ea.start_time <= GETDATE()
              AND (ea.submit_time IS NULL OR ea.submit_time <= GETDATE())
              AND (e.start_date IS NULL OR ea.submit_time IS NULL OR ea.submit_time >= e.start_date)
        ) stats
        WHERE e.id = ${examId}
          AND e.created_by = ${doctorId}
    `;

    return result.recordset[0] || null;
};

const validateDoctorExamMutability = async ({ examId, doctorId }) => {
    const examState = await getDoctorExamState(examId, doctorId);

    if (!examState) {
        return {
            ok: false,
            status: 404,
            message: 'Exam not found'
        };
    }

    if (examState.has_started || Number(examState.total_attempts) > 0) {
        return {
            ok: false,
            status: 409,
            message: 'This exam can no longer be modified because it has already started or has student attempts'
        };
    }

    return { ok: true, examState };
};

const claimAttemptSession = async ({ attemptId, sessionKey }) => {
    const normalizedSessionKey = normalizeText(sessionKey);
    if (!normalizedSessionKey) {
        return {
            ok: false,
            code: 400,
            message: 'Session key is required'
        };
    }

    const state = await getOpenAttemptSessionState(attemptId);
    if (!state) {
        return {
            ok: false,
            code: 404,
            message: 'Attempt not found or already submitted'
        };
    }

    const activeElsewhere = Boolean(
        state.session_token &&
        state.session_token !== normalizedSessionKey &&
        state.session_age_seconds !== null &&
        state.session_age_seconds < SESSION_TTL_SECONDS
    );

    if (activeElsewhere) {
        return {
            ok: false,
            code: 409,
            message: 'This exam is already active in another window or device'
        };
    }

    await sql.query`
        UPDATE exam_attempts
        SET
            session_token = ${normalizedSessionKey},
            session_last_seen = GETDATE()
        WHERE id = ${attemptId}
          AND submit_time IS NULL
    `;

    return {
        ok: true,
        session_key: normalizedSessionKey
    };
};

const buildQuestionMap = (rows) => {
    const questionMap = new Map();

    for (const row of rows) {
        if (!questionMap.has(row.question_id)) {
            questionMap.set(row.question_id, {
                question_type: questionTypeUpper(row.question_type),
                correct_answer: normalizeTrueFalse(row.correct_answer),
                marks: Number(row.marks) || 0,
                options: new Map()
            });
        }

        if (row.option_id) {
            questionMap.get(row.question_id).options.set(Number(row.option_id), Boolean(row.is_correct));
        }
    }

    return questionMap;
};

const sanitizeAttemptAnswers = (questionMap, answers, { allowEmptyText = false } = {}) => {
    const incomingAnswers = Array.isArray(answers) ? answers : [];
    const sanitizedAnswers = [];

    for (const answer of incomingAnswers) {
        const questionId = Number(answer?.question_id);
        if (!Number.isInteger(questionId) || !questionMap.has(questionId)) {
            return {
                ok: false,
                status: 400,
                message: 'Invalid question in submitted answers'
            };
        }

        const question = questionMap.get(questionId);
        if (question.question_type === 'MCQ') {
            const rawSelectedOptionId = answer?.selected_option_id;
            if (rawSelectedOptionId === null || rawSelectedOptionId === undefined || rawSelectedOptionId === '') {
                continue;
            }

            const selectedOptionId = Number(rawSelectedOptionId);
            if (!Number.isInteger(selectedOptionId) || !question.options.has(selectedOptionId)) {
                return {
                    ok: false,
                    status: 400,
                    message: 'Invalid option submitted for one of the questions'
                };
            }

            sanitizedAnswers.push({
                question_id: questionId,
                selected_option_id: selectedOptionId,
                text_answer: null
            });
            continue;
        }

        const textAnswer = normalizeText(answer?.text_answer);
        if (!textAnswer && !allowEmptyText) continue;
        if (!textAnswer && allowEmptyText) continue;

        const normalizedTextAnswer = question.question_type === 'TRUEFALSE'
            ? normalizeTrueFalse(textAnswer)
            : textAnswer;

        if (question.question_type === 'TRUEFALSE' && !['true', 'false'].includes(normalizedTextAnswer)) {
            return {
                ok: false,
                status: 400,
                message: 'Invalid true/false answer submitted'
            };
        }

        sanitizedAnswers.push({
            question_id: questionId,
            selected_option_id: null,
            text_answer: normalizedTextAnswer
        });
    }

    return { ok: true, sanitizedAnswers };
};

// ================================
// Get Available Exams
// ================================
const getAvailableExams = async (req, res) => {
    try {
        const userNameResult = await sql.query`
            SELECT name
            FROM users
            WHERE id = ${req.user.id}
        `;
        const userName = userNameResult.recordset[0]?.name || 'User';
        await createDemoExamIfMissing({
            userId: req.user.id,
            role: 'student',
            userName
        });

        const hasFaculties = await hasFacultyHierarchy();
        const result = await sql.query(`
            SELECT
                e.id, e.title, e.duration,
                e.total_marks, e.exam_code,
                e.start_date, e.end_date,
                e.access_mode,
                ISNULL(e.max_attempts_per_student, 1) AS max_attempts_per_student,
                ISNULL(e.proctoring_enabled, 1) AS proctoring_enabled,
                ISNULL(e.screen_capture_protection, 0) AS screen_capture_protection,
                ISNULL(e.post_end_visibility_mode, 'hide') AS post_end_visibility_mode,
                ISNULL(e.post_end_grace_minutes, 0) AS post_end_grace_minutes,
                ISNULL(e.is_demo_exam, 0) AS is_demo_exam,
                c.name AS course_name,
                c.level,
                d.name AS department_name,
                b.name AS branch_name,
                u.name AS university_name,
                ${hasFaculties ? 'f.name AS faculty_name' : 'CAST(NULL AS NVARCHAR(255)) AS faculty_name'},
                COUNT(q.id) AS questions_count,
                CAST(CASE WHEN ongoing_attempt.id IS NOT NULL THEN 1 ELSE 0 END AS bit) AS has_open_attempt,
                CAST(CASE WHEN completed_attempt.id IS NOT NULL THEN 1 ELSE 0 END AS bit) AS has_completed_attempt,
                CASE
                    WHEN ISNULL(e.is_demo_exam, 0) = 1 THEN 'active'
                    WHEN e.end_date IS NOT NULL
                         AND e.end_date < GETDATE()
                         AND ISNULL(e.post_end_visibility_mode, 'hide') = 'archive' THEN 'archived'
                    WHEN completed_attempt.id IS NOT NULL
                         AND ISNULL(completed_attempt.total_completed_attempts, 0) >= ISNULL(e.max_attempts_per_student, 1) THEN 'completed'
                    WHEN e.start_date IS NOT NULL AND e.start_date > GETDATE() THEN 'upcoming'
                    WHEN ongoing_attempt.id IS NOT NULL THEN 'in_progress'
                    ELSE 'active'
                END AS status
            FROM exams e
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN branches b ON d.branch_id = b.id
            LEFT JOIN universities u ON b.university_id = u.id
            ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
            JOIN users student ON student.id = ${req.user.id}
            LEFT JOIN questions q ON q.exam_id = e.id
            OUTER APPLY (
                SELECT TOP 1 ea.id
                FROM exam_attempts ea
                WHERE ea.exam_id = e.id
                  AND ea.student_id = ${req.user.id}
                  AND ea.submit_time IS NULL
                  AND ea.start_time <= GETDATE()
                ORDER BY ea.start_time DESC, ea.id DESC
            ) ongoing_attempt
            OUTER APPLY (
                SELECT TOP 1
                    ea.id,
                    completed_stats.total_completed_attempts
                FROM exam_attempts ea
                CROSS APPLY (
                    SELECT COUNT(*) AS total_completed_attempts
                    FROM exam_attempts ea_count
                    WHERE ea_count.exam_id = e.id
                      AND ea_count.student_id = ${req.user.id}
                      AND ea_count.submit_time IS NOT NULL
                      AND (e.start_date IS NULL OR ea_count.submit_time >= e.start_date)
                      AND ea_count.submit_time <= GETDATE()
                ) completed_stats
                WHERE ea.exam_id = e.id
                  AND ea.student_id = ${req.user.id}
                  AND ea.submit_time IS NOT NULL
                  AND (e.start_date IS NULL OR ea.submit_time >= e.start_date)
                  AND ea.submit_time <= GETDATE()
                ORDER BY ea.submit_time DESC, ea.id DESC
            ) completed_attempt
            WHERE (
                    e.end_date IS NULL
                    OR e.end_date >= GETDATE()
                    OR ISNULL(e.post_end_visibility_mode, 'hide') = 'archive'
                    OR (
                        ISNULL(e.post_end_grace_minutes, 0) > 0
                        AND DATEADD(MINUTE, ISNULL(e.post_end_grace_minutes, 0), e.end_date) >= GETDATE()
                    )
                )
              AND student.role = 'student'
              AND (
                  (
                      ISNULL(e.is_demo_exam, 0) = 1
                      AND e.created_by = student.id
                  )
                  OR (
                      ISNULL(e.is_demo_exam, 0) = 0
                      AND (
                          (
                              e.access_mode = 'link'
                              AND EXISTS (
                                  SELECT 1
                                  FROM exam_attempts ea_link
                                  WHERE ea_link.exam_id = e.id
                                    AND ea_link.student_id = student.id
                              )
                          )
                          OR (
                              e.access_mode = 'department'
                              AND student.department_id IS NOT NULL
                              AND c.department_id = student.department_id
                          )
                      )
                  )
              )
            GROUP BY
                e.id, e.title, e.duration,
                e.total_marks, e.exam_code,
                e.start_date, e.end_date, e.access_mode,
                e.max_attempts_per_student, e.proctoring_enabled, e.screen_capture_protection, e.post_end_visibility_mode, e.post_end_grace_minutes, e.is_demo_exam,
                c.name, c.level, d.name, b.name, u.name,
                ${hasFaculties ? 'f.name,' : ''}
                ongoing_attempt.id,
                completed_attempt.id,
                completed_attempt.total_completed_attempts
            HAVING COUNT(q.id) > 0
            ORDER BY
                CASE
                    WHEN completed_attempt.id IS NOT NULL THEN 3
                    WHEN e.start_date IS NOT NULL AND e.start_date > GETDATE() THEN 2
                    WHEN ongoing_attempt.id IS NOT NULL THEN 1
                    ELSE 0
                END,
                e.start_date,
                e.id DESC
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
// Get Exam by Code
// ================================
const getExamByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const exam = await getExamMeta(code, req.user.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        const isDemoExam = normalizeBoolean(exam.is_demo_exam);
        if (!isDemoExam && Number(exam.total_completed_attempts || 0) >= Number(exam.max_attempts_per_student || 1)) {
            return res.status(409).json({
                success: false,
                message: 'You have reached the maximum allowed attempts for this exam'
            });
        }

        if (isNotStarted(exam)) {
            return res.status(403).json({
                success: false,
                message: 'Exam has not started yet'
            });
        }

        if (isExamClosedForStudents(exam)) {
            return res.status(410).json({
                success: false,
                message: 'Exam is no longer available'
            });
        }

        let questions = await loadExamQuestionsWithOptions(exam.id);

        if (exam.current_attempt_id) {
            const questionOrder = parseJsonArray(exam.current_question_order_json);
            const optionOrder = parseJsonObject(exam.current_option_order_json);

            questions = orderByIdSequence(questions, questionOrder, 'id').map((question) => ({
                ...question,
                options: orderByIdSequence(
                    Array.isArray(question.options) ? question.options : [],
                    optionOrder[String(question.id)] || optionOrder[question.id] || [],
                    'id'
                ),
            }));
        }

        let savedAnswers = [];
        if (exam.current_attempt_id) {
            const savedAnswersResult = await sql.query`
                SELECT
                    a.question_id,
                    a.selected_option_id,
                    a.text_answer
                FROM answers a
                WHERE a.attempt_id = ${exam.current_attempt_id}
            `;
            savedAnswers = savedAnswersResult.recordset;
        }

        res.status(200).json({
            success: true,
            data: {
                ...exam,
                questions,
                saved_answers: savedAnswers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Start Exam
// ================================
const startExam = async (req, res) => {
    try {
        const { code } = req.params;
        const sessionKey = req.body?.session_key;
        const exam = await getExamMeta(code, req.user.id);
        const attemptRandomizationEnabled = await hasAttemptRandomizationColumns();

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        const isDemoExam = normalizeBoolean(exam.is_demo_exam);
        if (!isDemoExam && Number(exam.total_completed_attempts || 0) >= Number(exam.max_attempts_per_student || 1)) {
            return res.status(409).json({
                success: false,
                message: 'You have reached the maximum allowed attempts for this exam'
            });
        }

        if (isNotStarted(exam)) {
            return res.status(403).json({
                success: false,
                message: 'Exam has not started yet'
            });
        }

        if (isExamClosedForStudents(exam)) {
            return res.status(410).json({
                success: false,
                message: 'Exam is no longer available'
            });
        }

        if (isDemoExam && exam.current_attempt_id && exam.current_attempt_start_time) {
            const startedAtMs = new Date(exam.current_attempt_start_time).getTime();
            const durationSeconds = Math.max(0, Number(exam.duration || 0)) * 60;
            const graceSeconds = Math.max(0, Number(exam.post_end_grace_minutes || 0)) * 60;
            if (Number.isFinite(startedAtMs) && durationSeconds > 0) {
                const elapsedMs = Date.now() - startedAtMs;
                if (elapsedMs > (durationSeconds + graceSeconds) * 1000) {
                    await sql.query`
                        DELETE a
                        FROM answers a
                        WHERE a.attempt_id = ${exam.current_attempt_id}
                    `;
                    await sql.query`
                        DELETE FROM proctoring_violations
                        WHERE attempt_id = ${exam.current_attempt_id}
                    `;
                    await sql.query`
                        DELETE FROM exam_attempts
                        WHERE id = ${exam.current_attempt_id}
                    `;
                    exam.current_attempt_id = null;
                    exam.current_attempt_start_time = null;
                }
            }
        }

        if (exam.current_attempt_id) {
            const claim = await claimAttemptSession({
                attemptId: exam.current_attempt_id,
                sessionKey
            });

            if (!claim.ok) {
                return res.status(claim.code).json({
                    success: false,
                    message: claim.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Exam attempt already started',
                attempt_id: exam.current_attempt_id,
                already_started: true,
                session_key: normalizeText(sessionKey) || null,
                started_at: exam.current_attempt_start_time || null
            });
        }

        let questionOrderJson = null;
        let optionOrderJson = null;

        if (attemptRandomizationEnabled && (normalizeBoolean(exam.randomize_questions) || normalizeBoolean(exam.randomize_options))) {
            const questions = await loadExamQuestionsWithOptions(exam.id);
            const randomized = buildAttemptRandomizationState(questions, exam);
            questionOrderJson = randomized.question_order_json;
            optionOrderJson = randomized.option_order_json;
        }

        const result = attemptRandomizationEnabled
            ? await sql.query`
                INSERT INTO exam_attempts (exam_id, student_id, start_time, session_token, session_last_seen, question_order_json, option_order_json)
                OUTPUT INSERTED.id, INSERTED.start_time
                VALUES (${exam.id}, ${req.user.id}, GETDATE(), ${normalizeText(sessionKey) || null}, GETDATE(), ${questionOrderJson}, ${optionOrderJson})
            `
            : await sql.query`
                INSERT INTO exam_attempts (exam_id, student_id, start_time, session_token, session_last_seen)
                OUTPUT INSERTED.id, INSERTED.start_time
                VALUES (${exam.id}, ${req.user.id}, GETDATE(), ${normalizeText(sessionKey) || null}, GETDATE())
            `;

        res.status(201).json({
            success: true,
            message: 'Exam started successfully',
            attempt_id: result.recordset[0].id,
            session_key: normalizeText(sessionKey) || null,
            started_at: result.recordset[0].start_time || null
        });
    } catch (error) {
        console.error('Error starting exam:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Submit Exam
// ================================
const submitExam = async (req, res) => {
    let transaction;

    try {
        const { code } = req.params;
        const { attempt_id, answers, forced, violations, session_key } = req.body;

        const attemptId = Number(attempt_id);
        if (!Number.isInteger(attemptId) || attemptId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attempt id'
            });
        }

        const attemptResult = await sql.query`
            SELECT
                ea.id,
                ea.exam_id,
                ea.start_time,
                e.duration,
                e.post_end_grace_minutes,
                e.start_date,
                e.end_date,
                ISNULL(e.proctoring_enabled, 1) AS proctoring_enabled,
                ISNULL(e.screen_capture_protection, 0) AS screen_capture_protection
            FROM exam_attempts ea
            JOIN exams e ON ea.exam_id = e.id
            WHERE ea.id = ${attemptId}
              AND ea.student_id = ${req.user.id}
              AND e.exam_code = ${code}
              AND ea.submit_time IS NULL
        `;

        const attempt = attemptResult.recordset[0];
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Attempt not found or already submitted'
            });
        }

        const claim = await claimAttemptSession({
            attemptId,
            sessionKey: session_key
        });

        if (!claim.ok) {
            return res.status(claim.code).json({
                success: false,
                message: claim.message
            });
        }

        if (isNotStarted(attempt)) {
            return res.status(403).json({
                success: false,
                message: 'Exam has not started yet'
            });
        }

        if (isEnded(attempt)) {
            return res.status(410).json({
                success: false,
                message: 'Exam has already ended'
            });
        }

        const questionRows = await sql.query`
            SELECT
                q.id AS question_id,
                q.question_type,
                q.correct_answer,
                q.marks,
                o.id AS option_id,
                o.is_correct
            FROM questions q
            LEFT JOIN options o ON o.question_id = q.id
            WHERE q.exam_id = ${attempt.exam_id}
            ORDER BY q.id, o.id
        `;

        const questionMap = buildQuestionMap(questionRows.recordset);
        const sanitized = sanitizeAttemptAnswers(questionMap, answers);
        if (!sanitized.ok) {
            return res.status(sanitized.status).json({
                success: false,
                message: sanitized.message
            });
        }
        const { sanitizedAnswers } = sanitized;

        let score = 0;
        for (const answer of sanitizedAnswers) {
            const question = questionMap.get(answer.question_id);
            if (!question) continue;

            if (question.question_type === 'MCQ' && question.options.get(answer.selected_option_id)) {
                score += question.marks;
            }

            if (question.question_type === 'TRUEFALSE' && normalizeTrueFalse(answer.text_answer) === question.correct_answer) {
                score += question.marks;
            }
        }

        const graceMinutes = Math.max(0, Number(attempt.post_end_grace_minutes || 0));
        const durationExceeded = Boolean(
            attempt.start_time &&
            attempt.duration &&
            (Date.now() - new Date(attempt.start_time).getTime()) > (Number(attempt.duration) + graceMinutes) * 60 * 1000
        );
        const proctoringEnabled = normalizeBoolean(attempt.proctoring_enabled);
        const screenCaptureProtected = normalizeBoolean(attempt.screen_capture_protection);
        const violationPolicyTriggered = proctoringEnabled && (
            (Number(normalizedViolations.fullscreenExit) || 0) >= 2
            || (Number(normalizedViolations.tabSwitch) || 0) >= 3
            || (screenCaptureProtected && (Number(normalizedViolations.screenshot) || 0) >= 1)
        );
        const shouldForceSubmit = Boolean(forced) || durationExceeded || violationPolicyTriggered;

        const violationEntries = [
            { key: 'tabSwitch', type: 'tab_switch', reason: 'Student switched tabs' },
            { key: 'fullscreenExit', type: 'fullscreen_exit', reason: 'Student exited fullscreen' },
            { key: 'copy', type: 'copy_attempt', reason: 'Copy attempt detected' },
            { key: 'paste', type: 'paste_attempt', reason: 'Paste attempt detected' },
            { key: 'screenshot', type: 'screenshot_attempt', reason: 'Screenshot attempt detected' },
            { key: 'cameraDenied', type: 'camera_denied', reason: 'Camera permission was denied' },
            { key: 'cameraOff', type: 'camera_off', reason: 'Camera stopped during the exam' }
        ];
        const normalizedViolations = violations && typeof violations === 'object' ? violations : {};

        transaction = new sql.Transaction();
        await transaction.begin();

        await createTxRequest(transaction).query`
            DELETE FROM answers
            WHERE attempt_id = ${attemptId}
        `;

        await createTxRequest(transaction).query`
            DELETE FROM proctoring_violations
            WHERE attempt_id = ${attemptId}
        `;

        for (const answer of sanitizedAnswers) {
            await createTxRequest(transaction).query`
                INSERT INTO answers
                (attempt_id, question_id, selected_option_id, text_answer)
                VALUES (
                    ${attemptId},
                    ${answer.question_id},
                    ${answer.selected_option_id},
                    ${answer.text_answer}
                )
            `;
        }

        await createTxRequest(transaction).query`
            UPDATE exam_attempts
            SET
                submit_time = GETDATE(),
                score = ${score},
                forced_submit = ${shouldForceSubmit ? 1 : 0},
                session_token = NULL,
                session_last_seen = NULL
            WHERE id = ${attemptId}
        `;

        for (const violation of violationEntries) {
            const count = Number(normalizedViolations[violation.key]) || 0;
            if (count <= 0) continue;

            await createTxRequest(transaction).query`
                INSERT INTO proctoring_violations
                (attempt_id, violation_type, count, reason)
                VALUES (${attemptId}, ${violation.type}, ${count}, ${violation.reason})
            `;
        }

        if (durationExceeded) {
            await createTxRequest(transaction).query`
                INSERT INTO proctoring_violations
                (attempt_id, violation_type, count, reason)
                VALUES (${attemptId}, 'time_up', 1, 'Exam duration elapsed before submission')
            `;
        }

        if (violationPolicyTriggered) {
            await createTxRequest(transaction).query`
                INSERT INTO proctoring_violations
                (attempt_id, violation_type, count, reason)
                VALUES (${attemptId}, 'policy_force_submit', 1, 'Proctoring policy triggered a forced submit')
            `;
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Exam submitted successfully',
            score,
            attempt_id: attemptId,
            forced_submit: shouldForceSubmit
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {
                // ignore rollback failures
            }
        }

        console.error('Error submitting exam:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const autosaveExamAnswers = async (req, res) => {
    let transaction;

    try {
        const { code } = req.params;
        const { attempt_id, answers, session_key } = req.body;
        const attemptId = Number(attempt_id);

        if (!Number.isInteger(attemptId) || attemptId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attempt id'
            });
        }

        const attemptResult = await sql.query`
            SELECT
                ea.id,
                ea.exam_id
            FROM exam_attempts ea
            JOIN exams e ON e.id = ea.exam_id
            WHERE ea.id = ${attemptId}
              AND ea.student_id = ${req.user.id}
              AND e.exam_code = ${code}
              AND ea.submit_time IS NULL
        `;

        const attempt = attemptResult.recordset[0];
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Attempt not found or already submitted'
            });
        }

        const claim = await claimAttemptSession({
            attemptId,
            sessionKey: session_key
        });

        if (!claim.ok) {
            return res.status(claim.code).json({
                success: false,
                message: claim.message
            });
        }

        const questionRows = await sql.query`
            SELECT
                q.id AS question_id,
                q.question_type,
                q.correct_answer,
                q.marks,
                o.id AS option_id,
                o.is_correct
            FROM questions q
            LEFT JOIN options o ON o.question_id = q.id
            WHERE q.exam_id = ${attempt.exam_id}
            ORDER BY q.id, o.id
        `;

        const questionMap = buildQuestionMap(questionRows.recordset);
        const sanitized = sanitizeAttemptAnswers(questionMap, answers, { allowEmptyText: true });
        if (!sanitized.ok) {
            return res.status(sanitized.status).json({
                success: false,
                message: sanitized.message
            });
        }

        transaction = new sql.Transaction();
        await transaction.begin();

        await createTxRequest(transaction).query`
            DELETE FROM answers
            WHERE attempt_id = ${attemptId}
        `;

        for (const answer of sanitized.sanitizedAnswers) {
            await createTxRequest(transaction).query`
                INSERT INTO answers
                (attempt_id, question_id, selected_option_id, text_answer)
                VALUES (
                    ${attemptId},
                    ${answer.question_id},
                    ${answer.selected_option_id},
                    ${answer.text_answer}
                )
            `;
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Answers autosaved successfully'
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

const heartbeatExamSession = async (req, res) => {
    try {
        const { code } = req.params;
        const { attempt_id, session_key } = req.body;
        const attemptId = Number(attempt_id);

        if (!Number.isInteger(attemptId) || attemptId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attempt id'
            });
        }

        const lookup = await sql.query`
            SELECT ea.id
            FROM exam_attempts ea
            JOIN exams e ON e.id = ea.exam_id
            WHERE ea.id = ${attemptId}
              AND ea.student_id = ${req.user.id}
              AND e.exam_code = ${code}
              AND ea.submit_time IS NULL
        `;

        if (!lookup.recordset[0]) {
            return res.status(404).json({
                success: false,
                message: 'Attempt not found or already submitted'
            });
        }

        const claim = await claimAttemptSession({
            attemptId,
            sessionKey: session_key
        });

        if (!claim.ok) {
            return res.status(claim.code).json({
                success: false,
                message: claim.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Session heartbeat updated'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================================
// Get My Results
// ================================
const getMyResults = async (req, res) => {
    try {
        const hasFaculties = await hasFacultyHierarchy();
        const result = await sql.query(`
            SELECT
                e.id,
                e.title AS exam_title,
                c.name AS course_name,
                c.level,
                d.name AS department_name,
                b.name AS branch_name,
                u.name AS university_name,
                ${hasFaculties ? 'f.name AS faculty_name' : 'CAST(NULL AS NVARCHAR(255)) AS faculty_name'},
                ea.start_time,
                ea.submit_time,
                ea.score,
                ea.forced_submit,
                e.total_marks,
                ISNULL(v.total_violations, 0) AS violations_count,
                ISNULL(v.violation_summary, '') AS violation_summary,
                CASE
                    WHEN e.total_marks = 0 THEN 0
                    ELSE CAST(ea.score * 100.0 / e.total_marks AS DECIMAL(5,2))
                END AS percentage,
                CASE
                    WHEN essay_progress.pending_essay_answers > 0 THEN 'Pending Review'
                    WHEN ea.forced_submit = 1 THEN 'Terminated'
                    ELSE 'Completed'
                END AS status
            FROM exam_attempts ea
            JOIN exams e ON ea.exam_id = e.id
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN branches b ON d.branch_id = b.id
            LEFT JOIN universities u ON b.university_id = u.id
            ${hasFaculties ? 'LEFT JOIN faculties f ON d.faculty_id = f.id' : ''}
            OUTER APPLY (
                SELECT ISNULL(SUM(pv.count), 0) AS total_violations
                     , ISNULL(STRING_AGG(CONCAT(pv.violation_type, ': ', pv.count), ', '), '') AS violation_summary
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
            WHERE ea.student_id = ${req.user.id}
              AND ea.submit_time IS NOT NULL
              AND (e.start_date IS NULL OR ea.submit_time >= e.start_date)
              AND ea.submit_time <= GETDATE()
              AND ISNULL(e.is_demo_exam, 0) = 0
            ORDER BY ea.submit_time DESC
        `);

        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Error getting results:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAvailableExams,
    getExamByCode,
    startExam,
    submitExam,
    autosaveExamAnswers,
    getMyResults,
    heartbeatExamSession
};
