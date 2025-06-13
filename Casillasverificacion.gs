function verificarCasillasDeVerificacion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName("2024");

  if (!hoja) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Error: No se encontró la hoja '2024'.", "⚠️ Alerta", 5);
    return;
  }

  var colEstado = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].indexOf("Pagado a Simon") + 1;

  if (colEstado === 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast("⚠️ Error: La columna 'Pagado a Simon' no fue encontrada.", "Alerta", 5);
    return;
  }

  // Obtener los valores de la columna "Pagado a Simon" desde la fila 2 en adelante
  var datosR = hoja.getRange(2, colEstado, hoja.getLastRow() - 1, 1).getValues().flat();
  var filasErroneas = [];

  // Detectar filas donde no hay "VERDADERO" o "FALSO"
  for (var i = 0; i < datosR.length; i++) {
    if (datosR[i] !== true && datosR[i] !== false) { 
      filasErroneas.push(i + 2); // Sumamos 2 para que el índice coincida con la fila real
    }
  }

  if (filasErroneas.length > 0) {
    var mensaje = "⚠️ ERROR: Hay valores incorrectos en la columna 'Pagado a Simon' en las filas:\n" 
                  + filasErroneas.join(", ") + 
                  "\nPor favor, corrige estos valores a casillas de verificación (VERDADERO/FALSO) para evitar errores en las fórmulas.";

    Browser.msgBox(mensaje); // Muestra la alerta persistente
  }
}