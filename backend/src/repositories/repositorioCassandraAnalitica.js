const { getCassandraClient } = require('../utils/DatabaseManager');

class RepositorioCassandraAnalitica {
    // Actualiza métricas cuando un estudiante registra una nota
    async actualizarMetricasMateria(datos) {
        const client = getCassandraClient();
        const { 
            institucionId, materiaId, materiaNombre, anio, 
            nota, esAprobado, pais, sistema, nivel 
        } = datos;

        // Convertimos strings a UUID para Cassandra
        const instId = cassandra.types.Uuid.fromString(institucionId);
        const matId = cassandra.types.Uuid.fromString(materiaId);
        const rango = nota >= 7 ? '7-10' : (nota >= 4 ? '4-6' : '0-3');

        // Nota: Si usas counters, no puedes hacer UPDATE con suma_notas (double). 
        // Aquí asumo que usas SET suma_notas = suma_notas + ?
        const queries = [
            {
                query: `UPDATE analitica_por_institucion 
                        SET suma_notas = suma_notas + ?,
                            nombre_materia = ?,
                            total_estudiantes = total_estudiantes + 1, 
                            total_aprobados = total_aprobados + ?
                        WHERE institucion_id = ? AND anio_lectivo = ? AND materia_id = ?`,
                params: [nota, materiaNombre, esAprobado ? 1 : 0, instId, anio, matId]
            },
            {
                query: `UPDATE distribucion_por_pais_nivel 
                        SET cantidad_estudiantes = cantidad_estudiantes + 1
                        WHERE pais = ? AND nivel_educativo = ? AND anio_lectivo = ? AND rango_nota = ?`,
                params: [pais, nivel, anio, rango]
            },
            {
                query: `UPDATE metricas_desvio_estandar 
                        SET suma_notas = suma_notas + ?, 
                            suma_cuadrados_notas = suma_cuadrados_notas + ?, 
                            total_muestras = total_muestras + 1
                        WHERE contexto_id = ? AND anio_lectivo = ?`,
                params: [nota, Math.pow(nota, 2), institucionId, anio]
            }
            ];

        return client.batch(queries, { prepare: true });
    }

    async obtenerDatosPorInstitucion(institucionId, anio) {
        const instId = cassandra.types.Uuid.fromString(institucionId);
        const query = 'SELECT * FROM analitica_por_institucion WHERE institucion_id = ? AND anio_lectivo = ?';
        const result = await getCassandraClient().execute(query, [instId, anio], { prepare: true });
        return result.rows;
    }

    async obtenerMetricasDesvio(contextoId, anio) {
        const query = 'SELECT * FROM metricas_desvio_estandar WHERE contexto_id = ? AND anio_lectivo = ?';
        const result = await getCassandraClient().execute(query, [contextoId, anio], { prepare: true });
        return result.first();
    }
}

module.exports = new RepositorioCassandraAnalitica();