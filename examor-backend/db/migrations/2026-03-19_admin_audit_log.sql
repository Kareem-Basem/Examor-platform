IF OBJECT_ID('dbo.admin_audit_logs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.admin_audit_logs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        admin_id INT NOT NULL,
        action_type NVARCHAR(100) NOT NULL,
        target_type NVARCHAR(100) NOT NULL,
        target_id INT NULL,
        details NVARCHAR(MAX) NULL,
        created_at DATETIME NOT NULL CONSTRAINT DF_admin_audit_logs_created_at DEFAULT (GETDATE())
    );
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_admin_audit_logs_created_at'
      AND object_id = OBJECT_ID('dbo.admin_audit_logs')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_admin_audit_logs_created_at
    ON dbo.admin_audit_logs (created_at DESC, admin_id);
END
GO
