import { useState } from 'react'
import { Tabs, Tab, Divider } from "@heroui/react";
import EstudianteList from './components/estudiante/EstudianteList'
import InstitucionList from './components/institucion/InstitucionList'
import MateriaList from './components/materia/MateriaList'
import GradeConversion from './components/calificaciones/GradeConversion';
import RuleManager from './components/calificaciones/RuleManager';
import MateriaDetail from './components/materia/MateriaDetail'
import AnaliticaDashboard from './components/analitica/AnaliticaDashboard';
import ConversionMatrix from './components/calificaciones/ConversionMatrix';
import AuditoriaPanel from './components/analitica/AuditoriaPanel';

function App() {
  const [view, setView] = useState('students');
  // Estado para saber si estamos viendo el detalle de una materia
  const [selectedMateriaId, setSelectedMateriaId] = useState(null);
  const [refreshMatrix, setRefreshMatrix] = useState(0);

  // Función para volver a la lista
  const handleBackToList = () => {
    setSelectedMateriaId(null);
  };

  const handleRulesUploaded = () => {
    setRefreshMatrix(prev => prev + 1);
  };

  return (
    <div className="container max-w-6xl mx-auto">
      <header className="flex flex-row justify-between items-center py-4 px-10">
        {/* Título a la izquierda */}
        <h1 className="text-3xl font-bold text-slate-800">
          EduGrade Global
        </h1>

        {/* Tabs a la derecha */}
        <Tabs 
          aria-label="Opciones de navegación" 
          selectedKey={view} 
          onSelectionChange={setView}
          color="primary"
          variant="solid"
          radius="full"
          classNames={{ tabList: "gap-6", tab: "p-5" }}
        >
          <Tab key="students" title="Estudiantes" />
          <Tab key="institutions" title="Instituciones" />
          <Tab key="subjects" title="Materias" />
          <Tab key="analiticas" title="Analíticas" />
          <Tab key="administracion" title="Administración" />
        </Tabs>
      </header>

      <Divider orientation="horizontal" className="mx-4" />

      <main className="max-w-6xl mx-auto px-4">
        {view === 'students' && (
          <EstudianteList />
        )}
        
        {view === 'institutions' && (
          <InstitucionList />
        )}

        {view === 'subjects' && (
          <div>
            {!selectedMateriaId ? (
              <MateriaList onSelecMateria={(id) => setSelectedMateriaId(id)} />
            ) : (
              <MateriaDetail id={selectedMateriaId} onBack={handleBackToList} />
            )}
          </div>
        )}

        {view === 'analiticas' && (
          <div className="flex flex-col gap-4">
            <AnaliticaDashboard />
            <Divider className="my-6" />
            <AuditoriaPanel />
          </div>
        )}

        {view === 'administracion' && (
          <div>
            <GradeConversion />
            <ConversionMatrix refreshKey={refreshMatrix} />
            <RuleManager onUploadSuccess={handleRulesUploaded} />
          </div>
        )}
      </main>
      
      <footer className='my-10 text-center text-sm text-slate-400'>
        <p>TPO Persistencia Políglota - Sistema Nacional de Calificaciones Multimodelo</p>
      </footer>
    </div>
  )
}

export default App