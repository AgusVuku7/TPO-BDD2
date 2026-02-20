import { useEffect, useState, useCallback } from 'react';
import { 
  Card, CardHeader, CardBody, Divider, Button, 
  Select, SelectItem, Progress, Chip, Spinner,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell
} from "@heroui/react";
import { 
  BarChart3, TrendingUp, AlertTriangle, CheckCircle2, 
  Users, School, RefreshCcw 
} from "lucide-react";
import api from '../../services/api';

// 1. Quitamos defaultInstId de los parámetros
const AnaliticaDashboard = () => {
  const [reporte, setReporte] = useState([]);
  const [desvio, setDesvio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anio, setAnio] = useState("2022");
  
  // 2. Nuevos estados para manejar las instituciones
  const [instituciones, setInstituciones] = useState([]);
  const [selectedInst, setSelectedInst] = useState("");
  const [loadingInst, setLoadingInst] = useState(true);

  // 3. Cargar la lista de instituciones al montar el componente
  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        const res = await api.get('/institucion'); 
        
        // ¡Aquí está la corrección! Accedemos al arreglo dentro de res.data.instituciones
        const institucionesArray = res.data.instituciones || [];
        setInstituciones(institucionesArray);
        
        // Autoseleccionamos la primera si existe
        if (institucionesArray.length > 0) {
          setSelectedInst(institucionesArray[0]._id); 
        }
      } catch (error) {
        console.error("Error cargando instituciones:", error);
      } finally {
        setLoadingInst(false);
      }
    };
    
    fetchInstituciones();
  }, []);

  // 4. Actualizamos la función para que use selectedInst
  const fetchAnalitica = useCallback(async () => {
    if (!selectedInst) return; // Si aún no hay institución seleccionada, no hacemos nada

    setLoading(true);
    try {
      const [resReporte, resDesvio] = await Promise.all([
        api.get(`/analitica/institucion/${selectedInst}/${anio}`),
        api.get(`/analitica/desvios/${selectedInst}/${anio}`)
      ]);
      
      setReporte(Array.isArray(resReporte.data) ? resReporte.data : []);
      
      if (resDesvio.data.mensaje) {
        setDesvio(null); 
      } else {
        setDesvio(resDesvio.data);
      }
    } catch (error) {
      console.error("Error cargando analítica:", error);
      setReporte([]);
      setDesvio(null);
    } finally {
      setLoading(false);
    }
  }, [selectedInst, anio]);

  // Se ejecuta la búsqueda en Cassandra cuando cambia la institución seleccionada o el año
  useEffect(() => {
    if (selectedInst) {
      fetchAnalitica();
    }
  }, [selectedInst, anio, fetchAnalitica]);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* HEADER Y FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Panel de Analítica Avanzada</h1>
            <p className="text-small text-default-500">Métricas de Cassandra y MongoDB</p>
          </div>
        </div>
        
        <div className="flex gap-3 items-center w-full md:w-auto">
          {/* 5. Nuevo Select para Instituciones */}
          <Select 
            label="Institución"
            labelPlacement="outside"
            placeholder="Selecciona una institución"
            className="w-full md:w-64"
            isLoading={loadingInst}
            selectedKeys={selectedInst ? [selectedInst] : []}
            onSelectionChange={(keys) => setSelectedInst(Array.from(keys)[0])}
          >
            {instituciones.map((inst) => (
              <SelectItem key={inst._id || inst.id} textValue={inst.nombre}>
                {inst.nombre}
              </SelectItem>
            ))}
          </Select>

          <Select 
            label="Año"
            labelPlacement="outside"
            className="w-32"
            selectedKeys={[anio]}
            onSelectionChange={(keys) => setAnio(Array.from(keys)[0])}
          >
            <SelectItem key="2022" textValue="2022">2022</SelectItem>
            <SelectItem key="2023" textValue="2023">2023</SelectItem>
            <SelectItem key="2024" textValue="2024">2024</SelectItem>
            <SelectItem key="2025" textValue="2025">2025</SelectItem>
            <SelectItem key="2026" textValue="2026">2026</SelectItem>
          </Select>

          <Button isIconOnly variant="flat" onPress={fetchAnalitica} isLoading={loading} className="mt-6">
            <RefreshCcw size={18} />
          </Button>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardBody className="flex flex-row items-center gap-4 p-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><TrendingUp size={28} /></div>
            <div>
              <p className="text-default-500 text-tiny uppercase font-bold">Promedio Institucional</p>
              <h2 className="text-3xl font-black">{desvio?.promedio || "0.00"}</h2>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardBody className="flex flex-row items-center gap-4 p-6">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><AlertTriangle size={28} /></div>
            <div>
              <p className="text-default-500 text-tiny uppercase font-bold">Desvío Estándar</p>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-slate-800">{desvio?.desvioEstandar || "0.00"}</h2>
                <Chip size="sm" color={desvio?.estado === "ESTABLE" ? "success" : "danger"} variant="flat">
                  {desvio?.estado || "S/D"}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardBody className="flex flex-row items-center gap-4 p-6">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle2 size={28} /></div>
            <div className="w-full">
              <p className="text-default-500 text-tiny uppercase font-bold">Tasa de Aprobación Global</p>
              <h2 className="text-3xl font-black text-slate-800">
                {reporte && reporte.length > 0 
                  ? (reporte.reduce((acc, curr) => acc + parseFloat(curr.tasaAprobacion || 0), 0) / reporte.length).toFixed(1) 
                  : "0.0"}%
              </h2>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* TABLA DE DETALLE POR MATERIA */}
      <Card className="p-6 shadow-sm">
        <CardHeader className="flex gap-3 items-center">
          <School className="text-blue-600" size={30} />
          <div className="flex flex-col">
            <p className="text-xl font-bold text-slate-800">Rendimiento por Materia</p>
            <p className="text-small text-default-500">Datos calculados en tiempo real desde Cassandra</p>
          </div>
        </CardHeader>
        <Divider orientation="horizontal" className="my-5" />
        <CardBody>
          <Table removeWrapper aria-label="Tabla de analitica">
            <TableHeader>
              <TableColumn>MATERIA</TableColumn>
              <TableColumn>PROMEDIO</TableColumn>
              <TableColumn>TASA DE APROBACIÓN</TableColumn>
              <TableColumn>TOTAL ALUMNOS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={loading ? <Spinner /> : "No hay datos para este ciclo"}>
              {reporte.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-slate-700">{item.materia}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold">{item.promedio}</span>
                      <Progress size="sm" value={parseFloat(item.promedio) * 10} color={parseFloat(item.promedio) > 7 ? "success" : "warning"} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip variant="dot" color={parseFloat(item.tasaAprobacion) > 60 ? "success" : "danger"}>
                      {item.tasaAprobacion}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-default-500">
                      <Users size={14} /> {item.totalAlumnos}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default AnaliticaDashboard;