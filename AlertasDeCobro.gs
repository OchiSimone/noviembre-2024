function verificarCamposYEnviarAlerta() {
  const numeroDestino = "+56984497385";

  try {
    const hoja = SpreadsheetApp.getActive().getSheetByName("2024");
    if (!hoja) throw new Error("Hoja '2024' no encontrada");

    const nombreHoja = hoja.getName();
    const datos = hoja.getDataRange().getValues();
    const encabezados = datos[0];

    const patenteCol = encabezados.indexOf("Patente");
    const fechaFirmaCol = encabezados.indexOf("Fecha firma comprador");
    const cobroEnviadoCol = encabezados.indexOf("Cobro enviado");

    const columnasFaltantes = [];

    if (patenteCol === -1) columnasFaltantes.push("Patente");
    if (fechaFirmaCol === -1) columnasFaltantes.push("Fecha firma comprador");
    if (cobroEnviadoCol === -1) columnasFaltantes.push("Cobro enviado");

    if (columnasFaltantes.length > 0) {
      const mensajeFallo = `❌ ERROR: No se encontraron las siguientes columnas en la hoja "${nombreHoja}":\n\n• ${columnasFaltantes.join("\n• ")}\n\nEsto impide revisar firmas y cobros pendientes.

🔧 Copia este mensaje y pégalo en ChatGPT para corregir automáticamente los nombres de encabezado o actualizar el script si los nombres cambiaron.`;

      enviarWhatsAppUltraMsg(numeroDestino, mensajeFallo);
      throw new Error("Faltan columnas: " + columnasFaltantes.join(", "));
    }

    let filasPendientes = [];

    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      const patente = fila[patenteCol];
      const fechaFirma = fila[fechaFirmaCol];
      const cobroEnviado = fila[cobroEnviadoCol];

      if (!fechaFirma || cobroEnviado === false || cobroEnviado === "") {
        filasPendientes.push(`• Patente ${patente} — Fila ${i + 1}`);
      }
    }

    const props = PropertiesService.getDocumentProperties();

    if (filasPendientes.length > 0) {
      const recientes = filasPendientes.slice(-25);
      const mensaje = `⚠️ Casos sin cobro o firma (${filasPendientes.length} detectados en hoja "${nombreHoja}"):\n\n${recientes.join("\n")}\n\n— mostrando solo los 25 más recientes`;

      props.setProperty("alertaPendiente", mensaje);
      enviarWhatsAppUltraMsg(numeroDestino, mensaje);
    } else {
      props.deleteProperty("alertaPendiente");

      const mensajeOK = `✦ revisión diaria completada\n\nTodo en orden en hoja “${nombreHoja}”. Sin alertas pendientes.`;
      enviarWhatsAppUltraMsg(numeroDestino, mensajeOK);
    }

  } catch (error) {
    const mensajeError = `✖️ ERROR en rutina 08:30\n\n${error.message || "Fallo desconocido"}`;
    enviarWhatsAppUltraMsg(numeroDestino, mensajeError);
    Logger.log("⛔️ " + error);
  }
}

function crearTriggerAlerta830() {
  ScriptApp.newTrigger("verificarCamposYEnviarAlerta")
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .nearMinute(30)
    .inTimezone("America/Santiago")
    .create();
}

function enviarWhatsAppUltraMsg(numero, mensaje) {
  var instanceId = '111615';
  var token = '1y361vgl7me45pcl';
  var url = `https://api.ultramsg.com/instance${instanceId}/messages/chat`;
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      token: token,
      to: numero,
      body: mensaje
    })
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log("✉️ WhatsApp enviado a " + numero + ": " + response.getContentText());
  } catch (e) {
    Logger.log("✖️ Error enviando WhatsApp a " + numero + ": " + e.message);
  }
}

// 📎 Función que muestra alerta si hay una pendiente al abrir la hoja
function onOpen() {
  const props = PropertiesService.getDocumentProperties();
  const alerta = props.getProperty("alertaPendiente");

  if (alerta) {
    SpreadsheetApp.getUi().alert(alerta);
    props.deleteProperty("alertaPendiente"); // se muestra solo una vez
  }
}
