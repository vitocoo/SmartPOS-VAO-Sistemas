// ===============================
// VENDEDORES LUPINO — Web App API
// Columnas VENDEDORES:  A=Prefijo B=Nombre C=Teléfono D=Correo E=Categoría F=Fecha Alta G=Activo H=Comision% I=Alias Pago J=Link MP K=Notas
// ⚠️  Token MP NO va en Sheets — se guarda en Script Properties (seguro)
//     Para cargar tokens: ejecutar setTokenMP('PREFIJO', 'APP_USR-...')
// Columnas INVENTARIO:  A=Código B=Producto C=Stock D=P.Costo E=P.Venta F=Proveedor G=Categoría H=Reservada I=Reservada
// Columnas VENTAS:      A=Fecha B=Producto C=Cantidad D=P.Venta E=Modo de pago F=Total
// ===============================

function doGet(e) {
  const action  = e.parameter.action  || '';
  const prefijo = (e.parameter.prefijo || 'NE').toUpperCase();
  const data    = e.parameter.data ? JSON.parse(decodeURIComponent(e.parameter.data)) : {};

  var result;
  try {
    if      (action === 'getVendedores')      { result = getVendedores(); }
    else if (action === 'crearVendedor')      { result = crearVendedor(data); }
    else if (action === 'getProductos')       { result = getProductos(prefijo); }
    else if (action === 'vender')             { result = registrarVenta(data, prefijo); }
    else if (action === 'ingresarMercaderia') { result = ingresarMercaderia(data, prefijo); }
    else if (action === 'ajustarStock')       { result = ajustarStock(data, prefijo); }
    else if (action === 'getEstadisticas')    { result = getEstadisticas(data, prefijo); }
    else if (action === 'getVentas')          { result = getVentas(prefijo); }
    else if (action === 'getVentasDiarias')   { result = getVentasDiarias(data, prefijo); }
    else if (action === 'getTokenMP')         { result = getTokenMP(prefijo); }
    else if (action === 'adminLogin')         { result = adminLogin(data); }
    else if (action === 'clienteLogin')       { result = clienteLogin(data); }
    else if (action === 'cerrarSesion')       { result = cerrarSesionCliente(prefijo); }
    else if (action === 'getResumenAdmin')    { result = getResumenAdmin(data.token || ''); }
    else                                      { result = { error: 'Acción no reconocida: ' + action }; }
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===============================
// GESTIÓN SEGURA DE TOKENS MP
// Los tokens NUNCA se guardan en Sheets — viven en Script Properties
// ===============================

// Ejecutar manualmente UNA VEZ desde el editor para cargar el token:
// setTokenMP('NE', 'APP_USR-...')
// setTokenMP('VA', 'APP_USR-...')
function setTokenMP(prefijo, token) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('MP_TOKEN_' + prefijo.toUpperCase(), token);
  Logger.log('Token guardado para ' + prefijo);
}

// Eliminar token de un vendedor
function deleteTokenMP(prefijo) {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('MP_TOKEN_' + prefijo.toUpperCase());
  Logger.log('Token eliminado para ' + prefijo);
}

// Ver qué prefijos tienen token cargado (SIN mostrar el token)
function listarTokensConfigurados() {
  var props = PropertiesService.getScriptProperties().getProperties();
  var configurados = [];
  for (var key in props) {
    if (key.startsWith('MP_TOKEN_')) {
      configurados.push(key.replace('MP_TOKEN_', ''));
    }
  }
  Logger.log('Tokens configurados: ' + configurados.join(', '));
  return configurados;
}

// Endpoint que devuelve el token al POS — solo si el prefijo coincide
// El token sale del servidor cifrado en HTTPS, nunca se guarda en Sheets
function getTokenMP(prefijo) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('MP_TOKEN_' + prefijo) || '';
  if (!token) return { token: '', configurado: false };
  return { token: token, configurado: true };
}

function getHojaInv(prefijo) {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('INVENTARIO_' + prefijo);
  if (!hoja) throw new Error('No existe hoja INVENTARIO_' + prefijo);
  return hoja;
}

