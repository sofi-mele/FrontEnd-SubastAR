# SubastAR — Backlog de implementación frontend basado en Stitch

## 0. Diagnóstico del ZIP revisado

El ZIP de Stitch contiene una propuesta grande y útil para rediseñar SubastAR. Incluye:

- `design.md` con el contexto funcional original de la app.
- `amethyst_professional/DESIGN.md` con una línea visual nueva tipo **Amethyst Professional**.
- 52 pantallas en PNG.
- 47 pantallas con `code.html`.
- Un archivo `.fig.json` mínimo con componentes/iconos.
- Variantes mobile y algunas variantes desktop.

La propuesta sirve muy bien como **dirección visual**, pero no debe pegarse directo en el frontend porque el código generado por Stitch está en HTML/Tailwind/Material Symbols y tu app actual es **Expo + React Native + Expo Router**. Hay que traducir visualmente esas pantallas a componentes React Native.

---

## 1. Conclusión general

La línea visual que conviene adoptar es:

**mobile-first, premium, limpia, profesional, de alto valor, con fondo lavanda muy sutil, cards blancas, violeta fuerte como color de acción, estados bien marcados y más uso de imágenes grandes para subastas/lotes.**

La mejora principal frente al frontend actual no es solo “cambiar colores”, sino:

1. Mejorar jerarquía visual.
2. Mejorar tamaño de tipografías.
3. Mejorar cards de subasta/lote.
4. Profesionalizar el flujo de puja en vivo.
5. Profesionalizar el wizard de subir bien.
6. Mejorar estados vacíos, carga, error, éxito y restricción.
7. Agrupar mejor perfil, pagos, compras, pólizas y chat.
8. Usar componentes más consistentes en toda la app.

---

## 2. Advertencias importantes antes de implementar

### 2.1. No copiar el HTML de Stitch directamente

Los `code.html` de Stitch usan una estructura web que no corresponde al frontend actual. Se deben usar solo como referencia de:

- Layout.
- Jerarquía.
- Tamaños.
- Cards.
- Estados.
- Copy visual.
- Paleta.
- Espaciado.

No se debe convertir el proyecto a React web.

### 2.2. Reemplazar Material Symbols por Ionicons

En varias pantallas se ven textos como `gavel`, `dashboard`, `payments`, `notifications`, `arrow_back`, etc. Eso pasa porque Stitch usa Material Symbols. En tu app ya se usa `Ionicons`, así que hay que mapear esos íconos a Ionicons.

Ejemplos:

| Stitch / Material | Ionicons sugerido |
|---|---|
| `gavel` | `hammer-outline` |
| `notifications` | `notifications-outline` |
| `arrow_back` | `chevron-back` |
| `chat_bubble` | `chatbubble-outline` |
| `person` | `person-outline` |
| `payments` | `card-outline` |
| `shopping_bag` | `bag-check-outline` |
| `verified` | `checkmark-circle-outline` |
| `local_shipping` | `car-outline` o `cube-outline` |
| `shield` | `shield-checkmark-outline` |
| `history` | `time-outline` |

### 2.3. Hay pantallas que incluyen screenshots viejas o anotaciones

Algunas pantallas generadas por Stitch muestran capturas antiguas dentro de la nueva UI y hasta líneas negras de referencia. Eso no debe implementarse.

Pantallas a revisar especialmente:

- `inicio_subastar_2`
- `mi_perfil_subastar`
- `image.png_1`
- `image.png_2`
- `image.png_3`
- `image.png_4`

Estas sirven como referencia, pero hay que limpiar todo lo que parezca captura embebida.

### 2.4. Algunas pantallas tienen mezcla de idioma

Hay textos como `Professional Portal`, `Dashboard`, `New Auction`, `Place Bid`, `Accepting Bids`. Todo debe unificarse a español.

### 2.5. Algunas imágenes son demasiado específicas

Stitch usa autos, relojes, maquinaria y casas como imágenes de ejemplo. Pueden quedar como placeholders visuales si todavía no hay backend con imágenes, pero no deberían hardcodearse como contenido real permanente.

---

## 3. Paleta recomendada

La propuesta de Stitch mejora mucho usando un fondo lavanda/blanco más suave. Mi recomendación es mantener el violeta actual de SubastAR, pero ampliar el sistema de color con tokens más profesionales.

### 3.1. Colores principales

| Token | Valor | Uso |
|---|---:|---|
| `primary` | `#5C4ACF` | Botones principales, íconos activos, tab activo, CTAs |
| `primaryDark` | `#302477` | Títulos de marca, precios destacados, texto importante |
| `primaryDeep` | `#442EB6` | Variante premium para botones/headers |
| `primarySoft` | `#EFECFF` | Fondos de badges, chips activos, tarjetas suaves |
| `primaryFixed` | `#E4DFFF` | Fondos lavanda más marcados |
| `primaryBorder` | `#D8D1FF` | Bordes violeta suaves |
| `inversePrimary` | `#C7BFFF` | Detalles sobre fondos oscuros |

### 3.2. Fondos y superficies

