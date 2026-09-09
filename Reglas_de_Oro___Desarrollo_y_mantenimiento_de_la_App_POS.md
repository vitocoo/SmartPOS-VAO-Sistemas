# REGLAS DE ORO — DESARROLLO Y MANTENIMIENTO DE LA APP POS

## 0. PRINCIPIO SUPREMO

**NO ROMPER LO QUE YA FUNCIONA.**

La aplicación es un sistema que está en uso real.

Antes de modificar cualquier cosa:

- No eliminar funciones existentes sin autorización.
- No reorganizar código funcionando solamente porque "podría hacerse mejor".
- No cambiar nombres, estructuras, lógica o comportamiento que no formen parte del pedido.
- No aprovechar una modificación para hacer limpieza general.
- No hacer refactorizaciones preventivas.
- No modificar funcionalidades no relacionadas con la tarea solicitada.
- Si una función parece vieja, innecesaria o mejorable, se informa primero y se espera autorización.

**Una mejora que rompe otra cosa NO es una mejora.**

---

# 1. TRABAJAR SOBRE EL ARCHIVO CORRECTO

El archivo principal de producción se llama siempre:

`index.html`

Ese es el archivo que debe quedar listo para utilizar/publicar.

El nombre que se utilice durante la conversación para identificar una versión de la aplicación no cambia esta regla.

Ejemplo:

- `index.html` → archivo limpio y listo para producción.
- `index_v447.html` → copia de seguridad de la versión entregada.

Nunca entregar solamente el backup.

---

# 2. CADA ENTREGA DEBE TENER DOS ARCHIVOS

Cuando se modifica una aplicación:

### Archivo 1 — PRODUCCIÓN

`index.html`

Debe contener el código limpio, completo y funcional.

### Archivo 2 — BACKUP

`index_vXXX.html`

Debe ser una copia exacta del `index.html` entregado, utilizando el número de versión correspondiente.

El backup sirve para poder volver atrás rápidamente.

**Nunca entregar un archivo parcialmente modificado ni solamente fragmentos de código cuando se solicita una modificación del archivo.**

---

# 3. VERSIONADO

La aplicación utiliza una única versión global:

`APP_VERSION`

Ejemplo:

`APP_VERSION = 447`

Cuando se realiza una nueva entrega:

- aumentar la versión;
- mantener el número coherente en los lugares donde corresponda;
- no inventar múltiples versiones diferentes dentro del mismo archivo;
- no cambiar la versión solamente por modificar un comentario.

Cada módulo independiente tendrá además su propia versión cuando corresponda.

---

# 4. MODIFICAR SOLAMENTE LO SOLICITADO

Si el pedido es:

> "Cambiar X"

se cambia X.

No se debe aprovechar para:

- cambiar Y;
- ordenar Z;
- modificar estilos no relacionados;
- cambiar nombres;
- reemplazar funciones;
- modernizar código;
- cambiar librerías;
- reorganizar HTML;
- modificar otras pantallas.

Aunque técnicamente parezca conveniente.

**Primero cumplir el pedido. Después, si existe una mejora adicional, proponerla separadamente.**

---

# 5. ARQUITECTURA MODULAR — REGLA FUNDAMENTAL

La aplicación NO debe crecer indefinidamente dentro de un único `index.html`.

El `index.html` debe ser el **núcleo operativo**.

Debe contener principalmente aquello que se necesita para la operación cotidiana principal.

Las funcionalidades secundarias, administrativas, experimentales o herramientas deben convertirse progresivamente en **páginas/módulos independientes**.

### Ejemplos de funcionalidades que pueden vivir fuera de `index.html`

- Cajón de herramientas.
- Generador de Flyers.
- Producto Nuevo.
- Raspadita.
- Tragamonedas.
- Herramientas administrativas.
- Reportes que no sean necesarios durante la venta.
- Utilidades.
- Diagnóstico/mantenimiento.
- Funciones experimentales.
- Otras herramientas heredadas del `seba21.html` original.

Estas funciones **NO SE BORRAN**.

Se trasladan a su propia página cuando se decida extraerlas.

---

# 6. PRINCIPIO "NÚCLEO LIVIANO"

La prioridad es:

**menos código cargado = menor peso = menor complejidad = menor posibilidad de romper algo.**

El `index.html` debe cargar solamente lo necesario para funcionar como POS principal.

Una función que se utiliza ocasionalmente no debería obligar al POS completo a cargar todo su código permanentemente.

Por eso, cuando una funcionalidad no es esencial para la venta diaria, se debe evaluar convertirla en:

`index.html`
↓
`Herramientas`
↓
`herramienta_x.html`

---

# 7. NO HACER UNA REORGANIZACIÓN MASIVA

La modularización debe hacerse **una funcionalidad por vez**.

NO:

> "Ahora vamos a reorganizar todo el proyecto."

SÍ:

> "Vamos a sacar solamente el Flyer."

Se extrae una función.

Se prueba.

Se verifica que el POS principal continúe funcionando.

Recién después se pasa a la siguiente.

