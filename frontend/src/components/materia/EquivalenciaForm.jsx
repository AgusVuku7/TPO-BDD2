import { useState, useEffect } from 'react';
import { Button, Select, SelectItem, Input, Card, CardBody } from '@heroui/react';
import api from '../../services/api';

const EquivalenciaForm = ({ onSuccess }) => {
    const [materias, setMaterias] = useState([]);
    const [origen, setOrigen] = useState("");
    const [destino, setDestino] = useState("");
    const [porcentaje, setPorcentaje] = useState(100); // Estado para el porcentaje
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Cargar materias para los selects
        api.get('/materia').then(res => {
            setMaterias(res.data.materias || res.data || []);
        }).catch(console.error);
    }, []);

    const handleSubmit = async () => {
        if (!origen || !destino) return;
        setLoading(true);
        try {
            await api.post('/materia/equivalencia', { 
                idOrigen: origen, 
                idDestino: destino,
                porcentaje: porcentaje // Enviamos el valor
            });
            
            alert(`✅ Equivalencia (del ${porcentaje}%) vinculada exitosamente`);
            
            // Reset del formulario
            setOrigen("");
            setDestino("");
            setPorcentaje(100);
            
            if (onSuccess) onSuccess();
        } catch (error) {
            alert("❌ Error: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-6 bg-slate-50 border border-slate-200">
            <CardBody className="gap-4">
                <h3 className="font-bold text-slate-700">🔗 Gestionar Equivalencias</h3>
                
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    {/* Select Origen */}
                    <Select 
                        label="Materia Origen" 
                        placeholder="Seleccionar..." 
                        selectedKeys={origen ? [origen] : []}
                        onChange={(e) => setOrigen(e.target.value)}
                        className="flex-1"
                    >
                        {materias.map((m) => (
                            <SelectItem key={m._id} value={m._id} textValue={m.nombre}>
                                {m.nombre} ({m.pais || m.institucion?.pais || 'N/A'})
                            </SelectItem>
                        ))}
                    </Select>

                    {/* Input de Porcentaje */}
                    <Input
                        type="number"
                        label="% Equiv."
                        placeholder="100"
                        min="1"
                        max="100"
                        value={porcentaje.toString()}
                        onValueChange={setPorcentaje}
                        className="w-24"
                    />

                    <span className="pb-4 text-2xl text-slate-400">➡️</span>

                    {/* Select Destino */}
                    <Select 
                        label="Materia Destino" 
                        placeholder="Seleccionar..." 
                        selectedKeys={destino ? [destino] : []}
                        onChange={(e) => setDestino(e.target.value)}
                        className="flex-1"
                    >
                        {materias.filter(m => m._id !== origen).map((m) => (
                            <SelectItem key={m._id} value={m._id} textValue={m.nombre}>
                                {m.nombre} ({m.pais || m.institucion?.pais || 'N/A'})
                            </SelectItem>
                        ))}
                    </Select>

                    <Button color="primary" onPress={handleSubmit} isLoading={loading} isDisabled={!origen || !destino}>
                        Vincular
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
};

export default EquivalenciaForm;