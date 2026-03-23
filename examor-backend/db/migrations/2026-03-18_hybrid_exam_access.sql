USE [examor_platform];
GO

IF COL_LENGTH('dbo.users', 'profile_mode') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD profile_mode NVARCHAR(20) NULL;
END;
GO

IF COL_LENGTH('dbo.exams', 'access_mode') IS NULL
BEGIN
    ALTER TABLE dbo.exams
    ADD access_mode NVARCHAR(20) NOT NULL
        CONSTRAINT DF_exams_access_mode DEFAULT ('department');
END;
GO

IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.exams')
      AND name = 'course_id'
      AND is_nullable = 0
)
BEGIN
    ALTER TABLE dbo.exams ALTER COLUMN course_id INT NULL;
END;
GO

UPDATE dbo.users
SET profile_mode = CASE
    WHEN role = 'teacher' AND department_id IS NULL THEN 'independent'
    WHEN role = 'teacher' THEN 'academic'
    ELSE profile_mode
END
WHERE profile_mode IS NULL;
GO

UPDATE dbo.exams
SET access_mode = CASE
    WHEN course_id IS NULL THEN 'link'
    ELSE 'department'
END
WHERE access_mode IS NULL
   OR access_mode = '';
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_users_profile_mode'
)
BEGIN
    ALTER TABLE dbo.users
    ADD CONSTRAINT CK_users_profile_mode
        CHECK (profile_mode IS NULL OR profile_mode IN ('academic', 'independent'));
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_exams_access_mode'
)
BEGIN
    ALTER TABLE dbo.exams
    ADD CONSTRAINT CK_exams_access_mode
        CHECK (access_mode IN ('department', 'link'));
END;
GO
