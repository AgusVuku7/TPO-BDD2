const MateriaDetail = ({ materia, onBack }) => {
  if (!materia) return null;

  return (
    <div className="materia-detail">
      <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        Detalles de la Materia
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
        <p><strong>Código:</strong> {materia._id}</p>
        <p><strong>Nombre:</strong> {materia.nombre}</p>
        <p><strong>Nivel:</strong> {materia.nivel}</p>
        <p><strong>Institución:</strong> {materia.institucion?.nombre || 'No asignada'}</p>
      </div>
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onBack} className="btn-cancelar">Cerrar</button>
      </div>
    </div>
  );
};

export default MateriaDetail;