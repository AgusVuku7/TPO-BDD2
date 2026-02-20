import { useState } from 'react';
import api from '../../services/api';
import { Input, Button } from '@heroui/react';
import { Trash2, Plus } from "lucide-react";

const EstudianteForm = ({ initialData, onSuccess, onCancel }) => {
  const initialForm = { nombre: '', apellido: '', documento: '', mail: '', pais: '' };
  const [estudiante, setEstudiante] = useState(initialData || initialForm);
  const [metadataFields, setMetadataFields] = useState(
    initialData?.metadata
      ? Object.entries(initialData.metadata).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      : []
  );
  const [mensaje, setMensaje] = useState('');

  const addMetadataField = () => setMetadataFields([...metadataFields, { key: '', value: '' }]);
  
  const updateMetadataField = (index, field, newValue) => {
    const newFields = [...metadataFields];
    newFields[index][field] = newValue;
    setMetadataFields(newFields);
  };

  const removeMetadataField = (index) => {
    setMetadataFields(metadataFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reconstruimos el objeto metadata
    const finalMetadata = {};
    metadataFields.forEach(f => {
      if (f.key.trim()) finalMetadata[f.key.trim()] = f.value;
    });

    const payload = { ...estudiante, metadata: finalMetadata };
    if (!initialData) delete payload._id; // Dejamos que Mongo genere el ID

    try {
      if (initialData) {
        await api.put(`/estudiante/${estudiante._id}`, payload);
      } else {
        await api.post('/estudiante', payload);
      }
      onSuccess(); 
    } catch {
      setMensaje('❌ Error al procesar el estudiante');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Nombre" 
          value={estudiante.nombre} 
          onChange={e => setEstudiante({...estudiante, nombre: e.target.value})} 
          isRequired 
        />
        <Input 
          label="Apellido" 
          value={estudiante.apellido} 
          onChange={e => setEstudiante({...estudiante, apellido: e.target.value})} 
          isRequired 
        />
        <Input 
          label="Documento" 
          value={estudiante.documento} 
          onChange={e => setEstudiante({...estudiante, documento: e.target.value})} 
          isRequired 
        />
        <Input 
          label="País" 
          value={estudiante.pais} 
          onChange={e => setEstudiante({...estudiante, pais: e.target.value})} 
          isRequired 
        />
      </div>
      <Input 
          type="email" 
          label="Email" 
          value={estudiante.mail} 
          onChange={e => setEstudiante({...estudiante, mail: e.target.value})} 
          isRequired 
      />

      {/* Sección de Metadata Flexible */}
      <div className="mt-4 p-5 border border-neutral-300 rounded-xl bg-slate-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold text-slate-600 uppercase">Información Adicional</h4>
          <Button size="sm" color="primary" variant="flat" isIconOnly onPress={addMetadataField}>
            <Plus size={18} />
          </Button>
        </div>
        
        {metadataFields.map((field, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <Input 
              placeholder="Clave (ej: Carrera)" 
              size="sm" 
              value={field.key} 
              onChange={e => updateMetadataField(index, 'key', e.target.value)} 
            />
            <Input 
              placeholder="Valor"
              size="sm" 
              value={field.value} 
              onChange={e => updateMetadataField(index, 'value', e.target.value)} 
            />
            <Button size="sm" color="danger" variant="light" isIconOnly onPress={() => removeMetadataField(index)}>
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        {metadataFields.length === 0 && <p className="text-xs text-slate-400 italic">No hay campos extra añadidos.</p>}
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