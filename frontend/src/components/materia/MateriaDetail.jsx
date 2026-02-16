import { Button } from '@heroui/react';

const MateriaDetail = ({ materia, onBack }) => {
  if (!materia) return null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-6 p-2">
        {/* Fila 1 */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Código</span>
          <span className="text-lg text-slate-800">{materia._id}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</span>
          <span className="text-lg text-slate-800">{materia.nombre}</span>
        </div>

        {/* Fila 2 */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nivel</span>
          <span className="text-lg text-slate-800">{materia.nivel}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institución</span>
          <span className="text-lg text-slate-800">{materia.institucion?.nombre || 'No asignada'}</span>
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

export default MateriaDetail;