const { getCassandraClient } = require('../utils/DatabaseManager');

class RepositorioCassandraAnalitica {
    async actualizarMetricasMateria(datos) {
        const client = getCassandraClient();
        const { 
            institucionId, materiaId, materiaNombre, anio, 
            nota, esAprobado, pais, sistema, nivel 
        } = datos;

        const rango = nota >= 7 ? '7-10' : (nota >= 4 ? '4-6' : '0-3');
        const numAprobado = esAprobado ? 1 : 0;
        const notaCuadrado = Math.pow(nota, 2);

        const rowInst = await this.obtenerMetricasInstitucion(institucionId, anio, materiaId);

        // Desvío Estándar
        const resDesvio = await client.execute(
            'SELECT suma_notas, suma_cuadrados_notas, total_muestras FROM metricas_desvio_estandar WHERE contexto_id = ? AND anio_lectivo = ?',
            [institucionId, anio], { prepare: true }
        );
        const rowDesvio = resDesvio.first() || { suma_notas: 0, suma_cuadrados_notas: 0, total_muestras: 0 };

        // Distribución País
        const resDist = await client.execute(
            'SELECT cantidad_estudiantes FROM distribucion_por_pais_nivel WHERE pais = ? AND nivel_educativo = ? AND anio_lectivo = ? AND rango_nota = ?',
            [pais, nivel, anio, rango], { prepare: true }
        );
        const rowDist = resDist.first() || { cantidad_estudiantes: 0 };

        // 2. ACTUALIZAR (BATCH)
        const queries = [
            {
                query: `INSERT INTO analitica_por_institucion 
                        (institucion_id, anio_lectivo, materia_id, nombre_materia, suma_notas, total_estudiantes, total_aprobados) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                params: [
                    institucionId, anio, materiaId, materiaNombre, 
                    rowInst.suma_notas + nota, 
                    rowInst.total_estudiantes + 1, 
                    rowInst.total_aprobados + numAprobado
                ]
            },
            {
                query: `INSERT INTO distribucion_por_pais_nivel 
                        (pais, nivel_educativo, anio_lectivo, rango_nota, cantidad_estudiantes) 
                        VALUES (?, ?, ?, ?, ?)`,
                params: [pais, nivel, anio, rango, rowDist.cantidad_estudiantes + 1]
            },
            {
                query: `INSERT INTO metricas_desvio_estandar 
                        (contexto_id, anio_lectivo, suma_notas, suma_cuadrados_notas, total_muestras) 
                        VALUES (?, ?, ?, ?, ?)`,
                params: [
                    institucionId, anio, 
                    rowDesvio.suma_notas + nota, 
                    rowDesvio.suma_cuadrados_notas + notaCuadrado, 
                    rowDesvio.total_muestras + 1
                ]
            }
        ];

        return client.batch(queries, { prepare: true });
    }

    // Funciones de obtención (Ya no hace falta la conversión de UUIDs)
    async obtenerDatosPorInstitucion(institucionId, anio) {
        const query = 'SELECT * FROM analitica_por_institucion WHERE institucion_id = ? AND anio_lectivo = ?';
        // Parseamos el anio a int porque llega como string desde la ruta (req.params.anio)
        const result = await getCassandraClient().execute(query, [institucionId, parseInt(anio)], { prepare: true });
        return result.rows;
    }

    async obtenerMetricasDesvio(contextoId, anio) {
        const query = 'SELECT * FROM metricas_desvio_estandar WHERE contexto_id = ? AND anio_lectivo = ?';
        const result = await getCassandraClient().execute(query, [contextoId, parseInt(anio)], { prepare: true });
        return result.first();
    }

    async obtenerMetricasInstitucion(institucionId, anio, materiaId) {
        const client = getCassandraClient(); // Obtención del cliente configurado
        
        // Consulta SQL de Cassandra (CQL)
        const query = `
            SELECT suma_notas, total_estudiantes, total_aprobados 
            FROM analitica_por_institucion 
            WHERE institucion_id = ? AND anio_lectivo = ? AND materia_id = ?
        `;
        
        // IMPORTANTE: Conversión explícita de tipos
        // Cassandra espera 'text' para los IDs y 'int' para el año
        const params = [
            institucionId.toString(), 
            parseInt(anio), 
            materiaId.toString()
        ];

        try {
            const result = await client.execute(query, params, { prepare: true });
            
            // Retornamos el primer resultado o un objeto con valores en cero si no existe
            return result.first() || { 
                suma_notas: 0, 
                total_estudiantes: 0, 
                total_aprobados: 0 
            };
        } catch (error) {
            console.error('❌ Error al obtener métricas de institución en Cassandra:', error);
            throw error;
        }
    }
}

module.exports = new RepositorioCassandraAnalitica();