USE [examor_platform];
GO

IF OBJECT_ID('dbo.question_bank', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.question_bank (
        id INT IDENTITY(1,1) PRIMARY KEY,
        doctor_id INT NOT NULL,
        question_text NVARCHAR(MAX) NOT NULL,
        question_type NVARCHAR(50) NOT NULL,
        marks INT NOT NULL,
        correct_answer NVARCHAR(MAX) NULL,
        created_at DATETIME NOT NULL CONSTRAINT DF_question_bank_created_at DEFAULT (GETDATE())
    );
END
GO

IF OBJECT_ID('dbo.question_bank_options', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.question_bank_options (
        id INT IDENTITY(1,1) PRIMARY KEY,
        bank_question_id INT NOT NULL,
        option_text NVARCHAR(MAX) NOT NULL,
        is_correct BIT NOT NULL CONSTRAINT DF_question_bank_options_is_correct DEFAULT (0)
    );
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_question_bank_doctor'
)
BEGIN
    ALTER TABLE dbo.question_bank
    ADD CONSTRAINT FK_question_bank_doctor
        FOREIGN KEY (doctor_id) REFERENCES dbo.users(id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_question_bank_options_bank_question'
)
BEGIN
    ALTER TABLE dbo.question_bank_options
    ADD CONSTRAINT FK_question_bank_options_bank_question
        FOREIGN KEY (bank_question_id) REFERENCES dbo.question_bank(id) ON DELETE CASCADE;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_question_bank_doctor_created'
      AND object_id = OBJECT_ID('dbo.question_bank')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_question_bank_doctor_created
    ON dbo.question_bank (doctor_id, created_at DESC, id DESC);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_question_bank_options_bank_question'
      AND object_id = OBJECT_ID('dbo.question_bank_options')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_question_bank_options_bank_question
    ON dbo.question_bank_options (bank_question_id, id);
END
GO
