import { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Divider, Badge } from '@heroui/react';
import { Plus, Trash, Save, Globe } from 'lucide-react';
import api from '../../services/api';

const RuleManager = () => {
  const [rule, setRule] = useState({
    origen: '',
    destino: '',
    version: '1.0',
    mapping: [{ min: '', max: '', result: '', label: '' }]
  });
  const [loading, setLoading] = useState(false);

  // Agregar una nueva fila al mapeo
  const addMapping = () => {
    setRule({
      ...rule,
      mapping: [...rule.mapping, { min: '', max: '', result: '', label: '' }]
    });
  };

  // Eliminar una fila específica
  const removeMapping = (index) => {
    const newMapping = rule.mapping.filter((_, i) => i !== index);
    setRule({ ...rule, mapping: newMapping });
  };

  // Actualizar campos específicos del mapeo
  const updateMapping = (index, field, value) => {
    const newMapping = [...rule.mapping];
    // Intentamos convertir a número si es posible para mantener la lógica del backend
    const val = isNaN(value) || value === '' ? value : parseFloat(value);
    newMapping[index][field] = val;
    setRule({ ...rule, mapping: newMapping });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Enviamos al endpoint POST que ya tienes en conversion.js
      const res = await api.post('/conversion/regla', rule);
      alert(`Éxito: ${res.data.mensaje}`);
      // Limpiar formulario tras éxito
      setRule({ origen: '', destino: '', version: '1.0', mapping: [{ min: '', max: '', result: '', label: '' }] });
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Error al guardar"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mt-8 border-t-4 border-t-green-500">
      <CardHeader className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Globe className="text-green-600" size={30} />
          <div>
            <p className="text-xl font-bold text-slate-800">Editor de Reglas</p>
            <p className="text-small text-default-500">Define nuevas lógicas de conversión Append-only</p>
          </div>
        </div>
        <Badge color="success" variant="flat">Admin Mode</Badge>
      </CardHeader>
      
      <Divider className="my-4" />

      <CardBody className="gap-6">
        {/* Cabecera de la Regla */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="País Origen (ISO)" placeholder="Ej: AR" value={rule.origen} 
            onChange={(e) => setRule({...rule, origen: e.target.value.toUpperCase()})} />
          <Input label="País Destino (ISO)" placeholder="Ej: US" value={rule.destino} 
            onChange={(e) => setRule({...rule, destino: e.target.value.toUpperCase()})} />
          <Input label="Versión" placeholder="1.0" value={rule.version} 
            onChange={(e) => setRule({...rule, version: e.target.value})} />
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-3 flex items-center gap-2">
            Configuración de Mapeos
            <Button size="sm" variant="flat" color="primary" isIconOnly onPress={addMapping}><Plus size={16}/></Button>
          </p>
          
          {rule.mapping.map((m, index) => (
            <div key={index} className="flex flex-wrap md:flex-nowrap gap-2 mb-3 items-center animate-appearance-in">
              <Input size="sm" placeholder="Min" className="w-20" value={m.min} onChange={(e) => updateMapping(index, 'min', e.target.value)} />
              <Input size="sm" placeholder="Max" className="w-20" value={m.max} onChange={(e) => updateMapping(index, 'max', e.target.value)} />
              <Input size="sm" placeholder="Resultado" className="w-24" value={m.result} onChange={(e) => updateMapping(index, 'result', e.target.value)} />
              <Input size="sm" placeholder="Etiqueta (Ej: Sobresaliente)" className="flex-1" value={m.label} onChange={(e) => updateMapping(index, 'label', e.target.value)} />
              <Button size="sm" isIconOnly color="danger" variant="light" onPress={() => removeMapping(index)}>
                <Trash size={16} />
              </Button>
            </div>
          ))}
        </div>

        <Button color="success" className="text-white font-bold w-full" onPress={handleSave} isLoading={loading} startContent={<Save size={20} />}>
          Publicar Regla en Redis (Append-only)
        </Button>
      </CardBody>
    </Card>
  );
};

export default RuleManager;