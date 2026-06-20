# PWA — SubastAR (web)

La salida web de Expo (`web.output: "single"`, bundler Metro) quedó configurada como
**PWA instalable** en Android/Chrome, Chrome desktop y iOS/Safari mediante "Agregar a
pantalla de inicio". No se modificó lógica de negocio, rutas, autenticación ni llamadas
al backend.

## Archivos agregados / modificados

| Archivo | Qué hace |
| --- | --- |
| `public/index.html` | Plantilla HTML que Expo usa para `output: "single"`. Incluye `<link rel="manifest">`, `theme-color`, metadatos iOS, `apple-touch-icon` y el registro del service worker. Expo inyecta el bundle JS automáticamente (placeholders `%WEB_TITLE%` / `%LANG_ISO_CODE%`). |
| `public/manifest.json` | Manifest de la PWA (name, short_name, description, start_url, scope, display standalone, colores e íconos 192/512 + maskable). Accesible en `/manifest.json`. |
| `public/sw.js` | Service worker: precache del shell, cache-first para estáticos, network-first para navegaciones con fallback a `/offline.html`, y auto-update (`skipWaiting` + `clients.claim`). Ignora requests cross-origin (backend/API intactos). |
| `public/offline.html` | Página de fallback offline mínima y con la marca. |
| `public/favicon.png` | Favicon servido en la raíz. |
| `public/icons/icon-192.png` | Ícono 192×192 (`purpose: any`). |
| `public/icons/icon-512.png` | Ícono 512×512 (`purpose: any`). |
| `public/icons/maskable-512.png` | Ícono **maskable** 512×512 (fondo sólido + zona segura) para Android. |
| `public/icons/apple-touch-icon.png` | Ícono 180×180 con fondo sólido (iOS no admite transparencia). |
| `public/icons/splash/*.png` | 15 pantallas de inicio (launch screens) para iOS/PWA, una por resolución de dispositivo (iPhone + iPad, portrait). Logo de `splash-icon.png` centrado sobre `#FAF8FF`. Referenciadas con `apple-touch-startup-image` en `public/index.html`. |
| `app.json` | Se agregó `web.lang: "es-AR"`. |

> Nota: los íconos se generaron a partir de `assets/images/subastar-logo-icon.png`
> (1024×1024) y `assets/images/android-icon-foreground.png` (512×512). Si actualizás el
> logo, regenerá los PNG de `public/icons/` con esas dimensiones exactas.

## Cómo se registra el service worker

El registro vive en `public/index.html` y **se omite en desarrollo** (puertos `8081` /
`19006` del dev server de Expo) para no interferir con el hot-reload. En producción —o al
previsualizar el build local en otro puerto— se registra solo.

## Probar la instalación

### Build de producción local
```bash
npx expo export --platform web      # genera dist/
npx serve dist                      # o cualquier server estático; abrí http://localhost:3000
```

### Android / Chrome (desktop y mobile)
1. Abrí la URL servida (debe ser **HTTPS** en producción; `localhost` también vale).
2. Chrome muestra el ícono de instalar en la barra de direcciones, o menú ⋮ →
   "Instalar app" / "Agregar a pantalla de inicio".
3. La app abre en modo **standalone** (sin barra del navegador) con ícono propio.

### iPhone / iPad (Safari)
1. Abrí la URL en **Safari** (el botón de instalar no existe en iOS; es manual).
2. Tocá **Compartir** → **Agregar a pantalla de inicio**.
3. Aparece con el nombre "SubastAR", `apple-touch-icon` y abre en pantalla completa.

## Validar con Lighthouse
1. Chrome → DevTools (F12) → pestaña **Lighthouse**.
2. Categoría **Progressive Web App** (o "Installable") → **Analyze page load**.
3. Verificá: manifest válido, íconos 192/512, `start_url` responde, theme-color y service
   worker registrado con control de la página.

## Verificaciones rápidas
- Manifest accesible: `GET /manifest.json` → 200 con JSON válido.
- Service worker accesible: `GET /sw.js` → 200.
- Sin errores de consola al cargar.
- Las rutas internas (React Navigation / Expo Router) siguen funcionando: el SW hace
  network-first en navegaciones y cae al shell cacheado solo offline.
