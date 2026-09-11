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

## STACK
- Frontend: HTML/CSS/JS puro
- Backend: Google Apps Script
- DB: Google Sheets (1 planilla, hojas por cliente)
- Deploy: Vercel desde GitHub vitocoo/SmartPOS-VAO-Sistemas
- App: vaopos.vercel.app
- GAS: https://script.google.com/macros/s/AKfycbz.../exec

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

Estructura obligatoria:
