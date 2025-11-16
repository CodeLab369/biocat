# BIO - CAT · Gestión de Inventario

Aplicación web mobile-first para administrar inventario, clientes, órdenes y estadísticas de BIO - CAT (arena de tofu biodegradable para gatitos). Construida con React + Vite, Tailwind CSS y Zustand, lista para ejecutarse como sitio estático en GitHub Pages usando almacenamiento local.

## ✨ Características clave
- **Autenticación local** (usuario Anahi / contraseña 2025) con persistencia de sesión.
- **Inventario completo**: CRUD, filtros por nombre/cantidad/ubicación, importación/exportación `.xlsx`, plantilla descargable, formateo `1.500,50`, confirmaciones y toasts.
- **Clientes**: registro y filtrado por lugar de envío, acciones Ver/Editar/Eliminar y vaciado total.
- **Órdenes de venta**: selección de cliente, líneas dinámicas desde inventario, estados Pendiente/Completada, validación de stock y descuento automático al completar, vaciado masivo.
- **Estadísticas en tiempo real**: tarjetas de métricas y gráficos Recharts (barras, pastel, línea temporal).
- **Configuración**: cambio de credenciales, selector de tema (auto + toggle manual), umbral de alertas de stock y backup/restore JSON.
- **Experiencia mobile-first**: navegación inferior en móviles, sidebar en desktop, modales accesibles, toasts con Sonner.

## 🛠️ Stack
- React 19 + Vite 7
- Tailwind CSS 3 + lucide-react
- Zustand (estado global + persistencia localStorage)
- SheetJS (xlsx) para import/export masivo
- Recharts para gráficos
- Sonner para notificaciones
- Vitest + Testing Library para utilidades

## 📁 Estructura principal
```

├─ components/        # UI reutilizable (botones, tablas, modales, layout)
├─ context/           # Proveedor de tema claro/oscuro
├─ data/              # Datos demo iniciales
├─ modules/           # Módulos de dominio (auth, inventario, clientes, órdenes, etc.)
├─ routes/            # Configuración de enrutamiento protegido
├─ services/          # Servicios reutilizables (storage helper)
├─ store/             # Zustand (auth, inventario, clientes, órdenes, tema)
├─ utils/             # Formateo, helpers de órdenes, tests
└─ hooks/             # (reservado para futuros hooks personalizados)
```

## 🚀 Puesta en marcha
```bash
npm install
npm run dev
```
Vite abrirá `http://localhost:5173/` (usa `--host` si necesitas exponer en red).

### Scripts disponibles
| Comando            | Descripción                                |
|--------------------|--------------------------------------------|
| `npm run dev`      | Servidor de desarrollo con Vite            |
| `npm run build`    | Build de producción en `dist/`             |
| `npm run preview`  | Previsualiza el build localmente           |
| `npm run lint`     | Ejecuta ESLint                             |
| `npm run test`     | Corre Vitest (usa `-- --run` para único pase) |
| `npm run deploy`   | Publica `dist/` en GitHub Pages (gh-pages) |

## 🔐 Credenciales por defecto
- **Usuario:** `Anahi`
- **Contraseña:** `2025`
Puedes cambiarlas en Configuración → Credenciales (se valida la contraseña actual y se persiste en localStorage).

## 💾 Import / Export
- Inventario soporta **Importar** `.xlsx`, **Exportar** `.xlsx` y **Descargar formato** (encabezados preparados).
- En Configuración puedes **Exportar Backup JSON** o **Restaurar desde JSON** (perfecto para migrar a una API real).

## 🌗 Tema claro/oscuro
- Detecta automáticamente `prefers-color-scheme`.
- Toggle manual (Claro, Oscuro, Sistema) con persistencia en localStorage.

## 📦 Despliegue en GitHub Pages
El repositorio ya incluye un workflow (`.github/workflows/deploy.yml`) que construye y publica automáticamente en GitHub Pages usando `actions/deploy-pages`.

1. En GitHub ve a **Settings → Pages** y elige la opción **GitHub Actions**.
2. Cada push a `main` ejecutará el workflow:
	- `npm ci`
	- `npm run test -- --run`
	- `VITE_PUBLIC_BASE=/biocat/ npm run build`
	- Upload + deploy a Pages.
3. Si clonas el proyecto en otro repositorio, actualiza el valor de `VITE_PUBLIC_BASE` (paso "Build site") para que coincida con `/<nombre-del-repo>/`.

> Para una vista previa local aún puedes usar `npm run build` y `npm run preview`.

## 🔌 Migrar a API o Supabase
- El estado reside en `store/appStore.js` (Zustand + persist). Para conectarte a una API real:
	1. Reemplaza las acciones (`addProduct`, `addOrder`, etc.) por llamadas `fetch`/`supabase` y sincroniza la respuesta con el estado local.
	2. Usa `services/storageService.js` como referencia para abstraer la persistencia.
	3. Expón endpoints para import/export masivo (`/inventario/import`, `/inventario/export`) o usa Supabase Storage para respaldos.

## ✅ Pruebas
Se incluyen tests básicos para utilidades:
- `src/utils/__tests__/numberFormat.test.js`
- `src/utils/__tests__/orderUtils.test.js`

Ejecuta en un solo ciclo:
```bash
npm run test -- --run
```

## 🧭 Sugerencia de commits
1. `feat: scaffold inicial con Vite/Tailwind`
2. `feat: estado global, autenticación y layout`
3. `feat: módulo inventario con import/export`
4. `feat: clientes y órdenes de venta`
5. `feat: estadísticas, configuración y tema`
6. `chore: docs, tests y scripts de despliegue`

> Mantén los datos demo (`loadDemoData`) para pruebas rápidas o re-seed en distintos entornos.

¡Listo! Ya puedes administrar BIO - CAT sin backend y desplegar en GitHub Pages en minutos.
