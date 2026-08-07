# Cesar Fashion LLC — Producto

## Qué es
Tienda virtual de moda de Cesar Fashion LLC. Una boutique editorial online donde un administrador gestiona el inventario y los clientes compran piezas seleccionadas de alta calidad.

## Audiencia
- **Clientes**: personas que valoran la moda como declaración personal; compran ropa de calidad con curaduría. Idioma: español (mercado LATAM).
- **Administrador**: Cesar (propietario único) gestiona productos, stock, ofertas y precios desde un dashboard.

## Mecanismo central
Un catálogo curado de piezas de moda donde cada producto puede tener: categoría, precio, precio de oferta, stock, etiqueta de oferta y estado "destacado". El admin controla el inventario en tiempo real; los clientes navegan por catálogo y ofertas.

## Superficies
| Superficie | Modo | Trabajo del visitante |
|---|---|---|
| Home | Persuade | Entender la marca y llegar al catálogo/ofertas |
| Catálogo | Operate | Explorar el inventario completo |
| Ofertas | Operate | Ver piezas con descuento activo |
| Detalle de producto | Operate | Decidir sobre una pieza concreta |
| Login | Operate | Acceder al panel |
| Dashboard admin | Operate | Crear/editar/eliminar productos, toggle de oferta |

## Hechos comerciales
- Moneda: USD ($)
- El admin es único (credenciales en `.env`)
- Los precios de oferta deben ser menores al precio regular
- Un producto con stock 0 se muestra como "Agotado"

## Restricciones técnicas
- Next.js 16 (App Router), server actions, server-first, arquitectura hexagonal
- PostgreSQL + Prisma 7 (driver adapter pg)
- NextAuth v5 (credenciales, JWT)
- Tailwind CSS 4 + shadcn/ui (Base UI) + zod + lucide
