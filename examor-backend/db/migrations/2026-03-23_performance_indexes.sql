IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_exam_attempts_exam_student'
      AND object_id = OBJECT_ID('dbo.exam_attempts')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_exam_attempts_exam_student
        ON dbo.exam_attempts (exam_id, student_id, submit_time);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_questions_exam'
      AND object_id = OBJECT_ID('dbo.questions')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_questions_exam
        ON dbo.questions (exam_id, id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_proctoring_violations_attempt'
      AND object_id = OBJECT_ID('dbo.proctoring_violations')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_proctoring_violations_attempt
        ON dbo.proctoring_violations (attempt_id, violation_type);
END
GO
