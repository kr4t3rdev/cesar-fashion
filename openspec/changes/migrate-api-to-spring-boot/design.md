# Design: Migrar la API a Spring Boot

## Technical Approach

Crear `cesar-fashion-api/` como aplicación Java 21 y Spring Boot 3.4+, sin mover inicialmente el frontend. El servicio replica la arquitectura hexagonal actual y comparte la misma base PostgreSQL. La transición se hace por recurso: primero lecturas públicas, después mutaciones de catálogo, autenticación, pedidos, usuarios/mayoreo y cargas.

## Architecture Decisions

### Decision: Servicio separado y transición progresiva

**Choice**: Spring Boot en un directorio y despliegue independientes; Next.js continúa como frontend.
**Alternatives considered**: reemplazo total en un único corte; conservar Next.js como BFF.
**Rationale**: permite comparar módulos en producción y revertir sin detener ventas.

### Decision: Spring Data JPA con entidades de infraestructura

**Choice**: entidades JPA bajo `infrastructure/persistence/entity`, adaptadores que implementan ports del dominio.
**Alternatives considered**: exponer entidades JPA como dominio; JDBC/jOOQ.
**Rationale**: preserva el aislamiento actual entre dominio, aplicación y almacenamiento, y reduce el código SQL manual.

### Decision: Flyway baseline antes de gestionar DDL

**Choice**: `baseline-on-migrate=true` contra el esquema existente; Prisma conserva propiedad de migraciones hasta el cutover.
**Alternatives considered**: regenerar el esquema con Hibernate; ejecutar Prisma y Flyway simultáneamente.
**Rationale**: evita eliminar datos o que dos herramientas compitan por el historial de migración.

### Decision: Migración transparente de hashes

**Choice**: `PasswordEncoder` compuesto: detecta `salt:hash`, verifica con scrypt compatible y reemplaza con BCrypt al autenticar.
**Alternatives considered**: reseteo masivo; mantener scrypt indefinidamente.
**Rationale**: protege el acceso existente y permite retirar el formato legado al finalizar la transición.

### Decision: JWT de corta duración en cookie HttpOnly

**Choice**: access token firmado por Spring, SameSite=Lax, Secure en producción; Next.js lo reenvía en peticiones same-site.
**Alternatives considered**: token en localStorage; sesiones compartidas de NextAuth.
**Rationale**: evita XSS sobre el token y elimina acoplamiento con NextAuth.

### Decision: Headers de seguridad en Spring Security

**Choice**: activar en el filtro de Spring Security `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` y `Strict-Transport-Security` (max-age 31536000, includeSubDomains) para todas las respuestas, incluso sobre HTTP en desarrollo.
**Alternatives considered**: depender de los defaults de Spring (HSTS solo por HTTPS); reverse proxy CDN.
**Rationale**: cumplir la auditoría de cabeceras del usuario; forzar HSTS con `requestMatcher(AnyRequestMatcher.INSTANCE)` para que responda también sobre HTTP local.

## Data Flow

```text
Next.js client/server component
  -> HTTP /api/v1 + cookie JWT
  -> Spring Security
  -> REST controller -> application service -> domain port
  -> JPA adapter -> PostgreSQL
  <- DTO / ProblemDetail JSON
```

Para pedidos, el servicio abre una transacción, bloquea o decrementa inventario de forma condicional, crea `Order` y `OrderItem`, y confirma todo o hace rollback.

## Interfaces / Contracts

| Resource | Endpoints | Authorization |
|---|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Public / authenticated |
| Products | `GET /products`, `GET /products/{id}`, `POST`, `PUT`, `DELETE`, `PATCH /{id}/sale` | GET public; write staff |
| Combos | `GET /combos`, `GET /combos/{id}`, `POST`, `PUT`, `DELETE`, `PATCH /{id}/active` | GET public; write staff |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/{id}`, `PATCH /orders/{id}/status` | create active user; read/status staff |
| Users | `POST /auth/register`, `GET /users`, `POST /users`, `PUT /users/{id}`, `PATCH /users/{id}/status` | register public; admin otherwise |
| Wholesale | `GET /wholesale/products`, `POST /wholesale/declarations`, `DELETE /wholesale/declarations/{id}` | staff |
| Uploads | `POST /uploads/images` | staff |

Los DTOs usan `BigDecimal` serializado como número JSON y fechas ISO-8601. El error común es RFC 9457 `ProblemDetail`, con extensión `fieldErrors`.

## File Changes

| File | Action | Description |
|---|---|---|
| `cesar-fashion-api/pom.xml` | Create | Dependencias, Java 21 y plugins. |
| `cesar-fashion-api/src/main/java/**/domain/**` | Create | Records, reglas y puertos portados de `src/server/domain`. |
| `cesar-fashion-api/src/main/java/**/application/**` | Create | Servicios de casos de uso. |
| `cesar-fashion-api/src/main/java/**/infrastructure/**` | Create | JPA, Flyway, JWT y almacenamiento. |
| `cesar-fashion-api/src/main/java/**/interfaces/rest/**` | Create | Controllers, DTOs y manejo de errores. |
| `cesar-fashion-api/src/test/**` | Create | Pruebas unitarias e integración. |
| `src/lib/api/**` | Create later | Cliente tipado del frontend. |
| `src/server/application/*-actions.ts` | Remove later | Sustituidas tras el cutover por llamadas HTTP. |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | precios, descuentos, roles, validaciones | JUnit 5 parametrizado |
| Integration | JPA, JWT, hashes y transacciones | Testcontainers PostgreSQL + MockMvc |
| E2E | login, catálogo, checkout, cancelación | Playwright contra frontend y API |

## Migration / Rollout

1. Crear API y baseline sobre una copia de PostgreSQL.
2. Validar endpoints de lectura y mover el frontend a ellos.
3. Migrar una mutación por vez; comparar datos y mantener fallback temporal.
4. Migrar auth; retirar NextAuth solo cuando todos los usuarios existentes hayan sido probados.
5. Transferir propiedad de DDL a Flyway, eliminar Prisma/server actions y retirar fallbacks.

## Open Questions

- [ ] Elegir S3, Cloudflare R2, MinIO o conservar Uploadthing temporalmente para archivos.
- [ ] Confirmar dominio final para cookies y allowlist CORS en Railway.
