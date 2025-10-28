import React, { useState, useMemo } from 'react'
import UploadExcel from './components/UploadExcel'
import SearchPartidas from './components/SearchPartidas'
import DetallePartida from './components/DetallePartida'
import RangoBusqueda from './components/RangoBusqueda'
import GenerarPDF from './components/GenerarPDF'


const EXPORT_COLUMNS = [
  "COD_ARTICU","DES_ARTICU", "TIPO_COMP","NUM_COMP","DIA", "MES",  "ANIO", "COD_CLIENT", "NOM_CLIENT","CANTIDAD", "PRECIO", "NRO_PARTID"
]

export default function App() {
  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [partidaFilter, setPartidaFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [resumenData, setResumenData] = useState(null)

  
  const handleFilter = (nroPartid) => {
    if (!nroPartid) {
      setFilteredRows([])
      setPartidaFilter('')
      return
    }
    const q = String(nroPartid).toLowerCase()
    const found = rows.filter(r => {
      const val = r['NRO_PARTID'] != null ? String(r['NRO_PARTID']).toLowerCase() : ''
      return val.includes(q)
    })
    setFilteredRows(found)
    setPartidaFilter(nroPartid)
  }

  const generarPDFRango = (desde, hasta) => {
    // Filtrar las partidas en el rango
    const partidasEnRango = rows.filter(row => {
      const nroPartida = String(row['NRO_PARTID']).trim()
      return nroPartida >= desde && nroPartida <= hasta
    })

    // Agrupar por partida y artículo
    const resumen = partidasEnRango.reduce((acc, row) => {
      const partida = String(row['NRO_PARTID']).trim()
      const articulo = row['DES_ARTICU']
      const cantidad = parseFloat(String(row['CANTIDAD']).replace(',', '.')) || 0

      if (!acc[partida]) {
        acc[partida] = {}
      }
      if (!acc[partida][articulo]) {
        acc[partida][articulo] = 0
      }
      acc[partida][articulo] += cantidad
      return acc
    }, {})

    setShowModal(false)
    setResumenData(resumen)
    setShowPDFModal(true)
    }

  const partidasOptions = useMemo(() => {
    const set = new Set()
    for (const r of rows) {
      const v = r && r['NRO_PARTID'] != null ? String(r['NRO_PARTID']).trim() : ''
      if (v !== '') set.add(v)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }, [rows])

  return (
    <div className="container-fluid py-4">
      <h1>Calcular Precio Liquidado</h1>
      <div className="d-flex gap-2 align-items-center">
        <UploadExcel onData={(data) => setRows(data)} />
        <button 
          className="btn btn-secondary" 
          onClick={() => setRows([])} 
          disabled={rows.length === 0}
        >
          Limpiar datos
        </button>
        </div>
        <div className="d-flex gap-2 align-items-center ms-0-2 my-2">
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowModal(true)}
          disabled={rows.length === 0}
        >
          Listar Saldos de Partidas
        </button>
      </div>

      <RangoBusqueda
        show={showModal}
        onHide={() => setShowModal(false)}
        onBuscar={generarPDFRango}
        partidasOptions={partidasOptions}
      />
      <div className='col-12 my-4'>
      <GenerarPDF
        show={showPDFModal}
        onHide={() => setShowPDFModal(false)}
        resumen={resumenData}
      />
      </div>

      <section className="mt-4">
        <h2>Datos en memoria</h2>
        <p>Total filas: {rows.length} {filteredRows.length > 0 && `(mostrando ${filteredRows.length})`}</p>
        <div className="mb-3">
          <SearchPartidas options={partidasOptions} onFilter={handleFilter} />
        </div>
        
        {/* Detalle partida para las filas filtradas */}
        {filteredRows.length > 0 && (
          <DetallePartida rows={filteredRows} partidaNro={partidaFilter} />
        )}

        {rows.length === 0 && (
          <div>No hay datos cargados</div>
        )}
      </section>
    </div>
  )
}
