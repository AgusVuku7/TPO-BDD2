const cassandra = require('cassandra-driver');

// Configuración de conexión
const client = new cassandra.Client({
    contactPoints: [process.env.CASSANDRA_CONTACT_POINTS || 'cassandra'],
    localDataCenter: process.env.CASSANDRA_DC || 'datacenter1'
});

async function inicializarCassandra() {
    const keyspace = 'edugrade_analitica';
    try {
        console.log("🧹 Limpiando base de datos existente...");
        
        // Eliminar Keyspace si existe (Limpieza total)
        await client.execute(`DROP KEYSPACE IF EXISTS ${keyspace}`);
        console.log(`✅ Keyspace "${keyspace}" eliminado (si existía).`);

        console.log("🚀 Configurando nuevas tablas de analítica para EduGrade...");
        
        await client.execute(`
            CREATE KEYSPACE IF NOT EXISTS ${keyspace} 
            WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
        `);
        
        await client.execute(`USE ${keyspace}`);
        console.log("✅ Keyspace creado y seleccionado.");

        const queries = [
            `CREATE TABLE IF NOT EXISTS analitica_por_institucion (
                institucion_id text,
                anio_lectivo int,
                materia_id text,
                nombre_materia text,
                suma_notas double,
                total_estudiantes int,
                total_aprobados int,
                PRIMARY KEY (institucion_id, anio_lectivo, materia_id)
            ) WITH CLUSTERING ORDER BY (anio_lectivo DESC)`,

            // No la usamos al final
            `CREATE TABLE IF NOT EXISTS distribucion_por_pais_nivel (
                pais text,
                nivel_educativo text,
                rango_nota text,
                anio_lectivo int,
                cantidad_estudiantes int,
                PRIMARY KEY ((pais, nivel_educativo), anio_lectivo, rango_nota)
            )`,

            // No la usamos al final
            `CREATE TABLE IF NOT EXISTS analitica_sistemas_historico (
                sistema_educativo text,
                anio_lectivo int,
                pais text,
                promedio_general double,
                tasa_aprobacion_general double,
                PRIMARY KEY (sistema_educativo, anio_lectivo, pais)
            ) WITH CLUSTERING ORDER BY (anio_lectivo DESC)`,

            `CREATE TABLE IF NOT EXISTS metricas_desvio_estandar (
                contexto_id text,
                anio_lectivo int,
                suma_notas double,
                suma_cuadrados_notas double,
                total_muestras int,
                PRIMARY KEY (contexto_id, anio_lectivo)
            )`,

            `CREATE TABLE IF NOT EXISTS registro_auditoria (
                tipo_entidad text,
                anio_mes text,
                fecha_hora timestamp,
                evento_id timeuuid,
                entidad_id text,
                accion text,
                detalles text,
                PRIMARY KEY ((tipo_entidad, anio_mes), fecha_hora, evento_id)
            ) WITH CLUSTERING ORDER BY (fecha_hora DESC)`
        ];

        for (const query of queries) {
            await client.execute(query);
        }

        console.log("✨ Estructura de Cassandra completada con éxito desde cero.");

    } catch (error) {
        console.error("❌ Error en la inicialización:", error);
    } finally {
        await client.shutdown();
        process.exit();
    }
}

inicializarCassandra();