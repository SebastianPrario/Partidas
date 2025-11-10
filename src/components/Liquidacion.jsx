import React, { useRef } from 'react'
import { formatearImporte } from '../lib/helpers/formaterImporte';

export default function Liquidacion({ proveedor = '', fecha = '', items = [] }) {
  // Ajustamos las cantidades al entero menor más cercano (floor) y recalculamos ventas/costos
  console.log(items);
  const adjustedItems = (items || []).map(it => {
    const cantidadAjustada = Math.floor(Number(it.cantidadTotal || it.entradaTotal) || 0)
    const precio = Number(it.precioLiquidado) || 0
    const ventaAjustada = cantidadAjustada * precio
    const costoAjustado = it.costo 
    return { ...it, cantidadAjustada, ventaAjustada, costoAjustado }
  })

  const ventaTotalSum = adjustedItems.reduce((s, it) => s + (Number(it.ventaAjustada) || 0), 0)
  // El costo total se calcula usando las cantidades originales (con decimales) para preservar los decimales
  const costoTotalSum = (items || []).reduce((s, it) => s + ((Number(it.costo) || 0) ), 0)
  const comision = ventaTotalSum - costoTotalSum
  const contentRef = useRef(null)
  const porcentajeComision = ventaTotalSum > 0 ?  ((comision) / ventaTotalSum) *100: 0
  .toFixed(3)
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
              <th className="text-end">Costo Liquidado</th>
              <th className="text-end">Venta Total</th>
            </tr>
          </thead>
          <tbody>
            {adjustedItems.map((it) => (
              <tr key={it.descripcion}>
                <td>{it.descripcion}</td>
                <td className="text-end">{(Number(it.cantidadAjustada) || 0).toFixed(0)}</td>
                <td className="text-end">{(Number(it.precioLiquidado) || 0).toFixed(2)}</td>
                <td className="text-end">{(Number(it.costoAjustado) || 0).toFixed(2)}</td>
                <td className="text-end">{(Number(it.ventaAjustada) || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 totales">
        <div className="d-flex justify-content-between">
          <div><strong>Venta Total:</strong></div>
          <div>{formatearImporte(ventaTotalSum.toFixed(2))}</div>
        </div>
        <div className="d-flex justify-content-between">
          <div><strong>Costo Total:</strong></div>
          <div>{formatearImporte(costoTotalSum.toFixed(2))}</div>
        </div>
        <div className="d-flex justify-content-between">
          <div><strong>Costo Total Final (iva incluido):</strong></div>
          <div>{formatearImporte(costoTotalSum.toFixed(2)*1.105)}</div>
        </div>
        <div className="d-flex justify-content-between">
          <div><strong>Comisión:</strong></div>
          <div>{formatearImporte(comision.toFixed(2))}</div>
        </div>
         <div className="d-flex justify-content-between">
          <div><strong>Porcentaje:</strong></div>
          <div>{porcentajeComision.toFixed(3)}</div>
        </div>
         <div className="d-flex justify-content-between">
          <div><strong>Venta Ajustada:</strong></div>
          <div>{formatearImporte(((comision / porcentajeComision.toFixed(3))*100).toFixed(2))}</div>
        </div>
      </div>
      </span>
    </div>
  )
}
