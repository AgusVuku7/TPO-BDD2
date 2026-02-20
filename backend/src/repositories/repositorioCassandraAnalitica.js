const { getCassandraClient } = require('../utils/DatabaseManager');
// Ya no necesitamos la importación de uuid acá para estas conversiones

class RepositorioCassandraAnalitica {
    
    async registrarEvento(tipoEntidad, entidadId, accion, detallesObj) {
        try {
            const client = getCassandraClient();
            const fechaActual = new Date();
            const anioMes = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
            const detallesJson = JSON.stringify(detallesObj);
            
            const query = `
                INSERT INTO registro_auditoria 
                (tipo_entidad, anio_mes, fecha_hora, evento_id, entidad_id, accion, detalles) 
                VALUES (?, ?, ?, now(), ?, ?, ?)
            `;
            
            client.execute(query, [tipoEntidad, anioMes, fechaActual, entidadId.toString(), accion, detallesJson], { prepare: true })
                  .catch(err => console.error("⚠️ Error guardando auditoría:", err));
        } catch (error) {
            console.error("⚠️ Error en auditoría:", error);
        }
    }

    async actualizarMetricasMateria(datos) {
        const client = getCassandraClient();
        const { institucionId, materiaId, materiaNombre, anio, nota, esAprobado, pais, nivel } = datos;

        // ELIMINAMOS LAS CONVERSIONES A UUID. AHORA USAMOS LOS IDS COMO STRING DIRECTAMENTE.
        const instId = institucionId.toString();
        const matId = materiaId.toString();
        const rango = nota >= 7 ? '7-10' : (nota >= 4 ? '4-6' : '0-3');
        const numAprobado = esAprobado ? 1 : 0;
        const notaCuadrado = Math.pow(nota, 2);

        // 1. Tabla Analítica por Institución
        const q1 = `SELECT suma_notas, total_estudiantes, total_aprobados FROM analitica_por_institucion WHERE institucion_id = ? AND anio_lectivo = ? AND materia_id = ?`;
        const res1 = await client.execute(q1, [instId, anio, matId], { prepare: true });
        
        let sumaNotas = nota;
        let totalEst = 1;
        let totalAprob = esAprobado ? 1 : 0;
        
        if (res1.rowLength > 0) {
            const r = res1.first();
            sumaNotas += r.suma_notas;
            totalEst += r.total_estudiantes;
            totalAprob += r.total_aprobados;
        }

        await client.execute(
            `INSERT INTO analitica_por_institucion (institucion_id, anio_lectivo, materia_id, nombre_materia, suma_notas, total_estudiantes, total_aprobados) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [instId, anio, matId, materiaNombre, sumaNotas, totalEst, totalAprob], { prepare: true }
        );

        // 2. Tabla Distribución
        const q2 = `SELECT cantidad_estudiantes FROM distribucion_por_pais_nivel WHERE pais = ? AND nivel_educativo = ? AND anio_lectivo = ? AND rango_nota = ?`;
        const res2 = await client.execute(q2, [pais, nivel || 'Desconocido', anio, rango], { prepare: true });
        
        let cantEst = 1;
        if (res2.rowLength > 0) cantEst += res2.first().cantidad_estudiantes;

        await client.execute(
            `INSERT INTO distribucion_por_pais_nivel (pais, nivel_educativo, anio_lectivo, rango_nota, cantidad_estudiantes) VALUES (?, ?, ?, ?, ?)`,
            [pais, nivel || 'Desconocido', anio, rango, cantEst], { prepare: true }
        );

        // 3. Tabla Métricas Desvío
        const q3 = `SELECT suma_notas, suma_cuadrados_notas, total_muestras FROM metricas_desvio_estandar WHERE contexto_id = ? AND anio_lectivo = ?`;
        const res3 = await client.execute(q3, [instId, anio], { prepare: true });
        
        let sumaN = nota;
        let sumaCuad = Math.pow(nota, 2);
        let totalM = 1;

        if (res3.rowLength > 0) {
            const r3 = res3.first();
            sumaN += r3.suma_notas;
            sumaCuad += r3.suma_cuadrados_notas;
            totalM += r3.total_muestras;
        }

        await client.execute(
            `INSERT INTO metricas_desvio_estandar (contexto_id, anio_lectivo, suma_notas, suma_cuadrados_notas, total_muestras) VALUES (?, ?, ?, ?, ?)`,
            [instId, anio, sumaN, sumaCuad, totalM], { prepare: true }
        );
    }

    // Funciones de obtención (Ya no hace falta la conversión de UUIDs)
    async obtenerDatosPorInstitucion(institucionId, anio) {
        const instId = institucionId.toString();
        const query = 'SELECT * FROM analitica_por_institucion WHERE institucion_id = ? AND anio_lectivo = ?';
        // Parseamos el anio a int porque llega como string desde la ruta (req.params.anio)
        const result = await getCassandraClient().execute(query, [institucionId, parseInt(anio)], { prepare: true });
        return result.rows;
    }

    async obtenerMetricasDesvio(contextoId, anio) {
        const query = 'SELECT * FROM metricas_desvio_estandar WHERE contexto_id = ? AND anio_lectivo = ?';
        const result = await getCassandraClient().execute(query, [contextoId.toString(), anio], { prepare: true });
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