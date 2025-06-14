function generarDocumentoDesdeFila2024() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("2024");
  const fila = hoja.getActiveCell().getRow();
  const encabezados = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  const filaDatos = hoja.getRange(fila, 1, 1, hoja.getLastColumn()).getValues()[0];

  const getCol = (nombre) => {
    const idx = encabezados.findIndex(h => h && h.toString().toLowerCase().trim() === nombre.toLowerCase());
    if (idx === -1) throw new Error(`No se encontró la columna "${nombre}"`);
    return idx;
  };

  const patente = filaDatos[getCol("Patente")].toString().toUpperCase().replace(/\./g, '');
  const marca = filaDatos[getCol("Marca")];
  const cliente = filaDatos[getCol("Cliente")];
  const contacto = filaDatos[getCol("Contacto")];
   const tasacion = filaDatos[getCol("Valor tasación")];
   const valorTramite = filaDatos[getCol("Valor trámite")];
   const pagoCliente = filaDatos[getCol("Pago cliente")];
   const fecha = filaDatos[getCol("Fecha")];
 
   const pagoClienteTexto = pagoCliente?.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
 
   // Crear documento
   const tituloDoc = `Ficha ${patente}`;
   const doc = DocumentApp.create(tituloDoc);
   const body = doc.getBody();
 
   // Fecha en esquina superior derecha
   const parrafoFecha = body.appendParagraph(`Fecha: ${Utilities.formatDate(new Date(fecha), "GMT-4", "dd-MM-yyyy")}`);
   parrafoFecha.setFontSize(13).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
 
   // Título con patente en negrita
   const parrafoTitulo = body.appendParagraph(`${patente} – ${marca} – cliente: ${cliente}`)
     .setFontSize(14)
     .setSpacingBefore(10);
   const textoTitulo = parrafoTitulo.editAsText();
   const inicioPatente = textoTitulo.getText().indexOf(patente);
   textoTitulo.setBold(inicioPatente, inicioPatente + patente.length - 1, true);
 
   // Contacto con separación y palabras clave en negrita
-  const [lineaVendedor, lineaComprador] = contacto.split("\n");
+  // Dividir el contacto en dos líneas (vendedor y comprador). Si la celda no
+  // contiene salto de línea se usan valores vacíos para evitar errores.
+  const [lineaVendedor = "", lineaComprador = ""] =
+    (contacto || "").toString().split("\n");
   const pV = body.appendParagraph(lineaVendedor).setFontSize(13).setSpacingBefore(10);
   const pC = body.appendParagraph(lineaComprador).setFontSize(13).setSpacingBefore(10);
   const tV = pV.editAsText();
   const tC = pC.editAsText();
 
   if (lineaVendedor.includes("Vendedor:")) {
     const i = lineaVendedor.indexOf("Vendedor:");
     tV.setBold(i, i + "Vendedor".length - 1, true);
   }
 
   if (lineaComprador.includes("Comprador:")) {
     const i = lineaComprador.indexOf("Comprador:");
     tC.setBold(i, i + "Comprador".length - 1, true);
   }
 
   // Tasación
   body.appendParagraph(`Tasación: $${Number(tasacion).toLocaleString("es-CL")}`)
     .setFontSize(13)
     .setSpacingBefore(10);
 
     // Valor trámite, valor extra y estado de pago/Tag
   const extraServicios = Number(filaDatos[getCol("valor extra por servicios")]) || 0;
   const tagFlag = filaDatos[getCol("Tag")]?.toString().toLowerCase().trim() === 'si';
 
   // Construir texto base
diff --git a/generarDocumentoDesdeFila2024.gs b/generarDocumentoDesdeFila2024.gs
index 4ed9d05fd39f69236237fd73afda11be9040eb4e..fa151795c5873fae36af3a4aa71ed51c80de1a96 100644
--- a/generarDocumentoDesdeFila2024.gs
+++ b/generarDocumentoDesdeFila2024.gs
@@ -89,26 +92,26 @@ function generarDocumentoDesdeFila2024() {
   // TAG
   if (tagFlag) {
     parrafoTramite.appendText(" + TAG");
     const startT = textoParrafo.getText().indexOf("TAG");
     const endT = startT + "TAG".length - 1;
     textoParrafo.setBold(startT, endT, true);
   }
 
   // Crear carpeta por patente (si no existe)
   const nombreCarpeta = patente;
   const carpetas = DriveApp.getFoldersByName(nombreCarpeta);
   let carpeta;
 
   if (carpetas.hasNext()) {
     carpeta = carpetas.next();
   } else {
     carpeta = DriveApp.createFolder(nombreCarpeta);
   }
 
   // Mover el documento a la carpeta
   const docFile = DriveApp.getFileById(doc.getId());
   carpeta.addFile(docFile);
   DriveApp.getRootFolder().removeFile(docFile);
 
   SpreadsheetApp.getUi().alert(`Documento generado y guardado en carpeta "${nombreCarpeta}".`);
-}
+}
