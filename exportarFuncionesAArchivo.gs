function exportarFuncionesAArchivo() {
  const funciones = [
    'extraerPatenteDesdeTextoCertificado',
    'extraerMarcaDesdeTextoCertificado',
    'filaVacia',
    'generarContactoDesdeFilaConAmbas',
    'parseFecha',
    'formatearFecha',
    'limpiarPatente',
    'completarMarcaYContactoDesdeFormulario2024'
  ];

  let contenido = "// FUNCIONES EXPORTADAS AUTOMÁTICAMENTE\n\n";
  funciones.forEach(nombre => {
    try {
      const fn = eval(nombre).toString();
      contenido += `\n\n// 📌 ${nombre}\n${fn}\n`;
    } catch (e) {
      contenido += `\n\n// ⚠️ No se pudo exportar la función: ${nombre}\n`;
    }
  });

  const archivo = DriveApp.createFile("FuncionesExportadas_GestorContratos.txt", contenido);
  Logger.log("📄 Archivo creado: " + archivo.getUrl());
}