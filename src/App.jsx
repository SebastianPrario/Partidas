import React, { useState, useMemo } from 'react'
import UploadExcel from './components/UploadExcel'
import SearchPartidas from './components/SearchPartidas'
import DetallePartida from './components/DetallePartida'
import RangoBusqueda from './components/RangoBusqueda'
import GenerarPDF from './components/GenerarPDF'
import ListaItems from './components/ListaItems'



export default function App() {
  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [partidaFilter, setPartidaFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [resumenData, setResumenData] = useState(null)
  const [showListaItems, setShowListaItems] = useState(false)

  
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
        <div className="mb-3 d-flex gap-2 align-items-center">
          <SearchPartidas options={partidasOptions} onFilter={handleFilter} />
          <button 
            className="btn btn-info btn-sm" 
            onClick={() => setShowListaItems(!showListaItems)}
            disabled={filteredRows.length === 0}
          >
            DETALLE PARTIDA 
          </button>
        </div>
        
        {/* Lista de items de la partida seleccionada */}
        {showListaItems && filteredRows.length > 0 && (
          <ListaItems 
            rows={filteredRows} 
            partidaNro={partidaFilter}
            onClose={() => setShowListaItems(false)}
          />
        )}
        
        {/* Detalle: lista los articulos de la partida seleccionada */}
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
