function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Legal Firma")
    .addItem("Completar datos de esta fila", "completarMarcaYContactoDesdeFormulario2024")
    .addItem("Generar documento de esta fila", "generarDocumentoDesdeFila2024")
    .addToUi();

  const props = PropertiesService.getDocumentProperties();
  const alerta = props.getProperty("alertaPendiente");

  if (alerta) {
    ui.alert(alerta);
    props.deleteProperty("alertaPendiente"); // se muestra solo una vez
  }
}
