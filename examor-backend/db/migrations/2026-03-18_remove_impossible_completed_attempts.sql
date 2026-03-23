USE [examor_platform];
GO

/*
  Removes impossible completed attempts:
  any submitted attempt recorded before the exam start time.
*/

DELETE pv
FROM dbo.proctoring_violations pv
JOIN dbo.exam_attempts ea ON ea.id = pv.attempt_id
JOIN dbo.exams e ON e.id = ea.exam_id
WHERE ea.submit_time IS NOT NULL
  AND e.start_date IS NOT NULL
  AND ea.submit_time < e.start_date;
GO

DELETE a
FROM dbo.answers a
JOIN dbo.exam_attempts ea ON ea.id = a.attempt_id
JOIN dbo.exams e ON e.id = ea.exam_id
WHERE ea.submit_time IS NOT NULL
  AND e.start_date IS NOT NULL
  AND ea.submit_time < e.start_date;
GO

DELETE ea
FROM dbo.exam_attempts ea
JOIN dbo.exams e ON e.id = ea.exam_id
WHERE ea.submit_time IS NOT NULL
  AND e.start_date IS NOT NULL
  AND ea.submit_time < e.start_date;
GO
