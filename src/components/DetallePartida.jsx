import React, { useState, useMemo } from 'react'

export default function DetallePartida({ rows = [] }) {
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

  return (
    <div className="mt-4">
      <h3>Detalle por Partida</h3>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Descripción Artículo</th>
              <th className="text-end">Kilos a Facturar</th>
              <th className="text-end">Entrada en kilos</th>
              {/* <th className="text-end">Entrada Valorizada</th> 
              <th className="text-end">Venta Total</th>  */}
              <th className="text-end col-2">Precio Liquidado</th>
              <th className="text-end">Precio a Facturar</th>
            </tr>
          </thead>
          <tbody>
            {resumen.map(({ descripcion, cantidadTotal, entradaTotal, ventaTotal }) => {
              const precioLiquidado = Number(preciosLiquidados[descripcion]) || 0
              const entradaValorizada = entradaTotal * precioLiquidado
              const ventaTotalVal = ventaTotal || 0
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
                  <td className="text-end">{precioPromedio.toFixed(4)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}