function getHojaVentas(prefijo) {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('VENTAS_' + prefijo);
  if (!hoja) throw new Error('No existe hoja VENTAS_' + prefijo);
  return hoja;
}

function getVendedores() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('VENDEDORES');
  if (!hoja) throw new Error('No existe hoja VENDEDORES');
  var datos = hoja.getDataRange().getValues();
  var vendedores = [];
  for (var i = 1; i < datos.length; i++) {
    var f = datos[i];
    var prefijo = f[0] ? String(f[0]).trim().toUpperCase() : '';
    if (!prefijo) continue;
    // A=Prefijo B=Nombre C=Teléfono D=Correo E=Categoría F=Fecha Alta G=Activo H=Comision% I=Alias Pago J=Link MP K=Notas
    vendedores.push({
      prefijo:   prefijo,
      nombre:    String(f[1]  || '').trim(),
      telefono:  String(f[2]  || '').trim(),
      correo:    String(f[3]  || '').trim(),
      categoria: String(f[4]  || '').trim(),
      fechaAlta: f[5] ? Utilities.formatDate(new Date(f[5]), Session.getScriptTimeZone(), 'dd/MM/yyyy') : '',
      activo:    String(f[6]  || '').trim().toLowerCase() === 'si',
      comision:  parseFloat(f[7]) || 0,
      aliasPago: String(f[8]  || '').trim(),
      linkMP:    String(f[9]  || '').trim(),
      notas:     String(f[10] || '').trim()
      // tokenMP: NUNCA se devuelve desde getVendedores — se pide por separado con getTokenMP
    });
  }
  return { vendedores: vendedores };
}

function crearVendedor(data) {
  var ss        = SpreadsheetApp.getActiveSpreadsheet();
  var prefijo   = (data.prefijo   || '').trim().toUpperCase();
  var nombre    = (data.nombre    || '').trim();
  var telefono  = (data.telefono  || '').trim();
  var correo    = (data.correo    || '').trim();
  var categoria = (data.categoria || 'GENERAL').trim().toUpperCase();
  var comision  = parseFloat(data.comision) || 0;
  var aliasPago = (data.aliasPago || '').trim();
  var linkMP    = (data.linkMP    || '').trim();
  var tokenMP   = (data.tokenMP   || '').trim(); // se guarda en Properties, NO en Sheets

  if (!prefijo || prefijo.length < 2) return { error: 'Prefijo inválido (mínimo 2 letras)' };
  if (!nombre) return { error: 'Nombre requerido' };

  var hVend = ss.getSheetByName('VENDEDORES');
  if (!hVend) return { error: 'No existe hoja VENDEDORES' };

  var datosVend = hVend.getDataRange().getValues();
  for (var i = 1; i < datosVend.length; i++) {
    if (String(datosVend[i][0]).trim().toUpperCase() === prefijo) {
      return { error: 'El prefijo ' + prefijo + ' ya existe' };
    }
  }

  var nombreInv = 'INVENTARIO_' + prefijo;
  if (!ss.getSheetByName(nombreInv)) {
    var hInv = ss.insertSheet(nombreInv);
    hInv.getRange(1,1,1,9).setValues([['Código','Producto','Stock','P.Costo','P.Venta','Proveedor','Categoría','Reservada','Reservada']]);
    hInv.getRange(1,1,1,9).setFontWeight('bold');
  }

  var nombreVentas = 'VENTAS_' + prefijo;
  if (!ss.getSheetByName(nombreVentas)) {
    var hVentas = ss.insertSheet(nombreVentas);
    hVentas.getRange(1,1,1,6).setValues([['Fecha','Producto','Cantidad','P.Venta','Modo de pago','Total']]);
    hVentas.getRange(1,1,1,6).setFontWeight('bold');
  }

  // Guardar en Sheets SIN el token — columnas: A=Prefijo B=Nombre C=Teléfono D=Correo E=Categoría F=Fecha Alta G=Activo H=Comision% I=Alias Pago J=Link MP K=Notas
  var ultimaFila = hVend.getLastRow() + 1;
  hVend.getRange(ultimaFila,1,1,11).setValues([[
    prefijo, nombre, telefono, correo, categoria,
    new Date(), 'si', comision, aliasPago, linkMP, ''
  ]]);

  // Si vino token, guardarlo en Properties (seguro)
  if (tokenMP) {
    PropertiesService.getScriptProperties().setProperty('MP_TOKEN_' + prefijo, tokenMP);
  }

  return { success: true, mensaje: '✅ Vendedor ' + nombre + ' (' + prefijo + ') creado', prefijo: prefijo };
}

function getProductos(prefijo) {
  var inv   = getHojaInv(prefijo);
  var datos = inv.getDataRange().getValues();
  var productos = [];
  for (var i = 1; i < datos.length; i++) {
    var fila   = datos[i];
    var nombre = fila[1] ? String(fila[1]).trim() : '';
    var precio = parseFloat(fila[4]) || 0;
    if (!nombre || precio <= 0) continue;
    productos.push({
      id:       i + 1,
      codigo:   fila[0] ? String(fila[0]).trim() : '',
      name:     nombre.toUpperCase(),
      price:    precio,
      costo:    parseFloat(fila[3]) || 0,
      stock:    parseInt(fila[2])   || 0,
      proveedor:fila[5] ? String(fila[5]).trim() : '',
      category: fila[6] ? String(fila[6]).trim().toUpperCase() : 'GENERAL'
    });
  }
  return { productos: productos };
}

function registrarVenta(data, prefijo) {
  var inv      = getHojaInv(prefijo);
  var ventas   = getHojaVentas(prefijo);
  var items    = data.items || [];
  var metodo   = (data.metodoPago || 'EFECTIVO').toUpperCase();
  var ahora    = new Date();
  var errores  = [];
  var procesados = [];
  var bloqueados = [];
  var datosInv = inv.getDataRange().getValues();

  for (var k = 0; k < items.length; k++) {
    var item     = items[k];
    var filaIdx  = parseInt(item.id);
    if (!filaIdx || filaIdx < 2) continue;
    var stockActual = parseInt(datosInv[filaIdx-1][2]) || 0;
    var qty         = parseInt(item.qty) || 1;
    var precio      = (item.precioVenta !== undefined && item.precioVenta !== null && item.precioVenta !== '')
      ? parseFloat(item.precioVenta)
      : parseFloat(datosInv[filaIdx-1][4]) || 0;
    var nombre = String(datosInv[filaIdx-1][1]).trim().toUpperCase();

    // BLOQUEO DURO: sin stock no se registra ni se descuenta
    if (stockActual <= 0) {
      bloqueados.push(nombre);
      errores.push(nombre + ': sin stock (venta NO registrada)');
      continue;
    }

    // Stock insuficiente: registra pero avisa
    if (stockActual < qty) {
      errores.push(nombre + ': stock insuficiente (disponible: ' + stockActual + ')');
      qty = stockActual; // vende lo que hay
    }

    inv.getRange(filaIdx,3).setValue(stockActual - qty);
    var uf = ventas.getLastRow() + 1;
    ventas.getRange(uf,1,1,6).setValues([[ahora, nombre, qty, precio, metodo, precio*qty]]);
    ventas.getRange(uf,1).setNumberFormat('dd/mm/yyyy hh:mm');
    ventas.getRange(uf,4).setNumberFormat('"$"#,##0');
    ventas.getRange(uf,6).setNumberFormat('"$"#,##0');
    procesados.push({ name: nombre, qty: qty, precio: precio });
  }

  var success = procesados.length > 0;
  return {
    success: success,
    procesados: procesados,
    errores: errores,
    bloqueados: bloqueados
  };
}

