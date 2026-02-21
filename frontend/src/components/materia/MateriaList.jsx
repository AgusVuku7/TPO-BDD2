import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import MateriaForm from './MateriaForm';
import MateriaDetail from './MateriaDetail';
import EquivalenciaForm from './EquivalenciaForm';
import { Button, Card, CardBody, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalHeader, Pagination, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { Eye, Pencil, Plus, SearchIcon, Trash2, LibraryBig } from 'lucide-react';
import CorrelativaForm from './CorrelativaForm';

const MateriaList = () => {
  const [materias, setMaterias] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [modalMode, setModalMode] = useState(null); 
  const [selected, setSelected] = useState(null);

  const load = useCallback(async (isMounted = true) => {
    setLoading(true);
    try {
      const res = await api.get('/materia', {
        params: { buscar: searchTerm, page: page, limit: 10 }
      });
      if (isMounted) {
        setMaterias(res.data.materias);
        setTotalPages(res.data.pages);
      }
    } catch (error) {
      console.error("Error cargando materias:", error);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    let isMounted = true;
    load(isMounted);
    return () => { isMounted = false; };
  }, [load]);

  const handleOpenModal = (mode, item = null) => {
    setSelected(item);
    setModalMode(mode);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelected(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta materia?')) {
      try {
        await api.delete(`/materia/${id}`);
        load();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div>
      <Card className="p-6 mt-8">
        <CardHeader className='flex flex-row justify-between items-center'>
          <div className="flex gap-3 items-center">
            <LibraryBig className="text-blue-600" size={30} />
            <div className="flex flex-col">
              <p className="text-xl font-bold text-slate-800">Gestión de Materias</p>
              <p className="text-small text-default-500">Administración de currícula</p>
            </div>
          </div>

          <div className='flex gap-4 items-center'>
            {loading && <Spinner variant="dots" size="sm" color="primary" />}
            
            <Input
              isClearable
              placeholder="Buscar materia..."
              startContent={<SearchIcon className="w-4 h-4 text-default-400" />}
              value={searchTerm}
              onClear={() => setSearchTerm("")}
              onValueChange={setSearchTerm}
              className="max-w-xs"
            />
            
            <Button 
              onPress={() => handleOpenModal('create')} 
              color='primary'
              className="shrink-0 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Añadir Materia
            </Button>
          </div>
        </CardHeader>

        <Divider orientation="horizontal" className="my-5" />

        <CardBody>
          {/* --- TABLA DE MATERIAS --- */}
          <Table aria-label="Tabla de Materias" className="shadow-none" removeWrapper>
            <TableHeader>
              <TableColumn className="bg-blue-50 text-slate-800">NOMBRE</TableColumn>
              <TableColumn className="bg-blue-50 text-slate-800">NIVEL</TableColumn>
              <TableColumn className="bg-blue-50 text-slate-800">INSTITUCIÓN</TableColumn>
              <TableColumn className="bg-blue-50 text-slate-800 text-center">ACCIONES</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No hay materias registradas."}>
              {materias.map((m) => (
                <TableRow key={m._id} className="border-b border-divider">
                  <TableCell className="py-4 font-medium">{m.nombre}</TableCell>
                  <TableCell>{m.nivel}</TableCell>
                  <TableCell>{m.institucion?.nombre || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button size="sm" color='default' variant="light" isIconOnly onPress={() => handleOpenModal('view', m)}><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" color="primary" variant="light" isIconOnly onPress={() => handleOpenModal('edit', m)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" color="danger" variant="light" isIconOnly onPress={() => handleDelete(m._id)}><Trash2 className="w-4 h-4" /></Button>
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
              onChange={setPage}
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
                    {modalMode === 'view' ? 'Información de la Materia' : 
                    modalMode === 'edit' ? 'Editar Materia' : 'Nueva Materia'}
                    <Divider orientation="horizontal" className="my-2 mt-4" />
                  </ModalHeader>
                  <ModalBody className="pb-4">
                    {modalMode === 'view' ? (
                      <MateriaDetail materia={selected} onBack={onClose} />
                    ) : (
                      <MateriaForm 
                        initialData={selected} 
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

      <Card className="p-6 mt-8">
        <EquivalenciaForm onSuccess={() => load()} />
      </Card>
      <Card className="p-6 mt-8">
        <CorrelativaForm onSuccess={() => load()} />
      </Card>
    </div>
  );
};

export default MateriaList;