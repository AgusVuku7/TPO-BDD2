import { Button } from '@heroui/react';

const EstudianteDetail = ({ student, onBack }) => {
  if (!student) return null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-6 p-2">
        {/* Fila 1 */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Legajo</span>
          <span className="text-lg text-slate-800">{student._id}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documento</span>
          <span className="text-lg text-slate-800">{student.documento}</span>
        </div>

        {/* Fila 2 */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</span>
          <span className="text-lg text-slate-800">{student.nombre}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Apellido</span>
          <span className="text-lg text-slate-800">{student.apellido}</span>
        </div>

        {/* Fila 3 */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</span>
          <span className="text-lg text-slate-800">{student.mail}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">País</span>
          <span className="text-lg text-slate-800">{student.pais}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        {/* Botón de cerrar en color danger solicitado */}
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

export default EstudianteDetail;