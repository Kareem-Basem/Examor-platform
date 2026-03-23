USE [examor_platform];
GO

IF OBJECT_ID('dbo.faculties', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.faculties (
        id INT IDENTITY(1,1) PRIMARY KEY,
        branch_id INT NOT NULL,
        name NVARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL CONSTRAINT DF_faculties_created_at DEFAULT (GETDATE())
    );
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_faculties_branches'
)
BEGIN
    ALTER TABLE dbo.faculties
    ADD CONSTRAINT FK_faculties_branches
        FOREIGN KEY (branch_id) REFERENCES dbo.branches(id);
END
GO

IF COL_LENGTH('dbo.departments', 'faculty_id') IS NULL
BEGIN
    ALTER TABLE dbo.departments
    ADD faculty_id INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_departments_faculties'
)
BEGIN
    ALTER TABLE dbo.departments
    ADD CONSTRAINT FK_departments_faculties
        FOREIGN KEY (faculty_id) REFERENCES dbo.faculties(id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_faculties_branch_name'
      AND object_id = OBJECT_ID('dbo.faculties')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UX_faculties_branch_name
    ON dbo.faculties(branch_id, name);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_departments_faculty_id'
      AND object_id = OBJECT_ID('dbo.departments')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_departments_faculty_id
    ON dbo.departments(faculty_id, branch_id);
END
GO

;WITH branch_faculty_source AS (
    SELECT
        b.id AS branch_id,
        CASE
            WHEN u.name LIKE '%Sadat Academy%' THEN 'Faculty of Management Sciences'
            WHEN u.name LIKE '%Tebah Academy%' THEN 'Faculty of Computers and Information'
            WHEN u.name LIKE '%Assiut International College%' THEN 'Faculty of Computing and Artificial Intelligence'
            WHEN u.name LIKE '%Sphinx%' THEN 'General Faculty'
            ELSE 'General Faculty'
        END AS faculty_name
    FROM dbo.branches b
    JOIN dbo.universities u ON u.id = b.university_id
)
MERGE dbo.faculties AS target
USING branch_faculty_source AS source
ON target.branch_id = source.branch_id AND target.name = source.faculty_name
WHEN NOT MATCHED THEN
    INSERT (branch_id, name)
    VALUES (source.branch_id, source.faculty_name);
GO

UPDATE d
SET d.faculty_id = f.id
FROM dbo.departments d
JOIN dbo.faculties f ON f.branch_id = d.branch_id
WHERE d.faculty_id IS NULL;
GO
