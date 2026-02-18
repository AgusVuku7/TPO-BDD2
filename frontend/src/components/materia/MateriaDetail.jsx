import { useState, useEffect } from 'react';
import { Card, CardBody, Chip, Spinner, Divider, Button, Select, SelectItem } from '@heroui/react';
import api from '../../services/api';

const MateriaDetail = ({ materia, onBack }) => {
  // --- ESTADOS PARA CORRELATIVAS (Neo4j) ---
  const [loading, setLoading] = useState(true);
  const [correlativas, setCorrelativas] = useState([]);
  const [materiasCandidatas, setMateriasCandidatas] = useState([]);
  const [seleccionada, setSeleccionada] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);

  // --- ESTADOS PARA EQUIVALENCIAS (RF3 - Grafo) ---
  // AHORA EL DEFAULT DEBE COINCIDIR CON TU BASE DE DATOS (Nombre completo)
  const [sistemaDestino, setSistemaDestino] = useState("Argentina"); 
  
  const [equivalencias, setEquivalencias] = useState([]); 
  const [buscandoEq, setBuscandoEq] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false); 

  const idMateria = materia?._id;

  // 1. Cargar datos iniciales al montar
  useEffect(() => {
    const cargarInformacionGrafo = async () => {
      if (!idMateria) return;
      
      try {
        setLoading(true);

        // A. Traer correlativas (requeridas)
        const resCorrelativas = await api.get(`/materia/${idMateria}/correlativas`);
        setCorrelativas(resCorrelativas.data);

        // B. Traer todas las materias para el select de "Agregar Correlativa"
        const resTodas = await api.get('/materia');
        const lista = resTodas.data.materias || resTodas.data.data || [];
        setMateriasCandidatas(lista.filter(m => m._id !== idMateria));

      } catch (error) {
        console.error("🔴 Error al sincronizar con Neo4j:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarInformacionGrafo();
  }, [idMateria]);

  // 2. Función para AGREGAR correlativa (POST)
  const handleAgregarCorrelativa = async () => {
    if (!seleccionada) return;
    setLoadingPost(true);
    try {
      await api.post(`/materia/${idMateria}/correlativas`, { 
        idCorrelativa: seleccionada 
      });
      
      setSeleccionada(""); 
      const res = await api.get(`/materia/${idMateria}/correlativas`);
      setCorrelativas(res.data);
      
    } catch (error) {
      alert("⚠️ Error al registrar relación: " + (error.response?.data?.error || error.message));
    } finally {
      setLoadingPost(false);
    }
  };

  // 3. Buscar Equivalencia en el Grafo (GET)
  const buscarEquivalenciaEnGrafo = async () => {
    if (!idMateria) return;
    
    setBuscandoEq(true);
    setBusquedaRealizada(true); 
    setEquivalencias([]); 
    
    try {
      console.log("🔎 Buscando en sistema:", sistemaDestino); // Log para debug

      const res = await api.get(`/materia/${idMateria}/equivalencia`, {
        params: { sistema: sistemaDestino }
      });
      
      const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
      setEquivalencias(data);

    } catch (error) {
      console.log("No se encontró equivalencia o error:", error);
      setEquivalencias([]);
    } finally {
      setBuscandoEq(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 gap-4">
      <Spinner size="lg" color="primary" label="Consultando el grafo de materias..." />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: DATOS GENERALES */}
      <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código</span>
          <span className="text-md font-mono text-slate-600">{materia._id}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre</span>
          <span className="text-md font-bold text-slate-800">{materia.nombre}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nivel</span>
          <span className="text-md text-slate-700">{materia.nivel}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institución</span>
          <span className="text-md text-slate-700 font-medium">{materia.institucion?.nombre || 'ID No asignado'}</span>
        </div>
      </div>

      <Divider className="my-2" />

      {/* SECCIÓN 2: RELACIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: CORRELATIVIDADES */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            🔗 Materias requeridas
            <Chip size="sm" color="primary" variant="flat">{correlativas.length}</Chip>
          </h3>
          
          <div className="min-h-[120px] p-4 bg-orange-50/30 border border-orange-100 rounded-xl space-y-2">
            {correlativas.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">Esta materia no tiene requisitos previos registrados.</p>
            ) : (
              correlativas.map((c, i) => (
                <Card key={i} shadow="sm" className="border-none bg-white">
                  <CardBody className="py-2 px-3 flex flex-row justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">{c.nombre}</span>
                    <Chip size="sm" variant="dot" color="warning">Requerida</Chip>
                  </CardBody>
                </Card>
              ))
            )}
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Vincular Nueva Correlativa</p>
            <div className="flex gap-2">
              <Select 
                placeholder="Seleccionar..." 
                size="sm"
                selectedKeys={seleccionada ? [seleccionada] : []}
                onChange={(e) => setSeleccionada(e.target.value)}
                classNames={{ trigger: "h-10" }}
              >
                {materiasCandidatas.map((m) => (
                  <SelectItem key={m._id} value={m._id} textValue={m.nombre}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </Select>
              <Button 
                size="sm" 
                color="primary" 
                onPress={handleAgregarCorrelativa}
                isLoading={loadingPost}
                isDisabled={!seleccionada}
                className="h-10"
              >
                Añadir
              </Button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: EQUIVALENCIAS */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            🌐 Consultar Equivalencias (Grafo)
          </h3>
          
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 min-h-[200px]">
            <p className="text-xs text-slate-500">
              Consultar a qué materia equivale <strong>{materia.nombre}</strong> en otro sistema educativo.
            </p>

            <div className="flex gap-2 items-end">
              {/* CORRECCIÓN ACÁ: Los 'value' deben coincidir con lo que dice tu Base de Datos */}
              <Select 
                size="sm" 
                label="Sistema Destino" 
                selectedKeys={[sistemaDestino]}
                onChange={(e) => setSistemaDestino(e.target.value)}
                className="flex-1"
              >
                {/* Usamos los nombres completos que tenés en Neo4j */}
                <SelectItem key="Estados Unidos" value="Estados Unidos">Estados Unidos</SelectItem>
                <SelectItem key="Reino Unido" value="Reino Unido">Reino Unido</SelectItem>
                <SelectItem key="Alemania" value="Alemania">Alemania</SelectItem>
                <SelectItem key="Argentina" value="Argentina">Argentina</SelectItem>
              </Select>
              
              <Button 
                size="sm" 
                color="secondary" 
                variant="solid"
                onPress={buscarEquivalenciaEnGrafo}
                isLoading={buscandoEq}
                className="h-12 w-24"
              >
                Buscar
              </Button>
            </div>

            <div className="mt-2 space-y-2 max-h-[300px] overflow-y-auto">
              {equivalencias.length > 0 ? (
                equivalencias.map((eq, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg animate-appearance-in">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-green-800 mb-1">✅ Equivalencia #{index + 1}</p>
                      <Chip size="sm" color="success" variant="solid" className="font-bold">
                          {eq.porcentajes ? `${eq.porcentajes[0]}%` : '100%'}
                      </Chip>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-2 mt-1">
                      Materia: <strong className="text-lg">{eq.materia.nombre}</strong>
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Chip size="sm" variant="flat" color="success">
                         {eq.distancia === 1 ? "Directa" : "Indirecta (Transitiva)"}
                      </Chip>
                      <Chip size="sm" variant="flat" color="default">
                         {eq.distancia} salto(s)
                      </Chip>
                    </div>
                  </div>
                ))
              ) : (
                busquedaRealizada && !buscandoEq ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-center h-24 flex items-center justify-center">
                    <p className="text-xs text-red-400">
                      No se encontraron equivalencias en {sistemaDestino}.
                    </p>
                  </div>
                ) : !buscandoEq && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center h-24 flex items-center justify-center">
                    <p className="text-xs text-slate-400">
                      Seleccioná un país y hacé click en "Buscar".
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4">
        <Button color="danger" variant="flat" onPress={onBack} size="sm">
          Cerrar Detalle
        </Button>
      </div>
    </div>
  );
};

export default MateriaDetail;