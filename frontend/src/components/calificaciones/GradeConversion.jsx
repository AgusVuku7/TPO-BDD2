import { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Select, SelectItem, Divider, Chip } from '@heroui/react';
import { Calculator, ArrowRightLeft, GraduationCap } from 'lucide-react';
import api from '../../services/api';

const GradeConversion = () => {
  const [formData, setFormData] = useState({ nota: '', origen: 'AR', destino: 'UK' });
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Opciones basadas en tus sistemas educativos configurados
  const sistemas = [
    { label: "Argentina (1-10)", value: "AR" },
    { label: "Reino Unido (A-F)", value: "UK" },
    { label: "Estados Unidos (0.0-4.0)", value: "US" },
    { label: "Alemania (1.0-5.0)", value: "DE" },
    { label: "Sudáfrica (Level 1-7)", value: "ZA" }
  ];

  const handleConvert = async () => {
    // Reset de estados
    setError(null);
    setResultado(null);

    // Validación básica en el cliente
    if (!formData.nota.trim()) {
      setError("Por favor, ingresa una calificación.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/conversion/convertir', {
        params: {
          origen: formData.origen,
          destino: formData.destino,
          nota: formData.nota
        }
      });
      setResultado(res.data);
    } catch (err) {
      // Capturamos el mensaje de error que viene del backend
      const errorMsg = err.response?.data?.error || "Error inesperado al convertir.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mt-8">
      <CardHeader className="flex gap-3 items-center">
        <Calculator className="text-blue-600" size={30} />
        <div className="flex flex-col">
          <p className="text-xl font-bold text-slate-800">Conversor Global</p>
          <p className="text-small text-default-500">Conversor Global de Calificaciones de distintos sistemas educativos</p>
        </div>
      </CardHeader>
      <Divider orientation="horizontal" className="my-5" />
      <CardBody className="gap-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Input de Nota */}
          <Input
            type="text"
            label="Nota Original"
            placeholder="Ej: 8.5 o A*"
            labelPlacement="outside"
            isInvalid={!!error}
            errorMessage={error}
            value={formData.nota}
            onChange={(e) => setFormData({...formData, nota: e.target.value})}
            startContent={<GraduationCap size={18} className="text-default-400" />}
          />

          {/* Selector Origen */}
          <Select 
            label="Sistema Origen" 
            labelPlacement="outside"
            selectedKeys={[formData.origen]}
            onSelectionChange={(keys) => setFormData({...formData, origen: Array.from(keys)[0]})}
          >
            {sistemas.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </Select>

          {/* Selector Destino */}
          <Select 
            label="Sistema Destino" 
            labelPlacement="outside"
            selectedKeys={[formData.destino]}
            onSelectionChange={(keys) => setFormData({...formData, destino: Array.from(keys)[0]})}
          >
            {sistemas.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </Select>
        </div>

        <Button 
          color="primary" 
          size="md" 
          className="w-full font-bold mt-6"
          onPress={handleConvert}
          isLoading={loading}
          endContent={<ArrowRightLeft size={20} />}
        >
          Convertir Calificación
        </Button>

        {/* Visualización del Resultado */}
        {resultado && (
          <div className="mt-6 p-6 bg-blue-50 rounded-xl border-2 border-blue-100 flex flex-col items-center gap-2 animate-appearance-in">
            <p className="text-slate-600 font-semibold uppercase text-xs tracking-widest">Resultado Convertido</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-blue-700">{resultado.resultado}</span>
              <span className="text-xl text-blue-400 font-medium">({resultado.label})</span>
            </div>
            <Chip size="sm" variant="flat" color="primary" className="mt-2">
              Versión: {resultado.metadata.version}
            </Chip>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default GradeConversion;