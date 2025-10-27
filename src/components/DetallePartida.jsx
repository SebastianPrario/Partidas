import React, { useState, useMemo, useRef } from 'react'

export default function DetallePartida({ rows = [] , partidaNro }) {
  // Estado para mantener los precios liquidados por DES_ARTICU
  const [preciosLiquidados, setPreciosLiquidados] = useState({})
  console.log('Rendering DetallePartida with rows:', rows)
  // Computar resumen agrupado por DES_ARTICU y filtrar por rango de cantidad
  // También acumulamos EntradaTotal (TIPO_COMP = ENT | AJT) y VentaTotal (excluye ENT/AJT)
  const resumen = useMemo(() => {
    const map = new Map()

    for (const row of rows) {
      const desc = row['DES_ARTICU'] || ''
      if (!desc) continue

      const cantidad = Number(String(row['CANTIDAD']).replace(',', '.')) || 0
      const precio = Number(String(row['PRECIO']).replace(',', '.')) || 0
      const tipo = (row['TIPO_COMP'] || '').toString().trim().toUpperCase()

      if (!map.has(desc)) {
        map.set(desc, {
          descripcion: desc,
          cantidadTotal: 0,
          entradaTotal: 0,
          ventaTotal: 0
        })
      }

      const item = map.get(desc)
      item.cantidadTotal += cantidad

      if (tipo === 'ENT' || tipo === 'AJT') {
        item.entradaTotal += cantidad
      } else {
        // VentaTotal: suma de cantidad * precio para movimientos que no son ENT/AJT
        item.ventaTotal += cantidad * precio
      }
    }

    // Filtramos los items cuya cantidad total esté entre -1 y 1 (inclusive)
    const filtered = Array.from(map.values())
      .filter(item => Math.abs(item.cantidadTotal) > 1)
      .sort((a, b) => a.descripcion.localeCompare(b.descripcion))

    return filtered
  }, [rows])

  const handlePrecioChange = (descripcion, precio) => {
    setPreciosLiquidados(prev => ({
      ...prev,
      [descripcion]: precio
    }))
  }

  if (!resumen.length) return null

  const tableRef = useRef(null)

  const handlePrint = () => {
    try {
      const content = tableRef.current ? tableRef.current.innerHTML : ''
      const win = window.open('', '_blank')
      if (!win) {
        alert('No se pudo abrir la ventana de impresión. Revisa el bloqueador de ventanas emergentes.')
        return
      }
      win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Detalle Partida</title>` +
        '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css">' +
        '<style>body{padding:20px;font-family:Arial,Helvetica,sans-serif} table{width:100%;border-collapse:collapse}</style>' +
        `</head><body>${content}<script>window.onload=function(){setTimeout(()=>{window.print();},200);};</script></body></html>`)
      win.document.close()
    } catch (err) {
      console.error('Error printing', err)
      alert('Error al preparar la impresión. Revisa la consola para más detalles.')
    }
  }

  return (
    <div id="detalle-partida" className="mt-4">
      

      <div className="table-responsive" ref={tableRef}>
        <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="m-0">{partidaNro ? `Detalle de Partida: ${partidaNro}` : 'Detalle por Artículo'}</h3>
        <button className="btn btn-sm btn-outline-primary" onClick={handlePrint}>Imprimir PDF</button>
        </div>
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Descripción Artículo</th>
              <th className="text-end">Cantidad Total</th>
              <th className="text-end">Entrada Total</th>
              {/* <th className="text-end">Entrada Valorizada</th>
              <th className="text-end">Venta Total</th> */}
              <th className="text-end">Precio Liquidado</th>
              <th className="text-end">Precio Promedio</th>
            </tr>
          </thead>
          <tbody>
            {resumen.map(({ descripcion, cantidadTotal, entradaTotal, ventaTotal }) => {
              const precioLiquidado = Number(preciosLiquidados[descripcion]) || 0
              const entradaValorizada = entradaTotal * precioLiquidado
              const ventaTotalVal = ventaTotal || 0
              // PrecioPromedio = (EntradaValorizada + VentaTotal) / CantidadTotal
              const precioPromedio = cantidadTotal !== 0 ? (entradaValorizada + ventaTotalVal) / cantidadTotal : 0

              return (
                <tr key={descripcion}>
                  <td>{descripcion}</td>
                  <td className="text-end">{cantidadTotal.toFixed(2)}</td>
                  <td className="text-end">{entradaTotal.toFixed(2)}</td>
                  {/* <td className="text-end">{entradaValorizada.toFixed(2)}</td>
                  <td className="text-end">{ventaTotalVal.toFixed(2)}</td> */}
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={preciosLiquidados[descripcion] || ''}
                      onChange={(e) => handlePrecioChange(descripcion, e.target.value)}
                      placeholder="Ingrese precio"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="text-end">{precioPromedio.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}