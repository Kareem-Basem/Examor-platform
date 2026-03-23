USE [examor_platform];
GO

IF COL_LENGTH('dbo.users', 'phone_number') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD phone_number NVARCHAR(30) NULL;
END
GO

IF COL_LENGTH('dbo.users', 'academic_year') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD academic_year NVARCHAR(100) NULL;
END
GO

IF COL_LENGTH('dbo.users', 'bio') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD bio NVARCHAR(MAX) NULL;
END
GO
