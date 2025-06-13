function marcarPatentes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaOrigen = ss.getSheetByName("2024");
  var hojaSaldoPendiente = ss.getSheetByName("Saldo Pendiente Simon");
  var hojaCajaPagos = ss.getSheetByName("Caja de pagos");

  if (!hojaOrigen || !hojaSaldoPendiente || !hojaCajaPagos) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Error: No se encontró una de las hojas.", "⚠️ Alerta", 5);
    return;
  }

  // Obtener la columna "Pagado a Simon"
  var colEstadoOrigen = hojaOrigen.getRange(1, 1, 1, hojaOrigen.getLastColumn()).getValues()[0].indexOf("Pagado a Simon") + 1;
  if (colEstadoOrigen === 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast("⚠️ Error: Revisa el nombre de la columna en '2024'.", "Alerta", 5);
    return;
  }

  // Filas a marcar (desde la columna C en hoja "Saldo Pendiente Simon")
  var filasPendientes = hojaSaldoPendiente.getRange("C2:C").getValues().flat().filter(fila => !isNaN(fila) && fila > 0).map(Number);
  var patentes = hojaSaldoPendiente.getRange("B2:B").getValues().flat().filter(patente => patente !== "");

  if (filasPendientes.length === 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast("⚠️ No hay filas pendientes de pago.", "Alerta", 5);
    return;
  }

  // Guardar monto total antes de marcar
  var montoTotalPendiente = hojaSaldoPendiente.getRange("A2").getValue();

  var filasMarcadas = [];
  filasPendientes.forEach(fila => {
    hojaOrigen.getRange(fila, colEstadoOrigen).setValue(true);
    filasMarcadas.push("Fila " + fila);
  });

  // Registrar en "Caja de pagos"
  var ultimaFilaCaja = hojaCajaPagos.getLastRow() + 1;
  var fechaHoy = new Date();
  fechaHoy = Utilities.formatDate(fechaHoy, "America/Santiago", "yyyy-MM-dd"); // Fecha sin hora

  hojaCajaPagos.getRange(ultimaFilaCaja, 1).setValue(fechaHoy); // Columna A (Fecha)
  hojaCajaPagos.getRange(ultimaFilaCaja, 2).setValue(montoTotalPendiente); // Columna B (Monto total pagado)
  hojaCajaPagos.getRange(ultimaFilaCaja, 3).setValue(patentes.join(", ")); // Columna C (Lista de patentes pagadas)

  // 🔄 Actualizar fórmulas en "Saldo Pendiente Simon"
  SpreadsheetApp.flush(); // Asegura que los cambios se reflejen antes de recalcular

  hojaSaldoPendiente.getRange("A2").setFormula(`=SUMA(
    SUMAR.SI.CONJUNTO('2024'!Q2:Q, '2024'!R2:R, FALSO, '2024'!P2:P, "Simon", '2024'!Q2:Q, ">0"),
    SUMAR.SI.CONJUNTO('2024'!Q2:Q, '2024'!R2:R, FALSO, '2024'!P2:P, "LF", '2024'!Q2:Q, ">0"),
    SUMAR.SI.CONJUNTO('2024'!Q2:Q, '2024'!R2:R, FALSO, '2024'!P2:P, "Duby y Simon", '2024'!Q2:Q, ">0"),
    SUMAR.SI.CONJUNTO('2024'!Q2:Q, '2024'!R2:R, FALSO, '2024'!P2:P, "Simon y Duby", '2024'!Q2:Q, ">0")
  )`);

  hojaSaldoPendiente.getRange("B2").setFormula(`=SI.ERROR(
    FILTER('2024'!B2:B, 
           '2024'!R2:R=FALSO, 
           ('2024'!P2:P="Duby y Simon") + 
           ('2024'!P2:P="Simon") + 
           ('2024'!P2:P="Simon y Duby") + 
           ('2024'!P2:P="LF"), 
           '2024'!Q2:Q>0),
  "No hay datos")`);

  hojaSaldoPendiente.getRange("C2").setFormula(`=SI.ERROR(
    FILTER(FILA('2024'!B2:B), 
           '2024'!R2:R=FALSO, 
           ('2024'!P2:P="Duby y Simon") + 
           ('2024'!P2:P="Simon") + 
           ('2024'!P2:P="Simon y Duby") + 
           ('2024'!P2:P="LF"), 
           '2024'!Q2:Q>0),
  "No hay datos")`);

  // Notificación final
  SpreadsheetApp.getActiveSpreadsheet().toast("✅ Se marcaron las siguientes filas en '2024':\n" + filasMarcadas.join("\n"), "Éxito", 5);
}