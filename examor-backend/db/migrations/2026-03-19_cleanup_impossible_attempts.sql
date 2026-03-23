USE [examor_platform];
GO

BEGIN TRANSACTION;
GO

IF OBJECT_ID('tempdb..#ImpossibleAttempts') IS NOT NULL
    DROP TABLE #ImpossibleAttempts;
GO

SELECT ea.id
INTO #ImpossibleAttempts
FROM dbo.exam_attempts ea
JOIN dbo.exams e ON e.id = ea.exam_id
WHERE ea.start_time > GETDATE()
   OR (ea.submit_time IS NOT NULL AND ea.submit_time > GETDATE())
   OR (e.start_date IS NOT NULL AND ea.submit_time IS NOT NULL AND ea.submit_time < e.start_date);
GO

SELECT COUNT(*) AS impossible_attempts_count
FROM #ImpossibleAttempts;
GO

DELETE FROM dbo.proctoring_violations
WHERE attempt_id IN (SELECT id FROM #ImpossibleAttempts);
GO

DELETE FROM dbo.answers
WHERE attempt_id IN (SELECT id FROM #ImpossibleAttempts);
GO

DELETE FROM dbo.exam_attempts
WHERE id IN (SELECT id FROM #ImpossibleAttempts);
GO

COMMIT TRANSACTION;
GO
