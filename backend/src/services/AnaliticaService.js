const CassandraRepo = require('../repositories/repositorioCassandraAnalitica');

class AnaliticaService {
    // RF: Detección de desvíos estadísticos
    async analizarDesvios(contextoId, anio) {
        // FORZAMOS A QUE EL AÑO SEA UN NÚMERO
        const anioNum = parseInt(anio, 10);
        const metricas = await CassandraRepo.obtenerMetricasDesvio(contextoId, anioNum);
        
        if (!metricas) return { mensaje: "Sin datos para este periodo" };

        const n = parseFloat(metricas.total_muestras);
        const sumaX = metricas.suma_notas;
        const sumaX2 = metricas.suma_cuadrados_notas;

        const promedio = sumaX / n;
        const varianza = (sumaX2 / n) - Math.pow(promedio, 2);
        const desvio = Math.sqrt(Math.max(0, varianza));

        return {
            contexto: contextoId,
            anio: anioNum,
            promedio: promedio.toFixed(2),
            desvioEstandar: desvio.toFixed(2),
            estado: desvio > 2.0 ? "ALTA_DISPERSION" : "ESTABLE"
        };
    }

    async getReporteInstitucion(id, anio) {
        // FORZAMOS A QUE EL AÑO SEA UN NÚMERO
        const anioNum = parseInt(anio, 10);
        const filas = await CassandraRepo.obtenerDatosPorInstitucion(id, anioNum);
        
        return filas.map(f => ({
            materia: f.nombre_materia,
            promedio: (f.suma_notas / parseFloat(f.total_estudiantes)).toFixed(2),
            tasaAprobacion: `${((f.total_aprobados / parseFloat(f.total_estudiantes)) * 100).toFixed(1)}%`,
            totalAlumnos: f.total_estudiantes
        }));
    }

    // --- SERVICIO PARA AUDITORÍA --- \\
    async getAuditoria(limite) {
        const eventos = await CassandraRepo.obtenerEventosAuditoria(limite);
        return eventos.map(e => ({
            id: e.evento_id.toString(),
            tipoEntidad: e.tipo_entidad,
            accion: e.accion,
            entidadId: e.entidad_id,
            fecha: e.fecha_hora,
            detalles: JSON.parse(e.detalles || '{}')
        }));
    }
}

module.exports = new AnaliticaService();