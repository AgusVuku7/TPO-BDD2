const InstitucionDetail = ({ institucion, onBack }) => {
  if (!institucion) return null;

  return (
    <div className="institucion-detail">
      <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        Detalles de la Institución
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
        <div>
          <p><strong>ID/Código:</strong></p>
          <p>{institucion._id}</p>
        </div>
        <div>
          <p><strong>Nombre:</strong></p>
          <p>{institucion.nombre}</p>
        </div>
        <div>
          <p><strong>País:</strong></p>
          <p>{institucion.pais}</p>
        </div>
        <div>
          <p><strong>Región:</strong></p>
          <p>{institucion.region || 'N/A'}</p>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <p><strong>Sistema Educativo:</strong></p>
          <p>{institucion.sistema_educativo}</p>
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

export default InstitucionDetail;