function ingresarMercaderia(data, prefijo) {
  var inv      = getHojaInv(prefijo);
  var nombre   = (data.nombre   || '').trim().toUpperCase();
  var cantidad = parseInt(data.cantidad) || 0;
  var costo    = parseFloat(data.costo)  || 0;
  var venta    = parseFloat(data.venta)  || 0;
  var prov     = (data.proveedor || '').trim().toUpperCase();
  var cat      = (data.categoria || 'GENERAL').trim().toUpperCase();

  if (!nombre)       return { error: 'Nombre requerido' };
  if (cantidad <= 0) return { error: 'Cantidad inválida' };

  var datos = inv.getDataRange().getValues();
  var filaExistente = -1;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][1]).trim().toUpperCase() === nombre) { filaExistente = i+1; break; }
  }

  if (filaExistente > 0) {
    var stockActual = parseInt(datos[filaExistente-1][2]) || 0;
    inv.getRange(filaExistente,3).setValue(stockActual + cantidad);
    if (venta > 0) inv.getRange(filaExistente,5).setValue(venta);
    if (costo > 0) inv.getRange(filaExistente,4).setValue(costo);
    if (prov)      inv.getRange(filaExistente,6).setValue(prov);
    return { success: true, mensaje: '📦 Stock actualizado: ' + nombre + ' (+' + cantidad + ')', nuevo: false };
  } else {
    var ultimaFila   = inv.getLastRow() + 1;
    var datosSlice   = datos.slice(1);
    var ultimoCodigo = 0;
    for (var j = 0; j < datosSlice.length; j++) {
      var cod = String(datosSlice[j][0]);
      if (cod.startsWith(prefijo)) {
        var num = parseInt(cod.replace(prefijo,'')) || 0;
        if (num > ultimoCodigo) ultimoCodigo = num;
      }
    }
    var nuevoCodigo = prefijo + String(ultimoCodigo+1).padStart(3,'0');
    inv.getRange(ultimaFila,1,1,7).setValues([[nuevoCodigo, nombre, cantidad, costo, venta, prov, cat]]);
    return { success: true, mensaje: '✅ Nuevo producto: ' + nombre + ' (' + nuevoCodigo + ')', nuevo: true };
  }
}

function ajustarStock(data, prefijo) {
  var inv        = getHojaInv(prefijo);
  var filaIdx    = parseInt(data.id);
  var nuevoStock = parseInt(data.stock);
  var nuevoPrecio= parseFloat(data.precio);
  var nuevoNombre= (data.nombre || '').trim().toUpperCase();
  var nuevoCodigo= (data.codigo || '').trim().toUpperCase();

  if (!filaIdx || filaIdx < 2) return { error: 'ID inválido' };
  if (!isNaN(nuevoStock)   && nuevoStock  >= 0) inv.getRange(filaIdx,3).setValue(nuevoStock);
  if (!isNaN(nuevoPrecio)  && nuevoPrecio >  0) inv.getRange(filaIdx,5).setValue(nuevoPrecio);
  if (nuevoNombre) inv.getRange(filaIdx,2).setValue(nuevoNombre);
  if (nuevoCodigo) inv.getRange(filaIdx,1).setValue(nuevoCodigo);
  return { success: true, mensaje: 'Producto actualizado' };
}

function getEstadisticas(data, prefijo) {
  var ventas     = getHojaVentas(prefijo);
  var filas      = ventas.getDataRange().getValues();
  var hoy        = new Date();
  var hoyStr     = Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var mesActual  = hoy.getMonth();
  var anioActual = hoy.getFullYear();
  var resHoy = {}, resMes = {}, resProductos = {}, resMeses = {};
  var ventasHoy = 0, ventasMes = 0;

  for (var i = 1; i < filas.length; i++) {
    var fila  = filas[i];
    var fecha = fila[0];
    if (!fecha || !(fecha instanceof Date)) continue;
    var nombre   = String(fila[1]||'').trim().toUpperCase();
    var qty      = parseFloat(fila[2])||0;
    var total    = parseFloat(fila[5])||0;
    var metodo   = String(fila[4]||'EFECTIVO').trim().toUpperCase();
    var fechaStr = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var mesStr   = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM');
    var esMes    = fecha.getMonth()===mesActual && fecha.getFullYear()===anioActual;

    if (fechaStr===hoyStr) { resHoy[metodo]=(resHoy[metodo]||0)+total; ventasHoy+=total; }
    if (esMes)             { resMes[metodo]=(resMes[metodo]||0)+total; ventasMes+=total; }
    resMeses[mesStr]=(resMeses[mesStr]||0)+total;
    if (esMes && nombre) {
      if (!resProductos[nombre]) resProductos[nombre]={qty:0,total:0};
      resProductos[nombre].qty+=qty; resProductos[nombre].total+=total;
    }
  }

  var topProductos = [];
  var entries = Object.keys(resProductos).map(function(k){ return [k, resProductos[k]]; });
  entries.sort(function(a,b){ return b[1].total-a[1].total; });
  for (var t = 0; t < Math.min(10, entries.length); t++) {
    topProductos.push({ nombre:entries[t][0], qty:entries[t][1].qty, total:entries[t][1].total });
  }

  var histMeses = [];
  var mEntries = Object.keys(resMeses).sort();
  for (var m = 0; m < mEntries.length; m++) {
    histMeses.push({ mes:mEntries[m], total:resMeses[mEntries[m]] });
  }

  return { hoy:{metodos:resHoy,total:ventasHoy}, mes:{metodos:resMes,total:ventasMes}, topProductos:topProductos, histMeses:histMeses };
}

function getVentasDiarias(data, prefijo) {
  var ventas = getHojaVentas(prefijo);
  var anio   = parseInt(data.anio) || new Date().getFullYear();
  var mes    = parseInt(data.mes);
  var filas  = ventas.getDataRange().getValues();
  var dias   = {};
  var metodosArr = [];

  for (var i = 1; i < filas.length; i++) {
    var fila  = filas[i];
    var fecha = fila[0];
    if (!fecha || !(fecha instanceof Date)) continue;
    if (fecha.getFullYear() !== anio) continue;
    if (!isNaN(mes) && fecha.getMonth() !== mes) continue;
    var dia    = fecha.getDate();
    var metodo = String(fila[4]||'EFECTIVO').trim().toUpperCase();
    var total  = parseFloat(fila[5])||0;
    if (!dias[dia]) dias[dia]={};
    dias[dia][metodo]=(dias[dia][metodo]||0)+total;
    if (metodosArr.indexOf(metodo)===-1) metodosArr.push(metodo);
  }
  return { dias:dias, metodos:metodosArr.sort(), anio:anio, mes:isNaN(mes)?-1:mes };
}

function getVentas(prefijo) {
  var ventas  = getHojaVentas(prefijo);
  var filas   = ventas.getDataRange().getValues();
  var tz      = Session.getScriptTimeZone();
  var resultado = [];
  for (var i = 1; i < filas.length; i++) {
    var fila  = filas[i];
    var fecha = fila[0];
    if (!fecha || !(fecha instanceof Date)) continue;
    resultado.push({
      fecha:  Utilities.formatDate(fecha, tz, 'yyyy-MM-dd'),
      hora:   Utilities.formatDate(fecha, tz, 'HH:mm'),
      nombre: String(fila[1]||'').trim().toUpperCase(),
      qty:    parseFloat(fila[2])||0,
      precio: parseFloat(fila[3])||0,
      metodo: String(fila[4]||'EFECTIVO').trim().toUpperCase(),
      total:  parseFloat(fila[5])||0
    });
  }
  return { ventas: resultado };
}

// ===============================
// MÓDULO AUTH — VAO SmartPOS
// Gestión segura de acceso admin y PIN de clientes
// Tokens y PINs NUNCA en Sheets — solo en Script Properties
// ===============================

// ── HELPERS ──────────────────────────────────────────────────────

