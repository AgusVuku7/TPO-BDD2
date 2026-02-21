import { useState, useEffect } from 'react';
import { Button, Select, SelectItem, Input, addToast } from '@heroui/react';
import api from '../../services/api';
import { ArrowLeftRight, ChevronsDown, LibraryBig } from 'lucide-react';

const EquivalenciaForm = ({ onSuccess }) => {
    const [instituciones, setInstituciones] = useState([]);
    
    // Separamos las materias en dos estados para Origen y Destino
    const [materiasOrigen, setMateriasOrigen] = useState([]);
    const [materiasDestino, setMateriasDestino] = useState([]);

    const [instOrigen, setInstOrigen] = useState("");
    const [matOrigen, setMatOrigen] = useState("");
    
    const [instDestino, setInstDestino] = useState("");
    const [matDestino, setMatDestino] = useState("");
    
    const [porcentaje, setPorcentaje] = useState(100);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInstituciones = async () => {
            try {
                const res = await api.get('/institucion');
                setInstituciones(res.data.instituciones || res.data || []);
            } catch (error) {
                console.error("Error cargando instituciones:", error);
            }
        };
        fetchInstituciones();
    }, []);

    // Función para buscar materias por institución usando el nuevo parámetro del backend
    const cargarMaterias = async (idInstitucion, tipo) => {
        if (!idInstitucion) return;
        try {
            // Usamos el institucionId que implementamos en el backend
            const res = await api.get(`/materia?institucionId=${idInstitucion}`);
            const data = res.data.materias || [];
            
            if (tipo === 'origen') {
                setMateriasOrigen(data);
            } else {
                setMateriasDestino(data);
            }
        } catch (error) {
            console.error("Error cargando materias:", error);
        }
    };

    const handleSubmit = async () => {
        if (!matOrigen || !matDestino) return;
        setLoading(true);
        try {
            await api.post('/materia/equivalencia', { 
                idOrigen: matOrigen, 
                idDestino: matDestino,
                porcentaje: Number(porcentaje) 
            });
            
            addToast({
                title: "Vínculo Exitoso",
                description: "La equivalencia se ha registrado correctamente.",
                color: "primary",
                variant: "flat"
            });
            
            // Resetear estados
            setInstOrigen(""); setMatOrigen(""); setMateriasOrigen([]);
            setInstDestino(""); setMatDestino(""); setMateriasDestino([]);
            setPorcentaje(100);
            
            if (onSuccess) onSuccess();
        } catch (error) {
            addToast({
                title: "Error de Vinculación",
                description: error.response?.data?.error || error.message,
                color: "danger"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6 gap-4 mt-2">
            <div className="flex gap-3 items-center">
                <ArrowLeftRight className="text-blue-600" size={30} />
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
                        const val = e.target.value;
                        setInstOrigen(val);
                        setMatOrigen(""); 
                        cargarMaterias(val, 'origen'); // Buscamos materias al seleccionar
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
                        const val = e.target.value;
                        setInstDestino(val);
                        setMatDestino("");
                        cargarMaterias(val, 'destino'); // Buscamos materias al seleccionar
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
                    className="w-full"
                >
                    Vincular Equivalencia
                </Button>
            </div>
        </div>
    );
};

export default EquivalenciaForm;