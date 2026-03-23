USE [examor_platform];
GO

IF COL_LENGTH('dbo.questions', 'question_order') IS NULL
BEGIN
    ALTER TABLE dbo.questions
    ADD question_order INT NULL;
END
GO

;WITH ordered AS (
    SELECT
        q.id,
        ROW_NUMBER() OVER (PARTITION BY q.exam_id ORDER BY q.id) AS next_order
    FROM dbo.questions q
)
UPDATE q
SET question_order = o.next_order
FROM dbo.questions q
JOIN ordered o ON o.id = q.id
WHERE q.question_order IS NULL;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_questions_exam_order'
      AND object_id = OBJECT_ID('dbo.questions')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_questions_exam_order
    ON dbo.questions (exam_id, question_order, id);
END
GO
