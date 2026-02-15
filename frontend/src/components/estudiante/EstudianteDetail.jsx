const EstudianteDetail = ({ student, onBack }) => {
  if (!student) return null;

  return (
    <div className="estudiante-detail">
      <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        Información del Estudiante
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div>
          <p><strong>Legajo:</strong></p>
          <p>{student._id}</p>
        </div>
        <div>
          <p><strong>Documento:</strong></p>
          <p>{student.documento}</p>
        </div>
        <div>
          <p><strong>Nombre:</strong></p>
          <p>{student.nombre}</p>
        </div>
        <div>
          <p><strong>Apellido:</strong></p>
          <p>{student.apellido}</p>
        </div>
        <div>
          <p><strong>Email:</strong></p>
          <p>{student.mail}</p>
        </div>
        <div>
          <p><strong>País:</strong></p>
          <p>{student.pais}</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={onBack} 
          className="btn-cancelar"
          style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default EstudianteDetail;