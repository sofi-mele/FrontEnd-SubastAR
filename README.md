# FrontEnd-SubastAR

Base del proyecto en **Expo SDK 55** con **React 19**, **React Native 0.83**, **TypeScript** y **Expo Router**.

## Tecnologías incluidas

- Expo SDK 55
- React 19
- React Native 0.83
- TypeScript en `strict` mode
- Expo Router para navegación por archivos
- React Navigation (`native`, `bottom-tabs`, `drawer`, `native-stack`)
- React Query para estado remoto
- Fetch API propia en `src/services/http.ts`
- Servicios propios en `src/services/api.ts` y `src/services/cloudinary.ts`
- `react-hook-form` + `zod`
- `react-native-reanimated`
- `expo-image-picker`, `expo-document-picker`, `expo-file-system`, `expo-sharing`, `expo-image`
- `expo-secure-store` y `@react-native-async-storage/async-storage`
- `expo-font`, `expo-splash-screen`, `expo-status-bar`, `expo-linking`, `expo-web-browser`, `expo-device`, `expo-constants`, `expo-system-ui`
- ESLint 9 con `eslint-config-expo`

## Instalación

Copia el archivo de ejemplo de variables de entorno:

```powershell
Copy-Item .env.example .env
```

Luego instala dependencias:

```powershell
npm install
```

## Ejecutar

```powershell
npm run start
```

Para web:

```powershell
npm run web
```

## Variables de entorno

- `EXPO_PUBLIC_API_URL` — URL base de tu backend
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` — cloud name de Cloudinary
- `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` — upload preset de Cloudinary

## Estructura

- `app/` — rutas de Expo Router
- `src/components/ui/` — UI reutilizable
- `src/services/` — fetch, API y Cloudinary
- `src/providers/` — providers globales

## Notas

- El proyecto ya viene preparado para navegador con `react-native-web`.
- La pantalla principal funciona en modo demo si no defines `EXPO_PUBLIC_API_URL`.
- La pantalla de subida usa Cloudinary cuando configuras sus variables.

