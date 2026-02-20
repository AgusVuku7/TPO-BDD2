import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, 
  Card, CardHeader, Divider, Button, Spinner,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Select, SelectItem, useDisclosure,
  NumberInput,
  DateInput
} from "@heroui/react";
import { School, BookOpen, Trash2, Plus, Calendar, Star, Pencil } from "lucide-react";
import { parseDate } from "@internationalized/date";

const TrayectoriaTable = ({ studentId }) => {
  const [materias, setMaterias] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [allMaterias, setAllMaterias] = useState([]); // Para el select de materias
  const [allInstituciones, setAllInstituciones] = useState([]); // Para el select de inst
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Control de Modals
  const { isOpen: isMatOpen, onOpen: onMatOpen, onClose: onMatClose } = useDisclosure();
  const { isOpen: isInstOpen, onOpen: onInstOpen, onClose: onInstClose } = useDisclosure();

  // Estados de Formulario
  const [formMateria, setFormMateria] = useState({ materiaId: "", nota: null, anio: new Date().getFullYear() });
  const [formInst, setFormInst] = useState({ institucionId: "", desde: "", hasta: "" });

  // 1. Cargar datos del alumno (Neo4j)
  const fetchTrayectoria = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      // Llamamos a los endpoints del router trayectoria.js
      const [resMat, resInst] = await Promise.all([
        api.get(`/trayectoria/${studentId}/materias`),
        api.get(`/trayectoria/${studentId}/instituciones`)
      ]);
      setMaterias(resMat.data);
      setInstituciones(resInst.data);
    } catch (error) {
      console.error("Error cargando trayectoria:", error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchTrayectoria();
  }, [fetchTrayectoria]);

  // 2. Cargar catálogos generales (MongoDB) para los Selects
  const loadCatalogs = async () => {
    try {
      const [mats, insts] = await Promise.all([
        api.get('/materia', { params: { limit: 50 } }),
        api.get('/institucion', { params: { limit: 50 } })
      ]);
      setAllMaterias(mats.data.materias);
      setAllInstituciones(insts.data.instituciones);
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    }
  };

  const openMateriaModal = () => { 
    setEditingId(null); 
    setFormMateria({ materiaId: "", nota: null, anio: new Date().getFullYear() }); 
    loadCatalogs(); 
    onMatOpen(); 
  };
  
  const openInstModal = () => { 
    setEditingId(null); 
    setFormInst({ institucionId: "", desde: null, hasta: null }); 
    loadCatalogs(); 
    onInstOpen(); 
  };

  // 3. Handlers de Envío (POST a Trayectoria)
  const handleMateriaSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/trayectoria/${studentId}/materia/${editingId}`, formMateria);
      } else {
        await api.post(`/trayectoria/${studentId}/materia`, formMateria);
      }
      fetchTrayectoria();
      onMatClose();
    } catch (error) {
      alert("Error: " + error.response?.data?.error);
    } finally { setSubmitting(false); }
  };

  const handleInstSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/trayectoria/${studentId}/institucion/${editingId}`, formInst);
      } else {
        await api.post(`/trayectoria/${studentId}/institucion`, formInst);
      }
      fetchTrayectoria();
      onInstClose();
    } catch (error) {
      alert("Error: " + error.response?.data?.error);
    } finally { setSubmitting(false); }
  };

  // Handlers de Eliminación
  const handleDeleteMateria = async (id) => {
    await api.delete(`/trayectoria/${studentId}/materia/${id}`);
    fetchTrayectoria();
  };

  const handleDeleteInstitucion = async (id) => {
    await api.delete(`/trayectoria/${studentId}/institucion/${id}`);
    fetchTrayectoria();
  };

  // Handlers de actualización
  const handleEditMateria = (m) => {
    setEditingId(m.id);
    setFormMateria({ materiaId: m.id, nota: Number(m.nota), anio: Number(m.anio) });
    loadCatalogs();
    onMatOpen();
  };

  const handleEditInst = (i) => {
    setEditingId(i.id);
    const fechaDesde = i.desde?.split('T')[0];
    const fechaHasta = i.hasta?.split('T')[0];
    setFormInst({ institucionId: i.id, desde: fechaDesde, hasta: fechaHasta });
    loadCatalogs();
    onInstOpen();
  };

  if (!studentId) return (
    <Card className="p-10 mt-6 flex justify-center items-center">
      <p className="text-default-400">Seleccione un estudiante para gestionar su trayectoria</p>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* TARJETA MATERIAS */}
      <Card className="p-4">
        <CardHeader className="flex justify-between">
          <div className="flex gap-2 items-center"><BookOpen className="text-blue-600" /><p className="font-bold">Materias</p></div>
          <Button size="sm" color="primary" variant="flat" onPress={openMateriaModal} startContent={<Plus size={16}/>}>Añadir</Button>
        </CardHeader>
        <Divider className="my-2" />
        <Table removeWrapper aria-label="Materias">
          <TableHeader>
            <TableColumn>MATERIA</TableColumn>
            <TableColumn>NOTA</TableColumn>
            <TableColumn>AÑO</TableColumn>
            <TableColumn className="text-center">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent={loading ? <Spinner /> : "Sin materias"}>
            {materias.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.nombre}</TableCell>
                <TableCell>{m.nota}</TableCell>
                <TableCell>{m.anio}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button isIconOnly size="sm" variant="light" color="primary" onPress={() => handleEditMateria(m)}>
                      <Pencil size={16} />
                    </Button>
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDeleteMateria(m.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* TARJETA INSTITUCIONES */}
      <Card className="p-4">
        <CardHeader className="flex justify-between">
          <div className="flex gap-2 items-center"><School className="text-blue-600" /><p className="font-bold">Instituciones</p></div>
          <Button size="sm" color="primary" variant="flat" onPress={openInstModal} startContent={<Plus size={16}/>}>Vincular</Button>
        </CardHeader>
        <Divider className="my-2" />
        <Table removeWrapper aria-label="Instituciones">
          <TableHeader>
            <TableColumn>NOMBRE</TableColumn>
            <TableColumn>DESDE</TableColumn>
            <TableColumn>HASTA</TableColumn>
            <TableColumn className="text-center">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent={loading ? <Spinner /> : "Sin instituciones"}>
            {instituciones.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.nombre}</TableCell>
                <TableCell>{i.desde}</TableCell>
                <TableCell>{i.hasta || "Actualidad"}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button isIconOnly size="sm" variant="light" color="primary" onPress={() => handleEditInst(i)}>
                      <Pencil size={16} />
                    </Button>
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDeleteInstitucion(i.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* MODAL AÑADIR MATERIA */}
      <Modal isOpen={isMatOpen} onClose={onMatClose} placement="center">
        <ModalContent>
          <ModalHeader className="flex gap-2 mt-3">
            {editingId ? "Actualizar Materia" : "Registrar Materia cursada"}
          </ModalHeader>
          <ModalBody className="gap-4">
            <Select 
              label="Seleccionar Materia" 
              isDisabled={!!editingId}
              placeholder="Buscar..."
              selectedKeys={[formMateria.materiaId]}
              onSelectionChange={(keys) => setFormMateria({...formMateria, materiaId: Array.from(keys)[0]})}
              isRequired
            >
              {allMaterias.map((m) => (
                <SelectItem key={m._id} textValue={m.nombre}>{m.nombre}</SelectItem>
              ))}
            </Select>
            <div className="flex gap-4">
              <NumberInput 
                label="Nota" 
                startContent={<Star size={16}/> } 
                isRequired
                minValue={0}
                maxValue={10}
                formatOptions={{
                    minimumFractionDigits: 1, // Fuerza al menos un decimal (ej: 7,0)
                    maximumFractionDigits: 2  // Permite hasta dos decimales (ej: 7,55)
                  }}
                onValueChange={(val) => setFormMateria({...formMateria, nota: val})}
                value={formMateria.nota} 
              />
              <NumberInput 
                label="Año"
                startContent={<Calendar size={16}/>}
                isRequired
                minValue={1900}
                maxValue={2100}
                formatOptions={{
                  useGrouping: false,      // Evita el punto/coma de miles (2026 en vez de 2,026)
                  maximumFractionDigits: 0  // Asegura que sea un número entero
                }}
                onValueChange={(val) => setFormMateria({...formMateria, anio: val})}
                value={formMateria.anio}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onMatClose}>Cancelar</Button>
            <Button color="primary" isLoading={submitting} onPress={handleMateriaSubmit}>Guardar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL VINCULAR INSTITUCIÓN */}
      <Modal isOpen={isInstOpen} onClose={onInstClose} placement="center">
        <ModalContent>
          <ModalHeader className="flex gap-2 mt-3">
            {editingId ? "Actualizar Institución" : "Vincular Institución"}
          </ModalHeader>
          <ModalBody className="gap-4">
            <Select label="Institución" isDisabled={!!editingId} placeholder="Seleccione una..." isRequired
              selectedKeys={[formInst.institucionId]}
              onSelectionChange={(keys) => setFormInst({...formInst, institucionId: Array.from(keys)[0]})}
            >
              {allInstituciones.map((i) => (
                <SelectItem key={i._id} textValue={i.nombre}>{i.nombre}</SelectItem>
              ))}
            </Select>
            <div className="flex gap-4">
              <DateInput 
                label="Desde"
                isRequired
                value={formInst.desde ? parseDate(formInst.desde) : null}
                onChange={(date) => setFormInst({...formInst, desde: date?.toString()})}
              />
              <DateInput
                label="Hasta"
                isRequired
                value={formInst.hasta ? parseDate(formInst.hasta) : null}
                onChange={(date) => setFormInst({...formInst, hasta: date?.toString()})}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onInstClose}>Cancelar</Button>
            <Button color="primary" className="text-white" isLoading={submitting} onPress={handleInstSubmit}>Guardar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div>
  );
};

export default TrayectoriaTable;