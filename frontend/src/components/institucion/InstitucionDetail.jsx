import { Button } from '@heroui/react';

const InstitucionDetail = ({ institucion, onBack }) => {
  if (!institucion) return null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-6 p-2">
        {/* Fila 1 */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID/Código</span>
          <span className="text-lg text-slate-800">{institucion._id}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</span>
          <span className="text-lg text-slate-800">{institucion.nombre}</span>
        </div>

        {/* Fila 2 */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">País</span>
          <span className="text-lg text-slate-800">{institucion.pais}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Región</span>
          <span className="text-lg text-slate-800">{institucion.region || 'N/A'}</span>
        </div>

        {/* Fila 3 - Full Width */}
        <div className="flex flex-col col-span-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sistema Educativo</span>
          <span className="text-lg text-slate-800">{institucion.sistema_educativo}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          color="danger" 
          variant="flat" 
          onPress={onBack}
        >
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default InstitucionDetail;