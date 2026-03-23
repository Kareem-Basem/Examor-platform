USE [examor_platform];
GO

/*
  1) Closes stale open attempts that belong to exams which have not started yet
     or have already ended.
  2) Prevents multiple open attempts for the same student and exam.
*/

UPDATE ea
SET
    ea.submit_time = GETDATE(),
    ea.score = ISNULL(ea.score, 0),
    ea.forced_submit = 1
FROM dbo.exam_attempts ea
JOIN dbo.exams e ON e.id = ea.exam_id
WHERE ea.submit_time IS NULL
  AND (
      (e.start_date IS NOT NULL AND e.start_date > GETDATE())
      OR (e.end_date IS NOT NULL AND e.end_date < GETDATE())
  );
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_exam_attempts_open_attempt'
      AND object_id = OBJECT_ID('dbo.exam_attempts')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UX_exam_attempts_open_attempt
        ON dbo.exam_attempts (exam_id, student_id)
        WHERE submit_time IS NULL;
END;
GO