| Token | Valor | Uso |
|---|---:|---|
| `background` | `#FAF8FF` | Fondo general de la app |
| `surface` | `#FFFFFF` | Cards, inputs, modales |
| `surfaceAlt` | `#F7F6FD` | Contenedores secundarios |
| `surfaceContainer` | `#F2F3FF` | Bottom nav, secciones, paneles |
| `surfaceContainerHigh` | `#E4E7F8` | Separadores suaves, estados skeleton |
| `border` | `#E5E4ED` | Bordes principales |
| `outline` | `#787585` | Íconos secundarios y divisores fuertes |

### 3.3. Texto

| Token | Valor | Uso |
|---|---:|---|
| `text` | `#171B27` | Texto principal |
| `textStrong` | `#17171F` | Títulos y valores |
| `textMuted` | `#6F7381` | Descripciones y labels |
| `textVariant` | `#474554` | Texto secundario más legible |

### 3.4. Estados

| Estado | Fondo | Texto/Icono |
|---|---:|---:|
| Éxito | `#E8F8EE` | `#25B85A` |
| Peligro/Error | `#FDECEC` | `#EF4444` |
| Warning/Pendiente | `#FFF4D8` | `#D79512` |
| Live | `#FDECEC` | `#EF4444` |
| Bloqueado/Restringido | `#FDECEC` | `#EF4444` |
| Verificado | `#E8F8EE` | `#25B85A` |

---

## 4. Tipografías recomendadas

Mantener **Roboto**, porque ya está instalada en el proyecto. Pero conviene mejorar la escala actual para que la app se vea más profesional.

### 4.1. Escala sugerida

| Token | Tamaño | Peso | Line-height | Uso |
|---|---:|---:|---:|---|
| `display` | 32 | 900 | 38 | Marca, pantallas de éxito, precio destacado |
| `title` | 26 | 900 | 32 | Títulos principales de pantalla |
| `headline` | 22 | 700 | 28 | Secciones importantes |
| `subheading` | 18 | 700 | 24 | Cards y bloques |
| `body` | 16 | 400 | 24 | Texto normal |
| `bodySmall` | 14 | 400 | 20 | Descripción secundaria |
| `label` | 13 | 700 | 18 | Labels, chips, badges |
| `caption` | 12 | 500 | 16 | Metadatos, fechas, subtítulos |

### 4.2. Reglas de uso

- Los precios importantes deben usar peso `900`.
- Los títulos de cards deben usar `700`.
- Los labels de inputs deben estar arriba del input, nunca dentro como único indicador.
- Los textos legales deben ser body small, pero con buen line-height.
- Evitar textos menores a 12 px.

---

## 5. Sistema de espaciado y radios

### 5.1. Espaciado

| Token | Valor |
|---|---:|
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xl` | 20 |
| `xxl` | 24 |
| `huge` | 32 |
| `section` | 40 |

### 5.2. Radios

| Token | Valor | Uso |
|---|---:|---|
| `sm` | 8 | Badges pequeños |
| `md` | 12 | Inputs, chips |
| `lg` | 16 | Cards normales |
| `xl` | 22 | Cards grandes |
| `xxl` | 28 | Hero cards |
| `pill` | 999 | Chips, avatar, bottom tab activo |

### 5.3. Elevación

Implementar una sombra suave para cards:

- iOS: `shadowColor: '#302477'`, `shadowOpacity: 0.08`, `shadowOffset: { width: 0, height: 6 }`, `shadowRadius: 16`
- Android: `elevation: 3`

---

## 6. Componentes globales a implementar/refactorizar

Estos cambios deberían ir antes que las pantallas.

### 6.1. `Screen`

Mejoras:

- Fondo `background: #FAF8FF`.
- Padding horizontal 20/24.
- Soporte opcional para `bottomInset` cuando hay bottom tabs.
- Soporte para max width en web/tablet.
- `contentContainerStyle` con gap consistente.

### 6.2. `Header`

Crear un header premium:

- Logo/wordmark centrado cuando aplica.
- Botón back circular.
- Ícono de notificaciones a la derecha.
- Título alineado según contexto.
- Subtítulo opcional.
- Evitar headers vacíos como `Header title=""`.

Variantes:

- `AppHeader`
- `BackHeader`
- `SectionHeader`

### 6.3. `Card`

Crear variantes:

- `default`
- `soft`
- `highlight`
- `danger`
- `success`
- `dark`
- `image`

La card debe tener:

- Background blanco.
- Borde suave.
- Sombra sutil.
- Radio 16/22.
- Padding 16/20.

### 6.4. `Button`

Mejorar variantes:

- `primary`: violeta fuerte.
- `secondary`: lavanda suave con borde violeta.
- `ghost`: transparente.
- `danger`: rojo.
- `success`: verde.
- `dark`: fondo oscuro premium.

Tamaños:

- `md`: 48 px.
- `lg`: 56 px.
- `sm`: 40 px.

Estados:

- disabled.
- loading.
- pressed.
- icon left/right.

### 6.5. `Input`

Mejoras:

- Alto mínimo 52.
- Label arriba.
- Borde `#E5E4ED`.
- Focus violeta.
- Error rojo con mensaje.
- Placeholder gris.
- Soporte para prefix/suffix icon.
- Soporte para multiline con altura mínima 110.

### 6.6. `SearchInput`

Basado en Stitch:

