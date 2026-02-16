import { useState } from 'react';
import api from '../../services/api';
import { Input, Button } from '@heroui/react'; // Importación de componentes HeroUI

const EstudianteForm = ({ initialData, onSuccess, onCancel }) => {
  const initialForm = { _id: '', nombre: '', apellido: '', documento: '', mail: '', pais: '' };
  const [estudiante, setEstudiante] = useState(initialData || initialForm);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData) {
        await api.put(`/estudiante/${estudiante._id}`, estudiante);
      } else {
        await api.post('/estudiante', estudiante);
      }
      onSuccess(); 
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al procesar la solicitud');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Legajo" 
          placeholder="Ej: EST-123"
          value={estudiante._id} 
          disabled={!!initialData}
          onChange={e => setEstudiante({...estudiante, _id: e.target.value})} 
          required 
        />
        <Input 
          label="Documento" 
          value={estudiante.documento} 
          onChange={e => setEstudiante({...estudiante, documento: e.target.value})} 
          required 
        />
        <Input 
          label="Nombre" 
          value={estudiante.nombre} 
          onChange={e => setEstudiante({...estudiante, nombre: e.target.value})} 
          required 
        />
        <Input 
          label="Apellido" 
          value={estudiante.apellido} 
          onChange={e => setEstudiante({...estudiante, apellido: e.target.value})} 
          required 
        />
        <Input 
          type="email" 
          label="Email" 
          value={estudiante.mail} 
          onChange={e => setEstudiante({...estudiante, mail: e.target.value})} 
          required 
        />
        <Input 
          label="País" 
          value={estudiante.pais} 
          onChange={e => setEstudiante({...estudiante, pais: e.target.value})} 
          required 
        />
      </div>
      
      <div className="flex justify-end gap-3 mt-4">
        {/* Botón de cerrar/cancelar en color danger */}
        <Button color="danger" variant="flat" onPress={onCancel}>
          Cancelar
        </Button>
        <Button color="primary" type="submit">
          {initialData ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
      {mensaje && <p className="text-center text-red-500 text-sm mt-2">{mensaje}</p>}
    </form>
  );
};

export default EstudianteForm;