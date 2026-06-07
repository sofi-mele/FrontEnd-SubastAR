# SubastAR - Matriz de trazabilidad Figma / Frontend / API

Fuente visual: [Sistema de subastas - TPO Desarrollo de apps I](https://www.figma.com/design/iA8OKSBt1XyHbEI0GVjhFl/Sistema-de-subastas---TPO-Desarrollo-de-apps-I?node-id=0-1&p=f&t=9sNdCxvMAngdjhpX-0)

Contrato inicial: backend auxiliar `EnzoAA004/SubastAR-Enzo-`, incluyendo el PR #1 para registro y Expo Web.

Estados: `Implementado` = navegable y vinculado a API disponible; `Parcial` = pantalla visible pero requiere endpoint o refinamiento Figma; `Pendiente` = frame relevado aun sin estado propio.

## Alcance De La Revision

- La aplicacion expone rutas independientes o estados API-reproducibles para los flujos relevados abajo.
- Se inspecciono visualmente el lienzo publico de Figma en modo lectura; se reconocieron las agrupaciones de acceso/metodos de pago, chat, puja imposible, compras, estados de cuenta y seguro.
- La validacion pixel a pixel de cada frame sigue requiriendo abrir cada variante con datos de prueba reales en Android/Expo Web; no se incorporan mocks para forzar estados.
- Al expirar JWT o autenticarse desde una accion de invitado, el frontend conserva el destino solicitado para continuar el flujo.
- Inventario verificable actual: 72 frames/estados de flujo trazados en 49 rutas exportables; una misma ruta presenta variantes determinadas por el estado API.

## Acceso, Registro Y Pago

| Frame Figma | Estado | Ruta / reproduccion | API |
|---|---|---|---|
| Splash | Implementado | `/` | sesion local segura |
| Iniciar sesion - Crear cuenta - Invitado | Implementado | `/welcome` | invitado local |
| Registro - Iniciar sesion | Implementado | `/login` | `POST /auth/login` |
| Registro - Datos y DNI | Implementado | `/register` | `POST /auth/registro` multipart |
| Registro - Solicitud enviada / aprobacion pendiente | Implementado | `/registration-pending` | respuesta `202` de registro |
| Registro - Verificacion codigo mail | Implementado | `/verify` | `POST /auth/verificar-codigo` |
| Registro - Crear contrasena | Implementado | `/password` | `POST /auth/completar-registro` |
| Registro - Agregar medio de pago | Implementado | `/onboarding-payment` | navegacion |
| Registro - Tarjeta de credito | Implementado | `/profile/payments/add?type=tarjeta_credito&onboarding=true` | `POST /usuarios/me/medios-pago` |
| Registro - Cuenta bancaria | Implementado | `/profile/payments/add?type=cuenta_bancaria&onboarding=true` | `POST /usuarios/me/medios-pago` |
| Registro - Cheque | Implementado | `/profile/payments/add?type=cheque_certificado&onboarding=true` | `POST /usuarios/me/medios-pago` multipart |
| Agregacion exitosa tarjeta / cuenta | Implementado | `/payment-success?type=tarjeta_credito|cuenta_bancaria` | respuesta de alta |
| Cheque enviado a revision | Implementado | `/payment-success?type=cheque_certificado` | respuesta de alta pendiente de verificacion |

## Invitado, Subastas Y Pujas

| Frame Figma | Estado | Ruta / estado | API |
|---|---|---|---|
| User Invitado - subastas | Implementado | entrar como invitado y abrir `/(tabs)/auctions`; login/registro conservan destino protegido | `GET /subastas` |
| Inicio | Implementado | `/(tabs)` | `GET /subastas` |
| Subastas | Implementado | `/(tabs)/auctions` | `GET /subastas` |
| Subastas - filtros | Implementado | `/auction-filters`, estado/categoria/moneda | filtros de listado |
| Subastas - Datos | Implementado | `/auction/[id]` | `GET /subastas/{id}` |
| Subastas - Catalogo | Implementado | `/auction/[id]/catalog`, tabs todos/disponibles/vendidos | `GET /subastas/{id}/catalogo` |
| Subastas - Item - Objeto | Implementado | `/lot/[id]?auctionId=...` sin artista | `GET /subastas/{id}/catalogo/{item}` |
| Subastas - Item - Obra de arte | Implementado | `/lot/[id]?auctionId=...` con artista | mismo endpoint |
| Subastas - En vivo | Implementado | `/live/[id]` | `GET /subastas/{id}/en-vivo`, polling |
| Puja - elegir medio de pago | Implementado | seleccion en `/live/[id]` | `GET /usuarios/me/medios-pago` |
| Puja - confirmar oferta | Implementado | `/live/[id]/confirm` | `POST /subastas/{id}/pujas` |
| Puja aceptada | Implementado | estado success en `/live/[id]/confirm` | respuesta de puja |
| Subastas - Sin medio de pago | Implementado | `/live/[id]` con lista de pagos vacia | `GET /usuarios/me/medios-pago` |
| Puja imposible - sin medio de pago | Implementado | CTA de pago en `/live/[id]` | pagos vacios |
| Puja imposible - sin categoria habilitada | Implementado | estado restringido en `/live/[id]/confirm` | `403 POST /subastas/{id}/pujas` |
| Puja imposible - cuenta multada/bloqueada | Implementado | estado restringido y CTA a cuenta en `/live/[id]/confirm` | `403 POST /subastas/{id}/pujas` |
| Historial - Con pujas | Implementado | `/live/[id]/history?itemId=...` | `GET /subastas/{id}/pujas/{item}` |
| Ganar subasta | Implementado con PR pendiente | `/result/[id]?itemId=...` | `GET /subastas/{id}/resultado/{item}` |
| Resultado no ganador | Implementado con PR pendiente | mismo resultado con `fue_ganador=false` | mismo endpoint |

## Subir Producto Y Mis Bienes

| Frame Figma | Estado | Ruta / estado | API |
|---|---|---|---|
| Datos del bien | Implementado | `/sell` | iniciar/guardar solicitud |
| Datos - Obras de arte | Implementado | `/sell`, categoria obra con artista/fecha/origen/historia | `PUT /bienes/solicitudes/{codigo}/datos` |
| Datos - Objetos de disenador | Implementado | `/sell`, categoria disenador | mismo endpoint |
| Datos - Otros | Implementado | `/sell`, categoria otros | mismo endpoint |
| Fotos - estado inicial | Implementado | `/sell/photos?code=...`, sin archivos seleccionados | seleccion local |
| Fotos - carga de imagenes | Implementado | `/sell/photos?code=...`, selector y previsualizacion | seleccion local |
| Fotos - imagenes cargadas | Implementado | `/sell/photos?code=...`, 6 fotos y opcion eliminar | multipart fotos |
| Documentacion | Implementado | `/sell/documents?code=...` | multipart documentos |
| Revision final del bien | Implementado | `/sell/review` | confirmar solicitud |
| Solicitud de bien enviada | Implementado | `/sell/success` | respuesta de confirmacion |
| Mis bienes | Implementado | `/profile/assets`, filtros de estado | `GET /bienes/mis-bienes?estado=...` |
| Detalle de bienes - Aceptado | Implementado | `/profile/assets/[id]`, estado aceptado | detalle y aceptar condiciones |
| Detalle de bienes rechazados | Implementado | `/profile/assets/[id]`, estado rechazado | detalle |

## Perfil, Compras, Seguro Y Chat

| Frame Figma | Estado | Ruta / estado | API |
|---|---|---|---|
| Perfil | Implementado | `/(tabs)/profile` | `GET /usuarios/me` |
| Datos personales | Implementado | `/profile/edit` | `GET/PATCH /usuarios/me` |
| Metricas | Implementado | `/profile/metrics` | `GET /usuarios/me/metricas` |
| Historial de participaciones | Parcial | `/profile/history` | compras ganadas desde `GET /compras`; perdidas pendiente de endpoint |
| Perfil multado | Implementado | `/(tabs)/profile`, banner multado; detalle en `/profile/account-status` | estado cuenta |
| Estado de cuenta regular | Implementado | `/profile/account-status`, estado regular | estado cuenta |
| Multas | Implementado | `/profile/account-status` | `GET /usuarios/me/estado-cuenta` |
| Pantalla de inicio bloqueada | Implementado | `/(tabs)`, sesion con estado bloqueado | `GET /usuarios/me/estado-cuenta` |
| Medios de pago | Implementado | `/profile/payments`, confirmacion de eliminacion | listar/eliminar |
| Eliminar medio de pago - confirmacion | Implementado | modal en `/profile/payments` | `DELETE /usuarios/me/medios-pago/{id}` |
| Mis compras | Implementado | `/purchases`, secciones pendientes/en proceso/entregadas | `GET /compras` |
| Detalle de compras | Implementado | `/purchases/[id]` | `GET /compras/{id}` |
| Compra - regularizar pago | Implementado | `/purchases/[id]/payment`, seleccion y confirmacion | `POST /compras/{id}/regularizar-pago` |
| Compra - coordinacion de entrega | Implementado | `/purchases/[id]/delivery` | estado/direccion entrega |
| Compra - envio en camino | Implementado | `/purchases/[id]/delivery`, `estado_entrega=en_camino` | detalle compra |
| Compra - entrega completada | Implementado | `/purchases/[id]/delivery`, `estado_entrega=entregado` | detalle compra |
| Compra - detalle - facturacion | Implementado | `/purchases/[id]/invoice`, desde detalle | `GET /compras/{id}/factura/download` autenticado |
| Compra - detalle - envio cubierto | Implementado con PR pendiente | detalle compra con `poliza_id` | `GET /compras/{id}` |
| Compra - detalle - listo para retirar | Implementado | `/purchases/[id]/delivery` segun `estado_entrega` | detalle compra |
| Poliza de seguro | Implementado | `/policy/[id]` | `GET /seguros/{id}` |
| Seguros y Polizas | Parcial | `/profile/policies` | listado derivado de compras con `poliza_id` |
| Ampliar poliza | Implementado | `/policy/[id]/extend` | `POST /seguros/{id}/ampliar` |
| Contacto compania | Implementado | `/policy/[id]/contact` | contacto poliza |
| Chats | Implementado | `/(tabs)/chat` | `GET /chat/conversaciones` |
| Chat con Bot | Implementado con PR pendiente | `/chat/bot` | lectura y `POST` mensaje |
| Chat con soporte | Implementado con PR pendiente | `/chat/soporte` | lectura y `POST` mensaje |
| Chat de poliza | Implementado con PR pendiente | `/chat/poliza` | lectura y `POST` mensaje |

## Pendientes Backend Confirmados

- Resultado ganador/no ganador y envio de chat quedan condicionados a incorporar la ampliacion del PR backend que agrega sus endpoints.
- El vinculo real compra-poliza (`poliza_id`) y la entrega publica de imagenes de catalogo (`GET /fotos/{id}`) quedan condicionados a incorporar la siguiente ampliacion del mismo PR.
- Las aperturas, cierres y cambio de lote activo de subastas se ejecutaran mediante scripts SQL; el PR retira los endpoints y servicios `/admin/subastas/**`.
- Provision cloud: `nuevas_tablas.sql` depende de tablas originales; no es un esquema SQL Server completo para crear una base nueva.
