import React, { useRef } from 'react'

export default function Liquidacion({ proveedor = '', fecha = '', items = [] }) {
  const ventaTotalSum = items.reduce((s, it) => s + (Number(it.ventaTotal) || 0), 0)
  const costoTotalSum = items.reduce((s, it) => s + ((Number(it.cantidadTotal) || 0) * (Number(it.costo) || 0)), 0)
  const comision = ventaTotalSum - costoTotalSum
  const contentRef = useRef(null)

  const handlePrint = () => {
    try {
      const content = contentRef.current ? contentRef.current.innerHTML : ''
      const win = window.open('', '_blank')
      if (!win) {
        alert('No se pudo abrir la ventana de impresión. Revisa el bloqueador de ventanas emergentes.')
        return
      }
      win.document.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Liquidación</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css">
            <style>
              body { padding: 20px; font-family: Arial, Helvetica, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .totales { margin-top: 20px; padding-top: 20px; border-top: 2px solid #dee2e6; }
              @media print {
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `)
      win.document.close()
    } catch (err) {
      console.error('Error al imprimir:', err)
      alert('Error al preparar la impresión. Revisa la consola para más detalles.')
    }
  }

  return (
    <div >
      <div  className="d-flex justify-content-end align-items-end mb-3">
        <button className="btn btn-sm btn-outline-primary no-print" onClick={handlePrint}>
          Imprimir Liquidación
        </button>
      </div>
      <span ref={contentRef}>
      <h3>Liquidación</h3>
      <div className="mb-3">
        <strong>Proveedor:</strong> {proveedor || '-'} &nbsp; | &nbsp; 
        <strong>Fecha:</strong> {fecha || '-'}
      </div>

      <div className="table-responsive">
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Descripción</th>
              <th className="text-end">Cantidad Total</th>
              <th className="text-end">Precio Liquidado</th>
              <th className="text-end">Venta Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.descripcion}>
                <td>{it.descripcion}</td>
                <td className="text-end">{(Number(it.entradaTotal) || 0).toFixed(2)}</td>
                <td className="text-end">{(Number(it.precioLiquidado) || 0).toFixed(2)}</td>
                <td className="text-end">{(Number(it.ventaTotal) || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 totales">
        <div className="d-flex justify-content-between">
          <div><strong>Venta Total:</strong></div>
          <div>{ventaTotalSum.toFixed(2)}</div>
        </div>
        <div className="d-flex justify-content-between">
          <div><strong>Costo Total:</strong></div>
          <div>{costoTotalSum.toFixed(2)}</div>
        </div>
        <div className="d-flex justify-content-between">
          <div><strong>Comisión:</strong></div>
          <div>{comision.toFixed(2)}</div>
        </div>
      </div>
      </span>
    </div>
  )
}
