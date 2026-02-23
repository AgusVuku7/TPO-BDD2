const { getNeo4jDriver } = require('../utils/DatabaseManager');

class repositorioGrafoTrayectoria {

    // Relación CURSO
    async registrarCursada (estudianteId, materiaId, nota, anio) {

        const driver = getNeo4jDriver();
        const session = driver.session();

        try {

            await session.run(
                // MARGE Busca el patrón; si no existe, lo crea.
                `MATCH (e:Estudiante {id: $estudianteId}), (m:Materia {id: $materiaId})
                MERGE (e)-[r:CURSO {nota: $nota, anio: $anio}]->(m)
                RETURN type(r)`,

                {
                    estudianteId: estudianteId.toString(),
                    materiaId: materiaId.toString(),
                    nota,
                    anio
                }
            );
            
            console.log(`🟢 Relacion creada en Neo4j: ${estudianteId} cursa/curso ${materiaId}`);

        } catch (error) {
            console.error('🔴 Error creando trayectoria de materias', error);
            throw error;
        } finally {
            await session.close();
        }
    }

    async obtenerCursada(estudianteId) {
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            const result = await session.run(
                `MATCH (e:Estudiante {id: $estudianteId})-[r:CURSO]->(m:Materia)
                RETURN m.id AS id, m.nombre AS nombre, r.nota AS nota, r.anio AS anio
                ORDER BY r.anio DESC`,
                { estudianteId: estudianteId.toString() }
            );

            return result.records.map(record => {
                const nota = record.get('nota');
                const anio = record.get('anio');
                return {
                    id: record.get('id'),
                    nombre: record.get('nombre'),
                    // Convertimos a número para el frontend
                    nota: nota?.toNumber ? nota.toNumber() : nota, 
                    anio: anio?.toNumber ? anio.toNumber() : anio
                };
            });
        } finally {
            await session.close();
        }
    }

    async actualizarCursada(estudianteId, materiaId, nota, anio) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MATCH (e:Estudiante {id: $estudianteId})-[r:CURSO]->(m:Materia {id: $materiaId})
                SET r.nota = $nota, r.anio = $anio`,
                { estudianteId: estudianteId.toString(), materiaId: materiaId.toString(), nota, anio }
            );
        } finally { await session.close(); }
    }

    async eliminarCursada(estudianteId, materiaId) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MATCH (e:Estudiante {id: $estudianteId})-[r:CURSO]->(m:Materia {id: $materiaId})
                DELETE r`,
                { estudianteId: estudianteId.toString(), materiaId: materiaId.toString() }
            );
        } finally { await session.close(); }
    }


    // Relación ASISTE/ASISTIO
    async registrarTrayectoriaInstitucional(estudianteId, institucionId, desde, hasta) {

        const driver = getNeo4jDriver();
        const session = driver.session();

        try {

            await session.run(
                `MATCH (e:Estudiante {id: $estudianteId}), (i:Institucion {id: $institucionId})
                MERGE (e)-[r:ASISTE {desde: $desde, hasta: $hasta}]->(i)
                RETURN type(r)`,

                {
                    estudianteId: estudianteId.toString(),
                    institucionId: institucionId.toString(),
                    desde,
                    hasta
                }
            );
            
            console.log(`🟢 Relacion creada en Neo4j: ${estudianteId} asiste a ${institucionId}`);

        } catch (error) {
            console.error('🔴 Error creando trayectoria institucional en grafo:', error);
            throw error;
        } finally {
            await session.close();
        }
    }

    async obtenerTrayectoriaInstitucional(estudianteId) {
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            const result = await session.run(
                `MATCH (e:Estudiante {id: $estudianteId})-[r:ASISTE]->(i:Institucion)
                RETURN i.id AS id, i.nombre AS nombre, i.pais AS pais, r.desde AS desde, r.hasta AS hasta
                ORDER BY r.desde DESC`,
                { estudianteId: estudianteId.toString() }
            );

            return result.records.map(record => {
                const desde = record.get('desde');
                const hasta = record.get('hasta');
                return {
                    id: record.get('id'),
                    nombre: record.get('nombre'),
                    pais: record.get('pais'),
                    // Asegurar que si vienen como enteros de Neo4j se conviertan a número/string
                    desde: desde?.toNumber ? desde.toNumber() : desde,
                    hasta: hasta?.toNumber ? hasta.toNumber() : hasta
                };
            });
        } catch (error) {
            console.error('🔴 Error al obtener trayectoria institucional:', error);
            throw error;
        } finally {
            await session.close();
        }
    }

    async actualizarTrayectoriaInstitucional(estudianteId, institucionId, desde, hasta) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MATCH (e:Estudiante {id: $estudianteId})-[r:ASISTE]->(i:Institucion {id: $institucionId})
                SET r.desde = $desde, r.hasta = $hasta`,
                { estudianteId: estudianteId.toString(), institucionId: institucionId.toString(), desde, hasta }
            );
        } finally { await session.close(); }
    }

    async eliminarTrayectoriaInstitucional(estudianteId, institucionId) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MATCH (e:Estudiante {id: $estudianteId})-[r:ASISTE]->(i:Institucion {id: $institucionId})
                DELETE r`,
                { estudianteId: estudianteId.toString(), institucionId: institucionId.toString() }
            );
        } finally { await session.close(); }
    }

}

module.exports = new repositorioGrafoTrayectoria();