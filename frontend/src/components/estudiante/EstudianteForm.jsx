import { useState } from 'react';
import api from '../../services/api';

const EstudianteForm = ({ initialData, onSuccess, onCancel }) => {
  const initialForm = { _id: '', nombre: '', apellido: '', documento: '', mail: '', pais: '' };
  const [estudiante, setEstudiante] = useState(initialData || initialForm);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Enviando...');
    try {
      if (initialData) {
        // MODO EDICIÓN
        await api.put(`/estudiante/${estudiante._id}`, estudiante);
      } else {
        // MODO CREACIÓN
        await api.post('/estudiante', estudiante);
      }
      onSuccess(); // Cierra el modal y refresca la lista
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al procesar la solicitud');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{initialData ? 'Editar Estudiante' : 'Registrar Nuevo Estudiante'}</h3>
      <input 
        type="text" 
        placeholder="Legajo" 
        value={estudiante._id} 
        disabled={!!initialData} // El Legajo no se edita
        onChange={e => setEstudiante({...estudiante, _id: e.target.value})} 
        required 
      />
      <input type="text" placeholder="Nombre" value={estudiante.nombre} onChange={e => setEstudiante({...estudiante, nombre: e.target.value})} required />
      <input type="text" placeholder="Apellido" value={estudiante.apellido} onChange={e => setEstudiante({...estudiante, apellido: e.target.value})} required />
      <input type="text" placeholder="Documento" value={estudiante.documento} onChange={e => setEstudiante({...estudiante, documento: e.target.value})} required />
      <input type="email" placeholder="Email" value={estudiante.mail} onChange={e => setEstudiante({...estudiante, mail: e.target.value})} required />
      <input type="text" placeholder="País" value={estudiante.pais} onChange={e => setEstudiante({...estudiante, pais: e.target.value})} required />
      
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="btn-cancelar">Cancelar</button>
        <button type="submit" style={{ marginLeft: '10px' }}>{initialData ? 'Actualizar' : 'Guardar'}</button>
      </div>
      <p>{mensaje}</p>
    </form>
  );
};

export default EstudianteForm;