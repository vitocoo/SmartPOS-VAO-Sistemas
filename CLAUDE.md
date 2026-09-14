# CLAUDE.md — VAO POS / SmartPOS

## SOBRE MÍ
Soy Victor Alvarez Ojeda, VAO Sistemas, Bariloche.
NO SOY PROGRAMADOR. Explicame simple, sin jerga.
Si no entendés mi pedido, preguntá antes de asumir.

## REGLA CERO
Antes de tocar código, declarar brevemente:
1. Qué archivo vas a modificar
2. Qué sección exacta
3. Qué NO vas a tocar
4. Si detectás riesgo de romper una Regla de Oro
Esperar mi OK. Después escribir.

## 🛑 REGLA MÁS IMPORTANTE
**NO ROMPER LO QUE YA FUNCIONA.**
PRIMERO PRESERVAR. DESPUÉS MODIFICAR.
NUNCA MODIFICAR POR MODIFICAR.

Una solicitud de cambio NO es autorización para modificar el resto.
Si dudás entre cambiar algo no pedido o conservarlo → CONSERVARLO.

## REGLAS DE ORO
1. APP_VERSION entero, +1 por entrega. Nunca v1.2
2. Entregar SIEMPRE 2 archivos idénticos:
   - `archivo.html` (producción)
   - `archivo_vNNN_backup.html` (historial)
3. Cada archivo del ecosistema tiene su PROPIO APP_VERSION
4. Sin superposición de texto NUNCA
5. Sin pull-to-refresh (`overscroll-behavior-y: contain`)
6. Nunca salir de la página sin confirmación (history + popstate)
7. Verde = éxito. Rojo = error. Siempre.
8. Lista de productos tiene prioridad de espacio. Lo secundario colapsado.
9. Ediciones del usuario → icono 💾 cuando hay cambios pendientes
10. Autoguardado en localStorage mientras se edita
11. Un solo botón de refrescar por pantalla
12. Mensajes: centrado > abajo-izq > arriba-der. Nunca tapar info.
13. Modularizar: núcleo liviano + páginas aparte. Nunca uno gigante.
14. Antes de agregar feature: ¿es venta diaria o herramienta?
    Venta diaria → index. Herramienta → página aparte.

## REGLAS MULTICLIENTE (VAO POS)
15. Un solo código para todos los clientes
16. Prefijo llega por URL: `?p=XX`
17. HTML nunca hardcodea "XX" ni "LP"
18. GAS valida prefijo + sesión + módulo antes de tocar hojas
19. Cliente NUNCA ve la planilla
20. Cliente XX nunca ve datos de LP
21. PIN siempre 6 dígitos (solo números)
22. Si módulo = FALSE → ni botón ni endpoint existen
23. Avatar toma color_primario del cliente

## REGLAS DE SEGURIDAD EN ENDPOINTS
Aplica a cualquier endpoint del GAS que devuelva datos privados
(no aplica a endpoints públicos, como el login).

24. TODO endpoint que devuelva datos privados DEBE validar sesión.
    Datos privados = config, ventas, inventario, clientes, resúmenes.
    No alcanza con validar:
      - Que el prefijo exista.
      - Que el cliente esté activo.
    Hay que validar ADEMÁS:
      - Que venga token.
      - Que el token sea válido (validarSesionCliente/Admin).
      - Que el token no haya expirado.

25. Cadena obligatoria de validación en cada endpoint privado:
    1. ¿Existe el prefijo/cliente?
    2. ¿Está activo?
    3. ¿Vino token?
    4. ¿El token es válido para ese prefijo?
    5. ¿El token no expiró?
    6. Recién ahí: acceder a las hojas y devolver datos.

26. NUNCA confiar en el frontend para validar seguridad.
    El frontend puede ocultar botones, pero el backend es el único
    que decide si entrega o no los datos.

