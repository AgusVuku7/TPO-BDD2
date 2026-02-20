import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Card, CardHeader, CardBody, Divider, Button, 
  Chip, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@heroui/react";
import { Activity, RefreshCcw, Database, Info } from "lucide-react";
import api from '../../services/api';

const AuditoriaPanel = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [selectedEvento, setSelectedEvento] = useState(null);

  const fetchAuditoria = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/analitica/auditoria/eventos?limit=100');
      setEventos(res.data);
    } catch (error) {
      console.error("Error cargando auditoría:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditoria();
  }, [fetchAuditoria]);

  const pages = Math.ceil(eventos.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return eventos.slice(start, end);
  }, [page, eventos]);

  const getActionColor = (accion) => {
    if (accion.includes("CREAR") || accion.includes("AGREGAR") || accion.includes("INGRESAR")) return "success";
    if (accion.includes("ELIMINAR")) return "danger";
    return "warning";
  };

  const handleRowClick = (evento) => {
    setSelectedEvento(evento);
    onOpen();
  };

  const formatearClave = (clave) => {
    const conEspacios = clave.replace(/([A-Z])/g, ' $1').trim();
    return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1);
  };

  const renderDetallesHumanos = (detalles) => {
    if (!detalles || Object.keys(detalles).length === 0) {
      return <p className="text-sm text-slate-500 italic">No hay información adicional registrada para esta acción.</p>;
    }

    const dataParaMostrar = detalles.datos ? detalles.datos : detalles;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {Object.entries(dataParaMostrar).map(([clave, valor]) => {
          if (clave === '_id' || clave === '__v') return null;
          return (
            <div key={clave} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {formatearClave(clave)}
              </span>
              <span className="text-sm font-semibold text-slate-800 break-words">
                {typeof valor === 'object' && valor !== null ? JSON.stringify(valor) : String(valor)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Database className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Historial de Sistema (Auditoría)</h1>
            <p className="text-small text-default-500">Registro inmutable de movimientos</p>
          </div>
        </div>
        <Button variant="flat" onPress={fetchAuditoria} isLoading={loading} startContent={<RefreshCcw size={16}/>}>
          Actualizar
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex gap-3 items-center p-5">
          <Activity className="text-purple-600" size={24} />
          <h3 className="text-lg font-bold text-slate-800">Últimos movimientos</h3>
        </CardHeader>
        <Divider />
        <CardBody className="p-4">
          <Table 
            removeWrapper 
            aria-label="Tabla de Auditoría"
            selectionMode="single"
            onRowAction={(key) => {
              const ev = eventos.find(e => e.id === key);
              if (ev) handleRowClick(ev);
            }}
          >
            <TableHeader>
              <TableColumn>FECHA Y HORA</TableColumn>
              <TableColumn>ACCIÓN REALIZADA</TableColumn>
            </TableHeader>
            <TableBody items={items} emptyContent={loading ? <Spinner /> : "No hay eventos registrados este mes."}>
              {(ev) => (
                <TableRow key={ev.id} className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <TableCell className="whitespace-nowrap text-slate-600 font-medium">
                    {new Date(ev.fecha).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color={getActionColor(ev.accion)} variant="flat" className="font-bold tracking-wide">
                      {ev.accion.replace(/_/g, ' ')} 
                    </Chip>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {pages > 0 && (
            <div className="flex w-full justify-center mt-6 mb-2">
              <Pagination
                isCompact
                showControls
                color="secondary"
                page={page}
                total={pages}
                onChange={setPage}
              />
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-bold text-slate-800">
                Detalles del Movimiento
              </ModalHeader>
              <Divider />
              <ModalBody className="py-6">
                {selectedEvento && (
                  <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-1">Fecha y Hora</p>
                          <p className="font-medium text-slate-700">{new Date(selectedEvento.fecha).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-1">Acción</p>
                          <Chip size="sm" color={getActionColor(selectedEvento.accion)} variant="flat" className="font-bold">
                              {selectedEvento.accion.replace(/_/g, ' ')}
                          </Chip>
                        </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {/* CAMBIO AQUÍ: text-purple-500 en lugar de text-blue-500 */}
                        <Info size={16} className="text-purple-500" />
                        <h4 className="text-sm font-bold text-slate-800">Entidad Afectada</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* CAMBIO AQUÍ: color="secondary" (violeta) en lugar de "primary" (azul) */}
                        <Chip size="sm" color="secondary" variant="dot" className="font-bold">
                          {selectedEvento.tipoEntidad}
                        </Chip>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          ID: {selectedEvento.entidadId}
                        </span>
                      </div>
                    </div>

                    <Divider className="my-1"/>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Información Registrada</h4>
                      {renderDetallesHumanos(selectedEvento.detalles)}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                {/* CAMBIO AQUÍ: color="secondary" en lugar de "primary" */}
                <Button color="secondary" variant="solid" onPress={onClose} className="font-medium w-full">
                  Entendido
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AuditoriaPanel;