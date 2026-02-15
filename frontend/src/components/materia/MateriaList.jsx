import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import MateriaForm from './MateriaForm';
import MateriaDetail from './MateriaDetail'; // Debes crearlo similar a EstudianteDetail

const MateriaList = () => {
  const [materias, setMaterias] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState(null); 
  const [selected, setSelected] = useState(null);

  const load = useCallback(async (active = true) => {
    try {
      const res = await api.get('/materia', { params: { buscar: searchTerm, page, limit: 10 } });
      if (active) {
        setMaterias(res.data.materias);
        setTotalPages(res.data.pages);
      }
    } catch (e) { console.error(e); }
  }, [page, searchTerm]);

  useEffect(() => {
    let active = true;
    load(active);
    return () => { active = false; };
  }, [load]);

  return (
    <div className="list-container">
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <input type="text" placeholder="Buscar materia..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        <button onClick={() => setModalMode('create')} className="btn-nuevo">+ Añadir Materia</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #3498db', textAlign: 'left' }}>
            <th>Nombre</th>
            <th>Nivel</th>
            <th>Institución</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {materias.map(m => (
            <tr key={m._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px 0' }}>{m.nombre}</td>
              <td>{m.nivel}</td>
              <td>{m.institucion?.nombre || 'N/A'}</td>
              <td style={{ display: 'flex', gap: '8px', padding: '10px 0' }}>
                <button onClick={() => { setSelected(m); setModalMode('view'); }}>Ver</button>
                <button onClick={() => { setSelected(m); setModalMode('edit'); }}>Editar</button>
                <button onClick={async () => { if(window.confirm('¿Eliminar?')) { await api.delete(`/materia/${m._id}`); load(); } }} style={{ color: 'red' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
        <span style={{ fontWeight: 'bold' }}>Página {page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
      </div>

      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalMode === 'view' ? (
              <MateriaDetail materia={selected} onBack={() => setModalMode(null)} />
            ) : (
              <MateriaForm initialData={selected} onSuccess={() => { setModalMode(null); load(); }} onCancel={() => setModalMode(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MateriaList;