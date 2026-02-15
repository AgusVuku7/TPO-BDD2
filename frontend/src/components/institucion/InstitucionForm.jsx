import { useState } from 'react';
import api from '../../services/api';

const InstitucionForm = ({ initialData, onSuccess, onCancel }) => {
  const initialForm = { _id: '', nombre: '', pais: '', region: '', sistema_educativo: 'AR' };
  const [institucion, setInstitucion] = useState(initialData || initialForm);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Enviando...');
    try {
      if (initialData) {
        await api.put(`/institucion/${institucion._id}`, institucion);
      } else {
        await api.post('/institucion', institucion);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al procesar institución');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{initialData ? 'Editar Institución' : 'Registrar Nueva Institución'}</h3>
      <input 
        type="text" 
        placeholder="ID (ej: INST-AR-001)" 
        value={institucion._id} 
        disabled={!!initialData}
        onChange={e => setInstitucion({...institucion, _id: e.target.value})} 
        required 
      />
      <input type="text" placeholder="Nombre" value={institucion.nombre} onChange={e => setInstitucion({...institucion, nombre: e.target.value})} required />
      <input type="text" placeholder="País" value={institucion.pais} onChange={e => setInstitucion({...institucion, pais: e.target.value})} required />
      <input type="text" placeholder="Región" value={institucion.region} onChange={e => setInstitucion({...institucion, region: e.target.value})} />
      
      <label style={{ display: 'block', marginBottom: '5px' }}>Sistema Educativo:</label>
      <select 
        value={institucion.sistema_educativo} 
        onChange={e => setInstitucion({...institucion, sistema_educativo: e.target.value})}
      >
        <option value="AR">Argentina</option>
        <option value="UK">Reino Unido</option>
        <option value="US">Estados Unidos</option>
        <option value="DE">Alemania</option>
      </select>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" onClick={onCancel} className="btn-cancelar">Cancelar</button>
        <button type="submit">Guardar</button>
      </div>
      <p>{mensaje}</p>
    </form>
  );
};

export default InstitucionForm;