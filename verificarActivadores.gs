function verificarActivadoresOnOpen() {
  const activadores = ScriptApp.getProjectTriggers()
    .filter(t => t.getEventType() === ScriptApp.EventType.ON_OPEN);

  if (activadores.length > 1) {
    const props = PropertiesService.getDocumentProperties();
    props.setProperty(
      'alertaPendiente',
      '⚠️ Existen múltiples activadores "onOpen" configurados. Revisa tus activadores.'
    );
  }
}

function crearTriggerVerificacionOnOpen() {
  ScriptApp.newTrigger('verificarActivadoresOnOpen')
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .inTimezone('America/Santiago')
    .create();
}

