import { useState, useEffect } from 'react';
import { Card, CardBody, Chip, Spinner, Divider, Button, Select, SelectItem } from '@heroui/react';
import api from '../../services/api';

const MateriaDetail = ({ materia, onBack }) => {
  // Estados para la carga de datos de Neo4j
  const [loading, setLoading] = useState(true);
  const [correlativas, setCorrelativas] = useState([]);
  const [materiasCandidatas, setMateriasCandidatas] = useState([]);
  
  // Estados para la gestión de nuevas relaciones
  const [seleccionada, setSeleccionada] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);

  // Extraemos el ID de la materia que nos pasaron por props
  const idMateria = materia?._id;

  useEffect(() => {
    const cargarInformacionGrafo = async () => {
      if (!idMateria) return;
      
      try {
        setLoading(true);

        // 1. Obtenemos las materias que esta materia REQUIERE (desde Neo4j)
        const resCorrelativas = await api.get(`/materia/${idMateria}/correlativas`);
        setCorrelativas(resCorrelativas.data);

        // 2. Obtenemos todas las materias para el dropdown de "Agregar"
        // Filtramos para que no aparezca la materia actual en la lista
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

  // Función para crear la relación en el grafo
  const handleAgregarCorrelativa = async () => {
    if (!seleccionada) return;
    setLoadingPost(true);
    try {
      // Enviamos el ID de la materia actual y el de la requerida al backend
      await api.post(`/materia/${idMateria}/correlativas`, { 
        idCorrelativa: seleccionada 
      });
      
      setSeleccionada(""); // Limpiamos el selector
      
      // Actualizamos la lista local de correlativas para ver el cambio
      const res = await api.get(`/materia/${idMateria}/correlativas`);
      setCorrelativas(res.data);
      
    } catch (error) {
      alert("⚠️ Error al registrar relación: " + (error.response?.data?.error || error.message));
    } finally {
      setLoadingPost(false);
    }
  };

  // Pantalla de carga mientras se consulta Neo4j
  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 gap-4">
      <Spinner size="lg" color="primary" label="Consultando el grafo de materias..." />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: DATOS GENERALES (Provenientes de MongoDB) */}
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

      {/* SECCIÓN 2: GESTIÓN DE RELACIONES (Neo4j) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLUMNA: CORRELATIVIDADES */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            🔗 Materias requeridas
            <Chip size="sm" color="primary" variant="flat">{correlativas.length}</Chip>
          </h3>
          
          {/* Listado de materias requeridas */}
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

          {/* Formulario para añadir correlativa */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Vincular Nueva Correlativa</p>
            <div className="flex gap-2">
              <Select 
                placeholder="Seleccionar materia..." 
                size="sm"
                selectedKeys={seleccionada ? [seleccionada] : []}
                onChange={(e) => setSeleccionada(e.target.value)}
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
              >
                Añadir
              </Button>
            </div>
          </div>
        </div>

        {/* COLUMNA: EQUIVALENCIAS (Próximo paso) */}
        <div className="space-y-4 opacity-50">
          <h3 className="text-sm font-bold text-slate-700">⇄ Equivalencias</h3>
          <div className="h-full min-h-[160px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Módulo Pendiente</p>
            <p className="text-[11px] text-slate-400">
              Faltan equivalencias y correlatividades (Neo)
            </p>
          </div>
        </div>
      </div>

      {/* BOTÓN DE CIERRE (Maneja el onBack que cierra el Modal) */}
      <div className="flex justify-end pt-4">
        <Button color="danger" variant="flat" onPress={onBack} size="sm">
          Cerrar Detalle
        </Button>
      </div>
    </div>
  );
};

export default MateriaDetail;