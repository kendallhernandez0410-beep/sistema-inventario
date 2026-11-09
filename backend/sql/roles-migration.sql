/*
  Ejecutar una vez en inventario_db antes de iniciar la API con roles.
  Los usuarios existentes conservan sus cuentas y reciben el rol usuario.
*/
IF OBJECT_ID(N'dbo.usuarios', N'U') IS NULL
BEGIN
  THROW 50001, 'No existe dbo.usuarios. Ejecuta primero schema.sql.', 1;
END;
GO

IF COL_LENGTH(N'dbo.usuarios', N'rol') IS NULL
BEGIN
  ALTER TABLE dbo.usuarios
    ADD rol NVARCHAR(20) NOT NULL
      CONSTRAINT DF_usuarios_rol DEFAULT N'usuario' WITH VALUES;
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = N'CK_usuarios_rol'
    AND parent_object_id = OBJECT_ID(N'dbo.usuarios')
)
BEGIN
  ALTER TABLE dbo.usuarios
    ADD CONSTRAINT CK_usuarios_rol CHECK (rol IN (N'usuario', N'admin'));
END;
GO
