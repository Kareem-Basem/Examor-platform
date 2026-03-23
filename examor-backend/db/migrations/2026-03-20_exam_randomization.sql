USE [examor_platform];
GO

IF COL_LENGTH('dbo.exams', 'randomize_questions') IS NULL
BEGIN
    ALTER TABLE dbo.exams
    ADD randomize_questions BIT NOT NULL CONSTRAINT DF_exams_randomize_questions DEFAULT(0);
END
GO

IF COL_LENGTH('dbo.exams', 'randomize_options') IS NULL
BEGIN
    ALTER TABLE dbo.exams
    ADD randomize_options BIT NOT NULL CONSTRAINT DF_exams_randomize_options DEFAULT(0);
END
GO

IF COL_LENGTH('dbo.exam_attempts', 'question_order_json') IS NULL
BEGIN
    ALTER TABLE dbo.exam_attempts
    ADD question_order_json NVARCHAR(MAX) NULL;
END
GO

IF COL_LENGTH('dbo.exam_attempts', 'option_order_json') IS NULL
BEGIN
    ALTER TABLE dbo.exam_attempts
    ADD option_order_json NVARCHAR(MAX) NULL;
END
GO
