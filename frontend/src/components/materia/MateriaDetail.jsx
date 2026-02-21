import { useState, useEffect } from 'react';
import { Card, CardBody, Chip, Spinner, Divider, Button, Select, SelectItem } from '@heroui/react';
import api from '../../services/api';
import { Check } from 'lucide-react';

const MateriaDetail = ({ materia, onBack }) => {
  // --- ESTADOS PARA CORRELATIVAS (Neo4j) ---
  const [loading, setLoading] = useState(true);
  const [correlativas, setCorrelativas] = useState([]);

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

        // Traer correlativas (requeridas)
        const resCorrelativas = await api.get(`/materia/${idMateria}/correlativas`);
        setCorrelativas(resCorrelativas.data);

      } catch (error) {
        console.error("🔴 Error al sincronizar con Neo4j:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarInformacionGrafo();
  }, [idMateria]);

  // Buscar Equivalencia en el Grafo (GET)
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
    <div className="space-y-4">
      {/* SECCIÓN 1: DATOS GENERALES */}
      <div className="grid grid-cols-2 gap-6 p-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase">Nombre</span>
          <span className="text-lg text-gray-800">{materia.nombre}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase">Nivel</span>
          <span className="text-lg text-gray-800">{materia.nivel}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase">Institución</span>
          <span className="text-lg text-gray-800">{materia.institucion?.nombre || 'ID No asignado'}</span>
        </div>
      </div>

      {/* Sección Dinámica: Metadata */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
        <h4 className="text-sm font-bold text-slate-600 mb-3 uppercase">
          Información Adicional
        </h4>
        
        {materia.metadata && Object.keys(materia.metadata).length > 0 ? (
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            {Object.entries(materia.metadata).map(([clave, valor]) => (
              <div key={clave} className="flex flex-col border-b border-gray-200 pb-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  {clave.replace(/_/g, ' ')}
                </span>
                <span className="text-sm text-gray-700">
                  {typeof valor === 'object' ? JSON.stringify(valor) : String(valor)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No hay datos adicionales registrados.</p>
        )}
      </div>

      <Divider className="my-6" />

      {/* SECCIÓN 2: RELACIONES */}
      <div className="flex-row gap-8 mt-4">
        
        {/* CORRELATIVIDADES */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Materias requeridas
            <Chip size="sm" color="primary" variant="flat">{correlativas.length}</Chip>
          </h3>
          
          <div className="p-4 bg-orange-50/30 border border-orange-100 rounded-xl space-y-2">
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
        </div>

        {/* EQUIVALENCIAS */}
        <div className="space-y-4 mt-6">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Consultar Equivalencias
          </h3>
          
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 min-h-50">
            <p className="text-xs text-slate-500">
              Consultar a qué materia equivale <strong>{materia.nombre}</strong> en otro sistema educativo.
            </p>

            <div className="flex gap-2 items-center w-full">
              <Select 
                size="sm" 
                label="Sistema Destino" 
                selectedKeys={[sistemaDestino]}
                onChange={(e) => setSistemaDestino(e.target.value)}
                className="w-3/4"
              >
                <SelectItem key="Estados Unidos" value="Estados Unidos">Estados Unidos</SelectItem>
                <SelectItem key="Reino Unido" value="Reino Unido">Reino Unido</SelectItem>
                <SelectItem key="Alemania" value="Alemania">Alemania</SelectItem>
                <SelectItem key="Argentina" value="Argentina">Argentina</SelectItem>
              </Select>
              
              <Button 
                size="sm" 
                color="primary" 
                variant="solid"
                onPress={buscarEquivalenciaEnGrafo}
                isLoading={buscandoEq}
                className='w-1/4'
              >
                Buscar
              </Button>
            </div>

            <div className="mt-2 space-y-2 max-h-75 overflow-y-auto">
              {equivalencias.length > 0 ? (
                equivalencias.map((eq, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg animate-appearance-in">
                    <div className="flex justify-between items-start">
                      <div className='flex items-center gap-2'>
                        <Check className="text-blue-600" size={16}/>
                        <p className="text-sm font-bold text-blue-600 mb-1"> Equivalencia #{index + 1}</p>
                      </div>
                      <Chip size="sm" color="primary" variant="solid" className="font-bold">
                          {eq.porcentajes ? `${eq.porcentajes[0]}%` : '100%'}
                      </Chip>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-2 mt-1">
                      Materia: <strong className="text-md">{eq.materia.nombre}</strong>
                    </p>
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