- Card blanca grande.
- Icono lupa.
- Placeholder: “Buscar subastas, lotes, obras...”.
- Altura 56.
- Radio 14/16.
- Sombra suave.

### 6.7. `Chip`

Mejoras:

- `active`: `primarySoft` + borde `primaryBorder`.
- `inactive`: blanco + borde suave.
- Altura 40/44.
- Texto 14/15.

### 6.8. `Badge`

Tonos:

- `purple`
- `green`
- `red`
- `yellow`
- `dark`

Agregar variantes para:

- `EN VIVO`
- `Verificado`
- `Pendiente`
- `Finalizada`
- `Categoría Oro`
- `Líder actual`

### 6.9. `BottomNavigation`

Actualmente los tabs son básicos. Stitch propone una navegación inferior con 3 accesos principales:

- Inicio
- Chat
- Perfil

Pero tu app también tiene Subastas como tab actual. Recomiendo decidir una arquitectura:

Opción A — mobile simple:
- Inicio
- Subastas
- Chat
- Perfil

Opción B — como Stitch:
- Inicio
- Chat
- Perfil
- Acceso a subastas desde home prominente

Mi recomendación: **4 tabs** para no esconder Subastas.

### 6.10. `AuctionCard`

Implementar dos variantes:

#### `AuctionHeroCard`

Para home:

- Imagen grande arriba.
- Badge `EN VIVO` o fecha.
- Título.
- Ubicación.
- Estado verificado.
- Puja actual.
- Botón `Pujar`.
- Timer si está en vivo.

#### `AuctionListCard`

Para listado:

- Imagen 4:3.
- Badge estado arriba.
- Botón favorito.
- Lote/subasta.
- Precio actual.
- Ubicación.
- Timer/fecha.
- Moneda.

### 6.11. `LotCard`

Mejoras:

- Imagen visible.
- Lote número.
- Título máximo 2 líneas.
- Precio base o puja actual.
- Estado del lote.
- Acceso claro a detalle.

### 6.12. `LiveBanner`

Debe tener:

- Fondo `dangerSoft`.
- Punto rojo.
- Texto `EN VIVO`.
- Timer.
- Diseño compacto y muy visible.

### 6.13. `BidConsole`

Nuevo componente clave:

- Precio actual grande.
- Nombre del líder.
- Botones de puja rápida: +100, +500, +1000.
- Campo de monto manual.
- Selector de medio de pago.
- CTA principal `Pujar ahora`.
- Validaciones visibles.
- Estados no disponible/restringido.

### 6.14. `BidHistoryPreview`

Lista visual:

- Avatar circular con iniciales.
- Nombre.
- Monto.
- Timestamp.
- Badge líder para primer lugar.

### 6.15. `WizardProgress`

Para registro y subir bien:

- Stepper de 4 pasos.
- Progreso horizontal.
- Paso actual.
- Labels cortos.
- Color violeta para paso completado/activo.

### 6.16. `UploadDropzone`

Para DNI, fotos, documentos, cheque:

- Borde dashed.
- Fondo `primarySoft`.
- Icono.
- Texto principal.
- Texto secundario con formato/tamaño.
- Estado cargado.
- Estado error.
- Acciones eliminar/ver.

### 6.17. `Timeline`

Para entrega:

- Estados verticales.
- Check para completado.
- Estado activo destacado.
- Descripción y fecha.
- Ideal para seguimiento de entrega y revisión de bienes.

### 6.18. `SkeletonState`

Reemplazar algunos spinners por skeletons:

- Home loading.
- Auction cards loading.
- Purchases loading.
- Profile loading.

### 6.19. `StatusState`

Unificar estados:

- Empty.
- Error.
- Success.
- Restricted.
- Blocked.
- Warning.
- Loading.

---

## 7. Implementación por archivos

### 7.1. `src/constants/theme.ts`

Implementar:

- Nueva paleta extendida.
- Nuevos tokens de tipografía.
- Nuevos tokens de radius.
- Nuevo shadow.
- Mantener compatibilidad con nombres actuales para no romper componentes.

Prioridad: **Alta**

### 7.2. `src/components/ui/primitives.tsx`

Refactorizar:

- Screen.
- Header.
- Title.
- Body.
- Card.
- Button.
- Input.
- SearchInput.
- Chip.
- Badge.
- LoadingState.
- EmptyState.
- ErrorState.
- Modales.

Agregar:

- SectionHeader.
- IconButton.
- StatusState.
- SkeletonBlock.
- Divider.
- ListItem.
- SecurityNote.

Prioridad: **Alta**

### 7.3. `src/components/domain/cards.tsx`

Refactorizar:

- AuctionCard.
- LotCard.
- PaymentMethodCard.
- PurchaseCard.

Agregar:

- AuctionHeroCard.
- LiveBidCard.
- TimelineCard.
- MetricCard.
- PolicyCard.
- AssetCard.

Prioridad: **Alta**

### 7.4. `src/components/brand/logo.tsx`

Mejorar:

- Tamaños del logo.
- Wordmark más consistente.
- Variante compacta.
- Variante centered.
- Evitar que el logo ocupe demasiado en headers.

Prioridad: **Media**

---

## 8. Pantallas de Stitch y mapeo a tu frontend

