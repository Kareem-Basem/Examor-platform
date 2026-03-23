USE [examor_platform];
GO

IF COL_LENGTH('dbo.exam_attempts', 'forced_submit') IS NULL
BEGIN
    ALTER TABLE dbo.exam_attempts
    ADD forced_submit BIT NOT NULL
        CONSTRAINT DF_exam_attempts_forced_submit DEFAULT (0);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_answers_attempt_question'
      AND object_id = OBJECT_ID('dbo.answers')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_answers_attempt_question
        ON dbo.answers (attempt_id, question_id);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_exam_attempts_exam_student_submit'
      AND object_id = OBJECT_ID('dbo.exam_attempts')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_exam_attempts_exam_student_submit
        ON dbo.exam_attempts (exam_id, student_id, submit_time);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_proctoring_violations_attempt'
      AND object_id = OBJECT_ID('dbo.proctoring_violations')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_proctoring_violations_attempt
        ON dbo.proctoring_violations (attempt_id);
END;
GO
