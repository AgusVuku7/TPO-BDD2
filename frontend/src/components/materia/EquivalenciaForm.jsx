import { useState, useEffect } from 'react';
import { Button, Select, SelectItem, Input } from '@heroui/react';
import api from '../../services/api';
import { ChevronsDown, LibraryBig } from 'lucide-react';

const EquivalenciaForm = ({ onSuccess }) => {
    const [instituciones, setInstituciones] = useState([]);
    const [materias, setMaterias] = useState([]);

    // Usamos strings simples para el estado, igual que en tu InstitucionForm
    const [instOrigen, setInstOrigen] = useState("");
    const [matOrigen, setMatOrigen] = useState("");
    
    const [instDestino, setInstDestino] = useState("");
    const [matDestino, setMatDestino] = useState("");
    
    const [porcentaje, setPorcentaje] = useState(100);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resInst, resMat] = await Promise.all([
                    api.get('/institucion'),
                    api.get('/materia')
                ]);
                // Normalizamos los datos de la API
                setInstituciones(resInst.data.instituciones || resInst.data || []);
                setMaterias(resMat.data.materias || resMat.data || []);
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };
        fetchData();
    }, []);

    // Filtrado de materias basado en el ID de la institución seleccionada
    const materiasOrigen = materias.filter(m => {
        const instId = m.institucion?._id || m.institucion;
        return instId?.toString() === instOrigen;
    });

    const materiasDestino = materias.filter(m => {
        const instId = m.institucion?._id || m.institucion;
        return instId?.toString() === instDestino && m._id?.toString() !== matOrigen;
    });

    const handleSubmit = async () => {
        if (!matOrigen || !matDestino) return;
        setLoading(true);
        try {
            await api.post('/api/materia/equivalencia', { 
                idOrigen: matOrigen, 
                idDestino: matDestino,
                porcentaje: Number(porcentaje) 
            });
            
            alert(`✅ Equivalencia vinculada exitosamente`);
            
            setInstOrigen(""); setMatOrigen("");
            setInstDestino(""); setMatDestino("");
            setPorcentaje(100);
            
            if (onSuccess) onSuccess();
        } catch (error) {
            alert("❌ Error: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6 gap-4 mt-2">
            <div className="flex gap-3 items-center">
                <LibraryBig className="text-blue-600" size={30} />
                <div className="flex flex-col">
                    <p className="text-xl font-bold text-slate-800">Gestión de Equivalencias</p>
                    <p className="text-small text-default-500">Administración de materias equivalentes entre instituciones</p>
                </div>
            </div>
            
            {/* --- SECCIÓN ORIGEN --- */}
            <div className="flex flex-col md:flex-row gap-4 items-center mt-8 justify-center">
                <Select 
                    label="Institución Origen" 
                    placeholder="Seleccionar..." 
                    // Usamos el patrón de tu ejemplo funcional
                    selectedKeys={instOrigen ? [instOrigen] : []}
                    onChange={(e) => {
                        setInstOrigen(e.target.value);
                        setMatOrigen(""); // Limpiar materia si cambia institución
                    }}
                    className="max-w-md"
                    isRequired
                >
                    {instituciones.map((i) => (
                        <SelectItem key={i._id.toString()} value={i._id.toString()}>
                            {`${i.nombre} (${i.pais})`}
                        </SelectItem>
                    ))}
                </Select>

                <Select 
                    label="Materia Origen" 
                    placeholder="Seleccionar..." 
                    selectedKeys={matOrigen ? [matOrigen] : []}
                    onChange={(e) => setMatOrigen(e.target.value)}
                    className="max-w-md"
                    isDisabled={!instOrigen}
                    isRequired
                >
                    {materiasOrigen.map((m) => (
                        <SelectItem key={m._id.toString()} value={m._id.toString()}>
                            {m.nombre}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            
            <div className="flex items-center gap-2 mt-4 justify-center">
                <ChevronsDown size={24} className="text-default-500" />
                <Input
                    type="number"
                    label="Porcentaje"
                    min="1" max="100"
                    value={porcentaje.toString()}
                    onValueChange={setPorcentaje}
                    className='max-w-xs'
                />
                <ChevronsDown size={24} className="text-default-500" />
            </div>

            {/* --- SECCIÓN DESTINO --- */}
            <div className="flex flex-col md:flex-row gap-4 items-center mt-4 justify-center">
                <Select 
                    label="Institución Destino" 
                    placeholder="Seleccionar..." 
                    selectedKeys={instDestino ? [instDestino] : []}
                    onChange={(e) => {
                        setInstDestino(e.target.value);
                        setMatDestino("");
                    }}
                    className="max-w-md"
                    isRequired
                >
                    {instituciones.map((i) => (
                        <SelectItem key={i._id.toString()} value={i._id.toString()}>
                            {`${i.nombre} (${i.pais})`}
                        </SelectItem>
                    ))}
                </Select>

                <Select 
                    label="Materia Destino" 
                    placeholder="Seleccionar..." 
                    selectedKeys={matDestino ? [matDestino] : []}
                    onChange={(e) => setMatDestino(e.target.value)}
                    className="max-w-md"
                    isDisabled={!instDestino}
                    isRequired
                >
                    {materiasDestino.map((m) => (
                        <SelectItem key={m._id.toString()} value={m._id.toString()}>
                            {m.nombre}
                        </SelectItem>
                    ))}
                </Select>
            </div>

            <div className="mt-6 flex justify-center">
                <Button 
                    color="primary" 
                    onPress={handleSubmit} 
                    isLoading={loading} 
                    isDisabled={!matOrigen || !matDestino}
                    className="w-full max-w-4xl"
                >
                    Vincular Equivalencia
                </Button>
            </div>
        </div>
    );
};

export default EquivalenciaForm;