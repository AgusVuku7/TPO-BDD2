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

    //Relacion EQUIVALE
    async crearEquivalencia(materiaId1, materiaId2, porcentaje) {
        //Obtenemos el driver y abrimos sesion
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            //Ejecutamos la query
            await session.run(
                `
                MATCH (m1:Materia {id: $materiaId1}), (m2:Materia {id: $materiaId2})
                MERGE (m1)-[r:EQUIVALE_A {porcentaje: $porcentaje}]->(m2)
                MERGE (m2)-[r2:EQUIVALE_A {porcentaje: $porcentaje}]->(m1)
                RETURN type(r)
                `,
                //Pasamos los IDs a Strings ya que en neo4j se guardan en ese formato
                {
                    materiaId1: materiaId1.toString(),
                    materiaId2: materiaId2.toString(),
                    porcentaje
                }
            );
            
            console.log(`🟢 Relacion creada en Neo4j: ${materiaId1} es equivalente a ${materiaId2}`);

        } catch (error) {
            console.error('🔴 Error creando equivalencia en grafo:', error);
            throw error; //Lanzamos el error para que el backend se entere
        } finally {
            //Cerramos sesion
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