function generarToken(largo) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var token = '';
  for (var i = 0; i < (largo || 32); i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function hashSimple(texto) {
  // Hash básico para no guardar PINs en texto plano en Properties
  // No es criptográfico pero es suficiente para este sistema
  var hash = 0;
  var sal  = 'VAO2026';
  var str  = sal + texto + sal;
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'H' + Math.abs(hash).toString(36).toUpperCase();
}

// ── ADMIN — CLAVE MAESTRA ─────────────────────────────────────────

// Ejecutar UNA VEZ desde el editor para cargar la clave:
// setAdminClave('tu_clave_aqui')
function setAdminClave(clave) {
  if (!clave || clave.length < 6) {
    Logger.log('ERROR: La clave debe tener al menos 6 caracteres');
    return;
  }
  var props = PropertiesService.getScriptProperties();
  props.setProperty('ADMIN_CLAVE_HASH', hashSimple(clave));
  Logger.log('✅ Clave admin configurada correctamente');
}

function adminLogin(data) {
  var clave = (data.clave || '').trim();
  if (!clave) return { error: 'Clave requerida' };

  var props     = PropertiesService.getScriptProperties();
  var claveHash = props.getProperty('ADMIN_CLAVE_HASH');

  if (!claveHash) return { error: 'Sistema no configurado — ejecutar setAdminClave() primero' };
  if (hashSimple(clave) !== claveHash) return { error: 'Clave incorrecta' };

  // Generar token de sesión admin (duración 8 horas)
  var token    = 'ADMIN_' + generarToken(24);
  var expira   = new Date().getTime() + (8 * 60 * 60 * 1000);
  props.setProperty('SESSION_ADMIN', JSON.stringify({ token: token, expira: expira }));

  Logger.log('✅ Login admin exitoso');
  return { success: true, token: token, expira: expira };
}

function validarSesionAdmin(token) {
  if (!token || !token.startsWith('ADMIN_')) return false;
  var props    = PropertiesService.getScriptProperties();
  var sesionStr= props.getProperty('SESSION_ADMIN');
  if (!sesionStr) return false;
  try {
    var sesion = JSON.parse(sesionStr);
    if (sesion.token !== token) return false;
    if (new Date().getTime() > sesion.expira) {
      props.deleteProperty('SESSION_ADMIN');
      return false;
    }
    return true;
  } catch(e) { return false; }
}

// ── PIN DE CLIENTES ───────────────────────────────────────────────

// Ejecutar desde el editor para cargar el PIN de un cliente:
// setPIN('MC', '1234')
function setPIN(prefijo, pin) {
  prefijo = (prefijo || '').trim().toUpperCase();
  pin     = (pin || '').trim();
  if (!prefijo) { Logger.log('ERROR: Prefijo requerido'); return; }
  if (!pin || pin.length < 4) { Logger.log('ERROR: PIN debe tener al menos 4 caracteres'); return; }

  var props = PropertiesService.getScriptProperties();
  props.setProperty('PIN_' + prefijo, hashSimple(pin));

  // Actualizar estado en hoja CLIENTES_VAO si existe
  actualizarEstadoCliente(prefijo, 'PIN', 'CONFIGURADO ✅');

  Logger.log('✅ PIN configurado para ' + prefijo);
}

function eliminarPIN(prefijo) {
  prefijo = (prefijo || '').trim().toUpperCase();
  PropertiesService.getScriptProperties().deleteProperty('PIN_' + prefijo);
  actualizarEstadoCliente(prefijo, 'PIN', 'PENDIENTE ⚠️');
  Logger.log('🗑️ PIN eliminado para ' + prefijo);
}

function clienteLogin(data) {
  var prefijo = (data.prefijo || '').trim().toUpperCase();
  var pin     = (data.pin     || '').trim();

  if (!prefijo) return { error: 'Prefijo requerido' };
  if (!pin)     return { error: 'PIN requerido' };

  // Verificar que el cliente existe y está activo
  var infoCliente = obtenerInfoCliente(prefijo);
  if (!infoCliente)            return { error: 'Cliente no encontrado' };
  if (!infoCliente.activo)     return { error: 'Cliente inactivo — contactar a VAO Sistemas' };

  // Validar PIN
  var props   = PropertiesService.getScriptProperties();
  var pinHash = props.getProperty('PIN_' + prefijo);
  if (!pinHash) return { error: 'Acceso no configurado — contactar a VAO Sistemas' };
  if (hashSimple(pin) !== pinHash) return { error: 'PIN incorrecto' };

  // Generar token de sesión cliente (duración 7 días)
  var token  = 'CLI_' + prefijo + '_' + generarToken(20);
  var expira = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
  props.setProperty('SESSION_' + prefijo, JSON.stringify({ token: token, expira: expira }));

  Logger.log('✅ Login exitoso: ' + prefijo);
  return {
    success: true,
    token:   token,
    expira:  expira,
    prefijo: prefijo,
    nombre:  infoCliente.nombre
  };
}

function validarSesionCliente(prefijo, token) {
  if (!prefijo || !token) return false;
  if (!token.startsWith('CLI_' + prefijo + '_')) return false;

  var props    = PropertiesService.getScriptProperties();
  var sesionStr= props.getProperty('SESSION_' + prefijo);
  if (!sesionStr) return false;

  try {
    var sesion = JSON.parse(sesionStr);
    if (sesion.token !== token) return false;
    if (new Date().getTime() > sesion.expira) {
      props.deleteProperty('SESSION_' + prefijo);
      return false;
    }
    return true;
  } catch(e) { return false; }
}

function cerrarSesionCliente(prefijo) {
  prefijo = (prefijo || '').trim().toUpperCase();
  PropertiesService.getScriptProperties().deleteProperty('SESSION_' + prefijo);
  return { success: true };
}

// ── HELPERS INTERNOS ──────────────────────────────────────────────

function obtenerInfoCliente(prefijo) {
  // Busca en VENDEDORES (planilla del sistema)
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('VENDEDORES');
  if (!hoja) return null;
  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    var f = datos[i];
    if (String(f[0]).trim().toUpperCase() === prefijo) {
      return {
        prefijo: prefijo,
        nombre:  String(f[1] || '').trim(),
        activo:  String(f[6] || '').trim().toLowerCase() === 'si'
      };
    }
  }
  return null;
}

