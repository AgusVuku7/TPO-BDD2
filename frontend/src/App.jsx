import { useState } from 'react'
import { Tabs, Tab, Divider } from "@heroui/react";
import EstudianteList from './components/estudiante/EstudianteList'
import InstitucionList from './components/institucion/InstitucionList'
import MateriaList from './components/materia/MateriaList'
import GradeConversion from './components/calificaciones/GradeConversion';

function App() {
  const [view, setView] = useState('students');

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
          <Tab key="conversion" title="Conversor" />
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
          <MateriaList />
        )}

        {view === 'conversion' && (
          <GradeConversion />
        )}
      </main>
      
      <footer className='mt-10 text-center text-sm text-slate-400'>
        <p>TPO Persistencia Políglota - Sistema Nacional de Calificaciones Multimodelo</p>
      </footer>
    </div>
  )
}

export default App