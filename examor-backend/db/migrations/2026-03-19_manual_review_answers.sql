USE [examor_platform];
GO

IF COL_LENGTH('dbo.answers', 'awarded_marks') IS NULL
BEGIN
    ALTER TABLE dbo.answers
    ADD awarded_marks DECIMAL(10,2) NULL;
END
GO

IF COL_LENGTH('dbo.answers', 'review_feedback') IS NULL
BEGIN
    ALTER TABLE dbo.answers
    ADD review_feedback NVARCHAR(MAX) NULL;
END
GO

IF COL_LENGTH('dbo.answers', 'reviewed_by') IS NULL
BEGIN
    ALTER TABLE dbo.answers
    ADD reviewed_by INT NULL;
END
GO

IF COL_LENGTH('dbo.answers', 'reviewed_at') IS NULL
BEGIN
    ALTER TABLE dbo.answers
    ADD reviewed_at DATETIME NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_answers_reviewed_by_users'
)
BEGIN
    ALTER TABLE dbo.answers
    ADD CONSTRAINT FK_answers_reviewed_by_users
        FOREIGN KEY (reviewed_by) REFERENCES dbo.users(id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_answers_attempt_review'
      AND object_id = OBJECT_ID('dbo.answers')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_answers_attempt_review
    ON dbo.answers (attempt_id, question_id, reviewed_at);
END
GO
