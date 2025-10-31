import React, { useRef } from 'react';
// genera el pdf de las partidas por rango
export default function GenerarPDF({ show, onHide, resumen }) {
  const contentRef = useRef();

  if (!show) {
    return null;
  }

  const handlePrint = () => {
    const element = contentRef.current;
    const opt = {
      margin:       1,
      filename:     'resumen-partidas.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 4 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };


  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg" style={{ maxWidth: '80%' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Resumen de Partidas</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body" ref={contentRef}>
            {resumen && Object.keys(resumen).map(partida => (
              <div key={partida} className="mb-2 fs-8">
                <h5>Partida: {partida}</h5>                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Artículo</th>
                      <th>Cantidad Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(resumen[partida]).map(articulo => (
                      <tr key={articulo} className='fs-8'>
                        <td className='col-4'>{articulo}</td>
                        <td className='col-4'>{resumen[partida][articulo].toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handlePrint}>Imprimir a PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
