# Proposal: Cuentas de clientes con activación (rol "usuario")

## Intent

Permitir la venta al detalle por clientes finales: cualquier persona puede registrarse desde la tienda (rol `usuario`, cuenta inactiva por defecto), el administrador activa la cuenta desde el panel, y solo las cuentas activas pueden finalizar pedidos. Los visitantes sin cuenta pueden armar el carrito libremente, pero al llegar al checkout se les solicita crear una cuenta.

## Problem / Opportunity

- Hoy no existe registro público: todos los usuarios del sistema son staff (`admin` / `gestor`) creados por el admin.
- El checkout actual (`createOrderAction`) es público: cualquiera puede crear un pedido sin identificarse, lo que impide saber quién compra.
- Se necesita un rol de cliente con cuenta **activa** para poder pedir, con activación manual por el administrador (sin verificación por email).

## Goals

1. Registro público de clientes con rol `usuario` y cuenta **inactiva** por defecto.
2. Activación y desactivación de cuentas desde el panel de administración.
3. Solo cuentas **activas** (rol `usuario`) — o staff (`admin`/`gestor`) — pueden finalizar pedidos.
4. Los visitantes sin cuenta pueden agregar al carrito; el checkout los envía a registrarse.
5. El login bloquea cuentas inactivas con mensaje claro.
6. Cada pedido queda asociado a la cuenta que lo realizó (`customerId`).

## Non-Goals

- Verificación por email (la activación es manual del admin).
- Pasarela de pago online (se mantiene el flujo de pago manual actual).
- Historial de pedidos visible para el cliente (queda para una iteración futura).
- Roles con permisos granulares más allá de `admin` / `gestor` / `usuario`.

## Approach

- Agregar campo `status` al modelo `User` con valores `pending | active | disabled`, por defecto `pending`.
- Agregar rol `usuario` a `USER_ROLES`.
- Nuevo server action público `registerAction` (nombre, email, contraseña) que crea la cuenta en `pending`.
- `authorize()` de NextAuth rechaza cuentas con status distinto de `active`; el login distingue el mensaje de "pendiente de activación".
- `createOrderAction` exige una sesión de cuenta activa (usuario activo o staff) y registra `customerId`.
- El checkout muestra una puerta de acceso cuando no hay sesión: "Crear cuenta" (→ `/register`) e "Iniciar sesión" (→ `/login`), conservando el carrito.
- Panel `/admin/usuarios`: columna de estado + acción "Activar"/"Desactivar"; los usuarios creados por el admin nacen activos.
- El header muestra opción de salir para cuentas de cliente logueadas.

## Affected Areas

- `prisma/schema.prisma` (User.status, Order.customerId)
- `src/server/domain/user.ts`, `user-schema.ts`
- `src/server/infrastructure/prisma-user-repository.ts`, `prisma-order-repository.ts`
- `src/server/application/user-service.ts`, `user-actions.ts`, `order-service.ts`, `order-actions.ts`, `roles.ts`
- `src/auth.ts` (authorize), `src/auth.config.ts` (middleware redirect)
- `src/app/login/`, `src/app/(shop)/checkout/`, `src/app/(shop)/layout.tsx` (header)
- `src/app/admin/usuarios/`, `src/components/admin/users-table.tsx`
- Nuevo: `src/app/register/`, `src/components/auth/register-form.tsx`, `src/components/shop/checkout-gate.tsx`

## Risks

- **Enumeración de emails**: un endpoint público de registro podría revelar qué emails existen. Mitigación: la acción de registro devuelve el mismo mensaje de éxito si el email ya existe (no informa si la cuenta ya está registrada).
- **Cuentas inactivas bloqueando ventas**: si un cliente se registra y el admin no activa a tiempo, no puede comprar. Mitigación: el mensaje post-registro y el login indican que debe esperar la activación; el panel marca las pendientes claramente.
- **Backward compatibility**: pedidos existentes sin `customerId` siguen siendo válidos (`customerId` nullable).

## Rollback Plan

- Migración reversible: quitar `User.status` y `Order.customerId` (drop column), volver `createOrderAction` a público.
- Ninguna tabla existente se destruye; solo columnas nuevas y un rol nuevo.
