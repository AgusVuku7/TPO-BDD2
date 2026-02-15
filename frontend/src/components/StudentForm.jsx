import { useState } from 'react';
import api from '../services/api';

const StudentForm = () => {
  const initialForm = { _id: '', nombre: '', apellido: '', documento: '', mail: '', pais: '' };

  const [student, setStudent] = useState(initialForm);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Enviando...');
    try {
      await api.post('/estudiante', student);
      setMensaje('✅ Estudiante registrado con éxito');
      setStudent(initialForm);
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al registrar estudiante');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <h3>Registrar Nuevo Estudiante</h3>
      <input type="text" placeholder="Legajo" value={student._id} onChange={e => setStudent({...student, _id: e.target.value})} />
      <input type="text" placeholder="Nombre" value={student.nombre} onChange={e => setStudent({...student, nombre: e.target.value})} />
      <input type="text" placeholder="Apellido" value={student.apellido} onChange={e => setStudent({...student, apellido: e.target.value})} />
      <input type="text" placeholder="Documento" value={student.documento} onChange={e => setStudent({...student, documento: e.target.value})} />
      <input type="email" placeholder="Email" value={student.mail} onChange={e => setStudent({...student, mail: e.target.value})} />
      <input type="text" placeholder="País" value={student.pais} onChange={e => setStudent({...student, pais: e.target.value})} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button type="submit">Guardar</button>
        <span style={{ marginLeft: '10px' }}>{mensaje}</span>
      </div>
    </form>
  );
};

export default StudentForm;