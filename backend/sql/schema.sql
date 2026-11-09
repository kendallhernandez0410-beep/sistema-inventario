/*
  Esquema de referencia para inventario_db.
  Ejecutar en la base de datos correcta desde SQL Server Management Studio.
  Solo crea tablas faltantes; no altera ni elimina tablas existentes.
*/

IF OBJECT_ID(N'dbo.categorias', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.categorias (
    categoria_id INT IDENTITY(1, 1) NOT NULL
      CONSTRAINT PK_categorias PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL
      CONSTRAINT UQ_categorias_nombre UNIQUE,
    descripcion NVARCHAR(255) NULL
  );
END;
GO

IF OBJECT_ID(N'dbo.proveedores', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.proveedores (
    proveedor_id INT IDENTITY(1, 1) NOT NULL
      CONSTRAINT PK_proveedores PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    contacto NVARCHAR(150) NULL,
    telefono NVARCHAR(30) NULL,
    email NVARCHAR(254) NULL
  );
END;
GO

IF OBJECT_ID(N'dbo.productos', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.productos (
    producto_id INT IDENTITY(1, 1) NOT NULL
      CONSTRAINT PK_productos PRIMARY KEY,
    sku NVARCHAR(50) NOT NULL
      CONSTRAINT UQ_productos_sku UNIQUE,
    nombre NVARCHAR(255) NOT NULL,
    precio DECIMAL(18, 2) NOT NULL
      CONSTRAINT CK_productos_precio_no_negativo CHECK (precio >= 0),
    stock INT NOT NULL
      CONSTRAINT CK_productos_stock_no_negativo CHECK (stock >= 0),
    categoria_id INT NULL,
    proveedor_id INT NULL,
    CONSTRAINT FK_productos_categorias
      FOREIGN KEY (categoria_id) REFERENCES dbo.categorias (categoria_id),
    CONSTRAINT FK_productos_proveedores
      FOREIGN KEY (proveedor_id) REFERENCES dbo.proveedores (proveedor_id)
  );
END;
GO

IF OBJECT_ID(N'dbo.usuarios', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.usuarios (
    usuario_id INT IDENTITY(1, 1) NOT NULL
      CONSTRAINT PK_usuarios PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    correo NVARCHAR(254) NOT NULL
      CONSTRAINT UQ_usuarios_correo UNIQUE,
    password_hash NVARCHAR(60) NOT NULL,
    rol NVARCHAR(20) NOT NULL
      CONSTRAINT DF_usuarios_rol DEFAULT N'usuario',
    creado_en DATETIME2(0) NOT NULL
      CONSTRAINT DF_usuarios_creado_en DEFAULT SYSUTCDATETIME()
  );
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
