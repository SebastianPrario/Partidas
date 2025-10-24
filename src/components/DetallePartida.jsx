import React, { useState, useMemo } from 'react'

export default function DetallePartida({ rows = [] }) {
  // Estado para mantener los precios liquidados por DES_ARTICU
  const [preciosLiquidados, setPreciosLiquidados] = useState({})

  // Computar resumen agrupado por DES_ARTICU
  const resumen = useMemo(() => {
    const map = new Map()
    
    for (const row of rows) {
      const desc = row['DES_ARTICU'] || ''
      if (!desc) continue
      
      const cantidad = Number(String(row['CANTIDAD']).replace(',', '.')) || 0
      
      if (!map.has(desc)) {
        map.set(desc, {
          descripcion: desc,
          cantidadTotal: 0
        })
      }
      
      const item = map.get(desc)
      item.cantidadTotal += cantidad
    }
    
    return Array.from(map.values())
      .sort((a, b) => a.descripcion.localeCompare(b.descripcion))
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
      <h3>Detalle por Artículo</h3>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Descripción Artículo</th>
              <th className="text-end">Cantidad Total</th>
              <th className="text-end">Precio Liquidado</th>
            </tr>
          </thead>
          <tbody>
            {resumen.map(({ descripcion, cantidadTotal }) => (
              <tr key={descripcion}>
                <td>{descripcion}</td>
                <td className="text-end">{cantidadTotal.toFixed(2)}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}