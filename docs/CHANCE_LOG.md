# CHANCE LOG — VAO POS / SmartPOS

Registro descriptivo de cada sesión de desarrollo con IA.
Formato detallado en `CLAUDE.md` → sección "CHANCE LOG".

Propósito:
- Permitir reconstruir funciones complejas desde cero.
- Documentar errores blindados (nunca más sufrir el mismo problema).
- Dejar contexto para futuras IAs y para mí mismo en 3 meses.

═══════════════════════════════════════════════════
CHANCE LOG — 11/09/2026 — SESIÓN COMPLETA DEL DÍA
═══════════════════════════════════════════════════

## SESIÓN 1 — ARQUITECTO (orden general del proyecto)

QUÉ: Se ordenó el proyecto completo. Se creó `CLAUDE.md` + carpeta `docs/`.

POR QUÉ: El proyecto estaba disperso en 3 IAs y 5 conversaciones. Nadie
sabía dónde estaba cada regla. Cada IA reinventaba lo mismo.

CÓMO: Se unificaron 4 archivos de reglas de oro en uno solo. Se definió
el modelo multicliente (1 código, hojas por cliente). Se definió el modelo
de packs (base + pack1 + pack2 + pack3 + extra). Se definió PIN 6 dígitos,
3 colores + 4 temas, avatar con color del cliente, validación de contraste.

DÓNDE:
  - `CLAUDE.md` (raíz del repo)
  - `docs/ARQUITECTURA.md`
  - `docs/CONFIG_XX.md`
  - `docs/PROMPT_MAESTRO.md`
  - `docs/PLANILLA ÚNICA.txt`

PROBLEMA QUE EVITA O RESUELVE:
  - Pérdida de reglas entre sesiones.
  - IA inventando cosas distintas cada vez.
  - No tener un "lugar único" para las decisiones.

SI SE ROMPE: Los archivos son texto. Están en GitHub + Drive (backup).
Recuperar de cualquiera de los dos.

PENDIENTE:
  - Renombrar `PLANILLA ÚNICA.txt` a `PLANILLA_UNICA.txt` (sin tilde).
  - Borrar `.xlsx` del repo (contienen datos de clientes).

───────────────────────────────────────────────────

## SESIÓN 2 — CLAUDE (index v008)

QUÉ: Se reemplazó `index.html` completo. Se agregó pantalla de entrada
con código de cliente + identidad VAO.

POR QUÉ: El index viejo (v006) mostraba el POS directamente. Cualquiera
con la URL entraba. No había puerta de entrada.

CÓMO:
  - Input + botón "Entrar".
  - Regex `^[A-Za-z]{2,3}$` (valida formato, no existencia).
  - Redirige a `pos.html?p=XX` con mayúsculas.
  - Link chiquito a `admin.html`.
  - Colores del Brand Book aplicados (#141A22 fondo, #FF9800 borde,
    #2CCB6F botón, #0078FF focus).
  - Logo VAO copiado del header del v006 (height 42→64).

DÓNDE:
  - `index.html` v008
  - `index_v008.html` (backup)

PROBLEMA QUE EVITA O RESUELVE:
  - Cualquiera con la URL entraba al POS.
  - No había puerta clara para el cliente.

SI SE ROMPE:
  - Restaurar desde `index_v006_backup.html` (en Drive).
  - El código está versionado en GitHub.

PENDIENTE (detectado al probar):
  - ⚠️ HUECO: el sistema entra con CUALQUIER código (ej: AAA) aunque
    no exista. Falta validar contra VENDEDORES + CONFIG_XX.
  - Falta agregar Google Fonts (Playfair Display + DM Sans).
  - Falta decidir paleta oficial definitiva (Brand Book vs Manual).

───────────────────────────────────────────────────

## SESIÓN 3 — IDENTIDAD VISUAL (revisión de documentos)

QUÉ: Se revisaron 2 documentos de identidad: Brand Book v1.0 y Manual
de Identidad Visual.

POR QUÉ: Se detectó que la v008 usa una paleta distinta a la del Manual.
Hay que decidir cuál es la oficial antes de seguir.

CÓMO: Lectura de ambos documentos. Comparación.

DÓNDE:
  - Drive personal (los 2 PDFs)
  - A futuro: `docs/IDENTIDAD.md` unificado

PROBLEMA QUE EVITA O RESUELVE:
  - Dos paletas distintas entre Brand Book y Manual.
  - Logo actual es reconstrucción, no SVG oficial.
  - El Manual prohíbe avatares con iniciales genéricas.

SI SE ROMPE: Los PDFs están en Drive. Respaldar en 2 lugares.

PENDIENTE:
  - Decidir paleta oficial:
    * A) #1E88E5 / #43B02A / #FF8C00 (Manual)
    * B) #0078FF / #2CCB6F / #FF9800 (Brand Book v1.0)
  - Conseguir SVG oficial del símbolo (no reconstrucción).
  - Decidir qué hacer con avatares por iniciales.
  - Unificar ambos documentos en `docs/IDENTIDAD.md`.

───────────────────────────────────────────────────

## SESIÓN 4 — CHANCE LOG (definición)

QUÉ: Se definió el formato del CHANCE LOG y se hizo obligatorio.

POR QUÉ: El CHANGELOG técnico no alcanza. Se necesita un registro
descriptivo que permita reconstruir funciones y documentar errores
blindados.

CÓMO: Se definió estructura fija (QUÉ / POR QUÉ / CÓMO / DÓNDE /
PROBLEMA / SI SE ROMPE / PENDIENTE). Se agregó como regla obligatoria
en `CLAUDE.md`. Se guarda en `docs/CHANCE_LOG.md`.

DÓNDE:
  - `CLAUDE.md` → sección "CHANCE LOG"
  - `docs/CHANCE_LOG.md` → este archivo

PROBLEMA QUE EVITA O RESUELVE:
  - Pérdida de contexto entre sesiones.
  - Imposibilidad de reconstruir funciones complejas.
  - Repetir errores ya resueltos.

SI SE ROMPE: Es texto puro. Se recupera de GitHub.

PENDIENTE:
  - A futuro: app propia (vao-bitacora.vercel.app) que lo automatice.

---

## PROBLEMAS ABIERTOS AL CIERRE DEL DÍA

1. **Validación de prefijo incompleta**
   El sistema entra con cualquier código. Falta validar contra
   VENDEDORES + CONFIG_XX. Bloquea el paso siguiente.

2. **CONFIG_XX no existe todavía**
   Sin esta hoja, no se pueden guardar PINs, colores, packs, identidad.

3. **Paleta oficial sin definir**
   Brand Book vs Manual tienen paletas distintas.

4. **SVG oficial del símbolo sin conseguir**
   El que se usa es una reconstrucción.

5. **Avatares por iniciales vs Manual de Identidad**
   El Manual prohíbe meter el símbolo en círculo con letras.

6. **Google Fonts faltantes en index v008**
   No bloquea, pero rompe coherencia con pos.html.

---

## PRÓXIMO PASO (mañana con Claude)

**PASO 1 — Crear CONFIG_XX en la planilla**

Estructura en `docs/CONFIG_XX.md`. Campos:
Identidad, Apariencia, Pagos, WiFi, Recién llegados, Seguridad, Módulos.

Una vez creado, se puede:
  - Agregar endpoint `validarPrefijo` en el GAS.
  - Validar en pos.html al cargar.
  - Validar en index antes de redirigir.

═══════════════════════════════════════════════════
FIN DE LA SESIÓN — 11/09/2026
═══════════════════════════════════════════════════