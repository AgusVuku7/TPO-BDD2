import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Input, Button, Select, SelectItem } from '@heroui/react';

const MateriaForm = ({ initialData, onSuccess, onCancel }) => {

  const [materia, setMateria] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        institucion: initialData.institucion?._id || initialData.institucion
      };
    }
    return { _id: '', nombre: '', nivel: '', institucion: '' };
  });

  const [instituciones, setInstituciones] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        const res = await api.get('/institucion');
        setInstituciones(res.data.instituciones || []);
      } catch (error) {
        console.error("Error cargando instituciones:", error);
      }
    };
    fetchInstituciones();
  }, []);

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
      console.error(error);
      setMensaje('❌ Error al procesar la materia');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Código" 
          placeholder="Ej: MAT-01"
          value={materia._id} 
          disabled={!!initialData}
          onChange={e => setMateria({...materia, _id: e.target.value})} 
          required 
        />
        <Input 
          label="Nombre" 
          value={materia.nombre} 
          onChange={e => setMateria({...materia, nombre: e.target.value})} 
          required 
        />
        <Input 
          label="Nivel" 
          value={materia.nivel} 
          onChange={e => setMateria({...materia, nivel: e.target.value})} 
          required 
        />
        <Select 
          label="Institución"
          placeholder="Seleccione una institución"
          selectedKeys={materia.institucion ? [materia.institucion] : []}
          onChange={e => setMateria({...materia, institucion: e.target.value})}
          required
        >
          {instituciones.map((inst) => (
            <SelectItem key={inst._id} value={inst._id}>
              {inst.nombre}
            </SelectItem>
          ))}
        </Select>
      </div>
      
      <div className="flex justify-end gap-3 mt-4">
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

export default MateriaForm;