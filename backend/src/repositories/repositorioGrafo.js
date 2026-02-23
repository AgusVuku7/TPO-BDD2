const { getNeo4jDriver } = require('../utils/DatabaseManager');

class GraphRepository {
    
    async crearEstudiante(mongoId, nombre) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            // ON.. se ejecuta solo si el nodo fue creado recién, si ya existía no se pisa el nombre original
            await session.run(
                `MERGE (e:Estudiante {id: $id})
                ON CREATE SET e.nombre = $nombre
                RETURN e`,
                { id: mongoId.toString(), nombre }
                );
            console.log(`🟢 Nodo creado en Neo4j: ${nombre}`);
        } catch (error) {
            console.error('🔴 Error creando el nodo del estudiante en el grafo:', error);
            throw error;
        } finally {
            await session.close();
        }
    }

    async actualizarEstudiante(mongoId, nombre) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MATCH (e:Estudiante {id: $id})
                SET e.nombre = $nombre
                RETURN e`,
                { id: mongoId.toString(), nombre }
            );
            console.log(`🟢 Nodo actualizado en Neo4j: Estudiante ${nombre}`);
        } catch (error) {
            console.error('🔴 Error actualizando estudiante en grafo:', error);
        } finally {
            await session.close();
        }
    }

    async eliminarEstudiante(mongoId) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            // DETACH DELETE borra el nodo y todas sus relaciones, para evitar dejar relaciones colgando
            await session.run(
                `MATCH (e:Estudiante {id: $id})
                DETACH DELETE e`,
                { id: mongoId.toString() }
            );
            console.log(`🗑️ Nodo eliminado en Neo4j: Estudiante ${mongoId}`);
        } catch (error) {
            console.error('🔴 Error eliminando estudiante en grafo:', error);
        } finally {
            await session.close();
        }
    }

    async crearMateria(mongoId, nombre, pais) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MERGE (m:Materia {id: $id})
                ON CREATE SET m.nombre = $nombre, m.pais = $pais
                RETURN m`,
                { id: mongoId.toString(), nombre, pais }
            );
            console.log(`🟢 Nodo creado en Neo4j: ${nombre}`);
        } catch (error) {
            console.error('🔴 Error creando materia en grafo:', error);
            throw error;
        } finally {
            await session.close();
        }
    }

    async actualizarMateria(mongoId, nombre, pais) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MATCH (m:Materia {id: $id})
                SET m.nombre = $nombre, m.pais = $pais
                RETURN m`,
                { id: mongoId.toString(), nombre, pais }
            );
            console.log(`🟢 Nodo actualizado en Neo4j: Materia ${nombre}`);
        } catch (error) {
            console.error('🔴 Error actualizando materia en grafo:', error);
        } finally {
            await session.close();
        }
    }

    async eliminarMateria(mongoId) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `
                MATCH (m:Materia {id: $id})
                DETACH DELETE m
                `,
                { id: mongoId.toString() }
            );
            console.log(`🗑️ Nodo eliminado en Neo4j: Materia ${mongoId}`);
        } catch (error) {
            console.error('🔴 Error eliminando materia en grafo:', error);
        } finally {
            await session.close();
        }
    }

    
    // --- EQUIVALENCIAS --- \\
    
    async crearEquivalencia(idMateriaOrigen, idMateriaDestino, porcentaje) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            const result = await session.run(
                // Creamos la relacion en una sola direccion
                `MATCH (a:Materia {id: $idA})
                MATCH (b:Materia {id: $idB})
                MERGE (a)-[r:EQUIVALE_A]->(b)
                SET r.createdAt = datetime(),
                    r.porcentaje = $porcentaje
                RETURN r`,
                { 
                idA: idMateriaOrigen.toString(), 
                idB: idMateriaDestino.toString(),
                porcentaje: parseFloat(porcentaje)
                }
            );
            if (result.records.length === 0) {
                throw new Error(`No se encontraron los nodos en el grafo. Asegurate de que las materias existan.`);
            }
            return result.records[0].get('r').properties;
        } catch (error) {
            console.error('🔴 Error creando equivalencia:', error);
            throw error;
        } finally {
            await session.close();
        }
    }  

    // Busca equivalencias priorizando siempre el camino más corto.
    async buscarEquivalencia(idMateria, sistemaDestino) {
        const driver = getNeo4jDriver();
        const session = driver.session();
    
        try {
            const result = await session.run(
                `
                MATCH path = (start:Materia {id: $id})-[:EQUIVALE_A*1..4]-(end:Materia)
                WHERE toLower(end.pais) = toLower($sistema) 
                    AND start <> end
                
                // 1. Ordenamos todos los caminos encontrados por longitud (menor a mayor)
                WITH end, path
                ORDER BY length(path) ASC
    
                // 2. Agrupamos por materia destino ('end') y nos quedamos SOLO con el primero (el más corto)
                WITH end, head(collect(path)) as shortestPath
    
                // 3. Devolvemos los datos de ese camino ganador
                RETURN end, 
                    length(shortestPath) as saltos, 
                    [rel in relationships(shortestPath) | rel.porcentaje] as porcentajes
                ORDER BY saltos ASC
                `,
                { 
                    id: idMateria.toString(), 
                    sistema: sistemaDestino 
                }
            );
            if (result.records.length === 0) return []; 
            return result.records.map(record => ({
                materia: record.get('end').properties,
                distancia: record.get('saltos').toNumber(),
                porcentajes: record.get('porcentajes')
            }));
        } catch (error) {
            console.error('🔴 Error buscando equivalencias:', error);
            throw error;
        } finally {
            await session.close();
        }
    }

    // --- CORRELATIVIDADES --- \\

    async agregarCorrelatividad(idMateria, idCorrelativa) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MATCH (m1:Materia {id: $idMateria}), (m2:Materia {id: $idCorrelativa})
                MERGE (m1)-[r:REQUIERE]->(m2)
                RETURN type(r)`,
                // Pasamos los IDs a Strings ya que en neo4j se guardan en ese formato
                {
                    idMateria: idMateria.toString(),
                    idCorrelativa: idCorrelativa.toString()
                }
            );
            console.log(`🟢 Relacion creada en Neo4j: ${idMateria} necesita tener aprobada previamente ${idCorrelativa}`);
        } catch (error) {
            console.error('🔴 Error creando correlatividad en grafo:', error);
            throw error;
        } finally {
            await session.close();
        }
    }

    // Obtener correlativas (Qué materias necesito aprobar antes)
    async obtenerCorrelativas(materiaId) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (m:Materia {id: $id})-[:REQUIERE]->(requisito:Materia)
                RETURN requisito`,
                { id: materiaId.toString() }
            );
            return result.records.map(record => record.get('requisito').properties);
        } catch (error) {
            console.error('🔴 Error buscando correlativas:', error);
            throw error;
        } finally {
            await session.close();
        }
    }


    async crearInstitucion(mongoId, nombre, pais) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MERGE (i:Institucion {id: $id})
                ON CREATE SET i.nombre = $nombre, i.pais = $pais
                RETURN i`,
                { id: mongoId.toString(), nombre, pais }
            );
            console.log(`🟢 Nodo creado en Neo4j: ${nombre}`);
        } catch (error) {
            console.error('🔴 Error creando institucion en grafo:', error);
            throw error;
        } finally {
            await session.close();
        }
    }

    async actualizarInstitucion(mongoId, nombre, pais) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MATCH (i:Institucion {id: $id})
                SET i.nombre = $nombre, i.pais = $pais
                RETURN i`,
                { id: mongoId.toString(), nombre, pais }
            );
            console.log(`🟢 Nodo actualizado en Neo4j: Institucion ${nombre}`);
        } catch (error) {
            console.error('🔴 Error actualizando institucion en grafo:', error);
        } finally {
            await session.close();
        }
    }

    async eliminarInstitucion(mongoId) {
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MATCH (i:Institucion {id: $id})
                DETACH DELETE i`,
                { id: mongoId.toString() }
            );
            console.log(`🗑️ Nodo eliminado en Neo4j: Institucion ${mongoId}`);
        } catch (error) {
            console.error('🔴 Error eliminando institucion en grafo:', error);
        } finally {
            await session.close();
        }
    }
}
module.exports = new GraphRepository();