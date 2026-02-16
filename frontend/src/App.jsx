import { useState } from 'react'
import { Tabs, Tab, Divider, Card, CardHeader, CardBody } from "@heroui/react";
import EstudianteList from './components/estudiante/EstudianteList'
import InstitucionList from './components/institucion/InstitucionList'
import MateriaList from './components/materia/MateriaList'
import { Divide } from 'lucide-react';

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
        </Tabs>
      </header>

      <Divider orientation="horizontal" className="mx-4" />

      <main className="max-w-6xl mx-auto px-4">
        {view === 'students' && (
          <EstudianteList />
        )}
        
        {view === 'institutions' && (
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-blue-500 inline-block">
              Gestión de Instituciones
            </h2>
            <InstitucionList />
          </section>
        )}

        {view === 'subjects' && (
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-blue-500 inline-block">
              Gestión de Materias
            </h2>
            <MateriaList />
          </section>
        )}
      </main>
      
      <footer className="footer">
        <p>TPO Persistencia Políglota - Sistemas de Calificación: UK, US, DE, AR</p>
      </footer>
    </div>
  )
}

export default App