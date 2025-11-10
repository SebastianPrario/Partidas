import React, { useState, useMemo, useRef } from 'react'
import Liquidacion from './Liquidacion'

export default function DetallePartida({ rows = [] , partidaNro }) {
  // Estados para mantener los precios liquidados, costos y porcentajes por DES_ARTICU
  const [preciosLiquidados, setPreciosLiquidados] = useState({})
  const [costos, setCostos] = useState({})
  const [porcentajes, setPorcentajes] = useState({})
  const [usarCostosPorcentajes, setUsarCostosPorcentajes] = useState(false)
  // Estados para modales de generación de liquidación
  const [showFormModal, setShowFormModal] = useState(false)
  const [proveedorForm, setProveedorForm] = useState('')
  const [fechaForm, setFechaForm] = useState('')
  const [showLiquidacionModal, setShowLiquidacionModal] = useState(false)
  const [liquidacionItems, setLiquidacionItems] = useState([])
  // Estado para mantener los items eliminados
  const [itemsEliminados, setItemsEliminados] = useState(new Set())
  
  // Computar resumen agrupado por DES_ARTICU y filtrar por rango de cantidad
  // También acumulamos EntradaTotal (TIPO_COMP = ENT | AJT) y VentaTotal (excluye ENT/AJT)
  const resumen = useMemo(() => {
    const map = new Map()
    console.log(costos);
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
 
    // Filtramos los items eliminados y ordenamos por descripción
    const filtered = Array.from(map.values())
      .filter(item => !itemsEliminados.has(item.descripcion))
      .sort((a, b) => a.descripcion.localeCompare(b.descripcion))

    return filtered
  }, [rows, itemsEliminados])
 
  const handlePrecioChange = (descripcion, precio) => {
    setPreciosLiquidados(prev => ({
      ...prev,
      [descripcion]: precio
    }))
  }

  const handleCostoChange = (descripcion, costo) => {
    setCostos(prev => ({ ...prev, [descripcion]: costo }))
    actualizarPrecioLiquidado(descripcion, costo, porcentajes[descripcion])
  }

  const handlePorcentajeChange = (descripcion, porcentaje) => {
    setPorcentajes(prev => ({ ...prev, [descripcion]: porcentaje }))
    actualizarPrecioLiquidado(descripcion, costos[descripcion], porcentaje)
  }

  const actualizarPrecioLiquidado = (descripcion, costo, porcentaje) => {
    const c = Number(costo) || 0
    const p = Number(porcentaje) || 0
    if (usarCostosPorcentajes && c !== 0 && p !== 0) {
      const precio = (c * (100 + p) / 100).toFixed(2)
      setPreciosLiquidados(prev => ({ ...prev, [descripcion]: precio }))
    }
  }

  // Funciones para manejo de modales
  const abrirModalForm = () => setShowFormModal(true)
  const cerrarModalForm = () => setShowFormModal(false)

  const abrirModalLiquidacion = (items) => {
    setLiquidacionItems(items)
    setShowLiquidacionModal(true)
  }
  const cerrarModalLiquidacion = () => setShowLiquidacionModal(false)

  const handleGenerarLiquidacion = () => {
    // Construir items a partir del resumen y estados actuales
    const items = resumen.map(({ descripcion, entradaTotal }) => {
      const precioLiq = Number(preciosLiquidados[descripcion]) || 0
      const costo = Number(costos[descripcion]) || 0
      return {
        descripcion,
        entradaTotal: entradaTotal,
        precioLiquidado: precioLiq,
        ventaTotal: Number(entradaTotal * precioLiq) || 0,
        costo: costo * entradaTotal
      }
    })
    abrirModalLiquidacion(items)
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
          <div className="d-flex align-items-center gap-3">
            <h3 className="m-0">{partidaNro ? `Detalle de Partida: ${partidaNro}` : 'Detalle por Artículo'}</h3>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="usarCostosPorcentajes"
                checked={usarCostosPorcentajes}
                onChange={(e) => setUsarCostosPorcentajes(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="usarCostosPorcentajes">
                Usar Costos y Porcentajes
              </label>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-success" onClick={abrirModalForm}>Generar Liquidación</button>
            <button className="btn btn-sm btn-outline-primary" onClick={handlePrint}>Imprimir PDF</button>
          </div>
        </div>
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Descripción Artículo</th>
              <th className="text-end">Cantidad Total</th>
              <th className="text-end">Entrada Total</th>
              {usarCostosPorcentajes && (
                <>
                  <th className="text-end">Costo</th>
                  <th className="text-end">Porcentaje</th>
                </>
              )}
              <th className="text-end">Precio Liquidado</th>
              <th className="text-end">Precio Promedio</th>
            </tr>
          </thead>
          <tbody>
            {resumen.map(({ descripcion, cantidadTotal, entradaTotal, ventaTotal }) => {
              console.log('Calculando precio promedio para:', descripcion, cantidadTotal, entradaTotal, ventaTotal);
              const precioLiquidado = Number(preciosLiquidados[descripcion]) || 0
              const entradaValorizada = entradaTotal * precioLiquidado
              const ventaTotalVal = ventaTotal || 0
              // PrecioPromedio = (EntradaValorizada + VentaTotal) / CantidadTotal
              const precioPromedio = cantidadTotal !== 0 ? (entradaValorizada + ventaTotalVal) / cantidadTotal : 0

              return (
                <tr key={descripcion}>
                  <td className="d-flex justify-content-between align-items-center">
                    <span>{descripcion}</span>
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => {
                        console.log('Eliminando item:', descripcion);
                        setItemsEliminados(prev => new Set([...prev, descripcion]));
                        // Limpiar estados asociados
                        setPreciosLiquidados(prev => {
                          const { [descripcion]: _, ...rest } = prev;
                          return rest;
                        });
                        setCostos(prev => {
                          const { [descripcion]: _, ...rest } = prev;
                          return rest;
                        });
                        setPorcentajes(prev => {
                          const { [descripcion]: _, ...rest } = prev;
                          return rest;
                        });
                      }}
                      title="Eliminar item"
                    >
                      ×
                    </button>
                  </td>
                  <td className="text-end">{cantidadTotal.toFixed(2)}</td>
                  <td className="text-end">{entradaTotal.toFixed(2)}</td>
                  {usarCostosPorcentajes && (
                    <>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={costos[descripcion] || ''}
                          onChange={(e) => handleCostoChange(descripcion, e.target.value)}
                          placeholder="Ingrese costo"
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={porcentajes[descripcion] || ''}
                          onChange={(e) => handlePorcentajeChange(descripcion, e.target.value)}
                          placeholder="Ingrese %"
                          step="0.01"
                          min="0"
                        />
                      </td>
                    </>
                  )}
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={preciosLiquidados[descripcion] || ''}
                      onChange={(e) => handlePrecioChange(descripcion, e.target.value)}
                      placeholder="Ingrese precio"
                      step="0.01"
                      min="0"
                      disabled={usarCostosPorcentajes && costos[descripcion] && porcentajes[descripcion]}
                    />
                  </td>
                  <td className="text-end">{precioPromedio.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {/* Modal: formulario para generar liquidación (proveedor + fecha) */}
      {showFormModal && (
        <div className="modal-backdrop d-flex align-items-center justify-content-center" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:1050}}>
          <div className="card p-3" style={{width: '480px'}}>
            <h5>Generar Liquidación</h5>
            <div className="mb-2">
              <label className="form-label">Proveedor</label>
              <input className="form-control" value={proveedorForm} onChange={(e) => setProveedorForm(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-control" value={fechaForm} onChange={(e) => setFechaForm(e.target.value)} />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={cerrarModalForm}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => { cerrarModalForm(); handleGenerarLiquidacion(); }}>Generar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: vista de liquidación (componente Liquidacion) */}
      {showLiquidacionModal && (
        <div className="modal-backdrop d-flex align-items-center justify-content-center" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:1050}}>
          <div className="card p-3" style={{width: '90%', maxHeight: '90%', overflow: 'auto'}}>
            <div className="d-flex justify-content-end align-items-center mb-2">
           
              <button className="btn btn-sm btn-outline-secondary" onClick={cerrarModalLiquidacion}>Cerrar</button>
            </div>
            <Liquidacion proveedor={proveedorForm} fecha={fechaForm} items={liquidacionItems} />
          </div>
        </div>
      )}
    </div>
  )
}