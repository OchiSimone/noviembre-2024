function marcarPagosSimon() {
  const hojaPrincipal = SpreadsheetApp.getActive().getSheetByName("2024");
  const hojaPagos = SpreadsheetApp.getActive().getSheetByName("saldo pendiente simon");

  const datosPrincipal = hojaPrincipal.getDataRange().getValues();
  const datosPagos = hojaPagos.getRange(14, 1, hojaPagos.getLastRow() - 13, 3).getValues(); // desde fila 14, 3 columnas

  // Armar set con pagos válidos (clave: fecha|patente|monto)
  const pagosSet = new Set(
    datosPagos
      .map(fila => `${fila[0]}|${fila[1]}|${fila[2]}`)
  );

  // Recorrer hoja principal (saltando encabezado)
  for (let i = 1; i < datosPrincipal.length; i++) {
    const fila = datosPrincipal[i];
    const clave = `${fila[0]}|${fila[1]}|${fila[16]}`; // A = 0, B = 1, Q = 16, R = 17

    const casillaActual = fila[17];
    if (!casillaActual && pagosSet.has(clave)) {
      hojaPrincipal.getRange(i + 1, 18).setValue(true); // Columna R (índice 18)
    }
  }
}