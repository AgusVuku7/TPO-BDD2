import { Button, Divider } from '@heroui/react';

const EstudianteDetail = ({ student, onBack }) => {
  if (!student) return null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-6 p-2">
        {/* Fila 1 */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</span>
          <span className="text-lg text-slate-800">{student.nombre}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Apellido</span>
          <span className="text-lg text-slate-800">{student.apellido}</span>
        </div>

        {/* Fila 1 */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documento</span>
          <span className="text-lg text-slate-800">{student.documento}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">País</span>
          <span className="text-lg text-slate-800">{student.pais}</span>
        </div>

        {/* Fila 3 */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</span>
          <span className="text-lg text-slate-800">{student.mail}</span>
        </div>
      </div>

      <Divider className="my-4" />

      {/* Sección Dinámica: Metadata */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
        <h4 className="text-sm font-bold text-slate-600 mb-3 uppercase">
          Información Adicional
        </h4>
        
        {student.metadata && Object.keys(student.metadata).length > 0 ? (
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            {Object.entries(student.metadata).map(([clave, valor]) => (
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