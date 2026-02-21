import { useState, useEffect } from 'react';
import { Button, Select, SelectItem, addToast, Divider } from '@heroui/react';
import api from '../../services/api';
import { Link, LibraryBig, BookOpenCheck, ChartNetwork, ChevronRight } from 'lucide-react';

const CorrelativaForm = ({ onSuccess }) => {
    const [instituciones, setInstituciones] = useState([]);
    
    // Estados para la Materia Base
    const [materiasBase, setMateriasBase] = useState([]);
    const [instBase, setInstBase] = useState("");
    const [matBase, setMatBase] = useState("");

    // Estados para la Materia Correlativa (Requisito)
    const [materiasCorrelativa, setMateriasCorrelativa] = useState([]);
    const [instCorrelativa, setInstCorrelativa] = useState("");
    const [matCorrelativa, setMatCorrelativa] = useState("");

    const [loading, setLoading] = useState(false);

    // Cargar instituciones al inicio
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

    // Función genérica para cargar materias por institución
    const fetchMaterias = async (idInst, setMateriaState) => {
        if (!idInst) return;
        try {
            const res = await api.get(`/materia?institucionId=${idInst}`);
            setMateriaState(res.data.materias || []);
        } catch (error) {
            console.error("Error cargando materias:", error);
        }
    };

    const handleSubmit = async () => {
        if (!matBase || !matCorrelativa) {
            addToast({ title: "Atención", description: "Selecciona ambas materias", color: "warning" });
            return;
        }

        if (matBase === matCorrelativa) {
            addToast({ title: "Error", description: "Una materia no puede ser correlativa de sí misma", color: "danger" });
            return;
        }

        setLoading(true);
        try {
            // Utilizamos la ruta existente: POST /api/materia/:id/correlativas
            await api.post(`/materia/${matBase}/correlativas`, { 
                idCorrelativa: matCorrelativa 
            });
            
            addToast({
                title: "Vínculo Exitoso",
                description: "Correlatividad registrada correctamente.",
                color: "primary"
            });

            // Limpiar selección de materias
            setMatBase("");
            setMatCorrelativa("");
            
            if (onSuccess) onSuccess();
        } catch (error) {
            addToast({
                title: "Error de Vinculación",
                description: error.response?.data?.error || "No se pudo registrar la correlatividad",
                color: "danger"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6 gap-4 mt-2">
            <div className="flex gap-3 items-center">
                <ChartNetwork className="text-blue-600" size={30} />
                <h2 className="text-xl font-bold text-slate-800">Vincular Correlatividad</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {/* MATERIA BASE */}
                <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-600 flex items-center gap-2">
                        <ChevronRight size={18} /> Materia Objetivo
                    </p>
                    <Select 
                        label="Institución" 
                        placeholder="Seleccionar..." 
                        selectedKeys={instBase ? [instBase] : []}
                        onChange={(e) => {
                            const val = e.target.value;
                            setInstBase(val);
                            setMatBase("");
                            fetchMaterias(val, setMateriasBase);
                        }}
                    >
                        {instituciones.map((i) => (
                            <SelectItem key={i._id} value={i._id}>{i.nombre}</SelectItem>
                        ))}
                    </Select>

                    <Select 
                        label="Materia" 
                        placeholder="Materia que requiere el requisito" 
                        isDisabled={!instBase}
                        selectedKeys={matBase ? [matBase] : []}
                        onChange={(e) => setMatBase(e.target.value)}
                    >
                        {materiasBase.map((m) => (
                            <SelectItem key={m._id} value={m._id}>{m.nombre}</SelectItem>
                        ))}
                    </Select>
                </div>

                {/* MATERIA CORRELATIVA */}
                <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-600 flex items-center gap-2">
                        <ChevronRight size={18} /> Requisito Previo
                    </p>
                    <Select 
                        label="Institución" 
                        placeholder="Seleccionar..." 
                        selectedKeys={instCorrelativa ? [instCorrelativa] : []}
                        onChange={(e) => {
                            const val = e.target.value;
                            setInstCorrelativa(val);
                            setMatCorrelativa("");
                            fetchMaterias(val, setMateriasCorrelativa);
                        }}
                    >
                        {instituciones.map((i) => (
                            <SelectItem key={i._id} value={i._id}>{i.nombre}</SelectItem>
                        ))}
                    </Select>

                    <Select 
                        label="Materia Requisito" 
                        placeholder="Materia necesaria" 
                        isDisabled={!instCorrelativa}
                        selectedKeys={matCorrelativa ? [matCorrelativa] : []}
                        onChange={(e) => setMatCorrelativa(e.target.value)}
                    >
                        {materiasCorrelativa.map((m) => (
                            <SelectItem key={m._id} value={m._id}>{m.nombre}</SelectItem>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="flex justify-center">
                <Button 
                    color="primary" 
                    onPress={handleSubmit} 
                    isLoading={loading}
                    isDisabled={!matBase || !matCorrelativa}
                    className="w-full mt-5"
                >
                    Registrar Correlatividad
                </Button>
            </div>
        </div>
    );
};

export default CorrelativaForm;