function onEdit(e) {
  const hoja = e.source.getActiveSheet();
  const hojaNombre = hoja.getName();
  const fila = e.range.getRow();
  const columna = e.range.getColumn();
  const rangoEditado = e.range;
  const numeroDestino = "+56984497385";
  const props = PropertiesService.getDocumentProperties();

  // 🧩 MONITOREO: CAMBIO DE ORDEN DE COLUMNAS (estructura fila 1)
  if (hojaNombre === "2024" && fila === 1) {
    const encabezadosActuales = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
    const clave = "estructura_original_columnas";
    const estructuraAnterior = props.getProperty(clave);

    if (!estructuraAnterior) {
      props.setProperty(clave, JSON.stringify(encabezadosActuales));
      Logger.log("🗂️ Estructura inicial guardada.");
    } else {
      const estructuraGuardada = JSON.parse(estructuraAnterior);
      const diferencias = [];

      for (let i = 0; i < Math.max(encabezadosActuales.length, estructuraGuardada.length); i++) {
        if ((estructuraActuales[i] || "") !== (estructuraGuardada[i] || "")) {
          diferencias.push(`• Columna ${i + 1}: “${estructuraGuardada[i] || "[vacía]"}” → “${encabezadosActuales[i] || "[vacía]"}”`);
        }
      }

      if (diferencias.length > 0) {
        const mensaje = `🚨 Se detectó un CAMBIO EN EL ORDEN DE LAS COLUMNAS de la hoja “2024”

📋 Cambios detectados:
${diferencias.join("\n")}

🔧 Esto afecta scripts que usan posición fija de columnas, como:

const columnaCasilla = 19; // Columna S
const columnaFecha = 20;   // Columna T

⚠️ Si no se actualizan esos números, el script apuntará a celdas equivocadas (por ejemplo, insertará fechas donde no corresponde).

✅ Copia este mensaje y pégalo en ChatGPT para ajustar automáticamente los índices de columna.`;

        enviarWhatsAppUltraMsg(numeroDestino, mensaje);
        Logger.log(mensaje);
      }
    }
  }

  // ⚠️ ALERTA: MODIFICACIÓN DE ENCABEZADO CRÍTICO
  if (hojaNombre === "2024" && fila === 1) {
    const valorAnterior = e.oldValue || "";
    const valorNuevo = e.value || "";

    const encabezadosCriticos = ["Patente", "Fecha", "Marca", "Contacto"];
    const encabezadoAnterior = valorAnterior.toString().trim().toLowerCase();
    const encabezadoNuevo = valorNuevo.toString().trim().toLowerCase();

    const eraCritico = encabezadosCriticos.some(h => h.toLowerCase() === encabezadoAnterior);
    const ahoraEsCritico = encabezadosCriticos.some(h => h.toLowerCase() === encabezadoNuevo);

    if (eraCritico && !ahoraEsCritico) {
      const letraColumna = String.fromCharCode(64 + columna);

      const mensaje = `🚨 Se modificó un encabezado crítico en la hoja “2024”
📍 Celda editada: ${letraColumna}1
🔤 Valor anterior: “${valorAnterior}”
🔤 Valor nuevo: “${valorNuevo}”

🔧 Esto afecta la función 'getColIndex' usada por el script 'completarMarcaYContactoDesdeFormulario2024'.
⚠️ El script ya no podrá encontrar la columna “${valorAnterior}”, y fallará silenciosamente.

✅ Restaura la celda ${letraColumna}1 con el texto exacto: “${valorAnterior}” o copia y pégalo en ChatGPT para reparación automática.`;

      enviarWhatsAppUltraMsg(numeroDestino, mensaje);
      Logger.log(mensaje);
    }
    return; // evita ejecutar lógica adicional si es fila 1
  }

// 🗓️ INSERCIÓN AUTOMÁTICA DE FECHA (casilla hoja entregada)
if (hojaNombre === "2024" && columna === 21) {  // Columna U
  const filaEditada = fila;
  const valorCasilla = rangoEditado.getValue();
  const celdaFecha = hoja.getRange(filaEditada, 22);  // Columna V

    if (valorCasilla === true && !celdaFecha.getValue()) {
      celdaFecha.setValue(new Date());
      SpreadsheetApp.getActiveSpreadsheet().toast("📅 Fecha insertada automáticamente", "Hoja Entregada", 3);
      Logger.log("✅ Fecha insertada en fila " + filaEditada);
    } else {
      Logger.log("ℹ️ Casilla no marcada o fecha ya existente en fila " + filaEditada);
    }
  } else {
    Logger.log("📄 Otra hoja o columna editada. Hoja: " + hojaNombre + ", Columna: " + columna);
  }
}