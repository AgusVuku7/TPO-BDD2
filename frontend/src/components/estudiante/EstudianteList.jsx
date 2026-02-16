import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import EstudianteForm from './EstudianteForm';
import EstudianteDetail from './EstudianteDetail';
import { Button, Card, CardBody, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalHeader, Pagination, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { Divide, Eye, Pencil, Plus, SearchIcon, Trash2 } from 'lucide-react';

const EstudianteList = () => {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Manejo de Modal unificado: 'create', 'edit', 'view' o null
  const [modalMode, setModalMode] = useState(null); 
  const [selectedStudent, setSelectedStudent] = useState(null);

  const load = useCallback(async (isMounted = true) => {
    setLoading(true);
    try {
      const res = await api.get('/estudiante', {
        params: { buscar: searchTerm, page: page, limit: 10 }
      });
      if (isMounted) {
        setStudents(res.data.estudiantes);
        setTotalPages(res.data.pages);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    let isMounted = true;
    load(isMounted);
    return () => { isMounted = false; };
  }, [load]);

  const handleOpenModal = (mode, student = null) => {
    setSelectedStudent(student);
    setModalMode(mode);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedStudent(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar estudiante?')) {
      await api.delete(`/estudiante/${id}`);
      load();
    }
  };

  return (
    <Card className="p-6 mt-8">
      <CardHeader className='flex flex-row justify-between items-center'>
        {/* Lado Izquierdo: Título */}
        <div className='text-3xl font-bold text-slate-800'>
          Gestión de Estudiantes
        </div>

        {/* Lado Derecho: Spinner + Buscador + Botón */}
        <div className='flex gap-4 items-center'>
          {/* Spinner a la izquierda del buscador, condicionado por 'loading' */}
          {loading && <Spinner variant="dots" size="sm" color="primary" />}
          
          <Input
            isClearable
            placeholder="Buscar por nombre..."
            startContent={<SearchIcon className="w-4 h-4 text-default-400" />}
            value={searchTerm}
            onClear={() => setSearchTerm("")}
            onValueChange={setSearchTerm}
            className="max-w-xs" // Limitamos el ancho para que no empuje el botón
          />
          
          <Button 
            onPress={() => handleOpenModal('create')} 
            color='primary'
            className="shrink-0 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Añadir Estudiante
          </Button>
        </div>
      </CardHeader>
      <Divider orientation="horizontal" className="my-5" />
      <CardBody>
        <Table aria-label="Tabla de Estudiantes" className="shadow-none" removeWrapper>
          <TableHeader>
            <TableColumn className="bg-blue-50 text-slate-800">NOMBRE Y APELLIDO</TableColumn>
            <TableColumn className="bg-blue-50 text-slate-800">PAÍS</TableColumn>
            <TableColumn className="bg-blue-50 text-slate-800 text-center">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No hay estudiantes registrados."}>
            {students.map((s) => (
              <TableRow key={s._id} className="border-b border-divider">
                <TableCell className="py-4">{s.nombre} {s.apellido}</TableCell>
                <TableCell>{s.pais}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" color='default' variant="light" isIconOnly onPress={() => handleOpenModal('view', s)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" color="primary" variant="light" isIconOnly onPress={() => handleOpenModal('edit', s)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" color="danger" variant="light" isIconOnly onPress={() => handleDelete(s._id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-center mt-8">
          <Pagination
            isCompact
            showControls
            color="primary"
            page={page}
            total={totalPages}
            onChange={setPage} // Actualiza el estado y dispara el useEffect
          />
        </div>

        <Modal
          isOpen={!!modalMode} 
          onOpenChange={handleCloseModal}
          size="2xl"
          backdrop="blur"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-2xl font-bold text-slate-800 p-6">
                  {modalMode === 'view' ? 'Información del Estudiante' : 
                  modalMode === 'edit' ? 'Modificar Registro' : 'Nuevo Registro'}
                  <Divider orientation="horizontal" className="my-2 mt-4" />
                </ModalHeader>
                <ModalBody className="pb-4">
                  {modalMode === 'view' ? (
                    <EstudianteDetail student={selectedStudent} onBack={onClose} />
                  ) : (
                    <EstudianteForm 
                      initialData={selectedStudent} 
                      onSuccess={() => { onClose(); load(); }} 
                      onCancel={onClose} 
                    />
                  )}
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default EstudianteList;