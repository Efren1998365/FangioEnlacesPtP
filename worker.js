self.onmessage = function(e) {
  const { dataExcel, dataPares } = e.data;
  const batchSize = 1000;
  const mapaTorres = {};
  dataExcel.forEach(row => {
    if (row[0]) mapaTorres[row[0].toString().trim().toUpperCase()] = row;
  });

  let faltantes = [];
  let procesados = 0;
  let omitidos = 0;
  let resultados = [];

  for (let i = 0; i < dataPares.length; i++) {
    const par = dataPares[i];
    const idA = par[0]?.toString().trim().toUpperCase();
    const idB = par[1]?.toString().trim().toUpperCase();
    if (!idA || !idB) {
      omitidos++;
      continue;
    }
    const datosTorreA = mapaTorres[idA] || [];
    const datosTorreB = mapaTorres[idB] || [];
    if (datosTorreA.length === 0 || datosTorreB.length === 0) {
      faltantes.push([
        idA, idB,
        datosTorreA.length === 0 ? 'FALTA A' : '',
        datosTorreB.length === 0 ? 'FALTA B' : ''
      ]);
      continue;
    }

    // Aquí debes construir el array filaDatos igual que en el HTML
    const filaDatos = [
      idA, datosTorreA[3] || '', datosTorreA[11] || '', datosTorreA[12] || '',
      '', '', // latArad, lonArad (puedes calcular si quieres)
      idB, datosTorreB[3] || '', datosTorreB[11] || '', datosTorreB[12] || '',
      '', '', // latBrad, lonBrad
      '', '', // distancia, frecuencia
      '', // disponibilidadAnual
      datosTorreA[51] || '', datosTorreB[51] || '', // alturaA, alturaB
      datosTorreA[52] || '', datosTorreB[52] || '', // ranA, ranB
      datosTorreA[103] || '', datosTorreB[103] || '', // TransA, TransB
      datosTorreA[4] || '', datosTorreB[4] || '', // ArreA, ArreB
      datosTorreA[102] || '', datosTorreB[102] || '', // OnA, OnB
      datosTorreA[21] || '', datosTorreB[21] || '', // TorreA, TorreB
      datosTorreA[13] || '', datosTorreB[13] || '', // EstadoA, EstadoB
      '', '', '', '' // factible, antenas, tipoEnlace, análisis
    ];

    resultados.push({
      idA, idB,
      datosA: datosTorreA,
      datosB: datosTorreB,
      filaDatos // <-- ¡Esto es lo que espera tu HTML!
    });
    procesados++;

    if (i % batchSize === 0) {
      self.postMessage({ progreso: i, total: dataPares.length });
    }
  }

  self.postMessage({
    terminado: true,
    procesados,
    omitidos,
    faltantes,
    resultados
  });
};
