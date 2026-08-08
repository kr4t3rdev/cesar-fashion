# Cesar Fashion LLC — Design System

## Mundo visual
**Editorial moderna con acento bordeaux.** La tienda se lee como una publicación de moda: marfil cálido de fondo, tinta casi negra para el texto, tipografía display serif (Playfair Display) para titulares y grotesca (Inter) para UI. El acento oxblood (rojo vino) funciona como el toque editorial — aparece en ofertas, enlaces activos y momentos de marca.

## Token de color
Paleta OKLCH (tema claro y oscuro):

| Token | Claro | Rol |
|---|---|---|
| `--background` | oklch(0.985 0.005 85) — marfil | Fondo base |
| `--foreground` | oklch(0.19 0.015 260) — tinta | Texto principal |
| `--primary` | oklch(0.19 0.015 260) | Botones/acentos de marca |
| `--accent` | oklch(0.5 0.13 25) — oxblood | Ofertas, énfasis editorial |
| `--accent-strong` | oklch(0.5 0.13 25) · dark: oklch(0.74 0.12 25) | Acento de texto pequeño (marca) — AA en modo oscuro |
| `--muted` | oklch(0.945 0.01 85) | Fondos secundarios |
| `--destructive` | oklch(0.55 0.2 25) | Errores/eliminar |

El acento alcanza ~5.6:1 de contraste sobre el fondo (cumple WCAG AA).

## Tipografía
- **Display**: Playfair Display (`--font-display`) — titulares, marca, headings. Italic reservado para la palabra de énfasis en el hero ("intención").
- **UI/Texto**: Inter (`--font-sans`) — cuerpo, navegación, UI.
- **Mono**: system stack — nunca usado en el UI (reservado).

## Espaciado y ritmo
- Ritmo base de 4px (Tailwind), secciones separadas por `gap-20` (80px) en la home.
- Más espacio arriba que abajo de cada heading.
- Radios: `--radius: 0.75rem` (12px) para tarjetas y modales.

## Componentes
- **Botones**: rectos (`rounded-md`), primario tinta sobre marfil; secundario outline. Sin sombras dramáticas (`shadow-xs`).
- **Tarjetas de producto**: aspect 4:5, borde sutil, hover con sombra `lg` y zoom 5% de la imagen. Badges de oferta en acento.
- **Tabla admin**: cabecera muted, filas con hover, badges de estado.
- **Formularios**: inputs rectos con focus ring, switches para oferta/destacado.

## Modo
- **Persuade**: home — hero con titular grande, imagen editorial, prueba social implícita en "Piezas destacadas".
- **Operate**: catálogo, ofertas, detalle, login, dashboard.

## Principios
1. La moda es el protagonista; la UI es discreta.
2. El acento oxblood solo para acciones de oferta y momentos de marca.
3. Server-first: cada página se renderiza desde la BD, sin estados de carga falsos.
4. Responsive desde el menú móvil funcional hasta el grid de productos 2→4 columnas.
