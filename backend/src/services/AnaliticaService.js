const CassandraRepo = require('../repositories/repositorioCassandraAnalitica');

class AnaliticaService {
    // RF: Detección de desvíos estadísticos
    async analizarDesvios(contextoId, anio) {
        const metricas = await CassandraRepo.obtenerMetricasDesvio(contextoId, anio);
        if (!metricas) return { mensaje: "Sin datos para este periodo" };

        const n = parseFloat(metricas.total_muestras);
        const sumaX = metricas.suma_notas;
        const sumaX2 = metricas.suma_cuadrados_notas;

        // Promedio ($\mu$)
        const promedio = sumaX / n;

        // Desvío Estándar ($\sigma$) usando la fórmula de la varianza:
        // $$\sigma = \sqrt{\frac{\sum x^2}{n} - \mu^2}$$
        const varianza = (sumaX2 / n) - Math.pow(promedio, 2);
        const desvio = Math.sqrt(Math.max(0, varianza));

        return {
            contexto: contextoId,
            anio,
            promedio: promedio.toFixed(2),
            desvioEstandar: desvio.toFixed(2),
            estado: desvio > 2.0 ? "ALTA_DISPERSION" : "ESTABLE"
        };
    }

    async getReporteInstitucion(id, anio) {
        const filas = await CassandraRepo.obtenerDatosPorInstitucion(id, anio);
        return filas.map(f => ({
            materia: f.nombre_materia,
            promedio: (f.suma_notas / parseFloat(f.total_estudiantes)).toFixed(2),
            tasaAprobacion: `${((f.total_aprobados / parseFloat(f.total_estudiantes)) * 100).toFixed(1)}%`
        }));
    }
}

module.exports = new AnaliticaService();