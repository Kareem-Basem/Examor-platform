/*
  Adds:
  - User session lock (single active login)
  - Academic verification metadata
  - Exam lifecycle / security controls
*/

IF COL_LENGTH('dbo.users', 'active_session_id') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD active_session_id NVARCHAR(128) NULL;
END
GO

IF COL_LENGTH('dbo.users', 'active_session_last_seen') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD active_session_last_seen DATETIME NULL;
END
GO

IF COL_LENGTH('dbo.users', 'academic_verified') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD academic_verified BIT NOT NULL
        CONSTRAINT DF_users_academic_verified DEFAULT (0);
END
GO

IF COL_LENGTH('dbo.users', 'academic_verified_by_admin_id') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD academic_verified_by_admin_id INT NULL;
END
GO

IF COL_LENGTH('dbo.users', 'academic_verified_at') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD academic_verified_at DATETIME NULL;
END
GO

IF COL_LENGTH('dbo.users', 'academic_email_confirmed') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD academic_email_confirmed BIT NOT NULL
        CONSTRAINT DF_users_academic_email_confirmed DEFAULT (0);
END
GO

IF COL_LENGTH('dbo.users', 'google_subject_id') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD google_subject_id NVARCHAR(255) NULL;
END
GO

IF COL_LENGTH('dbo.users', 'google_email') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD google_email NVARCHAR(255) NULL;
END
GO

IF COL_LENGTH('dbo.exams', 'proctoring_enabled') IS NULL
BEGIN
    ALTER TABLE dbo.exams
    ADD proctoring_enabled BIT NOT NULL
        CONSTRAINT DF_exams_proctoring_enabled DEFAULT (1);
END
GO

IF COL_LENGTH('dbo.exams', 'post_end_visibility_mode') IS NULL
BEGIN
    ALTER TABLE dbo.exams
    ADD post_end_visibility_mode NVARCHAR(20) NOT NULL
        CONSTRAINT DF_exams_post_end_visibility_mode DEFAULT ('hide');
END
GO

IF COL_LENGTH('dbo.exams', 'post_end_grace_minutes') IS NULL
BEGIN
    ALTER TABLE dbo.exams
    ADD post_end_grace_minutes INT NOT NULL
        CONSTRAINT DF_exams_post_end_grace_minutes DEFAULT (0);
END
GO

IF COL_LENGTH('dbo.exams', 'max_attempts_per_student') IS NULL
BEGIN
    ALTER TABLE dbo.exams
    ADD max_attempts_per_student INT NOT NULL
        CONSTRAINT DF_exams_max_attempts_per_student DEFAULT (1);
END
GO

IF COL_LENGTH('dbo.exams', 'allow_custom_exam_code') IS NULL
BEGIN
    ALTER TABLE dbo.exams
    ADD allow_custom_exam_code BIT NOT NULL
        CONSTRAINT DF_exams_allow_custom_exam_code DEFAULT (1);
END
GO

IF COL_LENGTH('dbo.exams', 'screen_capture_protection') IS NULL
BEGIN
    ALTER TABLE dbo.exams
    ADD screen_capture_protection BIT NOT NULL
        CONSTRAINT DF_exams_screen_capture_protection DEFAULT (0);
END
GO

IF COL_LENGTH('dbo.exams', 'is_demo_exam') IS NULL
BEGIN
    ALTER TABLE dbo.exams
    ADD is_demo_exam BIT NOT NULL
        CONSTRAINT DF_exams_is_demo_exam DEFAULT (0);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_exams_post_end_visibility_mode'
      AND parent_object_id = OBJECT_ID('dbo.exams')
)
BEGIN
    ALTER TABLE dbo.exams
    ADD CONSTRAINT CK_exams_post_end_visibility_mode
    CHECK (post_end_visibility_mode IN ('hide', 'archive'));
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_exams_post_end_grace_minutes'
      AND parent_object_id = OBJECT_ID('dbo.exams')
)
BEGIN
    ALTER TABLE dbo.exams
    ADD CONSTRAINT CK_exams_post_end_grace_minutes
    CHECK (post_end_grace_minutes >= 0 AND post_end_grace_minutes <= 43200);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_exams_max_attempts_per_student'
      AND parent_object_id = OBJECT_ID('dbo.exams')
)
BEGIN
    ALTER TABLE dbo.exams
    ADD CONSTRAINT CK_exams_max_attempts_per_student
    CHECK (max_attempts_per_student >= 1 AND max_attempts_per_student <= 20);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_users_academic_verified_by_admin'
      AND parent_object_id = OBJECT_ID('dbo.users')
)
BEGIN
    ALTER TABLE dbo.users
    ADD CONSTRAINT FK_users_academic_verified_by_admin
        FOREIGN KEY (academic_verified_by_admin_id) REFERENCES dbo.users(id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_users_active_session_id'
      AND object_id = OBJECT_ID('dbo.users')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_users_active_session_id
        ON dbo.users (active_session_id, active_session_last_seen)
        WHERE active_session_id IS NOT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_exams_lifecycle_flags'
      AND object_id = OBJECT_ID('dbo.exams')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_exams_lifecycle_flags
        ON dbo.exams (
            access_mode,
            is_demo_exam,
            post_end_visibility_mode,
            end_date,
            start_date
        );
END
GO
