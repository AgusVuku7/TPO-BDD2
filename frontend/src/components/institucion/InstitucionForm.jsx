import { useState } from 'react';
import api from '../../services/api';
import { Input, Button, Select, SelectItem } from '@heroui/react';
import { Trash2, Plus } from "lucide-react";

const InstitucionForm = ({ initialData, onSuccess, onCancel }) => {
  const initialForm = { nombre: '', pais: '', region: '', sistema_educativo: 'AR' };
  const [institucion, setInstitucion] = useState(initialData || initialForm);
  const [metadataFields, setMetadataFields] = useState(
    initialData?.metadata
      ? Object.entries(initialData.metadata).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      : []
  );
  const [mensaje, setMensaje] = useState('');

  const paises = [
    { label: "Argentina", value: "Argentina" },
    { label: "Reino Unido", value: "Reino Unido" },
    { label: "Estados Unidos", value: "Estados Unidos" },
    { label: "Alemania", value: "Alemania" },
    { label: "Sudáfrica", value: "Sudáfrica" }
  ];

  const sistemas = [
    { label: "AR", value: "AR" },
    { label: "UK", value: "UK" },
    { label: "US", value: "US" },
    { label: "DE", value: "DE" },
    { label: "ZA", value: "ZA" }
  ];

  // Funciones para manejar la metadata dinámica
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
    
    const finalMetadata = {};
    metadataFields.forEach(f => {
      if (f.key.trim()) finalMetadata[f.key.trim()] = f.value;
    });

    const payload = { ...institucion, metadata: finalMetadata };
    
    if (!initialData) delete payload._id;

    try {
      if (initialData) {
        await api.put(`/institucion/${institucion._id}`, payload);
      } else {
        await api.post('/institucion', payload);
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
          label="Nombre" 
          value={institucion.nombre} 
          onChange={e => setInstitucion({...institucion, nombre: e.target.value})} 
          isRequired
        />
        <Select 
          label="Sistema Educativo"
          selectedKeys={[institucion.sistema_educativo]}
          onChange={e => setInstitucion({...institucion, sistema_educativo: e.target.value})}
          isRequired
        >
          {sistemas.map((sistema) => (
            <SelectItem key={sistema.value} value={sistema.value}>
              {sistema.label}
            </SelectItem>
          ))}
        </Select>
        <Select 
          label="País"
          selectedKeys={[institucion.pais]}
          onChange={e => setInstitucion({...institucion, pais: e.target.value})}
          isRequired
        >
          {paises.map((pais) => (
            <SelectItem key={pais.value} value={pais.value}>
              {pais.label}
            </SelectItem>
          ))}
        </Select>
        <Input 
          label="Región" 
          value={institucion.region} 
          onChange={e => setInstitucion({...institucion, region: e.target.value})} 
          isRequired
        />
      </div>

      {/* --- SECCIÓN DE METADATA --- */}
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
              placeholder="Clave (ej: ranking)" 
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