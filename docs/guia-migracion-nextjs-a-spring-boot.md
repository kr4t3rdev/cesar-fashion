# Guía manual: API de Next.js a Spring Boot

Esta guía migra el backend sin apagar la tienda. Haz una fase completa, pruébala y súbela a Git antes de pasar a la siguiente.

## 0. Preparación

1. Crea un backup de PostgreSQL y restaura una copia local. Nunca apuntes el backend nuevo a producción durante el desarrollo.
2. Mantén Next.js, Prisma, NextAuth y las server actions funcionando. Son el rollback hasta finalizar la guía.
3. Instala Java 21 y Maven con Homebrew (macOS):

   ```bash
   brew install openjdk@21
   echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   brew install maven
   ```

   Verifica con `java -version` y `mvn -version`.

4. Instala el IDE. Se recomienda **IntelliJ IDEA Community** (`brew install --cask intellij-idea-ce`); también funciona VS Code con las extensiones *Extension Pack for Java* y *Spring Boot Extension Pack*.
5. Crea una app en Railway separada para el API. El frontend y backend se desplegarán como servicios distintos.

## 1. Crear el proyecto

Crea el proyecto en la raíz del repositorio como `cesar-fashion-api/` con Spring Initializr: Maven, Java 21, Spring Boot 3.4+, Web, Validation, Security, Data JPA, PostgreSQL, Flyway, Actuator y Testcontainers.

Si descargaste el ZIP en otro sitio, muévelo a la raíz y renómbralo para que coincida con la guía:

```bash
mv <ruta>/cesar_fashion_llc_api ./cesar-fashion-api
```

> **Atención**: Spring Initializr puede añadir Vaadin, GraphQL u OAuth2 server si no se eligen bien las opciones. El API REST solo necesita `web`, `validation`, `security`, `data jpa`, `postgresql`, `flyway`, `actuator` y `testcontainers`. Si aparece Vaadin, borra `src/main/frontend/` y quita `com.vaadin:*` del `pom.xml`. Usa una versión estable de Spring Boot (3.4.x).

Ábrelo con **File → Open** en IntelliJ (selecciona la carpeta `cesar-fashion-api`); el IDE detecta el `pom.xml` y descarga las dependencias automáticamente. En VS Code, selecciona la misma carpeta con "Open Folder".

Configura `application.properties` para la base local (usa variables de entorno con defaults locales, nunca datos productivos). Si el puerto 8080 está ocupado (p. ej. por VLC), define `server.port=${PORT:8081}`.

Organiza el código así:

```text
cesar-fashion-api/
  src/main/java/com/cesarfashion/api/
    domain/             # reglas, records y puertos
    application/        # casos de uso
    infrastructure/     # JPA, seguridad, archivos
    interfaces/rest/    # controllers, DTOs, errores
```

