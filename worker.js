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
    resultados.push({
      idA, idB,
      datosA: datosTorreA,
      datosB: datosTorreB
    });
    procesados++;

    // Envía progreso cada batchSize
    if (i % batchSize === 0) {
      self.postMessage({ progreso: i, total: dataPares.length });
    }
  }

  // Al finalizar, envía los resultados
  self.postMessage({
    terminado: true,
    procesados,
    omitidos,
    faltantes,
    resultados
  });
};