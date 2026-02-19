const { getNeo4jDriver } = require('../utils/DatabaseManager');

class GraphRepository {
    //Nodo Estudiante
    async crearEstudiante(mongoId, nombre) {
        //Obtenemos el driver y abrimos sesion
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
        //Ejecutamos la query
        await session.run(
            `
            MERGE (e:Estudiante {id: $id})
            ON CREATE SET e.nombre = $nombre
            RETURN e
            `,
            { id: mongoId.toString(), nombre }
            );
            
        console.log(`🟢 Nodo creado en Neo4j: ${nombre}`);

        } catch (error) {
        console.error('🔴 Error creando el nodo del estudiante en el grafo:', error);
        throw error; //Lanzamos el error para que el backend se entere
        } finally {
        //Cerramos sesion
        await session.close();
        }
    }

    //Nodo Materia
    async crearMateria(mongoId, nombre, pais) {
        //Obtenemos el driver y abrimos sesion
        const driver = getNeo4jDriver();
        const session = driver.session();
        
        try {
            //Ejecutamos la query
            await session.run(
                `
                MERGE (m:Materia {id: $id})
                ON CREATE SET m.nombre = $nombre, m.pais = $pais
                RETURN m
                `,
                { id: mongoId.toString(), nombre, pais }
            );
            
            console.log(`🟢 Nodo creado en Neo4j: ${nombre}`);

        } catch (error) {
            console.error('🔴 Error creando materia en grafo:', error);
            throw error; //Lanzamos el error para que el backend se entere
        } finally {
            //Cerramos sesion
            await session.close();
        }
    }

    //Nodo Institucion
    async crearInstitucion(mongoId, nombre, pais) {
        //Obtenemos el driver y abrimos sesion
        const driver = getNeo4jDriver();
        const session = driver.session();
        
        try {
            //Ejecutamos la query
            await session.run(
                `
                MERGE (i:Institucion {id: $id})
                ON CREATE SET i.nombre = $nombre, i.pais = $pais
                RETURN i
                `,
                { id: mongoId.toString(), nombre, pais }
            );
            
            console.log(`🟢 Nodo creado en Neo4j: ${nombre}`);

        } catch (error) {
            console.error('🔴 Error creando institucion en grafo:', error);
            throw error; //Lanzamos el error para que el backend se entere
        } finally {
            //Cerramos sesion
            await session.close();
        }
    }

    /**
    * Crea una relación de equivalencia entre dos materias.
    * Usamos MERGE para evitar duplicados.
    */
    async crearEquivalencia(idMateriaOrigen, idMateriaDestino, porcentaje) {
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
        const result = await session.run(
            //Creamos la relacion en una sola direccion
            `
            MATCH (a:Materia {id: $idA})
            MATCH (b:Materia {id: $idB})
            MERGE (a)-[r:EQUIVALE_A]->(b)
            SET r.createdAt = datetime(),
                r.porcentaje = $porcentaje
            RETURN r
            `,
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

    /**
    * Busca equivalencias priorizando siempre el camino más corto (Directa mata Transitiva).
    */
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

    //Generamos una correlatividad entre dos materias
    async agregarCorrelatividad(idMateria, idCorrelativa) {
        //Obtenemos el driver y abrimos sesion
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            //Ejecutamos la query
            await session.run(
                `
                MATCH (m1:Materia {id: $idMateria}), (m2:Materia {id: $idCorrelativa})
                MERGE (m1)-[r:REQUIERE]->(m2)
                RETURN type(r)
                `,
                //Pasamos los IDs a Strings ya que en neo4j se guardan en ese formato
                {
                    idMateria: idMateria.toString(),
                    idCorrelativa: idCorrelativa.toString()
                }
            );
            
            console.log(`🟢 Relacion creada en Neo4j: ${idMateria} necesita tener aprobada previamente ${idCorrelativa}`);

        } catch (error) {
            console.error('🔴 Error creando correlatividad en grafo:', error);
            throw error; //Lanzamos el error para que el backend se entere
        } finally {
            //Cerramos sesion
            await session.close();
        }
    }

    // Obtener correlativas (Qué materias necesito aprobar antes)
    async obtenerCorrelativas(materiaId) {
        //Obtenemos el driver y abrimos sesion
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            const result = await session.run(
                `
                MATCH (m:Materia {id: $id})-[:REQUIERE]->(requisito:Materia)
                RETURN requisito
                `,
                { id: materiaId.toString() }
            );

            //Mapeamos los resultados para devolver un array limpio de objetos
            return result.records.map(record => record.get('requisito').properties);

        } catch (error) {
            console.error('🔴 Error buscando correlativas:', error);
            throw error;
        } finally {
            await session.close();
        }
    }
}

module.exports = new GraphRepository();