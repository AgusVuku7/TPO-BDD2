import { useState } from 'react';
import api from '../../services/api';
import { Input, Button, Select, SelectItem } from '@heroui/react';

const InstitucionForm = ({ initialData, onSuccess, onCancel }) => {
  const initialForm = { _id: '', nombre: '', pais: '', region: '', sistema_educativo: 'AR' };
  const [institucion, setInstitucion] = useState(initialData || initialForm);
  const [mensaje, setMensaje] = useState('');

  const sistemas = [
    { label: "Argentina", value: "AR" },
    { label: "Reino Unido", value: "UK" },
    { label: "Estados Unidos", value: "US" },
    { label: "Alemania", value: "DE" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData) {
        await api.put(`/institucion/${institucion._id}`, institucion);
      } else {
        await api.post('/institucion', institucion);
      }
      onSuccess(); 
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al procesar la institución');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="ID/Código" 
          placeholder="Ej: INST-AR-001"
          value={institucion._id} 
          disabled={!!initialData}
          onChange={e => setInstitucion({...institucion, _id: e.target.value})} 
          required 
        />
        <Input 
          label="Nombre" 
          value={institucion.nombre} 
          onChange={e => setInstitucion({...institucion, nombre: e.target.value})} 
          required 
        />
        <Input 
          label="País" 
          value={institucion.pais} 
          onChange={e => setInstitucion({...institucion, pais: e.target.value})} 
          required 
        />
        <Input 
          label="Región" 
          value={institucion.region} 
          onChange={e => setInstitucion({...institucion, region: e.target.value})} 
        />
        <Select 
          label="Sistema Educativo"
          className="col-span-1 md:col-span-2"
          selectedKeys={[institucion.sistema_educativo]}
          onChange={e => setInstitucion({...institucion, sistema_educativo: e.target.value})}
        >
          {sistemas.map((sistema) => (
            <SelectItem key={sistema.value} value={sistema.value}>
              {sistema.label}
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

export default InstitucionForm;