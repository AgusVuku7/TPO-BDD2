const { getNeo4jDriver } = require('../utils/DatabaseManager');

class GraphRepository {
    //Nodo Estudiante
    async crearEstudiante(mongoId, nombre, mail) {
        //Obtenemos el driver y abrimos sesion
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
        //Ejecutamos la query
        await session.run(
            `
            MERGE (e:Estudiante {id: $id})
            ON CREATE SET e.nombre = $nombre, e.mail = $mail
            RETURN e
            `,
            { id: mongoId.toString(), nombre, email }
            );
            
        console.log(`🟢 Nodo creado en Neo4j: ${mail}`);

        } catch (error) {
        console.error('🔴 Error creando estudiante en grafo:', error);
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

    //Relacion CURSA
    async registrarCursada (estudianteId, materiaId, nota, anio) {
        //Obtenemos el driver y abrimos sesion
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            //Ejecutamos la query
            await session.run(
                `
                MATCH (e:Estudiante {id: $estudianteId}), (m:Materia {id: $materiaId})
                MERGE (e)-[r:CURSO {nota: $nota, anio: $anio}]->(m)
                RETURN type(r)
                `,
                //Pasamos los IDs a Strings ya que en neo4j se guardan en ese formato
                {
                    estudianteId: estudianteId.toString(),
                    materiaId: materiaId.toString(),
                    nota,
                    anio
                }
            );
            
            console.log(`🟢 Relacion creada en Neo4j: ${estudianteId} cursa/curso ${materiaId}`);

        } catch (error) {
            console.error('🔴 Error creando cursada en grafo:', error);
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

    //Relacion ASISTE/ASISTIO
    async registrarInstitucionEstudiante(estudianteId, institucionId, desde, hasta) {
        //Obtenemos el driver y abrimos sesion
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            //Ejecutamos la query
            await session.run(
                `
                MATCH (e:Estudiante {id: $estudianteId}), (i:Institucion {id: $institucionId})
                MERGE (e)-[r:ASISTE {desde: $desde, hasta: $hasta}]->(i)
                RETURN type(r)
                `,
                //Pasamos los IDs a Strings ya que en neo4j se guardan en ese formato
                {
                    estudianteId: estudianteId.toString(),
                    institucionId: institucionId.toString(),
                    desde,
                    hasta
                }
            );
            
            console.log(`🟢 Relacion creada en Neo4j: ${estudianteId} asiste a ${institucionId}`);

        } catch (error) {
            console.error('🔴 Error creando cursada en grafo:', error);
            throw error; //Lanzamos el error para que el backend se entere
        } finally {
            //Cerramos sesion
            await session.close();
        }
    }
}

module.exports = new GraphRepository();