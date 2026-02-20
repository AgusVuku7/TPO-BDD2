import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Input, Button, Select, SelectItem } from '@heroui/react';
import { Plus, Trash2 } from 'lucide-react';

const MateriaForm = ({ initialData, onSuccess, onCancel }) => {

  const [materia, setMateria] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        institucion: initialData.institucion?._id || initialData.institucion
      };
    }
    return { nombre: '', nivel: '', institucion: '' };
  });

  const [metadataFields, setMetadataFields] = useState(
    initialData?.metadata
      ? Object.entries(initialData.metadata).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      : []
  );

  const [instituciones, setInstituciones] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        const res = await api.get('/institucion');
        setInstituciones(res.data.instituciones || []);
      } catch (error) { console.error(error); }
    };
    fetchInstituciones();
  }, []);

  const addMetadataField = () => setMetadataFields([...metadataFields, { key: '', value: '' }]);
  const removeMetadataField = (index) => setMetadataFields(metadataFields.filter((_, i) => i !== index));
  const updateMetadataField = (index, field, val) => {
    const newFields = [...metadataFields];
    newFields[index][field] = val;
    setMetadataFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalMetadata = {};
    metadataFields.forEach(f => { if (f.key.trim()) finalMetadata[f.key.trim()] = f.value; });

    const payload = { ...materia, metadata: finalMetadata };
    if (!initialData) delete payload._id;

    try {
      if (initialData) {
        await api.put(`/materia/${materia._id}`, payload);
      } else {
        await api.post('/materia', payload);
      }
      onSuccess();
    } catch {
      setMensaje('❌ Error al procesar la materia');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Nombre" 
          value={materia.nombre} 
          onChange={e => setMateria({...materia, nombre: e.target.value})} 
          isRequired 
        />
        <Input 
          label="Nivel" 
          value={materia.nivel} 
          onChange={e => setMateria({...materia, nivel: e.target.value})} 
          isRequired 
        />
      </div>
      <Select 
        label="Institución"
        placeholder="Seleccione una institución"
        selectedKeys={materia.institucion ? [materia.institucion] : []}
        onChange={e => setMateria({...materia, institucion: e.target.value})}
        isRequired
      >
        {instituciones.map((inst) => (
          <SelectItem key={inst._id} value={inst._id}>
            {inst.nombre}
          </SelectItem>
        ))}
      </Select>

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
              placeholder="Clave (ej: horas, régimen)" 
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

export default MateriaForm;