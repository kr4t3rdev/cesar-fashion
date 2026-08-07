# Accounts Specification

## Purpose

Define el ciclo de vida de las cuentas de cliente: registro público, activación manual por el administrador, reglas de inicio de sesión y control de acceso por rol. Extiende el dominio de usuarios existente (staff) con un rol de cliente (`usuario`).

## Requirements

### Requirement: Registro público de cliente

La aplicación MUST ofrecer una página y una server action pública de registro (`/register`) que permita a cualquier visitante crear una cuenta con nombre, email y contraseña.

La cuenta creada MUST tener rol `usuario` y status `pending` (inactiva). La acción de registro MUST validar los datos (email válido, contraseña de al menos 6 caracteres) y MUST NOT permitir duplicar emails: si el email ya existe, SHOULD devolver el mismo mensaje de éxito que en el flujo normal (evitar enumeración de cuentas).

#### Scenario: Registro exitoso

- GIVEN un visitante sin cuenta
- WHEN envía el formulario de registro con nombre, email válido y contraseña de al menos 6 caracteres
- THEN se crea la cuenta con rol `usuario` y status `pending`
- AND el visitante ve un mensaje de que su cuenta fue creada y debe esperar la activación del administrador

#### Scenario: Email ya registrado

- GIVEN un email que ya existe en el sistema
- WHEN el visitante intenta registrarse con ese email
- THEN la aplicación no crea una cuenta duplicada
- AND devuelve el mismo mensaje de éxito que el registro normal (no revela que la cuenta existe)

#### Scenario: Datos inválidos

- GIVEN un visitante envía un email mal formado o una contraseña menor a 6 caracteres
- WHEN se procesa el registro
- THEN la cuenta NO se crea
- AND se muestran los errores de validación por campo

### Requirement: Activación y gestión de cuentas por el administrador

El panel de administración MUST listar a todos los usuarios con su estado (`pending`, `active`, `disabled`) y MUST permitir al admin activar una cuenta pendiente o desactivar una activa. Los usuarios creados directamente por el admin MUST nacer con status `active`. Un usuario con rol `admin` MUST NOT poder desactivar o eliminar su propia cuenta.

#### Scenario: Activación de una cuenta pendiente

- GIVEN un usuario con rol `usuario` y status `pending`
- WHEN el admin activa la cuenta desde `/admin/usuarios`
- THEN el status pasa a `active`
- AND el cliente ya puede iniciar sesión y finalizar pedidos

#### Scenario: Desactivación de una cuenta activa

- GIVEN un usuario con rol `usuario` y status `active`
- WHEN el admin desactiva la cuenta
- THEN el status pasa a `disabled`
- AND el cliente deja de poder iniciar sesión y finalizar pedidos

#### Scenario: Usuario creado por el admin

- GIVEN un admin crea un usuario (staff o cliente) desde el panel
- WHEN se guarda
- THEN la cuenta nace con status `active` y puede iniciar sesión de inmediato

### Requirement: Restricción de acceso al panel admin por rol

La aplicación MUST restringir el acceso a `/admin/*` a usuarios con rol `admin` o `gestor`. Un usuario con rol `usuario` MUST NOT poder acceder al panel: al intentar entrar, la aplicación SHOULD redirigirlo a la tienda (`/`).

#### Scenario: Usuario cliente intenta acceder al panel

- GIVEN un usuario con rol `usuario` logueado
- WHEN visita `/admin`
- THEN la aplicación lo redirige a la tienda y no muestra datos del panel

#### Scenario: Staff accede al panel

- GIVEN un usuario con rol `admin` o `gestor` logueado
- WHEN visita `/admin`
- THEN la aplicación le permite acceder normalmente

### Requirement: Inicio de sesión solo para cuentas activas

La autenticación MUST permitir iniciar sesión únicamente a cuentas con status `active`. Una cuenta `pending` o `disabled` MUST NOT iniciar sesión, y la pantalla de login SHOULD mostrar un mensaje distinto para cuentas pendientes de activación ("Tu cuenta está pendiente de activación por el administrador") frente al error genérico de credenciales.

#### Scenario: Login de cuenta activa

- GIVEN una cuenta con status `active` y contraseña correcta
- WHEN el usuario inicia sesión
- THEN la sesión se crea con rol `usuario`, `gestor` o `admin` según corresponda
- AND un usuario `usuario` es redirigido a la tienda (no al panel)

#### Scenario: Login de cuenta pendiente

- GIVEN una cuenta con status `pending` y contraseña correcta
- WHEN el usuario intenta iniciar sesión
- THEN la sesión NO se crea
- AND se muestra el mensaje de cuenta pendiente de activación

#### Scenario: Login con contraseña incorrecta

- GIVEN cualquier cuenta
- WHEN el usuario ingresa una contraseña incorrecta
- THEN la sesión NO se crea
- AND se muestra el error genérico "Credenciales incorrectas"

### Requirement: Estado de la cuenta en sesión

La sesión de una cuenta MUST exponer su rol (`admin`, `gestor`, `usuario`). Las server actions que requieren ser cliente (checkout) SHOULD verificar rol y status de la cuenta contra la base de datos al momento de la acción, no solo el token.

#### Scenario: Sesión con rol de cliente

- GIVEN un usuario con rol `usuario` activo que inicia sesión
- WHEN la aplicación consulta la sesión
- THEN la sesión contiene el rol `usuario` y el id de la cuenta
