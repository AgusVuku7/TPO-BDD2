import { Button, Divider } from '@heroui/react';

const InstitucionDetail = ({ institucion, onBack }) => {
  if (!institucion) return null;

  return (
    <div className="p-4">
      {/* Datos fijos */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase">Nombre</span>
          <span className="text-lg text-gray-800">{institucion.nombre}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase">Sistema Educativo</span>
          <span className="text-lg text-gray-900">{institucion.sistema_educativo}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase">País</span>
          <span className="text-lg text-gray-800">{institucion.pais}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase">Región</span>
          <span className="text-lg text-gray-900">{institucion.region}</span>
        </div>
      </div>

      <Divider className="my-4" />

      {/* Sección Dinámica: Metadata */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
        <h4 className="text-sm font-bold text-slate-600 mb-3 uppercase">
          Información Adicional
        </h4>
        
        {institucion.metadata && Object.keys(institucion.metadata).length > 0 ? (
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            {Object.entries(institucion.metadata).map(([clave, valor]) => (
              <div key={clave} className="flex flex-col border-b border-gray-200 pb-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  {clave.replace(/_/g, ' ')}
                </span>
                <span className="text-sm text-gray-700">
                  {typeof valor === 'object' ? JSON.stringify(valor) : String(valor)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No hay datos adicionales registrados.</p>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button color="danger" variant="flat" onPress={onBack}>Cerrar</Button>
      </div>
    </div>
  );
};

export default InstitucionDetail;