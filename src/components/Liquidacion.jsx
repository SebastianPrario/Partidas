import React from 'react'

export default function Liquidacion({ proveedor = '', fecha = '', items = [] }) {
  const ventaTotalSum = items.reduce((s, it) => s + (Number(it.ventaTotal) || 0), 0)
  const costoTotalSum = items.reduce((s, it) => s + ((Number(it.entradaTotal) || 0) * (Number(it.costo) || 0)), 0)
  const comision = ventaTotalSum - costoTotalSum

  return (
    <div>
      <div className="mb-3">
        <strong>Proveedor:</strong> {proveedor || '-'} &nbsp; | &nbsp; <strong>Fecha:</strong> {fecha || '-'}
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

      <div className="mt-3">
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
    </div>
  )
}
