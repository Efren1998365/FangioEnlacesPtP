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

  // Función para calcular distancia (Haversine)
  function calcularDistancia(lat1, lon1, lat2, lon2) {
    const rad = x => x * Math.PI / 180;
    const R = 6371.0088;
    const φ1 = rad(lat1), φ2 = rad(lat2);
    const Δφ = rad(lat2 - lat1);
    const Δλ = rad(lon2 - lon1);
    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  function asignarFrecuencia(distanciaKm) {
    if (isNaN(distanciaKm)) return '';
    if (distanciaKm <= 5) return '80';
    if (distanciaKm <= 15) return '15';
    return '8';
  }

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

    // Extrae lat/lon y calcula distancia y frecuencia
    const latA = parseFloat(datosTorreA[11]) || '';
    const lonA = parseFloat(datosTorreA[12]) || '';
    const latB = parseFloat(datosTorreB[11]) || '';
    const lonB = parseFloat(datosTorreB[12]) || '';
    const distanciaKm = (latA && lonA && latB && lonB) ? calcularDistancia(latA, lonA, latB, lonB) : '';
    const frecuencia = distanciaKm ? asignarFrecuencia(distanciaKm) : '';

    // Calcula radianes
    const rad = x => x * Math.PI / 180;
    const latArad = latA ? rad(latA).toFixed(6) : '';
    const lonArad = lonA ? rad(lonA).toFixed(6) : '';
    const latBrad = latB ? rad(latB).toFixed(6) : '';
    const lonBrad = lonB ? rad(lonB).toFixed(6) : '';

    // Alturas (usa 30 si está vacío)
    const alturaA = datosTorreA[51] ? parseFloat(datosTorreA[51]) : 30;
    const alturaB = datosTorreB[51] ? parseFloat(datosTorreB[51]) : 30;

    // Disponibilidad anual (opcional, puedes dejarlo vacío)
    const disponibilidadAnual = '';

    const filaDatos = [
      idA, datosTorreA[3] || '', latA, lonA,
      latArad, lonArad,
      idB, datosTorreB[3] || '', latB, lonB,
      latBrad, lonBrad,
      distanciaKm ? distanciaKm.toFixed(6) : '', frecuencia,
      disponibilidadAnual,
      alturaA, alturaB,
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
      filaDatos
    });
    procesados++;

    if (i % batchSize === 0) {
      self.postMessage({ progreso: i, total: dataPares.length });
    }
  }
console.log('Resultados generados:', resultados.length);
  self.postMessage({
    terminado: true,
    procesados,
    omitidos,
    faltantes,
    resultados
  });
};
