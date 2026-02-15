import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import EstudianteForm from './EstudianteForm';
import EstudianteDetail from './EstudianteDetail';

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
    <div className="student-list-container">
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ padding: '8px', width: '300px' }}
          />
          {loading && <span>Cargando...</span>}
        </div>
        <button onClick={() => handleOpenModal('create')} className="btn-nuevo">+ Añadir Estudiante</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #3498db', textAlign: 'left' }}>
            <th>Nombre y Apellido</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px 0' }}>{s.nombre} {s.apellido}</td>
              <td style={{ display: 'flex', gap: '8px', padding: '10px 0' }}>
                {/* BOTÓN VER AÑADIDO */}
                <button 
                  onClick={() => handleOpenModal('view', s)}
                  style={{ backgroundColor: '#34495e', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Ver
                </button>
                <button onClick={() => handleOpenModal('edit', s)}>Editar</button>
                <button onClick={() => handleDelete(s._id)} style={{ color: 'red' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
        <span style={{ fontWeight: 'bold' }}>Página {page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
      </div>

      {/* MODAL DINÁMICO */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalMode === 'view' ? (
              <EstudianteDetail 
                student={selectedStudent} 
                onBack={handleCloseModal} 
              />
            ) : (
              <EstudianteForm 
                initialData={selectedStudent} 
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

export default EstudianteList;