| Carpeta Stitch | Pantalla/uso en app | Archivo recomendado | Observación |
|---|---|---|---|
| `modern_professional_splash_screen_for_subastar_auction_app_centered_violet_logo` | SplashScreen | `src/features/auth/screens.tsx` | Usar como base de splash limpio, sin lógica extra. |
| `bienvenida_subastar` | WelcomeScreen | `src/features/auth/screens.tsx` | Muy buena base visual para bienvenida. |
| `iniciar_sesi_n_subastar` | LoginScreen | `src/features/auth/screens.tsx` | Ajustar copy en español y mantener validación actual. |
| `registro_datos_personales_subastar` | RegisterScreen | `src/features/auth/screens.tsx` | Usar para registro con DNI frente/dorso. |
| `solicitud_enviada_subastar` | RegistrationPendingScreen | `src/features/auth/screens.tsx` | Cubierto. |
| `verificaci_n_de_c_digo_subastar` | VerifyScreen | `src/features/auth/screens.tsx` | Cubierto. |
| `crear_contrase_a_subastar` | PasswordScreen | `src/features/auth/screens.tsx` | Cubierto. |
| `onboarding_de_pagos_subastar` | OnboardingPaymentScreen | `src/features/auth/screens.tsx` | Cubierto. |
| `agregar_tarjeta_subastar` | PaymentAddScreen | `src/features/account/screens.tsx` | Cubierto para tarjeta. |
| `agregar_cuenta_bancaria_subastar` | PaymentAddScreen | `src/features/account/screens.tsx` | Cubierto para cuenta bancaria. |
| `agregar_cheque_certificado_subastar` | PaymentAddScreen | `src/features/account/screens.tsx` | Cubierto para cheque. |
| `inicio_subastar_2` | HomeScreen | `src/features/auctions/screens.tsx` | Usar estructura, pero eliminar screenshot embebida/anotaciones. |
| `inicio_invitado_subastar` | HomeScreen guest | `src/features/auctions/screens.tsx` | Cubierto. |
| `inicio_cuenta_restringida_subastar` | HomeScreen restricted | `src/features/auctions/screens.tsx` | Cubierto. |
| `estado_de_carga_inicio_subastar` | LoadingState/Home skeleton | `src/components/ui/primitives.tsx` | Usar para skeleton, no solo spinner. |
| `explorar_subastas_subastar_2` | AuctionsScreen | `src/features/auctions/screens.tsx` | Muy buena base mobile. |
| `sin_resultados_subastas_subastar` | AuctionsScreen empty | `src/features/auctions/screens.tsx` | Cubierto. |
| `condiciones_de_subasta_subastar` | AuctionDetailScreen | `src/features/auctions/screens.tsx` | Usar como base de detalle/condiciones. |
| `detalle_del_bien_subastar` | LotDetailScreen/AssetDetailScreen | `src/features/auctions/screens.tsx y account` | Usar con cuidado: parece bien/lote de alto valor. |
| `subasta_en_vivo_subastar` | LiveAuctionScreen | `src/features/auctions/screens.tsx` | Prioridad máxima. |
| `puja_aceptada_subastar` | ConfirmBidScreen accepted | `src/features/auctions/screens.tsx` | Cubierto. |
| `puja_restringida_categor_a_insuficiente` | ConfirmBidScreen restricted | `src/features/auctions/screens.tsx` | Cubierto. |
| `error_de_puja_sin_medio_de_pago` | LiveAuctionScreen no payment | `src/features/auctions/screens.tsx` | Cubierto. |
| `error_de_validaci_n_monto_insuficiente` | LiveAuctionScreen validation | `src/features/auctions/screens.tsx` | Cubierto. |
| `subir_bien_paso_1_subastar` | SellStartScreen | `src/features/selling/screens.tsx` | Cubierto. |
| `subir_bien_fotos_subastar` | SellPhotosScreen | `src/features/selling/screens.tsx` | Cubierto. |
| `subir_bien_documentaci_n_subastar` | SellDocumentsScreen | `src/features/selling/screens.tsx` | Cubierto. |
| `subir_bien_resumen_subastar` | SellReviewScreen | `src/features/selling/screens.tsx` | Cubierto. |
| `subir_bien_xito_subastar` | SellSuccessScreen | `src/features/selling/screens.tsx` | Cubierto. |
| `mi_perfil_subastar` | ProfileScreen | `src/features/account/screens.tsx` | Muy buena base para menú agrupado. |
| `m_tricas_de_actividad_subastar` | MetricsScreen | `src/features/account/screens.tsx` | Cubierto. |
| `estado_de_cuenta_subastar` | AccountStatusScreen | `src/features/account/screens.tsx` | Cubierto. |
| `medios_de_pago_subastar` | PaymentsScreen | `src/features/account/screens.tsx` | Cubierto. |
| `mis_compras_subastar` | PurchasesScreen | `src/features/account/screens.tsx` | Cubierto. |
| `sin_compras_subastar` | PurchasesScreen empty | `src/features/account/screens.tsx` | Cubierto. |
| `detalle_de_compra_subastar` | PurchaseDetailScreen | `src/features/account/screens.tsx` | Cubierto. |
| `factura_de_compra_subastar` | InvoiceScreen | `src/features/account/screens.tsx` | Cubierto. |
| `seguimiento_de_entrega_subastar` | DeliveryScreen | `src/features/account/screens.tsx` | Cubierto. |
| `seguros_y_p_lizas_subastar` | PoliciesScreen | `src/features/account/screens.tsx` | Cubierto. |
| `detalle_de_p_liza_subastar` | PolicyScreen | `src/features/account/screens.tsx` | Cubierto. |
| `ampliar_cobertura_subastar` | ExtendPolicyScreen | `src/features/account/screens.tsx` | Cubierto. |
| `bienes_asegurados_subastar` | PolicyScreen/PoliciesScreen | `src/features/account/screens.tsx` | Usar como detalle/listado de bienes cubiertos. |
| `soporte_de_p_liza_subastar` | PolicyContactScreen/Chat | `src/features/account/screens.tsx` | Tiene texto de seguro vehicular; adaptar a SubastAR. |
| `mensajes_subastar` | ChatsScreen | `src/features/account/screens.tsx` | Cubierto. |
| `chat_de_soporte_subastar` | ConversationScreen | `src/features/account/screens.tsx` | Cubierto. |
| `error_de_conexi_n_subastar` | ErrorState | `src/components/ui/primitives.tsx` | Usar como error global. |

