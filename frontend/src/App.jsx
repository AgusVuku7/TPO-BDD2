import { useState } from 'react'
import EstudianteForm from './components/estudiante/EstudianteForm'
import EstudianteList from './components/estudiante/EstudianteList'
import InstitucionList from './components/institucion/InstitucionList'
import InstitucionForm from './components/institucion/InstitucionForm'
import MateriaList from './components/materia/MateriaList'
import MateriaForm from './components/materia/MateriaForm'

function App() {
  const [view, setView] = useState('students');

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>EduGrade Global</h1>
        <nav>
          <button onClick={() => setView('students')} className={view === 'students' ? 'active' : ''}>Estudiantes</button>
          <button onClick={() => setView('institutions')} className={view === 'institutions' ? 'active' : ''}>Instituciones</button>
          <button onClick={() => setView('subjects')} className={view === 'subjects' ? 'active' : ''}>Materias</button>
        </nav>
      </header>

      <main className="content">
        {view === 'students' && (
          <section>
            <h2>Gestión de Estudiantes</h2>
            <EstudianteList />
          </section>
        )}
        
        {view === 'institutions' && (
          <section>
            <h2>Gestión de Instituciones</h2>
            <InstitucionList />
          </section>
        )}

        {view === 'subjects' && (
          <section>
            <h2>Gestión de Materias</h2>
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