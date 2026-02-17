import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Card, CardHeader, Divider } from "@heroui/react";
import { GraduationCap } from "lucide-react";

// Datos de ejemplo vinculados por el ID (Legajo) del estudiante EST-001
const MOCK_TRAYECTORIAS = {
  "EST-001": [
    { id: 1, materia: "Análisis Matemático I", calificacion: 9, institucion: "Facultad de Ingeniería" },
    { id: 2, materia: "Álgebra Lineal", calificacion: 8, institucion: "Facultad de Ingeniería" }
  ],
  "ABC-456": [
    { id: 3, materia: "Base de Datos I", calificacion: 10, institucion: "Instituto Tecnológico" }
  ]
};

const TrayectoriaTable = ({ studentId }) => {
  // Obtenemos los datos si existe el ID, sino array vacío
  const data = studentId ? (MOCK_TRAYECTORIAS[studentId] || []) : [];

  return (
    <Card className="p-6 mt-6">
      <CardHeader className="flex gap-3 items-center">
        <GraduationCap className="text-blue-600" size={30} />
        <div className="flex flex-col">
          <p className="text-lg font-bold text-slate-800">Trayectorias Académicas</p>
          {studentId && <p className="text-small text-default-500">Legajo seleccionado: {studentId}</p>}
        </div>
      </CardHeader>

      <Divider className="my-3" />
      
      <Table 
        aria-label="Tabla de trayectorias" 
        removeWrapper
        color="default"
      >
        <TableHeader>
          <TableColumn className="bg-blue-50 text-slate-800">MATERIA</TableColumn>
          <TableColumn className="bg-blue-50 text-slate-800">CALIFICACIÓN</TableColumn>
          <TableColumn className="bg-blue-50 text-slate-800">INSTITUCIÓN</TableColumn>
        </TableHeader>
        <TableBody 
          emptyContent={studentId ? "Este estudiante no tiene trayectorias registradas." : "Seleccione estudiante para visualizar sus trayectorias"}
        >
          {data.map((item) => (
            <TableRow key={item.id} className="border-b border-divider bg-white">
              <TableCell className="font-medium py-4">{item.materia}</TableCell>
              <TableCell>{item.calificacion}</TableCell>
              <TableCell>{item.institucion}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TrayectoriaTable;