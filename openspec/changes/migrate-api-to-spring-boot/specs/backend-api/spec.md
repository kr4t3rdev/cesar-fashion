# Backend API Specification

## Purpose

Definir el backend REST independiente que conserva el comportamiento actual de catálogo, inventario, cuentas y pedidos.

## Requirements

### Requirement: API REST versionada

El servicio MUST exponer recursos bajo `/api/v1`, respuestas JSON y documentación OpenAPI. Los errores de validación MUST incluir código, mensaje y errores por campo cuando existan.

#### Scenario: Validación inválida

- GIVEN una solicitud con un precio inválido
- WHEN se crea o actualiza un producto
- THEN la API responde `400 Bad Request`
- AND expone el error asociado a `price`

### Requirement: Autenticación compatible y segura

La API MUST autenticar credenciales activas y emitir un access token JWT. Durante la transición MUST validar el formato `salt:hash` de scrypt usado por Node y SHOULD rehashear a BCrypt tras un login exitoso. Cuentas `pending` o `disabled` MUST NOT recibir tokens.

#### Scenario: Usuario existente inicia sesión

- GIVEN un usuario activo con hash scrypt de la aplicación actual
- WHEN envía credenciales correctas a `/api/v1/auth/login`
- THEN recibe un JWT válido
- AND su contraseña queda actualizada a BCrypt de forma transparente

#### Scenario: Cuenta no activa

- GIVEN un usuario `pending` o `disabled`
- WHEN envía credenciales correctas
- THEN la API responde `403 Forbidden`
- AND no emite un token

### Requirement: Autorización por rol

La API MUST requerir JWT para mutaciones. Solo `admin` o `gestor` MAY administrar productos, combos, mayoreo, usuarios y estado de pedidos. Un usuario activo MAY crear sus propios pedidos.

#### Scenario: Cliente modifica un producto

- GIVEN un JWT de rol `usuario`
- WHEN solicita `POST /api/v1/products`
- THEN la API responde `403 Forbidden`

### Requirement: Pedido transaccional

La creación y cancelación de pedidos MUST comprobar y actualizar inventario dentro de una única transacción. La API MUST calcular precios y stock usando datos del servidor, nunca importes enviados por el cliente.

#### Scenario: Stock concurrente insuficiente

- GIVEN stock para una sola unidad
- WHEN dos pedidos simultáneos solicitan esa unidad
- THEN solo uno se confirma
- AND el otro responde `409 Conflict` sin crear pedido

### Requirement: Persistencia sin migración destructiva

El backend MUST leer y escribir el esquema PostgreSQL existente, incluyendo IDs CUID y registros históricos. Flyway MUST inicializar una baseline antes de que Spring gestione cambios de esquema.

#### Scenario: Consulta de pedido histórico

- GIVEN un pedido existente sin `customerId`
- WHEN un gestor lo consulta
- THEN la API devuelve el pedido correctamente
- AND el cliente asociado es nulo

### Requirement: Carga de imágenes

La API MUST validar la autorización de cargas y devolver una URL pública persistible en `imageUrl`. La migración SHOULD preservar las URLs de Uploadthing hasta que exista una migración explícita de archivos.

#### Scenario: Staff carga una imagen

- GIVEN un JWT de staff y un archivo de imagen permitido
- WHEN lo envía al endpoint de carga
- THEN la API devuelve una URL pública
- AND esa URL puede asignarse a un producto o combo
