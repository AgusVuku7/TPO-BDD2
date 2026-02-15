import { useState, useEffect } from 'react';
import api from '../../services/api';

const MateriaForm = ({ initialData, onSuccess, onCancel }) => {
  const [materia, setMateria] = useState({ _id: '', nombre: '', nivel: '', institucion: '' });
  const [instituciones, setInstituciones] = useState([]);

  useEffect(() => {
    // Cargar instituciones para el select
    const fetchInstituciones = async () => {
      const res = await api.get('/institucion');
      setInstituciones(res.data.instituciones || []);
    };
    fetchInstituciones();

    if (initialData) {
      setMateria({
        ...initialData,
        institucion: initialData.institucion?._id || initialData.institucion
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData) {
        await api.put(`/materia/${materia._id}`, materia);
      } else {
        await api.post('/materia', materia);
      }
      onSuccess();
    } catch (error) {
      console.error("Error al guardar materia:", error);
      alert("Error al guardar materia");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{initialData ? 'Editar Materia' : 'Nueva Materia'}</h3>
      <input type="text" placeholder="Código (ej: MAT-01)" value={materia._id} disabled={!!initialData} onChange={e => setMateria({...materia, _id: e.target.value})} required />
      <input type="text" placeholder="Nombre" value={materia.nombre} onChange={e => setMateria({...materia, nombre: e.target.value})} required />
      <input type="text" placeholder="Nivel" value={materia.nivel} onChange={e => setMateria({...materia, nivel: e.target.value})} required />
      
      <label>Institución:</label>
      <select 
        value={materia.institucion} 
        onChange={e => setMateria({...materia, institucion: e.target.value})}
        required
      >
        <option value="">Seleccione una institución...</option>
        {instituciones.map(inst => (
          <option key={inst._id} value={inst._id}>{inst.nombre}</option>
        ))}
      </select>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" onClick={onCancel} className="btn-cancelar">Cancelar</button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  );
};

export default MateriaForm;