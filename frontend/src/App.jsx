import { useState } from 'react'
import StudentForm from './components/StudentForm'
// Importa aquí tus otros formularios cuando los crees:
// import InstitutionForm from './components/InstitutionForm'
// import SubjectForm from './components/SubjectForm'

function App() {
  const [view, setView] = useState('students')

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
            <StudentForm />
          </section>
        )}
        
        {view === 'institutions' && (
          <section>
            <h2>Gestión de Instituciones</h2>
            <p>Formulario de Instituciones (Próximamente)</p>
            {/* <InstitutionForm /> */}
          </section>
        )}

        {view === 'subjects' && (
          <section>
            <h2>Gestión de Materias</h2>
            <p>Formulario de Materias (Próximamente)</p>
            {/* <SubjectForm /> */}
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