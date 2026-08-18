# Tasks: Migrar la API a Spring Boot

## Phase 1: Preparación segura

- [ ] 1.1 Hacer backup de PostgreSQL y restaurarlo en una base local de pruebas.
- [ ] 1.2 Inventariar llamadas a `src/server/application/*-actions.ts` y accesos directos a servicios desde `src/app/**`.
- [ ] 1.3 Crear `cesar-fashion-api/` con Java 21, Maven, Actuator, Validation, Security, JPA, Flyway, PostgreSQL, OpenAPI y testcontainers.
- [ ] 1.4 Configurar perfiles `local`, `test` y `prod`; nunca versionar secretos ni la URL productiva.
- [ ] 1.5 Ejecutar Flyway baseline sobre la copia de la base; mantener Prisma como propietario de DDL.

## Phase 2: Dominio y persistencia

- [ ] 2.1 Portar `product.ts`, `combo.ts`, `order.ts`, `user.ts` y `wholesale.ts` a `domain/`, usando `BigDecimal` para dinero.
- [ ] 2.2 Portar `repositories.ts` a puertos Java y crear entidades JPA que mapeen exactamente `prisma/schema.prisma`.
- [ ] 2.3 Implementar adaptadores JPA para productos, combos y usuarios; probar lecturas contra datos existentes.
- [ ] 2.4 Implementar repositorio de pedidos con transacción y actualización de stock atómica; probar creación y cancelación concurrentes.
- [ ] 2.5 Portar las reglas de los servicios sin dependencias de `revalidatePath`.

## Phase 3: API y seguridad

- [x] 3.1 Crear DTOs validados, mapeadores y `@ControllerAdvice` con `ProblemDetail` y `fieldErrors`.
- [x] 3.2 Exponer endpoints de lectura para productos, ofertas, combos y pedidos según `design.md`.
- [x] 3.3 Implementar login, logout, `me`, JWT HttpOnly y autorización por `admin`, `gestor`, `usuario`.
- [x] 3.4 Implementar verificación Node scrypt y rehash BCrypt al login; probar ambos formatos.
- [x] 3.5 Headers de seguridad: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` y `Strict-Transport-Security` verificados con `curl -I` sobre HTTP y HTTPS.
- [x] 3.6 Exponer mutaciones de catálogo, pedidos, usuarios y mayoreo con autorización equivalente.
- [x] 3.7 Implementar carga de imágenes con proveedor elegido, límite MIME/tamaño y URL pública.

## Phase 4: Integración del frontend

- [x] 4.1 Crear `src/lib/api/` con cliente HTTP, tipos generados desde OpenAPI y `NEXT_PUBLIC_API_URL`.
- [x] 4.2 Migrar primero catálogo y combos de solo lectura; comparar visualmente y en pruebas E2E.
- [x] 4.3 Migrar formularios admin y checkout, sustituyendo cada server action por API antes de borrar su fallback.
- [x] 4.4 Sustituir NextAuth por login contra la API y adaptar guards de UI a `/auth/me`.
- [x] 4.5 Retirar fallbacks, `src/auth.ts`, `src/server/**`, Prisma y sus dependencias solo tras el cutover completo.

## Phase 5: Despliegue y verificación

- [x] 5.1 Configurar Railway con servicios independientes, health check `/actuator/health`, variables y CORS/cookies de producción.
- [ ] 5.2 Ejecutar JUnit, Testcontainers, `npm run lint`, `npx tsc --noEmit`, build y Playwright.
- [ ] 5.3 Verificar manualmente login de hash legado, roles, pedido, cancelación y recuperación de stock.
- [ ] 5.4 Monitorear errores, latencia y stock durante el despliegue gradual; conservar rollback hasta estabilizar.
