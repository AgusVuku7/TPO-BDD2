import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import InstitucionForm from './InstitucionForm';
import InstitucionDetail from './InstitucionDetail';

const InstitucionList = () => {
  const [instituciones, setInstituciones] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [modalMode, setModalMode] = useState(null); // 'create', 'edit', 'view' o null
  const [selected, setSelected] = useState(null);

  const load = useCallback(async (isMounted = true) => {
    setLoading(true);
    try {
      const res = await api.get('/institucion', {
        params: { buscar: searchTerm, page: page, limit: 10 }
      });
      if (isMounted) {
        // Asumimos que el backend devuelve { instituciones, pages } similar a estudiantes
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
    if (window.confirm('¿Eliminar esta institución?')) {
      try {
        await api.delete(`/institucion/${id}`);
        load();
      } catch (error) {
        console.error("Error al eliminar institución:", error);
        alert("Error al eliminar");
      }
    }
  };

  return (
    <div className="institucion-list-container">
      {/* 1. Inicio: Buscador y Botón Nuevo */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar institución..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ padding: '8px', width: '300px' }}
          />
          {loading && <span style={{ fontSize: '0.8rem' }}>Cargando...</span>}
        </div>
        <button onClick={() => handleOpenModal('create')} className="btn-nuevo">+ Añadir Institución</button>
      </div>

      {/* 2. Tabla de Datos */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #3498db', textAlign: 'left' }}>
            <th>Nombre</th>
            <th>País</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {instituciones.map(inst => (
            <tr key={inst._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px 0' }}>{inst.nombre}</td>
              <td>{inst.pais}</td>
              <td style={{ display: 'flex', gap: '8px', padding: '10px 0' }}>
                <button 
                  onClick={() => handleOpenModal('view', inst)}
                  style={{ backgroundColor: '#34495e', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Ver
                </button>
                <button onClick={() => handleOpenModal('edit', inst)}>Editar</button>
                <button onClick={() => handleDelete(inst._id)} style={{ color: 'red' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 3. Paginación debajo */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
        <span style={{ fontWeight: 'bold' }}>Página {page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
      </div>

      {/* 4. Modales */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalMode === 'view' ? (
              <InstitucionDetail 
                institucion={selected} 
                onBack={handleCloseModal} 
              />
            ) : (
              <InstitucionForm 
                initialData={selected} 
                onSuccess={() => { handleCloseModal(); load(); }} 
                onCancel={handleCloseModal} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitucionList;