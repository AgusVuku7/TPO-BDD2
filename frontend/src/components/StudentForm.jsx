import { useState } from 'react';
import api from '../services/api';

const StudentForm = () => {
  const [student, setStudent] = useState({
    _id: '', nombre: '', apellido: '', documento: '', mail: '', pais: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('api/estudiante', student);
      alert(`Estudiante ${response.data.nombre} registrado con éxito`);
    } catch (error) {
      console.error(error);
      alert('Error al registrar estudiante');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <h3>Registrar Nuevo Estudiante</h3>
      <input type="text" placeholder="Legajo (EST-001)" className="block mb-2 border" 
        onChange={e => setStudent({...student, _id: e.target.value})} />
      <input type="text" placeholder="Nombre" className="block mb-2 border" 
        onChange={e => setStudent({...student, nombre: e.target.value})} />
      <input type="text" placeholder="Apellido" className="block mb-2 border" 
        onChange={e => setStudent({...student, apellido: e.target.value})} />
      <input type="text" placeholder="Documento" className="block mb-2 border" 
        onChange={e => setStudent({...student, documento: e.target.value})} />
      <input type="email" placeholder="Email" className="block mb-2 border" 
        onChange={e => setStudent({...student, mail: e.target.value})} />
      <input type="text" placeholder="País" className="block mb-2 border" 
        onChange={e => setStudent({...student, pais: e.target.value})} />
      <button type="submit" className="bg-blue-500 text-white p-2">Guardar Estudiante</button>
    </form>
  );
};

export default StudentForm;