// 🛡️ ZONA PROTEGIDA – Extrae patente desde texto certificado (match Patente o Inscripción)
function extraerPatenteDesdeTextoCertificado(textoCertificado) {
  const matchPatente = textoCertificado.match(/Patente\s*:?\s*([A-Z0-9\-]+)/i);
  const matchInscripcion = textoCertificado.match(/Inscripción\s*:?\s*([A-Z0-9.\-]+)/i);

  if (matchPatente) {
    Logger.log("✅ Patente extraída con matchPatente: " + matchPatente[1]);
    return matchPatente[1];
  } else if (matchInscripcion) {
    Logger.log("✅ Patente extraída con matchInscripcion: " + matchInscripcion[1]);
    return matchInscripcion[1];
  } else {
    Logger.log("❌ No se encontró la patente ni por 'Patente' ni por 'Inscripción'");
    return "";
  }
}

// 🛡️ Extrae marca desde texto CAV
function extraerMarcaDesdeTextoCertificado(textoCertificado) {
  const textoPlano = textoCertificado.replace(/\s+/g, ' ').trim();
  const match = textoPlano.match(/Marca\s*[:\s]\s*([^\s,]+)/i);

  if (match) {
    Logger.log("✅ Marca extraída: " + match[1]);
    return match[1].trim();
  } else {
    Logger.log("❌ No se encontró la marca");
    return "[PENDIENTE]";
  }
}

// 🧩 Genera texto de contacto vendedor / comprador
function generarContactoDesdeFila(fila, encabezadosF) {
  const getCol = (nombre) => {
    const idx = encabezadosF.findIndex(h => h && h.toString().toLowerCase().trim() === nombre.toLowerCase());
    return idx === -1 ? "" : fila[idx];
  };

  const nombreVend = (() => {
    const vendedorNatural = getCol("Nombre del Vendedor (Persona Natural)");
    const vendedor = getCol("Nombre del Vendedor");
    const representanteVend = getCol("Nombre del Representante del Vendedor");
    const empresa = getCol("Nombre de la Empresa");
    const representanteLegal = getCol("Nombre del Representante Legal");

    if (empresa && representanteLegal) return `${empresa} / ${representanteLegal}`;
    if (vendedor && representanteVend) return `${vendedor} / ${representanteVend}`;
    if (vendedorNatural) return vendedorNatural;
    return "[PENDIENTE]";
  })();

  const telVend = getCol("Teléfono del Vendedor") ||
                  getCol("Teléfono del Representante Legal de la Empresa") ||
                  getCol("Teléfono del Representante Legal del Vendedor") ||
                  "[PENDIENTE]";

  const nombreComp = (() => {
    const compradorNatural = getCol("Nombre del Comprador (Persona natural)");
    const comprador = getCol("Nombre del Comprador");
    const representanteComp = getCol("Nombre del Representante del Comprador");
    const empresaComp = getCol("Nombre de la Empresa Compradora");
    const representanteLegalComp = getCol("Nombre del Representante Legal del Comprador");

    if (empresaComp && representanteLegalComp) return `${empresaComp} / ${representanteLegalComp}`;
    if (comprador && representanteComp) return `${comprador} / ${representanteComp}`;
    if (compradorNatural) return compradorNatural;
    return "[PENDIENTE]";
  })();

  const telComp = getCol("Teléfono del Comprador (Persona natural)") ||
                  getCol("Teléfono del Representante Legal del Comprador") ||
                  "[PENDIENTE]";

  return `Vendedor: ${nombreVend} – ${telVend}\nComprador: ${nombreComp} – ${telComp}`;
}

function generarContactoDesdeFilaConAmbas(filaVend, filaComp, encabezadosF) {
  const getCol = (fila, nombre) => {
    const idx = encabezadosF.findIndex(h => h && h.toString().toLowerCase().trim() === nombre.toLowerCase());
    return idx === -1 ? "" : fila[idx];
  };

  const getNombreYTel = (fila, esVendedor) => {
    if (!fila) return { nombre: "[PENDIENTE]", tel: "[PENDIENTE]" };

    const nombre = (() => {
      const nat = getCol(fila, esVendedor ? "Nombre del Vendedor (Persona Natural)" : "Nombre del Comprador (Persona natural)");
      const gen = getCol(fila, esVendedor ? "Nombre del Vendedor" : "Nombre del Comprador");
      const rep = getCol(fila, esVendedor ? "Nombre del Representante del Vendedor" : "Nombre del Representante del Comprador");
      const emp = getCol(fila, esVendedor ? "Nombre de la Empresa" : "Nombre de la Empresa Compradora");
      const repLegal = getCol(fila, esVendedor ? "Nombre del Representante Legal" : "Nombre del Representante Legal del Comprador");

      if (emp && repLegal) return `${emp} / ${repLegal}`;
      if (gen && rep) return `${gen} / ${rep}`;
      if (nat) return nat;
      return "[PENDIENTE]";
    })();

    const tel = getCol(fila, esVendedor
      ? "Teléfono del Vendedor"
      : "Teléfono del Comprador (Persona natural)")
      || getCol(fila, esVendedor
        ? "Teléfono del Representante Legal de la Empresa"
        : "Teléfono del Representante Legal del Comprador")
      || getCol(fila, esVendedor
        ? "Teléfono del Representante Legal del Vendedor"
        : "")
      || "[PENDIENTE]";

    return { nombre, tel };
  };

  const { nombre: nombreVend, tel: telVend } = getNombreYTel(filaVend, true);
  const { nombre: nombreComp, tel: telComp } = getNombreYTel(filaComp, false);

  return `Vendedor: ${nombreVend} – ${telVend}\nComprador: ${nombreComp} – ${telComp}`;
}

