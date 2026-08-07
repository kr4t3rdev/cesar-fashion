# Checkout Specification

## Purpose

Define la regla de acceso al cierre del pedido: solo cuentas activas pueden finalizar pedidos, los visitantes sin cuenta llegan a una puerta de registro, y cada pedido queda asociado a la cuenta que lo realiza.

## Requirements

### Requirement: Carrito libre para invitados

Cualquier visitante, con o sin cuenta, MUST poder agregar productos y combos al carrito desde las tarjetas y las páginas de detalle, y gestionar su carrito (cantidades, eliminación) sin necesidad de iniciar sesión.

#### Scenario: Invitado arma el carrito

- GIVEN un visitante sin sesión
- WHEN agrega productos o combos al carrito
- THEN los ítems se acumulan en el carrito (localStorage)
- AND el visitante puede seguir navegando y ajustar cantidades sin iniciar sesión

### Requirement: Puerta de acceso en el checkout

Cuando un visitante sin sesión accede a `/checkout`, la aplicación MUST mostrar una puerta de acceso en lugar del formulario de pedido, con dos opciones: "Crear cuenta" (que lleva a `/register`) e "Iniciar sesión" (que lleva a `/login`). El carrito del visitante MUST conservarse a través de este flujo (persistencia en localStorage). Si el visitante decide registrarse y su cuenta queda pendiente de activación, SHOULD ver un mensaje indicando que debe esperar la activación antes de pedir.

#### Scenario: Invitado llega al checkout

- GIVEN un visitante sin sesión con ítems en el carrito
- WHEN visita `/checkout`
- THEN NO ve el formulario de pedido
- AND ve la puerta de acceso con "Crear cuenta" e "Iniciar sesión"
- AND el carrito permanece intacto

#### Scenario: Invitado se registra desde la puerta

- GIVEN un visitante en la puerta de acceso del checkout
- WHEN hace clic en "Crear cuenta" y completa el registro
- THEN su cuenta queda `pending`
- AND se le indica que debe esperar la activación del administrador antes de finalizar el pedido

#### Scenario: Cuenta pendiente intenta checkout

- GIVEN un usuario logueado con rol `usuario` y status `pending` o `disabled`
- WHEN visita `/checkout` o intenta finalizar el pedido
- THEN NO puede crear el pedido
- AND se le muestra que su cuenta está pendiente de activación

### Requirement: Finalizar pedido solo con cuenta activa

La server action `createOrderAction` MUST exigir una sesión válida de una cuenta activa (rol `usuario` con status `active`, o staff `admin`/`gestor`). Si no hay sesión, MUST devolver un resultado con código `UNAUTHENTICATED`. Si la sesión existe pero la cuenta está `pending`/`disabled`, MUST devolver código `INACTIVE`. Cuando la acción es permitida, el pedido MUST quedar asociado a la cuenta (`customerId`) y MUST aplicar todas las reglas existentes (stock, precios, descuentos).

#### Scenario: Cliente activo finaliza el pedido

- GIVEN un usuario con rol `usuario` y status `active`, con ítems en el carrito y datos de contacto válidos
- WHEN confirma el pedido
- THEN se crea el pedido con status `pending` y `customerId` = id de la cuenta
- AND se descuenta el stock y se muestra la referencia del pedido

#### Scenario: Staff finaliza el pedido

- GIVEN un usuario con rol `admin` o `gestor` logueado
- WHEN confirma un pedido desde el checkout
- THEN el pedido se crea normalmente con `customerId` = id del staff

#### Scenario: Sin sesión al confirmar

- GIVEN un visitante sin sesión en el checkout
- WHEN intenta ejecutar la acción de crear pedido
- THEN la acción devuelve `UNAUTHENTICATED`
- AND la UI lo dirige a la puerta de acceso (registro/login)

#### Scenario: Sesión caducada o cuenta desactivada entremedio

- GIVEN un usuario cuya cuenta fue desactivada mientras tenía una sesión activa
- WHEN intenta finalizar el pedido
- THEN la acción verifica el estado real en base de datos
- AND devuelve `INACTIVE`, impidiendo la venta

### Requirement: Asociación del pedido a la cuenta

El modelo `Order` MUST almacenar `customerId` (referencia opcional al `User` que realizó el pedido). Los pedidos existentes sin `customerId` MUST seguir funcionando y mostrarse en el panel sin cliente asociado.

#### Scenario: Pedido con cliente asociado

- GIVEN un pedido creado por una cuenta activa
- WHEN se consulta el pedido en el panel admin
- THEN se muestra el nombre/email del cliente asociado si existe

#### Scenario: Pedido sin cliente (legado)

- GIVEN un pedido existente creado antes de este cambio
- WHEN se consulta el pedido en el panel admin
- THEN el pedido se muestra correctamente con cliente "—" cuando `customerId` es nulo
