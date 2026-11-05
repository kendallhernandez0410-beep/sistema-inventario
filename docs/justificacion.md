# Justificación empresarial

## Tema

Sistema de inventario y proveedores para una pequeña o mediana empresa que
necesita centralizar el catálogo de productos y el control de existencias.

## Justificación

Cuando los productos, categorías y datos de proveedores se gestionan en hojas
separadas, se duplican registros y es difícil saber qué artículos están
disponibles o quién los suministra. El sistema relaciona cada producto con su
categoría y proveedor, y conserva la información en SQL Server para que el
equipo consulte una fuente de datos única.

En esta primera entrega, la API permite listar y registrar productos,
categorías y proveedores. El formulario de productos permite seleccionar
registros existentes; las claves foráneas evitan asociar un producto con una
categoría o proveedor inexistente. Esto prepara una base verificable para
agregar posteriormente movimientos de inventario, compras y reportes.

## Beneficio esperado

- Reducir errores de captura y duplicación de datos.
- Consultar existencias y relaciones de suministro desde una interfaz común.
- Mantener integridad referencial en la base de datos.
- Facilitar la ampliación del sistema con procesos empresariales posteriores.