Configura `application-local.yml` con la copia local de PostgreSQL. Añade `DATABASE_URL`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS` y credenciales de archivos como variables de entorno, nunca al repositorio.

## 2. Conectar la base existente sin dañarla

1. Copia el esquema actual desde `prisma/schema.prisma`; no inventes columnas ni cambies IDs CUID.
2. Define entidades JPA con `String id`, `BigDecimal` para `price`, `salePrice`, `subtotal` y `total`, y `Instant`/`OffsetDateTime` para fechas.
3. Usa nombres explícitos con `@Table`, `@Column` y `@JoinColumn`; verifica `User`, `Product`, `Combo`, `ComboItem`, `Order`, `OrderItem` y `WholesaleSale`.
4. Ejecuta `flyway baseline` contra la copia. Mientras Prisma siga activo, Flyway no debe crear migraciones. No uses `ddl-auto=create` ni `update`.
5. Prueba que Spring puede listar productos, combos y pedidos históricos antes de escribir datos.
6. Para verificar la conexión, crea un endpoint de salud que consulte una tabla real, por ejemplo `GET /api/v1/health` con un `SELECT count(*) FROM "Product"`. Si la app arranca y responde, Flyway hizo el baseline correctamente.

## 3. Portar el dominio y casos de uso

Porta primero las reglas puras de los archivos actuales:

| Archivo actual | Destino Spring |
|---|---|
| `domain/product.ts` | `domain/product/Product.java` + reglas de oferta/precio |
| `domain/combo.ts` | `domain/combo/Combo.java` + disponibilidad |
| `domain/order.ts` | `domain/order/Order.java` + estados |
| `domain/user.ts` | enums `UserRole`, `UserStatus` |
| `domain/repositories.ts` | interfaces de puertos Java |
| `application/*-service.ts` | servicios `@Service` |

No portes `revalidatePath`: es responsabilidad del cliente HTTP. Conserva todas las validaciones relevantes como DTOs con `@NotBlank`, `@Positive`, `@Min`, `@Size` y validadores de clase cuando comparen campos como `salePrice < price`.

## 4. Implementar pedidos correctamente

Esta fase es crítica. El backend debe ignorar precio, subtotal y total recibidos del navegador: consulta productos/combos en PostgreSQL y calcula los importes en el servidor.

1. Marca el caso de uso `createOrder` y `setStatus(cancelled)` con `@Transactional`.
2. Al descontar stock, usa una actualización condicional (`stock >= cantidad`) o bloqueo pesimista. Nunca hagas solo “leer stock, luego escribir stock”.
3. Si cualquier producto no tiene stock, lanza un error de conflicto y revierte todo: stock, pedido e ítems.
4. Al cancelar un pedido pendiente, restituye los productos y cantidades de combos exactamente como `prisma-order-repository.ts`.
5. Cubre con Testcontainers dos pedidos concurrentes por el último artículo: solo uno puede completarse.

## 5. Crear REST y errores

Empieza por lectura pública para reducir riesgo:

```text
GET  /api/v1/products
GET  /api/v1/products/{id}
GET  /api/v1/combos
GET  /api/v1/combos/{id}
```

Después agrega mutaciones de staff y checkout. Documenta cada endpoint con `springdoc-openapi`; abre `/swagger-ui/index.html` y genera los tipos TypeScript para `src/lib/api/`.

Centraliza errores en `@RestControllerAdvice`: validación `400`, no encontrado `404`, no autenticado `401`, no autorizado `403`, stock/estado inválido `409`. Devuelve `ProblemDetail` y `fieldErrors` para que los formularios actuales puedan mostrar errores por campo.

Consejos probados en esta migración:
- Con `open-in-view=false`, las colecciones lazy (`Combo.items`, `items.product`) lanzan `LazyInitializationException`. Usa `@EntityGraph(attributePaths = {"items", "items.product"})` en los métodos de consulta del repositorio.
- `discountPercent` debe devolver `Integer` (`.intValue()`) para que el JSON salga como número entero igual que `Math.round` en TypeScript.
- En el `@RestControllerAdvice` genérico, añade `log.error(...)` con el stacktrace o los errores 500 quedarán silenciosos.

## 6. Migrar autenticación sin expulsar usuarios

El hash actual tiene forma `saltHex:hashHex` y fue generado con Node `scryptSync(password, salt, 64)`. BCrypt no puede validarlo directamente.

1. Implementa un `PasswordEncoder` que detecte ese formato, reproduzca scrypt con los mismos parámetros y compare en tiempo constante.
2. Si el login es válido con scrypt, guarda inmediatamente un hash BCrypt. Así el formato heredado desaparece gradualmente.
3. Rechaza login para `pending` y `disabled`; incluye `id`, `role` y `status` en las claims JWT necesarias.
4. Usa JWT corto en cookie `HttpOnly`, `Secure` en producción y `SameSite=Lax`. No guardes tokens en `localStorage`.
5. Protege mutaciones con Spring Security: `admin`/`gestor` administran; usuario activo crea pedidos.
6. Prueba tres cuentas reales de la copia: hash antiguo válido, BCrypt válido y cuenta pendiente.

## 7. Migrar el frontend módulo por módulo

1. Añade `NEXT_PUBLIC_API_URL` y un cliente en `src/lib/api/` que incluya `credentials: "include"`.
2. Migra catálogo y combos de lectura. Compara sus resultados con la UI anterior.
3. Migra productos, combos y mayoreo del panel. Solo cuando cada formulario funcione, elimina su server action correspondiente.
4. Migra checkout y pedidos. Conserva el carrito local; el API debe devolver la referencia y los errores de stock.
5. Reemplaza NextAuth con `/auth/login`, `/auth/logout` y `/auth/me`; adapta la protección de rutas en el frontend.
6. Deja la eliminación de `src/server/**`, `src/auth.ts`, Prisma y NextAuth para el final.

## 8. Archivos y despliegue

Puedes conservar URLs existentes de Uploadthing. Para nuevas cargas, escoge S3, Cloudflare R2 o MinIO y crea `POST /api/v1/uploads/images`, restringido a staff, con validación MIME y de tamaño.

En Railway, despliega Spring Boot como servicio separado. Define health check `/actuator/health`, URL pública de API, `CORS_ALLOWED_ORIGINS` con el dominio exacto del frontend, `JWT_SECRET` largo y único, y conexión PostgreSQL. Activa `Secure` en las cookies solo cuando ambos dominios usen HTTPS.

## 9. Cutover y limpieza

1. Ejecuta JUnit, Testcontainers, `npm run lint`, `npx tsc --noEmit`, build y Playwright.
2. Prueba manualmente: login heredado, registro, activación, rol cliente, rol gestor, creación/cancelación de pedido y recuperación de stock.
3. Despliega el API, mueve primero lecturas y luego una mutación por vez. Monitorea errores y discrepancias.
4. Cuando todos los módulos hayan estado estables, desactiva los fallbacks de Next.js.
5. Solo entonces pasa las migraciones futuras a Flyway, elimina Prisma, NextAuth, Uploadthing y `src/server/**`.

## Checklist de seguridad

- [ ] Headers HTTP: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` y `Strict-Transport-Security` (`max-age=31536000; includeSubDomains`) en todas las respuestas. Verifica con `curl -sI`. Spring activa HSTS solo por HTTPS: fuerza su emisión también en HTTP local con `.requestMatcher(AnyRequestMatcher.INSTANCE)`.
- [ ] Contraseñas y JWT nunca se registran en logs.
- [ ] CORS contiene solo los orígenes reales.
- [ ] Cookies: `HttpOnly`, `Secure` en producción, `SameSite=Lax`.
- [ ] El backend calcula precios y stock.
- [ ] Transacciones cubren pedido y ajuste de inventario.
- [ ] `ddl-auto` no modifica producción.
- [ ] Hay backup verificable y rollback funcional.
