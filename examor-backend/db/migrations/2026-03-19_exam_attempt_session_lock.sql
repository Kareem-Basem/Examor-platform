USE [examor_platform];
GO

IF COL_LENGTH('dbo.exam_attempts', 'session_token') IS NULL
BEGIN
    ALTER TABLE dbo.exam_attempts
    ADD session_token NVARCHAR(128) NULL;
END
GO

IF COL_LENGTH('dbo.exam_attempts', 'session_last_seen') IS NULL
BEGIN
    ALTER TABLE dbo.exam_attempts
    ADD session_last_seen DATETIME NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_exam_attempts_session_token'
      AND object_id = OBJECT_ID('dbo.exam_attempts')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_exam_attempts_session_token
    ON dbo.exam_attempts (session_token, session_last_seen)
    WHERE submit_time IS NULL AND session_token IS NOT NULL;
END
GO
