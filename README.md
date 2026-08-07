# Cesar Fashion LLC

Tienda virtual de moda editorial. Catalogo curado con dashboard admin para gestionar productos, ofertas e inventario.

## Stack

- **Next.js 16** (App Router) — server actions, server-first
- **Arquitectura hexagonal** — `src/server/{domain,application,infrastructure}`
- **PostgreSQL + Prisma 7** (driver adapter pg)
- **NextAuth v5** — credenciales admin (JWT)
- **Tailwind CSS 4 + shadcn/ui** (Base UI) — estilo editorial (Playfair Display + Inter)
- **Zod** — validación de entrada

## Estructura

```
src/
├── app/                    # Rutas (tienda, admin, login, api/auth)
│   └── (shop)/             # Home, catálogo, ofertas, detalle producto
├── server/
│   ├── domain/             # Entidades puras, schemas zod, puertos
│   ├── application/        # Casos de uso + server actions
│   └── infrastructure/     # Adaptador Prisma
├── components/
│   ├── shop/               # Header, footer, tarjetas de producto
│   ├── admin/              # Form productos, tabla inventario
│   └── ui/                 # Componentes shadcn (Base UI)
├── auth.ts                 # Config NextAuth
└── proxy.ts                # Protección de rutas admin (Next 16)
```

## Setup

```bash
npm install
cp .env.example .env      # ajusta credenciales de BD y admin
npm run db:migrate        # crea esquema en PostgreSQL
npm run db:seed           # productos de ejemplo + admin
npm run dev               # http://localhost:3000
```

## Credenciales admin

| Campo | Valor (por defecto) |
|---|---|
| Email | `admin@cesarfashion.com` |
| Password | `admin1234` |

Configurables en `.env` con `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `start` | Build y producción |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Aplicar migraciones Prisma |
| `npm run db:seed` | Sembrar BD |
| `npm run db:studio` | Prisma Studio |
