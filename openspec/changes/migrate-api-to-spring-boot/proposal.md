# Proposal: Migrar la API a Spring Boot

## Intent

Separar el backend del monolito Next.js y migrarlo gradualmente a Spring Boot, sin interrumpir la tienda ni perder los usuarios, pedidos, inventario o imágenes existentes.

## Scope

### In Scope

- Crear un servicio Spring Boot REST independiente en `cesar-fashion-api/`.
- Portar productos, combos, pedidos, usuarios, mayoreo, autenticación y cargas de imagen.
- Conservar PostgreSQL y el esquema existente durante el cutover.
- Cambiar el frontend Next.js de server actions a consumo HTTP progresivo.
- Documentar y probar la compatibilidad de contraseñas existentes.

### Out of Scope

- Rediseño visual o reescritura del frontend.
- Cambios funcionales de precios, stock, roles o checkout.
- Reescribir los datos existentes o cambiar identificadores CUID.

## Approach

Se creará el API en paralelo y se migrará por módulos. Spring Boot mantendrá una arquitectura hexagonal: `domain`, `application`, `infrastructure` e `interfaces/rest`. El frontend seguirá desplegado en Next.js y consumirá la nueva API mediante HTTP. Prisma conservará las migraciones hasta completar el cutover; Flyway se inicializará con una baseline del esquema productivo y asumirá las migraciones futuras.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `cesar-fashion-api/` | New | Servicio Spring Boot, REST, seguridad y persistencia. |
| `prisma/schema.prisma` | Modified later | Se congela durante la migración y se retira solo tras el cutover. |
| `src/server/**` | Modified/Removed later | Server actions y servicios reemplazados por cliente HTTP. |
| `src/auth.ts` | Modified later | NextAuth sustituido por token JWT emitido por Spring Boot. |
| `src/components/**` | Modified | Formularios y mutaciones consumen la API. |
| `railway.json` | Modified | Despliegue separado para frontend y backend. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hash `scrypt` de Node incompatible con BCrypt | High | Implementar un verificador temporal compatible y rehashear a BCrypt al primer login. |
| Venta duplicada o stock incorrecto | Medium | Transacciones de base de datos y pruebas de concurrencia para pedidos. |
| Diferencias entre Prisma y JPA | Medium | Probar contra una copia de datos y comparar respuestas por endpoint. |
| CORS/JWT rompe el frontend | Medium | Usar URL de API por entorno, allowlist explícita y pruebas E2E. |
| Corte de despliegue fallido | Low | Mantener NextAuth/server actions hasta que cada módulo esté validado. |

## Rollback Plan

El frontend conserva sus server actions y NextAuth hasta el último paso. Si un módulo de la API falla, su cliente vuelve temporalmente a la acción existente. No se aplicarán migraciones destructivas ni cambios de identificadores. Se puede apagar el servicio Spring Boot y mantener Next.js/Prisma como antes.

## Dependencies

- Java 21, Maven o Gradle y Spring Boot 3.4+.
- PostgreSQL accesible desde Railway y el entorno local.
- Almacenamiento de imágenes decidido antes de migrar Uploadthing.

## Success Criteria

- [ ] La API expone los flujos actuales con autenticación y autorización equivalentes.
- [ ] Usuarios existentes pueden iniciar sesión sin restablecer la contraseña.
- [ ] La creación y cancelación de pedidos mantiene el stock consistente.
- [ ] Next.js consume la API para todos los módulos sin server actions ni NextAuth.
- [ ] OpenAPI, pruebas y monitoreo cubren el servicio antes del cutover.