Esto evita que una limpieza termine provocando diez problemas nuevos.

---

# 8. CADA MÓDULO DEBE SER AUTÓNOMO

Una página secundaria debe intentar tener:

- HTML propio.
- CSS propio cuando corresponda.
- JavaScript propio.
- `APP_VERSION` propio.
- Sus propias funciones.
- Sus propios controles.
- Dependencias claramente identificadas.

Debe evitar depender innecesariamente de variables internas del `index.html`.

Si necesita información del sistema principal, se debe definir explícitamente cómo obtiene esa información.

**No crear dependencias ocultas.**

---

# 9. LAS FUNCIONES COMPARTIDAS SON EXCEPCIÓN

Si varios módulos necesitan una misma función, NO duplicarla diez veces sin analizarlo.

Primero identificar si realmente es una función común.

Ejemplo:

- formato de moneda;
- conversión de moneda;
- comunicación con Apps Script;
- configuración global;
- utilidades comunes.

En ese caso se puede evaluar un archivo compartido.

Pero:

**No crear un archivo común gigante que vuelva a convertirse en otro `seba21.html`.**

La modularización debe reducir complejidad, no cambiarle el nombre.

---

# 10. EXTRACCIÓN DE FUNCIONES DEL SEBA21 ORIGINAL

El `seba21.html` original puede utilizarse como fuente para recuperar funcionalidades.

Pero copiar una función desde el original NO significa copiar todo su código.

Al extraer una funcionalidad:

1. Identificar exactamente qué parte pertenece a esa función.
2. Identificar sus dependencias.
3. Separarla.
4. Adaptar únicamente las dependencias necesarias.
5. Probarla de forma independiente.
6. Comprobar que `index.html` siga funcionando.
7. Recién entonces considerar eliminada esa parte del núcleo.

**Nunca cortar código a ciegas.**

---

# 11. ANTES DE ELIMINAR CÓDIGO

Si una parte del código parece pertenecer a una función que se está trasladando:

Primero determinar:

- dónde se utiliza;
- qué funciones la llaman;
- qué variables necesita;
- qué eventos dependen de ella;
- si comparte lógica con otra función;
- si afecta el inicio de la aplicación.

Si existe duda:

**NO ELIMINAR.**

Informar qué se encontró y esperar instrucciones.

---

# 12. LOCALSTORAGE — PROTECCIÓN CONTRA PÉRDIDA DE TRABAJO

Cuando el usuario esté realizando una edición, configuración, armado de contenido o trabajo que pueda perderse por:

- cerrar accidentalmente;
- recargar;
- salir de la página;
- cambiar de pantalla;
- perder conexión;
- error del navegador;

se debe utilizar `localStorage` cuando sea técnicamente apropiado.

El objetivo es:

**si el usuario sale por accidente, poder recuperar su trabajo.**

La recuperación debe ser segura y no sobrescribir silenciosamente información nueva.

---

# 13. NO CONFUNDIR "LIMPIAR" CON "BORRAR"

Cuando el usuario diga que quiere "limpiar" una aplicación, interpretar inicialmente:

**quitar del núcleo las funciones que ya no corresponden a esa versión, preferentemente trasladándolas a módulos independientes.**

No interpretar automáticamente:

> "borrar definitivamente esas funciones".

La función puede seguir siendo útil posteriormente.

---

# 14. CAMBIOS VISUALES

No modificar diseño, colores, tamaños, distribución o comportamiento visual que no hayan sido solicitados.

Si existe un sistema visual ya definido:

- respetarlo;
- no reemplazarlo por otro;
- no introducir estilos nuevos sin necesidad;
- mantener coherencia con la interfaz existente.

---

# 15. BACKEND Y GOOGLE SHEETS

El frontend y el backend deben tratarse como sistemas relacionados pero independientes.

No modificar `Code.gs` cuando el pedido corresponde solamente al frontend.

No modificar estructuras de Google Sheets sin autorización.

No cambiar nombres de columnas, hojas, endpoints o estructuras existentes porque parezcan mejorables.

Especialmente:

**No tocar el backend para solucionar un problema que puede solucionarse correctamente en el frontend.**

### 15bis. DIAGNÓSTICO DE FÓRMULAS ROTAS EN GOOGLE SHEETS (#NAME? / #ERROR!)

Cuando una fórmula escrita desde `Code.gs` (vía `setFormula()`) da `#NAME?` o `#ERROR!` en la planilla:

1. No asumir que el problema es la sintaxis general (paréntesis, separadores) sin antes aislar la función puntual que falla.
2. Probar la función sospechosa sola, en una celda vacía, con un caso mínimo (ej. `=ESNUMERO(1)`).
3. Si falla, probar la variante con punto (`=ES.NUMERO(1)`) y la variante en inglés (`=ISNUMBER(1)`).
4. **Caso ya confirmado en esta planilla:** la mayoría de las funciones en español funcionan normalmente (`SI`, `Y`, `O`, `NO`, `COINCIDIR`, `BUSCARV`, `ELEGIR`), pero `ISNUMBER` no tiene traducción activa (ni `ESNUMERO` ni `ES.NUMERO` funcionan) — hay que usar `ISNUMBER` en inglés ahí específicamente. Mezclar nombres en inglés y español en la misma fórmula funciona sin problema.
5. Si aparece una función nueva que también falla, agregar el hallazgo a esta lista en vez de perder tiempo re-diagnosticando desde cero la próxima vez.