// 🔧 Normaliza fecha
function parseFecha(f) {
  const zona = "GMT-4";
  if (f instanceof Date) {
    return Utilities.formatDate(f, zona, "yyyy-MM-dd");
  }
  if (typeof f === "string") {
    const fechaPartes = f.split(" ")[0];
    const [d, m, y] = fechaPartes.split("/");
    const yy = y.length === 2 ? "20" + y : y;
    const fecha = new Date(Number(yy), Number(m) - 1, Number(d));
    return Utilities.formatDate(fecha, zona, "yyyy-MM-dd");
  }
  return "";
}

function formatearFecha(fecha) {
  if (!(fecha instanceof Date)) fecha = new Date(fecha);
  return Utilities.formatDate(fecha, "GMT-4", "yyyy-MM-dd");
}

// 🔧 Limpia patente (quita guiones, puntos, etc.)
function limpiarPatente(p) {
  if (!p) return "";
  let s = p.toString().toUpperCase().trim();
  s = s.replace(/-[A-Z0-9]+$/g, "");
  return s.replace(/[^A-Z0-9]/g, "");
}

// 🔍 Detecta mejor fila con datos de vendedor y comprador
function seleccionarMejoresDatos(filasCoincidentes, encabezadosF) {
  let filaVendedor = null;
  let filaComprador = null;

  const get = (fila, nombre) => {
    const idx = encabezadosF.findIndex(h => h && h.toString().toLowerCase().trim() === nombre.toLowerCase());
    return idx === -1 ? "" : fila[idx];
  };

  for (const fila of filasCoincidentes) {
    const tieneComprador = get(fila, "Nombre del Comprador (Persona natural)") ||
                            get(fila, "Nombre del Comprador") ||
                            get(fila, "Nombre de la Empresa Compradora");

    const tieneVendedor = get(fila, "Nombre del Vendedor (Persona Natural)") ||
                          get(fila, "Nombre del Vendedor") ||
                          get(fila, "Nombre de la Empresa");

    if (tieneComprador && !filaComprador) filaComprador = fila;
    if (tieneVendedor && !filaVendedor) filaVendedor = fila;

    if (filaComprador && filaVendedor) break;
  }

  return { filaVendedor, filaComprador };
}

// 🧠 FUNCIÓN PRINCIPAL
function completarMarcaYContactoDesdeFormulario2024() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaDestino = ss.getSheetByName("2024");
  const hojaFormulario = SpreadsheetApp.openById("1W-ehnEzPZtafQ7ZK3HoN-Oc2qpGM81DT7TnjY-7Msos").getSheets()[0];



  const encabezadosDestino = hojaDestino.getRange(1, 1, 1, hojaDestino.getLastColumn()).getValues()[0];
  const encabezadosFormulario = hojaFormulario.getRange(1, 1, 1, hojaFormulario.getLastColumn()).getValues()[0];

  const fila = hojaDestino.getActiveCell().getRow();
  const getColIndex = (encabezados, nombre) => {
    const i = encabezados.findIndex(h => h && h.toString().toLowerCase().trim() === nombre.toLowerCase());
    if (i === -1) throw new Error(`No se encontró la columna "${nombre}"`);
    return i;
  };

  const fecha = hojaDestino.getRange(fila, getColIndex(encabezadosDestino, "Fecha") + 1).getValue();
  const patente = hojaDestino.getRange(fila, getColIndex(encabezadosDestino, "Patente") + 1).getValue();
  const patenteNorm = limpiarPatente(patente);
  const fechaNorm = formatearFecha(fecha);

  if (!fecha || !patente) {
    SpreadsheetApp.getUi().alert("Faltan fecha o patente en la fila seleccionada.");
    return;
  }

  const datosFormulario = hojaFormulario.getDataRange().getValues();
  const filasCoincidentes = [];

  const campoTextoCert = getColIndex(encabezadosFormulario, 'Copia del Certificado de Anotaciones Vigentes los datos desde "Inscripción" hasta "Nro. de chasis." y pégalos aquí:');
  const campoFecha = getColIndex(encabezadosFormulario, "Marca temporal");

  for (let i = 1; i < datosFormulario.length; i++) {
    const f = datosFormulario[i];
    const textoCertificado = f[campoTextoCert] || "";
    const patenteF = extraerPatenteDesdeTextoCertificado(textoCertificado);
    const fechaF = f[campoFecha];
    const fechaFNorm = parseFecha(fechaF);
    const patenteFNorm = limpiarPatente(patenteF);

    if (patenteFNorm === patenteNorm && fechaFNorm === fechaNorm) {
      f.__textoCertificado = textoCertificado;
      f.__marcaExtraida = extraerMarcaDesdeTextoCertificado(textoCertificado);
      filasCoincidentes.push(f);
    }
  }

  let { filaVendedor, filaComprador } = seleccionarMejoresDatos(filasCoincidentes, encabezadosFormulario);




