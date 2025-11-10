import React from 'react'

export default function ListaItems({ rows, partidaNro, onClose }) {
  if (!rows || rows.length === 0) {
    return null
  }

  return (
    <div className="card mt-3 border-primary">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Items de la Partida {partidaNro}</h5>
        <button 
          type="button" 
          className="btn-close btn-close-white" 
          onClick={onClose}
          aria-label="Cerrar"
        ></button>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Artículo</th>
                <th>Código</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Comprobante</th>
                <th>Fecha</th>
                <th>Cliente/Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row['DES_ARTICU'] || '-'}</td>
                  <td>{row['COD_ARTICU'] || '-'}</td>
                  <td className="text-end">{Number(row['CANTIDAD'] || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="text-end">${Number(row['PRECIO'] || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>{row['TIPO_COMP'] || '-'} {row['NUM_COMP'] || ''}</td>
                  <td>
                    {row['DIA'] && row['MES'] && row['ANIO'] 
                      ? `${String(row['DIA']).padStart(2, '0')}/${String(row['MES']).padStart(2, '0')}/${row['ANIO']}`
                      : '-'
                    }
                  </td>
                  <td>{row['NOM_CLIENT'] || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-muted">
          <small>Total de items: <strong>{rows.length}</strong></small>
        </div>
      </div>
    </div>
  )
}