---

## 9. Pantallas cubiertas por Stitch

Stitch cubrió bastante bien:

- Splash.
- Bienvenida.
- Login.
- Registro.
- Solicitud enviada.
- Verificación por código.
- Crear contraseña.
- Onboarding de pagos.
- Agregar tarjeta.
- Agregar cuenta bancaria.
- Agregar cheque.
- Home logueado.
- Home invitado.
- Home restringido.
- Explorar subastas.
- Sin resultados.
- Subasta en vivo.
- Puja exitosa.
- Puja restringida.
- Error por no tener medio de pago.
- Error por monto insuficiente.
- Subir bien paso 1.
- Subir bien fotos.
- Subir bien documentación.
- Subir bien resumen.
- Subir bien éxito.
- Perfil.
- Métricas.
- Estado de cuenta.
- Medios de pago.
- Mis compras.
- Sin compras.
- Detalle de compra.
- Factura.
- Seguimiento de entrega.
- Seguros y pólizas.
- Detalle de póliza.
- Ampliar cobertura.
- Bienes asegurados.
- Soporte de póliza.
- Mensajes.
- Chat de soporte.
- Error de conexión.
- Carga/skeleton.

---

## 10. Pantallas o casos que todavía faltan o habría que pedirle mejor a Stitch

Aunque el ZIP es grande, todavía faltan o están incompletos estos casos:

### 10.1. Catálogo real de una subasta

Falta una pantalla clara para:

- `CatalogScreen`.
- Lista de lotes dentro de una subasta.
- Filtros `Todas`, `Disponibles`, `Vendidos`.
- Lote vendido/subastado.
- Lote sin imagen.
- Lote con precio base.

### 10.2. Detalle de subasta más limpio

Hay `condiciones_de_subasta_subastar`, pero conviene separar:

- Detalle general de subasta.
- Condiciones legales.
- Catálogo de lotes.
- CTA a puja si está en vivo.
- CTA a streaming si aplica.

### 10.3. Confirmación de puja previa

Stitch generó la puja exitosa y errores, pero falta una pantalla clara para:

- Revisar monto.
- Revisar medio de pago.
- Confirmar puja.
- Mensaje de advertencia legal/transaccional antes de enviar.

Esta pantalla corresponde a `ConfirmBidScreen` antes de `accepted`.

### 10.4. Resultado de puja cuando no ganaste

Falta variante:

- “La subasta finalizó”.
- “Tu oferta no resultó ganadora”.
- Monto final ganador si se permite mostrar.
- CTA a seguir participando.

### 10.5. Historial completo de pujas

Falta una pantalla específica para:

- Ranking de pujas.
- Oferta líder.
- Timestamp.
- Usuario/iniciales.
- Monto.
- Filtros o scroll.

### 10.6. Editar perfil

Falta diseño para:

- Datos personales.
- Campos no editables.
- Dirección editable.
- País editable.
- Guardar cambios.

### 10.7. Eliminar medio de pago

Falta modal destructivo:

- “Eliminar medio de pago”.
- Explicación.
- Cancelar.
- Eliminar.

### 10.8. Éxito al agregar medio de pago

Hay onboarding y formularios, pero falta pantalla clara para:

- Tarjeta agregada.
- Cuenta agregada.
- Cheque enviado a revisión.
- Volver a subasta o perfil.

### 10.9. Regularizar pago pendiente

Falta pantalla específica:

- Compra pendiente.
- Total a regularizar.
- Selección de medio de pago verificado.
- Confirmar pago.
- Sin medios habilitados.

### 10.10. Mis bienes

Falta una pantalla clara para:

- Listado de bienes propios.
- Filtros Todos/Pendiente/Aceptado/Rechazado.
- Estado de cada bien.
- Acceso a detalle.
- CTA subir otro bien.

### 10.11. Aceptar/rechazar condiciones del bien

Hay pantalla de detalle, pero falta estado específico para:

- Bien aceptado.
- Precio base.
- Comisión.
- Depósito.
- Aceptar condiciones.
- Rechazar condiciones.
- Confirmación de respuesta enviada.

### 10.12. Estados de permisos

Faltan casos:

- Permiso de cámara/galería denegado.
- Permiso de documentos denegado.
- Archivo demasiado grande.
- Formato inválido.
- Menos de 6 fotos.
- Más de 8 fotos.

### 10.13. Tablet/desktop consistente

Hay algunas pantallas desktop, pero no están consistentes con la app mobile. Si se quiere web/tablet con `react-native-web`, hay que definir:

- Layout mobile.
- Layout tablet.
- Layout desktop.
- Side navigation opcional.
- Max width de contenido.

---

## 11. Mejores ideas visuales de Stitch que sí conviene implementar

### 11.1. Fondo lavanda sutil

Pasar de fondo blanco puro a `#FAF8FF` mejora mucho la percepción premium.

### 11.2. Cards grandes con imagen

Las subastas se ven mucho más profesionales cuando cada subasta/lote tiene imagen grande, badge y precio destacado.

### 11.3. Precio muy protagonista

En subastas y compras, los precios deben ser muy visibles:

- Tamaño 28-34.
- Peso 900.
- Color `primary` o `primaryDark`.
- Moneda visible.

### 11.4. Live auction como pantalla principal de producto

La pantalla `subasta_en_vivo_subastar` es de las mejores del ZIP. Conviene implementarla casi como está, traducida a React Native.

### 11.5. Bottom nav más visual

La navegación inferior con icono activo circular violeta se ve mucho mejor que una tab plana.

### 11.6. Perfil agrupado

La pantalla `mi_perfil_subastar` organiza muy bien por grupos:

- Cuenta.
- Estado operativo y legal.
- Gestión financiera.

### 11.7. Wizard de subir bien

El flujo de subir bien mejora mucho con:

- Stepper visible.
- Cards de categoría.
- Dropzones.
- Resumen final.
- Mensaje legal claro.

### 11.8. Timeline de entrega

La pantalla de seguimiento de entrega es una buena referencia para compras y logística.

### 11.9. Estados vacíos y de error más humanos

Stitch propone empty states más visuales. Conviene reemplazar textos simples por cards con icono, explicación y CTA.

---

## 12. Cambios concretos por pantalla

### 12.1. Splash

Implementar:

- Fondo `#FAF8FF`.
- Logo centrado.
- Wordmark SubastAR.
- Animación suave opcional.
- Mantener redirección actual según sesión.

### 12.2. Welcome

Implementar:

- Logo grande.
- Claim: “Descubrí objetos únicos”.
- Subcopy: “Explorá subastas seleccionadas y participá desde cualquier lugar.”
- Botón primario: Iniciar sesión.
- Botón secundario: Crear cuenta.
- Link/botón ghost: Continuar como invitado.
- Security note discreto.

### 12.3. Login

Implementar:

- Header seguro.
- Inputs con iconos.
- Botón full width.
- Error visible.
- Link de recuperar contraseña.
- Continuar como invitado.
- Link a registro.
- No cambiar `signIn`, `returnTo`, ni validación actual.

### 12.4. Registro

Implementar:

- Stepper.
- Bloque explicativo de verificación de identidad.
- Inputs más limpios.
- Upload boxes para DNI frente/dorso.
- Estado de documento cargado.
- Errores claros.

### 12.5. Home

Implementar:

- Header con wordmark, notificaciones y avatar opcional.
- Hero de subasta en vivo o destacada.
- CTA “Pujar”.
- Acciones rápidas: Explorar subastas, Subir bien.
- Si invitado: banner para crear cuenta.
- Si bloqueado/multado: status banner restrictivo.
- Si loading: skeleton.
- No mostrar capturas viejas dentro de cards.

### 12.6. Explorar subastas

Implementar:

- Search grande.
- Chips: Todas, En vivo, Próximas, Finalizadas.
- Botón/ícono de filtros avanzados.
- Cards con imagen.
- Timer o fecha.
- Ubicación.
- Precio actual/base.
- Estado.
- Empty state con limpiar filtros.

### 12.7. Detalle de subasta

Implementar:

- Header con back.
- Card principal con información: fecha, lugar, moneda, rematador, categoría.
- Card de condiciones.
- Card de cantidad de lotes.
- CTA Ver catálogo.
- CTA Ir a pujar si está en vivo.
- CTA Ver streaming si aplica.

### 12.8. Catálogo

Implementar:

- Header con nombre de subasta.
- Chips de estado.
- Grid/list de lotes.
- Cards con imagen.
- Precio base.
- Estado vendido/disponible.
- Empty state.

### 12.9. Detalle de lote

Implementar:

- Imagen hero.
- Badge de lote.
- Título.
- Descripción.
- Datos de artista/procedencia si existen.
- Precio base.
- CTA Ir a pujar.
- Modal login requerido si invitado.

### 12.10. Subasta en vivo

Implementar como pantalla prioritaria:

- Live banner sticky arriba.
- Timer visible.
- Imagen del lote.
- Título y descripción.
- Oferta actual gigante.
- Líder actual.
- Botones rápidos +100/+500/+1000.
- Campo de monto manual.
- Selector de medio de pago.
- CTA Pujar ahora.
- Historial reciente.
- Error/validación inline.

### 12.11. Confirmar puja

Implementar:

- Resumen de oferta.
- Medio de pago seleccionado.
- Advertencia de compromiso.
- Botón Confirmar puja.
- Estados pending/success/error.
- Puja aceptada visualmente premium.

### 12.12. Subir bien

Implementar wizard completo:

- Paso 1: datos y categoría.
- Paso 2: fotos.
- Paso 3: documentación/declaración.
- Paso 4: revisión.
- Éxito.

Mejoras:

- Barra de progreso.
- Dropzones.
- Preview de fotos.
- Contador 0/8.
- Warning si faltan fotos.
- Resumen final mucho más claro.

### 12.13. Perfil

Implementar:

- Profile card con avatar.
- Categoría visible.
- Estado de cuenta si hay multa.
- Grupos de menú.
- Cards/list items con icono.
- Logout visible pero no destructivo.

### 12.14. Medios de pago

Implementar:

- Cards por medio.
- Estado verificado/pendiente.
- Monto disponible si existe.
- Acciones agregar.
- Modal eliminar.
- Formularios por tipo.

### 12.15. Compras

Implementar:

- Secciones: Pendientes, En entrega, Entregadas/listas.
- Cards con lote, monto, estado pago, estado entrega.
- Empty state con CTA a subastas.

### 12.16. Detalle de compra

Implementar:

- Resumen financiero.
- Estado entrega.
- CTA seguimiento.
- CTA chat.
- CTA regularizar pago si pendiente.
- CTA factura.
- CTA póliza si existe.

### 12.17. Entrega

Implementar:

- Timeline vertical.
- Estado actual destacado.
- Dirección/estimación.
- Seguro asociado si existe.
- CTA chat.

### 12.18. Pólizas

Implementar:

- Lista de pólizas.
- Card de póliza activa/pendiente.
- Detalle con cobertura.
- Piezas cubiertas.
- Contacto aseguradora.
- Ampliar cobertura.

### 12.19. Chat

Implementar:

- Lista de conversaciones.
- Badge de no leídos.
- Conversación con burbujas.
- Input sticky inferior.
- Estados empty/error.

---

## 13. Backlog priorizado

### Fase 1 — Design system y base visual

Prioridad máxima.

- [ ] Actualizar `theme.ts`.
- [ ] Crear tokens extendidos.
- [ ] Refactorizar `Screen`.
- [ ] Refactorizar `Header`.
- [ ] Refactorizar `Card`.
- [ ] Refactorizar `Button`.
- [ ] Refactorizar `Input`.
- [ ] Refactorizar `SearchInput`.
- [ ] Refactorizar `Chip`.
- [ ] Refactorizar `Badge`.
- [ ] Crear `IconButton`.
- [ ] Crear `SectionHeader`.
- [ ] Crear `StatusState`.
- [ ] Crear `SkeletonBlock`.
- [ ] Crear `SecurityNote`.
- [ ] Crear `WizardProgress`.
- [ ] Crear `UploadDropzone`.

### Fase 2 — Cards de dominio

- [ ] `AuctionHeroCard`.
- [ ] `AuctionListCard`.
- [ ] `LotCard`.
- [ ] `PaymentMethodCard`.
- [ ] `PurchaseCard`.
- [ ] `MetricCard`.
- [ ] `PolicyCard`.
- [ ] `AssetCard`.
- [ ] `BidHistoryRow`.
- [ ] `Timeline`.

### Fase 3 — Auth y onboarding

- [ ] Splash.
- [ ] Welcome.
- [ ] Login.
- [ ] Registro.
- [ ] Solicitud enviada.
- [ ] Verificación.
- [ ] Crear contraseña.
- [ ] Onboarding pagos.
- [ ] Agregar tarjeta/cuenta/cheque.
- [ ] Payment success.

### Fase 4 — Subastas y pujas

- [ ] Home.
- [ ] Home invitado.
- [ ] Home restringido.
- [ ] Explorar subastas.
- [ ] Sin resultados.
- [ ] Filtros avanzados.
- [ ] Detalle de subasta.
- [ ] Catálogo.
- [ ] Detalle de lote.
- [ ] Subasta en vivo.
- [ ] Confirmar puja.
- [ ] Puja aceptada.
- [ ] Puja rechazada.
- [ ] Puja restringida.
- [ ] Sin medio de pago.
- [ ] Historial completo.
- [ ] Resultado ganador.
- [ ] Resultado perdedor.

### Fase 5 — Subir bien

- [ ] Paso 1.
- [ ] Paso 2.
- [ ] Paso 3.
- [ ] Paso 4.
- [ ] Éxito.
- [ ] Validaciones de archivos.
- [ ] Permisos denegados.
- [ ] Mis bienes.
- [ ] Detalle bien.
- [ ] Aceptar/rechazar condiciones.

### Fase 6 — Cuenta, pagos y compras

- [ ] Perfil.
- [ ] Editar perfil.
- [ ] Métricas.
- [ ] Estado de cuenta.
- [ ] Medios de pago.
- [ ] Eliminar medio.
- [ ] Mis compras.
- [ ] Detalle compra.
- [ ] Regularizar pago.
- [ ] Factura.
- [ ] Seguimiento de entrega.

### Fase 7 — Pólizas y chat

- [ ] Lista pólizas.
- [ ] Detalle póliza.
- [ ] Bienes asegurados.
- [ ] Ampliar cobertura.
- [ ] Contacto aseguradora.
- [ ] Lista chats.
- [ ] Conversación.
- [ ] Soporte de póliza adaptado a bienes/subastas.

---

## 14. Prompt recomendado para Codex — primera tarea

```text
We have a Stitch AI redesign exported in `/docs/design/stitch/`.
The frontend is Expo + React Native + Expo Router, not web React.

Refactor only the design system and reusable UI components.

Files to modify:
- `src/constants/theme.ts`
- `src/components/ui/primitives.tsx`
- `src/components/domain/cards.tsx`
- `src/components/brand/logo.tsx`

Important:
- Do not paste HTML/Tailwind from Stitch.
- Translate the Stitch design into React Native components.
- Preserve all existing exports when possible.
- Preserve current business logic and API contracts.
- Use Roboto fonts already installed.
- Adopt the Amethyst Professional palette:
  - primary: #5C4ACF
  - primaryDark: #302477
  - background: #FAF8FF
  - surface: #FFFFFF
  - surfaceAlt: #F7F6FD
  - primarySoft: #EFECFF
  - primaryBorder: #D8D1FF
  - text: #171B27
  - textMuted: #6F7381
  - success: #25B85A
  - danger: #EF4444
  - warning: #D79512

Create or improve:
- Screen
- Header
- Card
- Button
- Input
- SearchInput
- Chip
- Badge
- LoadingState
- EmptyState
- ErrorState
- StatusState
- IconButton
- SectionHeader
- SkeletonBlock
- WizardProgress
- UploadDropzone
- SecurityNote

After changes, run:
- npm run lint
- npx tsc --noEmit

Stop after this design-system refactor. Do not refactor feature screens yet.
```

---

## 15. Prompt recomendado para Codex — subastas y puja en vivo

```text
Refactor only the auction-related screens using the Stitch redesign as reference.

Files:
- `src/features/auctions/screens.tsx`
- `src/components/domain/cards.tsx` only if needed for auction/lot/bid cards

Preserve:
- Expo Router paths
- React Query query keys
- API calls from `auctionService`, `paymentService`, `profileService`
- AuthRequiredModal behavior
- Account blocked/restricted behavior
- Bid confirmation flow
- Live auction refetch interval

Implement the visual direction from Stitch:
- premium auction cards with images
- improved search and filter chips
- better auction detail
- catalog grid/list
- professional lot detail
- live banner with timer
- large current bid display
- quick bid buttons
- payment method selection
- bid history preview
- accepted/restricted/no-payment/error states

Do not paste HTML/Tailwind. Use React Native components and existing primitives.
```

---

## 16. Prompt recomendado para Codex — vender/subir bien

```text
Refactor only the selling wizard based on Stitch screens.

Files:
- `src/features/selling/screens.tsx`

Preserve:
- `assetService.start`
- `assetService.saveDetails`
- `assetService.uploadPhotos`
- `assetService.uploadDocuments`
- `assetService.confirm`
- ImagePicker behavior
- DocumentPicker behavior
- 6 minimum and 8 maximum photos
- declaration checkbox
- all route params

Implement:
- 4-step WizardProgress
- category cards
- better form layout
- upload dropzone
- photo grid with remove buttons
- document list
- review summary
- success state

Do not change API contracts.
```

---

## 17. Prompt recomendado para Codex — cuenta, compras, pagos, pólizas y chat

```text
Refactor only account-related screens based on Stitch.

File:
- `src/features/account/screens.tsx`

Preserve all services:
- profileService
- paymentService
- purchaseService
- assetService
- insuranceService
- chatService
- authService

Implement:
- professional profile screen
- grouped menu sections
- metrics cards
- account status banners
- improved payment method list/forms
- purchases sections
- purchase detail financial summary
- delivery timeline
- invoice screen
- policies list/detail
- extend coverage
- chat list and conversation bubbles

Do not change API contracts, route paths, or query keys.
```

---

## 18. Definition of Done

Una pantalla se considera bien refactorizada si cumple:

- Usa tokens del theme.
- No tiene colores hardcodeados salvo casos justificados.
- Mantiene lógica original.
- Mantiene navegación original.
- Tiene loading.
- Tiene error.
- Tiene empty state.
- Tiene estados disabled.
- Tiene copy en español.
- Tiene buena jerarquía visual.
- No contiene screenshots viejas embebidas.
- No contiene texto de Material Symbols visible.
- Funciona en mobile.
- No rompe `npm run lint`.
- No rompe `npx tsc --noEmit`.

---

## 19. Prioridades finales

Si querés mejorar la app rápido y que se note profesional, empezaría por:

1. Theme + primitives.
2. Auction cards.
3. Home.
4. Explore auctions.
5. Live auction.
6. Bid confirmation/error/success states.
7. Sell wizard.
8. Profile.
9. Purchases/payment.
10. Policies/chat.

El mayor impacto visual y funcional está en **Home + Explorar + Subasta en vivo + Subir bien**.