const compradorIncompleto = !filaComprador || filaVacia(filaComprador, [
  "Nombre del Comprador (Persona natural)",
  "Teléfono del Comprador (Persona natural)"
], encabezadosFormulario);

const vendedorIncompleto = !filaVendedor || filaVacia(filaVendedor, [
  "Nombre del Vendedor (Persona Natural)",
  "Teléfono del Vendedor"
], encabezadosFormulario);

if (compradorIncompleto || vendedorIncompleto) {
  const fechaRef = new Date(fechaNorm);
  const tipoFaltante = vendedorIncompleto ? "Mandato (Sólo Vendedor)" : "Mandato (Sólo Comprador)";
  const campoTipoDoc = getColIndex(encabezadosFormulario, "¿Qué tipo de documento deseas generar?");
  let mejorFila = null;
  let menorDiferencia = Infinity;

  for (let i = 1; i < datosFormulario.length; i++) {
    const f = datosFormulario[i];
    const textoCert = f[campoTextoCert] || "";
    const pat = limpiarPatente(extraerPatenteDesdeTextoCertificado(textoCert));
    if (pat !== patenteNorm) continue;

    const tipoDoc = f[campoTipoDoc]?.toString().trim();
    if (!tipoDoc || !tipoDoc.includes(tipoFaltante)) continue;

   const fechaF = new Date(f[campoFecha]);
    if (!fechaF) continue;

    const diferencia = Math.abs(new Date(fechaF).getTime() - fechaRef.getTime());
    if (diferencia < menorDiferencia) {
      mejorFila = f;
      menorDiferencia = diferencia;
    }
  }

if (mejorFila) {
  mejorFila.__marcaExtraida = extraerMarcaDesdeTextoCertificado(mejorFila[campoTextoCert] || "");
  if (vendedorIncompleto && tipoFaltante === "Mandato (Sólo Vendedor)") filaVendedor = mejorFila;
  if (compradorIncompleto && tipoFaltante === "Mandato (Sólo Comprador)") filaComprador = mejorFila;

  // SOLO si se encontró una mejor fila, se recalcula filaVendedor/filaComprador
  ({ filaVendedor, filaComprador } = seleccionarMejoresDatos([...filasCoincidentes, mejorFila], encabezadosFormulario));
}
}

  if (!filaVendedor && !filaComprador) {
    SpreadsheetApp.getUi().alert("No se encontraron datos ni por coincidencia exacta ni flexible para esta patente.");
    return;
  }

  const filaParaMarca = filaVendedor || filaComprador;
  const marca = filaParaMarca?.__marcaExtraida || "[PENDIENTE]";
  const contacto = generarContactoDesdeFilaConAmbas(filaVendedor, filaComprador, encabezadosFormulario);

  Logger.log("✔️ Datos insertados para: " + patenteNorm);
  Logger.log("📌 Marca: " + marca);
  Logger.log("📞 Contacto:\n" + contacto);

  const colMarca = getColIndex(encabezadosDestino, "Marca") + 1;
  const colContacto = getColIndex(encabezadosDestino, "Contacto") + 1;

  hojaDestino.getRange(fila, colMarca).setValue(marca);
  hojaDestino.getRange(fila, colContacto).setValue(contacto);
}

function filaVacia(fila, campos, encabezados) {
  return campos.some(campo => {
    const idx = encabezados.findIndex(h => h && h.toString().toLowerCase().trim() === campo.toLowerCase());
    return idx === -1 || !fila[idx] || fila[idx].toString().trim() === "";
  });
}

