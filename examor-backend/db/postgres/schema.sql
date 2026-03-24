-- PostgreSQL schema generated from SQL Server dump + migrations
-- Target DB: examor_platform

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    university_id INT NULL,
    department_id INT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    profile_mode VARCHAR(20) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    phone_number VARCHAR(30) NULL,
    academic_year VARCHAR(100) NULL,
    bio TEXT NULL,
    academic_verified BOOLEAN NOT NULL DEFAULT FALSE,
    academic_verified_by_admin_id INT NULL,
    academic_verified_at TIMESTAMP NULL,
    academic_email_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    active_session_id VARCHAR(128) NULL,
    active_session_last_seen TIMESTAMP NULL,
    google_subject_id VARCHAR(255) NULL,
    google_email VARCHAR(255) NULL,
    CONSTRAINT ck_users_profile_mode
        CHECK (profile_mode IS NULL OR profile_mode IN ('academic', 'independent')),
    CONSTRAINT fk_users_academic_verified_by_admin
        FOREIGN KEY (academic_verified_by_admin_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS universities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    university_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NULL,
    FOREIGN KEY (university_id) REFERENCES universities(id)
);

CREATE TABLE IF NOT EXISTS faculties (
    id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_faculties_branches
        FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    faculty_id INT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    CONSTRAINT fk_departments_faculties
        FOREIGN KEY (faculty_id) REFERENCES faculties(id)
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    department_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    level INT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course_id INT NULL,
    created_by INT NOT NULL,
    duration INT NULL,
    total_marks INT NULL,
    exam_code VARCHAR(50) NULL UNIQUE,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    access_mode VARCHAR(20) NOT NULL DEFAULT 'department',
    randomize_questions BOOLEAN NOT NULL DEFAULT FALSE,
    randomize_options BOOLEAN NOT NULL DEFAULT FALSE,
    proctoring_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    post_end_visibility_mode VARCHAR(20) NOT NULL DEFAULT 'hide',
    post_end_grace_minutes INT NOT NULL DEFAULT 0,
    max_attempts_per_student INT NOT NULL DEFAULT 1,
    allow_custom_exam_code BOOLEAN NOT NULL DEFAULT TRUE,
    screen_capture_protection BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo_exam BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_exams_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_exams_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT ck_exams_access_mode CHECK (access_mode IN ('department', 'link')),
    CONSTRAINT ck_exams_post_end_visibility_mode CHECK (post_end_visibility_mode IN ('hide', 'archive')),
    CONSTRAINT ck_exams_post_end_grace_minutes CHECK (post_end_grace_minutes >= 0 AND post_end_grace_minutes <= 43200),
    CONSTRAINT ck_exams_max_attempts_per_student CHECK (max_attempts_per_student >= 1 AND max_attempts_per_student <= 20)
);

CREATE TABLE IF NOT EXISTS exam_attempts (
    id SERIAL PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    start_time TIMESTAMP NULL,
    submit_time TIMESTAMP NULL,
    score INT NULL,
    forced_submit BOOLEAN NOT NULL DEFAULT FALSE,
    session_token VARCHAR(128) NULL,
    session_last_seen TIMESTAMP NULL,
    question_order_json TEXT NULL,
    option_order_json TEXT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    exam_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NULL,
    marks INT NULL,
    correct_answer VARCHAR(10) NULL,
    question_order INT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

CREATE TABLE IF NOT EXISTS options (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL,
    option_text VARCHAR(500) NULL,
    is_correct BOOLEAN NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option_id INT NULL,
    text_answer TEXT NULL,
    awarded_marks DECIMAL(10, 2) NULL,
    review_feedback TEXT NULL,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (selected_option_id) REFERENCES options(id),
    CONSTRAINT fk_answers_reviewed_by_users FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS proctoring_violations (
    id SERIAL PRIMARY KEY,
    attempt_id INT NOT NULL,
    violation_type VARCHAR(50) NULL,
    count INT NULL DEFAULT 1,
    reason TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT NOW(),
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_bank (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    marks INT NOT NULL,
    correct_answer TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_question_bank_doctor FOREIGN KEY (doctor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS question_bank_options (
    id SERIAL PRIMARY KEY,
    bank_question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (bank_question_id) REFERENCES question_bank(id)
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id INT NULL,
    details TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS ix_users_active_session_id
    ON users (active_session_id, active_session_last_seen)
    WHERE active_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_exams_lifecycle_flags
    ON exams (access_mode, is_demo_exam, post_end_visibility_mode, end_date, start_date);

CREATE INDEX IF NOT EXISTS ix_exam_attempts_exam_student
    ON exam_attempts (exam_id, student_id, submit_time);

CREATE INDEX IF NOT EXISTS ix_exam_attempts_session_token
    ON exam_attempts (session_token, session_last_seen)
    WHERE submit_time IS NULL AND session_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_questions_exam
    ON questions (exam_id, id);

CREATE INDEX IF NOT EXISTS ix_proctoring_violations_attempt
    ON proctoring_violations (attempt_id, violation_type);
