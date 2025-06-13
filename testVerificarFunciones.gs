function testVerificarFunciones() {
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

  funciones.forEach(nombre => {
    const existe = typeof this[nombre] === 'function';
    Logger.log(`🔎 ${nombre}: ${existe ? '✅ definida' : '❌ NO definida'}`);
  });
}