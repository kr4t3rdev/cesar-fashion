# Tasks: Cuentas de clientes con activación (rol "usuario")

## Phase 1: Fundación / Infraestructura

- [x] 1.1 Agregar `status String @default("pending")` al modelo `User` y `customerId String?` con relación a `User` en el modelo `Order` (schema.prisma) y crear migración `add_user_status_orders_customer`.
- [x] 1.2 Actualizar `src/server/domain/user.ts`: `USER_ROLES = ["admin", "gestor", "usuario"]`, tipos `UserStatus` (`pending | active | disabled`) y `USER_STATUSES`, incluir `status` en `UserEntity`/`UserInput`, y helper `isUserStatus`.
- [x] 1.3 Actualizar `src/server/domain/user-schema.ts`: incluir `usuario` en el enum de rol del schema admin y agregar `userStatusSchema` (enum de estados). Crear `src/server/domain/register-schema.ts` con `registerInputSchema` (nombre, email, contraseña ≥6).
- [x] 1.4 Actualizar `UserRepositoryPort` y `PrismaUserRepository`: leer/escribir `status` en `toEntity`, `create` y `update`; agregar `findByEmailWithStatus` (o reutilizar `findByEmail` exponiendo status).
- [x] 1.5 Actualizar `OrderRepositoryPort` y `PrismaOrderRepository`: aceptar y persistir `customerId` en `createOrder`; exponer `customerName`/`customerEmail` del `User` en `OrderEntity` (join).

## Phase 2: Autenticación y cuentas

- [x] 2.1 Agregar `registerUser` al `user-service.ts` (público): valida, rechaza duplicados con mensaje genérico de éxito (anti-enumeración), crea usuario rol `usuario` + status `pending`, hashea contraseña.
- [x] 2.2 Crear `registerAction` (server action pública) en `src/server/application/register-actions.ts` con `registerInputSchema`.
- [x] 2.3 Actualizar `authorize()` en `src/auth.ts`: rechazar cuentas con status distinto de `active` (login falla). Agregar al token/sesión el `status` (opcional) para la UI.
- [x] 2.4 Actualizar `login-form.tsx`: tras un signIn fallido, consultar si el email existe con status `pending`/`disabled` y mostrar mensaje distinto ("Tu cuenta está pendiente de activación por el administrador").
- [x] 2.5 Actualizar `roles.ts`: helpers `isActiveUser(session)`, `canOrder(session)`, `isStaff(session)`.
- [x] 2.6 Actualizar `createUser` (admin) en `user-service.ts` para que las cuentas creadas por el admin nazcan `status: active`; `updateUser` acepta `status`.
- [x] 2.7 Agregar `setUserStatusAction` en `user-actions.ts` (solo admin) para activar/desactivar cuentas.
- [x] 2.8 Actualizar `auth.config.ts` (middleware `authorized`): si el usuario está logueado y NO es staff, redirigir `/admin/*` a `/`; y en `src/app/admin/layout.tsx` redirigir rol `usuario` a `/`.

## Phase 3: UI de registro y gestión admin

- [x] 3.1 Crear página `src/app/register/page.tsx` y `src/components/auth/register-form.tsx` (nombre, email, contraseña) con estado de éxito post-registro: "Cuenta creada. Espera la activación del administrador".
- [x] 3.2 Actualizar `src/components/admin/users-table.tsx`: columna de estado (badge Pendiente/Activo/Deshabilitado), badge de rol `usuario`, y botón Activar/Desactivar (usa `setUserStatusAction`).
- [x] 3.3 Actualizar `src/app/admin/usuarios/page.tsx` y `user-form.tsx`: incluir rol `usuario` en el selector de rol del admin.
- [x] 3.4 Actualizar `src/app/login/page.tsx` con link a `/register` ("¿No tienes cuenta? Crea una").

## Phase 4: Cierre del pedido (checkout gate)

- [x] 4.1 Actualizar `order-service.ts` y `createOrderAction`: exigir sesión de cuenta activa; devolver `{ code: "UNAUTHENTICATED" | "INACTIVE" }`; guardar `customerId`; verificar status contra BD.
- [x] 4.2 Actualizar `order-schema.ts`/`order.ts`: `OrderCreateInput` y `OrderEntity` incluyen `customerId` y datos del cliente.
- [x] 4.3 Crear `src/components/shop/checkout-gate.tsx` (puerta de acceso con "Crear cuenta" → `/register` e "Iniciar sesión" → `/login`) y mostrarla en `src/app/(shop)/checkout/page.tsx` cuando no hay sesión activa.
- [x] 4.4 Actualizar `checkout-form.tsx` para manejar códigos `UNAUTHENTICATED`/`INACTIVE` de la acción (mostrar puerta o mensaje de activación).
- [x] 4.5 Actualizar `src/components/shop/site-header.tsx`: para rol `usuario` logueado mostrar botón de salir (signOut) en vez de "Iniciar sesión".
- [x] 4.6 Actualizar `src/components/admin/orders-table.tsx` para mostrar cliente (`customerName`/`customerEmail`) del pedido.

## Phase 5: Verificación

- [x] 5.1 Correr `npm run lint` y `npx tsc --noEmit`; corregir errores.
- [x] 5.2 Verificar contra escenarios del spec: registro exitoso / email duplicado / datos inválidos (accounts).
- [x] 5.3 Verificar escenarios de activación: admin activa → cliente loguea y pide; desactivación bloquea (accounts + checkout).
- [x] 5.4 Verificar checkout gate: invitado arma carrito, ve puerta, se registra, no puede pedir hasta activación; cuenta activa pide y `customerId` queda en BD.
- [x] 5.5 Verificar restricción de acceso: `usuario` no accede a `/admin`; staff sí.
- [x] 5.6 Correr `npm run build` y prueba E2E con Playwright del flujo completo (registro → login pendiente → activación admin → checkout → pedido).