function actualizarEstadoCliente(prefijo, campo, valor) {
  // Actualiza columna L (Token MP) o M (PIN) en CLIENTES_VAO si existe
  try {
    var ss   = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName('CLIENTES_VAO');
    if (!hoja) return;
    var datos = hoja.getDataRange().getValues();
    var colMap = { 'TOKEN': 12, 'PIN': 13 }; // L=12, M=13
    var col = colMap[campo.toUpperCase()];
    if (!col) return;
    for (var i = 1; i < datos.length; i++) {
      if (String(datos[i][0]).trim().toUpperCase() === prefijo) {
        hoja.getRange(i+1, col).setValue(valor);
        return;
      }
    }
  } catch(e) { Logger.log('actualizarEstadoCliente: ' + e.message); }
}

// ── RESUMEN ADMIN ─────────────────────────────────────────────────

function getResumenAdmin(token) {
  if (!validarSesionAdmin(token)) return { error: 'Sesión admin inválida o expirada' };

  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var hVend   = ss.getSheetByName('VENDEDORES');
  if (!hVend) return { error: 'No existe hoja VENDEDORES' };

  var datos   = hVend.getDataRange().getValues();
  var clientes = [];
  var props   = PropertiesService.getScriptProperties();

  for (var i = 1; i < datos.length; i++) {
    var f       = datos[i];
    var prefijo = String(f[0] || '').trim().toUpperCase();
    if (!prefijo) continue;

    var tienePin   = !!props.getProperty('PIN_' + prefijo);
    var tieneToken = !!props.getProperty('MP_TOKEN_' + prefijo);
    var tieneSesion= !!props.getProperty('SESSION_' + prefijo);

    // Contar ventas del mes
    var totalMes = 0;
    try {
      var hVentas = ss.getSheetByName('VENTAS_' + prefijo);
      if (hVentas) {
        var ventas  = hVentas.getDataRange().getValues();
        var hoy     = new Date();
        for (var v = 1; v < ventas.length; v++) {
          var fecha = ventas[v][0];
          if (fecha instanceof Date &&
              fecha.getMonth() === hoy.getMonth() &&
              fecha.getFullYear() === hoy.getFullYear()) {
            totalMes += parseFloat(ventas[v][5]) || 0;
          }
        }
      }
    } catch(e) {}

    clientes.push({
      prefijo:     prefijo,
      nombre:      String(f[1] || '').trim(),
      activo:      String(f[6] || '').trim().toLowerCase() === 'si',
      tienePin:    tienePin,
      tieneToken:  tieneToken,
      sesionActiva:tieneSesion,
      ventasMes:   totalMes
    });
  }

  return { success: true, clientes: clientes };
}
