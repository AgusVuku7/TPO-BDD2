import { useState, useRef } from 'react';
import { Card, CardBody, CardHeader, Button, Divider, Badge, Progress } from '@heroui/react';
import { FileJson, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const RuleImporter = () => {
  const [dragActive, setDragActive] = useState(false);
  const [fileData, setFileData] = useState(null); // Array de reglas parseadas
  const [status, setStatus] = useState({ loading: false, progress: 0, error: null, success: null });
  const fileInputRef = useRef(null);

  // Manejadores de Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Procesamiento del archivo JSON
  const processFile = (file) => {
    if (file.type !== "application/json") {
      setStatus({ ...status, error: "El archivo debe ser un JSON válido." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        // Validamos que sea un array de reglas
        const rulesArray = Array.isArray(json) ? json : [json];
        setFileData(rulesArray);
        setStatus({ ...status, error: null, success: `Se encontraron ${rulesArray.length} reglas.` });
      } catch {
        setStatus({ ...status, error: "Error al parsear el JSON. Verifica el formato." });
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!fileData) return;
    setStatus({ ...status, loading: true, progress: 0 });

    let count = 0;
    const total = fileData.length;

    try {
      for (const rule of fileData) {
        // Reutilizamos tu lógica de guardado en Redis (Append-only)
        await api.post('/conversion/regla', rule);
        count++;
        setStatus(prev => ({ ...prev, progress: Math.round((count / total) * 100) }));
      }
      setStatus({ loading: false, progress: 100, error: null, success: "¡Todas las reglas han sido publicadas en Redis!" });
      setFileData(null);
    } catch (err) {
      setStatus({ 
        loading: false, 
        progress: 0, 
        error: `Error en regla ${count + 1}: ${err.response?.data?.error || err.message}` 
      });
    }
  };

  return (
    <Card className="p-6 mt-8">
      <CardHeader className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <FileJson className="text-blue-600" size={30} />
          <div>
            <p className="text-xl font-bold text-slate-800">Importar</p>
            <p className="text-small text-default-500">Publicación de Nuevas Reglas</p>
          </div>
        </div>
      </CardHeader>
      
      <Divider className="my-4" />

      <CardBody className="gap-4">
        {/* Zona de Drop */}
        <div 
          className={`relative p-10 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-4
            ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}
            ${fileData ? "border-blue-400 bg-blue-50" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input ref={fileInputRef} type="file" className="hidden" accept=".json" onChange={(e) => processFile(e.target.files[0])} />
          
          <UploadCloud size={48} className={fileData ? "text-blue-500" : "text-gray-400"} />
          <div className="text-center">
            <p className="font-semibold text-gray-700">
              {fileData ? "Archivo cargado con éxito" : "Arrastra tu JSON aquí o haz clic para buscar"}
            </p>
            <p className="text-xs text-gray-500">Solo archivos .json</p>
          </div>
        </div>

        {/* Feedback de Estado */}
        {status.error && (
          <div className="flex items-center gap-2 text-danger text-sm bg-danger-50 p-3 rounded-lg">
            <AlertCircle size={16} /> {status.error}
          </div>
        )}

        {status.loading && (
          <div className="space-y-2">
            <p className="text-xs font-mono text-center">Procesando: {status.progress}%</p>
            <Progress value={status.progress} color="primary" className="h-2" />
          </div>
        )}

        <Button 
          color={fileData ? "primary" : "default"} 
          className="font-bold py-6"
          isDisabled={!fileData || status.loading}
          isLoading={status.loading}
          onPress={handleUpload}
          fullWidth
        >
          Iniciar Carga en Base de Datos
        </Button>
      </CardBody>
    </Card>
  );
};

export default RuleImporter;