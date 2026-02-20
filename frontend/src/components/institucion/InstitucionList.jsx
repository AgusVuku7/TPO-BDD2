import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import InstitucionForm from './InstitucionForm';
import InstitucionDetail from './InstitucionDetail';
import { Button, Card, CardBody, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalHeader, Pagination, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { Eye, Pencil, Plus, SearchIcon, Trash2, Building2 } from 'lucide-react';

const InstitucionList = () => {
  const [instituciones, setInstituciones] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [modalMode, setModalMode] = useState(null); 
  const [selected, setSelected] = useState(null);

  const load = useCallback(async (isMounted = true) => {
    setLoading(true);
    try {
      const res = await api.get('/institucion', {
        params: { buscar: searchTerm, page: page, limit: 10 }
      });
      if (isMounted) {
        setInstituciones(res.data.instituciones);
        setTotalPages(res.data.pages);
      }
    } catch (error) {
      console.error("Error cargando instituciones:", error);
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
    await api.delete(`/institucion/${id}`);
    load();
  };

  return (
    <Card className="p-6 mt-8">
      <CardHeader className='flex flex-row justify-between items-center'>
        <div className="flex gap-3 items-center">
          <Building2 className="text-blue-600" size={30} />
          <div className="flex flex-col">
            <p className="text-xl font-bold text-slate-800">Gestión de Instituciones</p>
            <p className="text-small text-default-500">ABM de instituciones</p>
          </div>
        </div>

        <div className='flex gap-4 items-center'>
          {loading && <Spinner variant="dots" size="sm" color="primary" />}
          
          <Input
            isClearable
            placeholder="Buscar institución..."
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
            Añadir Institución
          </Button>
        </div>
      </CardHeader>

      <Divider orientation="horizontal" className="my-5" />

      <CardBody>
        <Table aria-label="Tabla de Instituciones" className="shadow-none" removeWrapper>
          <TableHeader>
            <TableColumn className="bg-blue-50 text-slate-800">NOMBRE</TableColumn>
            <TableColumn className="bg-blue-50 text-slate-800">PAÍS</TableColumn>
            <TableColumn className="bg-blue-50 text-slate-800 text-center">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No hay instituciones registradas."}>
            {instituciones.map((inst) => (
              <TableRow key={inst._id} className="border-b border-divider">
                <TableCell className="py-4">{inst.nombre}</TableCell>
                <TableCell>{inst.pais}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" color='default' variant="light" isIconOnly onPress={() => handleOpenModal('view', inst)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" color="primary" variant="light" isIconOnly onPress={() => handleOpenModal('edit', inst)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" color="danger" variant="light" isIconOnly onPress={() => handleDelete(inst._id)}><Trash2 className="w-4 h-4" /></Button>
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
                  {modalMode === 'view' ? 'Detalles de la Institución' : 
                  modalMode === 'edit' ? 'Modificar Institución' : 'Nueva Institución'}
                  <Divider orientation="horizontal" className="my-2 mt-4" />
                </ModalHeader>
                <ModalBody className="pb-4">
                  {modalMode === 'view' ? (
                    <InstitucionDetail institucion={selected} onBack={onClose} />
                  ) : (
                    <InstitucionForm 
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
  );
};

export default InstitucionList;