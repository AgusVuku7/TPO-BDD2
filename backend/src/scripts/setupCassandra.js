
// Ejecuta el script: node backend/src/scripts/setupCassandra.js

const cassandra = require('cassandra-driver');

// Configuración de conexión
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1'
});

async function inicializarCassandra() {
    try {
        console.log("🚀 Configurando tablas de analítica para EduGrade...");

        // 1. Crear Keyspace
        await client.execute(`
            CREATE KEYSPACE IF NOT EXISTS edugrade_analitica 
            WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
        `);
        
        await client.execute("USE edugrade_analitica");
        console.log("✅ Keyspace listo.");

        // 2. Definición de las tablas exactas de la consigna
        const queries = [
            // Tabla 1: Promedios por Institución
            // "¿Cuál es el promedio y la tasa de aprobación de la Institución X en el año Y?"
            // Uso: Permite obtener promedios por institución rápidamente. La tasa de aprobación se calcula dividiendo total_aprobados / total_estudiantes.
            `CREATE TABLE IF NOT EXISTS analitica_por_institucion (
                institucion_id uuid,
                anio_lectivo int,
                materia_id uuid,
                nombre_materia text,
                suma_notas double,
                total_estudiantes counter,
                total_aprobados counter,
                PRIMARY KEY (institucion_id, anio_lectivo, materia_id)
            ) WITH CLUSTERING ORDER BY (anio_lectivo DESC)`,

            // Tabla 2: Distribuciones Geográficas y Niveles
            // "¿Cómo se distribuyen las notas en el País P para el Nivel Educativo N?"
            // Uso: Ideal para gráficos de barras o distribuciones por región y país, cumpliendo con la gestión de información internacional.
            `CREATE TABLE IF NOT EXISTS distribucion_por_pais_nivel (
                pais text,
                nivel_educativo text,
                rango_nota text,
                anio_lectivo int,
                cantidad_estudiantes counter,
                PRIMARY KEY ((pais, nivel_educativo), anio_lectivo, rango_nota)
            )`,

            // Tabla 3: Histórico de Sistemas
            // "Compara la evolución del Sistema Educativo A vs B en los últimos 5 años".
            // Uso: Al particionar por sistema_educativo, puedes traer toda la historia de un sistema en una sola consulta para graficar líneas de tiempo.
            `CREATE TABLE IF NOT EXISTS analitica_sistemas_historico (
                sistema_educativo text,
                anio_lectivo int,
                pais text,
                promedio_general double,
                tasa_aprobacion_general double,
                PRIMARY KEY (sistema_educativo, anio_lectivo, pais)
            ) WITH CLUSTERING ORDER BY (anio_lectivo DESC)`,

            // Tabla 4: Métricas para Desvíos Estadísticos
            // Esta tabla te da los tres componentes (sumatoria x^2, sumatoria x, N) de forma inmediata
            `CREATE TABLE IF NOT EXISTS metricas_desvio_estandar (
                contexto_id text,
                anio_lectivo int,
                suma_notas double,
                suma_cuadrados_notas double,
                total_muestras counter,
                PRIMARY KEY (contexto_id, anio_lectivo)
            )`
        ];

        // 3. Ejecución secuencial
        for (const query of queries) {
            await client.execute(query);
        }

        console.log("✅ Estructura de Cassandra completada con éxito.");

    } catch (error) {
        console.error("❌ Error en la inicialización:", error);
    } finally {
        await client.shutdown();
        process.exit();
    }
}

inicializarCassandra();