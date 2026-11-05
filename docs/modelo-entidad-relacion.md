# Diagrama entidad-relación

```mermaid
erDiagram
    CATEGORIAS ||--o{ PRODUCTOS : clasifica
    PROVEEDORES ||--o{ PRODUCTOS : suministra

    USUARIOS {
        int usuario_id PK
        string nombre
        string correo UK
        string password_hash
        datetime creado_en
    }

    CATEGORIAS {
        int categoria_id PK
        string nombre UK
        string descripcion
    }

    PROVEEDORES {
        int proveedor_id PK
        string nombre
        string contacto
        string telefono
        string email
    }

    PRODUCTOS {
        int producto_id PK
        string sku UK
        string nombre
        decimal precio
        int stock
        int categoria_id FK
        int proveedor_id FK
    }
```

Las cuentas de usuario son independientes del catálogo y almacenan únicamente
el hash de la contraseña.

Cada producto puede pertenecer a cero o una categoría y tener cero o un
proveedor asignado. Una categoría o un proveedor puede relacionarse con muchos
productos. Las relaciones son opcionales para permitir capturar el producto
antes de completar su clasificación o asignación.

El script de referencia está en [`backend/sql/schema.sql`](../backend/sql/schema.sql).
Solo crea tablas que no existan; revisa las tablas actuales antes de ejecutarlo,
ya que no modifica columnas ni agrega claves foráneas a tablas preexistentes.