---

# 16. NO HACER CAMBIOS "POR SI ACASO"

Queda prohibido modificar código con argumentos como:

- "por seguridad";
- "para optimizar";
- "ya que estamos";
- "aproveché de mejorar";
- "era código antiguo";
- "lo dejé más moderno".

Si no fue solicitado y no es imprescindible para cumplir el pedido:

**NO TOCAR.**

---

# 17. PRUEBA DESPUÉS DE CADA CAMBIO

Después de cada modificación importante comprobar al menos:

### POS PRINCIPAL

- carga;
- productos;
- búsqueda;
- carrito;
- cantidades;
- precios;
- ofertas;
- pagos;
- cierre de venta.

### FUNCIONES AFECTADAS

Probar específicamente la función modificada.

### FUNCIONES NO AFECTADAS

Comprobar que sigan funcionando las zonas críticas.

---

# 18. SI ALGO FALLA, VOLVER ATRÁS

Si una modificación provoca errores inesperados:

No seguir agregando parches encima.

Primero:

1. identificar qué cambio provocó el problema;
2. revertirlo;
3. recuperar la última versión funcional;
4. analizar nuevamente;
5. realizar una modificación más pequeña.

**No solucionar un problema creando tres problemas nuevos.**

---

# 19. NO ADIVINAR

Si falta información crítica:

No inventar.

No asumir.

No cambiar arquitectura basándose en una suposición.

Se debe indicar:

> "Encontré X. Para hacer Y necesito confirmar Z."

Pero si el pedido está suficientemente claro, **trabajar directamente y no hacer preguntas innecesarias.**

---

# 20. ENTREGABLE FINAL

Cuando el trabajo esté terminado, entregar:

### PRODUCCIÓN

`index.html`

### BACKUP

`index_vXXX.html`

Y explicar brevemente:

- qué se modificó;
- qué se extrajo;
- qué quedó en `index.html`;
- qué quedó pendiente;
- versión final.

No entregar solamente explicaciones.

**El archivo completo es el producto.**

---

# 21. REGLA ESPECIAL PARA MODULARIZACIÓN

Cuando el usuario solicite:

> "Sacar esto del index"

interpretar como:

**extraer la funcionalidad a una página independiente, mantenerla funcional y eliminar del núcleo solamente lo que ya quedó correctamente reemplazado.**

La nueva página debe quedar preparada para integrarse posteriormente desde:

**Cajón de herramientas / Herramientas**

No se debe eliminar una función simplemente para hacer el archivo más pequeño.

El objetivo es:

**POS principal liviano + herramientas independientes + navegación clara.**

---

# 22. OBJETIVO DE ARQUITECTURA A FUTURO

La evolución deseada es:

```text
APP
│
├── index.html
│   └── POS / operación diaria
│
├── herramientas.html
│   ├── Flyer
│   ├── Producto Nuevo
│   ├── Raspadita
│   ├── Tragamonedas
│   ├── Reportes
│   ├── Diagnóstico
│   └── otras herramientas
│
├── flyer.html
├── producto-nuevo.html
├── raspadita.html
└── otras herramientas
```

La estructura exacta puede cambiar según el proyecto.

El principio NO cambia:

> **El núcleo vende. Las herramientas ayudan. No todo tiene que vivir dentro del núcleo.**

---

# 23. REGLA FINAL

Antes de entregar cualquier modificación preguntarse:

### ¿Estoy modificando solamente lo solicitado?

### ¿Estoy preservando lo que funciona?

### ¿Estoy evitando aumentar innecesariamente el tamaño del núcleo?

### ¿Esta función realmente pertenece al POS principal?

### ¿Podría vivir mejor como módulo independiente?

### ¿La extracción rompe alguna dependencia?

### ¿Existe una copia recuperable de la versión anterior?

Si alguna respuesta genera duda:

**DETENERSE, ANALIZAR Y NO HACER CAMBIOS ADICIONALES.**

---

# FILOSOFÍA DEL PROYECTO

La aplicación debe crecer como un sistema profesional:

**pequeño núcleo + módulos independientes + cambios controlados + versiones recuperables.**

No buscamos tener "menos archivos".

Buscamos tener **menos complejidad dentro de cada archivo**.

Un archivo gigante no es una señal de que el sistema sea más simple.

Muchas veces es exactamente lo contrario.

**NO ROMPER.
NO INVENTAR.
NO MEZCLAR.
NO SOBRECARGAR EL NÚCLEO.
MODULARIZAR DE A UNA FUNCIÓN.
PROBAR.
VERSIONAR.
ENTREGAR COMPLETO.**