27. NUNCA devolver campos sensibles aunque el endpoint esté validado.
    Ejemplos: PIN, tokens MP, claves, hashes.
    Filtrar estos campos ANTES de serializar la respuesta.

28. Antes de agregar un endpoint nuevo, preguntarse:
    - ¿Este endpoint devuelve datos privados? → Validar sesión.
    - ¿Qué pasa si un atacante adivina el prefijo? → Debe fallar.
    - ¿Qué pasa si el token es inventado? → Debe fallar.
    - ¿Qué pasa si el token expiró? → Debe fallar.

29. Este bloque de reglas aplica a TODAS las apps VAO
    (VAO POS, SmartPOS, futuras), siempre que la arquitectura
    tenga cliente/usuarios + endpoints + sesión.

## STACK
- Frontend: HTML/CSS/JS puro
- Backend: Google Apps Script
- DB: Google Sheets (1 planilla, hojas por cliente)
- Deploy: Vercel desde GitHub vitocoo/SmartPOS-VAO-Sistemas
- App: vaopos.vercel.app
- GAS: https://script.google.com/macros/s/AKfycbzJ3NY7.../exec

## ARQUITECTURA
Planilla única "SmartPOS_VAO_Sistemas_Planilla".

GLOBALES: VENDEDORES, CLIENTES_VAO, GUIA_SCRIPT_PROPERTIES
POR CLIENTE: INVENTARIO_XX, VENTAS_XX, CONFIG_XX, CONF_DIARIA_XX

1 cliente = 1 prefijo 2-3 letras. Si colisionan iniciales → usar 3er apellido.

## NUNCA HAGAS ESTO
- Hardcodear prefijo en HTML
- Acceder a hoja sin validar prefijo
- Devolver datos de un cliente a otro
- Subir PINs, tokens o claves a GitHub
- Tocar backend para arreglar problema de frontend
- Refactorizar sin pedido explícito
- "Aprovechar" un cambio para limpiar otra cosa

## FLUJO DE TRABAJO
1. Yo pido en criollo
2. Vos declarás qué tocás y qué NO
3. Yo confirmo
4. Vos entregás código + backup vNNN
5. Yo pruebo
6. Si falla → volver atrás, no parchear encima
7. Una cosa por vez, sin excepciones

## FUENTE DE FUNCIONES MADURAS
`seba21_v469_backup.html` — POS Copihue, 15.000 líneas, 1 año en uso.
Extraer UNA función por vez. No copiar todo. No copiar arquitectura.

## CHANCE LOG — OBLIGATORIO

Al final de CADA sesión, generar un CHANCE LOG descriptivo.
NO es un changelog técnico. Es un registro con contexto y recuperación.

## REGLAS DE PIN POR PÁGINA

Toda página que muestre datos sensibles del cliente DEBE pedir PIN.
Datos sensibles = todo lo que el cliente no querría que un tercero vea.

CON PIN:
- pos.html (ventas, inventario, cobrar)
- reportes.html (ventas del cliente)
- finanzas.html (cuando exista)
- fiados.html (cuando exista)
- prestamos.html (cuando exista)
- retiro-caja.html (cuando exista)
- retiro-local.html (cuando exista)
- config.html (cuando exista)
- Cualquier página con datos del negocio

SIN PIN (públicas):
- index.html (pantalla de entrada)
- catalog.html (si algún día hay catálogo público)

CON CLAVE ADMIN (no PIN):
- admin.html (login propio, uso exclusivo de VAO)

REGLA: si el cliente pierde plata porque alguien vio esos datos → PIN.
REGLA: si el cliente lo puede compartir tranquilamente → no PIN.

para vao sistemas existe marca VAO SISTEMAS (logo) no es usado en almacen copihue.
4 colores base que pueden pisar codigo de colores de mis sitemas.(modelos aparte de almacen copihue)
para esto existe plantilla en imagen.png con estructura y explicacion del logo.

colores almacen copihue.
codigo colores para nuestros sistemas ver sistema-de-color-promociones-copihue.md
