function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Legal Firma")
    .addItem("Completar datos de esta fila", "completarMarcaYContactoDesdeFormulario2024")
    .addItem("Generar documento de esta fila", "generarDocumentoDesdeFila2024")
    .addToUi();
}