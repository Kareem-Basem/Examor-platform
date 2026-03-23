IF COL_LENGTH('dbo.users', 'is_active') IS NULL
BEGIN
    ALTER TABLE dbo.users
    ADD is_active BIT NOT NULL CONSTRAINT DF_users_is_active DEFAULT (1);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_users_is_active'
      AND object_id = OBJECT_ID('dbo.users')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_users_is_active
    ON dbo.users (is_active, role);
END
GO
