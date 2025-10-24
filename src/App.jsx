import React, { useState, useMemo } from 'react'
import UploadExcel from './components/UploadExcel'
import SearchPartidas from './components/SearchPartidas'
import DetallePartida from './components/DetallePartida'
import initSqlJs from 'sql.js'

const EXPORT_COLUMNS = [
  "COD_ARTICU","DES_ARTICU", "TIPO_COMP","NUM_COMP","DIA", "MES",  "ANIO", "COD_CLIENT", "NOM_CLIENT","CANTIDAD", "PRECIO", "NRO_PARTID"
]

export default function App() {
  const [rows, setRows] = useState([])
  const [exporting, setExporting] = useState(false)
  const [filteredRows, setFilteredRows] = useState([])

  const handleExportSQLite = async () => {
    if (!rows || rows.length === 0) return
    setExporting(true)
    try {
      const SQL = await initSqlJs({ locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}` })
      const db = new SQL.Database()

      // create table
      const columnsSql = EXPORT_COLUMNS.map(col => {
        // choose type heuristically
        if (["DIA","MES","ANIO"].includes(col)) return `\"${col}\" INTEGER`
        if (["CANTIDAD","PRECIO"].includes(col)) return `\"${col}\" REAL`
        return `\"${col}\" TEXT`
      }).join(', ')
      db.run(`CREATE TABLE IF NOT EXISTS partidas (${columnsSql});`)

      // prepare insert
      const placeholders = EXPORT_COLUMNS.map(() => '?').join(', ')
      const insertSql = `INSERT INTO partidas (${EXPORT_COLUMNS.map(c => `\"${c}\"`).join(',')}) VALUES (${placeholders});`
      const stmt = db.prepare(insertSql)

      for (const row of rows) {
        const values = EXPORT_COLUMNS.map(col => {
          const v = row[col]
          // try convert numeric-like values
          if (v === null || v === undefined || v === '') return null
          // If the column is numeric
          if (["DIA","MES","ANIO"].includes(col)) return Number(v) || null
          if (["CANTIDAD","PRECIO"].includes(col)) {
            const n = Number(String(v).replace(',', '.'))
            return isNaN(n) ? null : n
          }
          return String(v)
        })
        stmt.run(values)
      }
      stmt.free()

      const binaryArray = db.export()
      const blob = new Blob([binaryArray], { type: 'application/x-sqlite3' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'partidas.sqlite'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      db.close()
    } catch (err) {
      console.error('Error exporting SQLite', err)
      alert('Error al generar la base SQLite. Ver consola para detalles.')
    } finally {
      setExporting(false)
    }
  }

  const handleFilter = (nroPartid) => {
    if (!nroPartid) {
      setFilteredRows([])
      return
    }
    const q = String(nroPartid).toLowerCase()
    const found = rows.filter(r => {
      const val = r['NRO_PARTID'] != null ? String(r['NRO_PARTID']).toLowerCase() : ''
      return val.includes(q)
    })
    setFilteredRows(found)
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
      <h1>Subir archivo Excel</h1>
      <div className="d-flex gap-2 align-items-center">
        <UploadExcel onData={(data) => setRows(data)} />
        <button 
          className="btn btn-primary"
          onClick={handleExportSQLite} 
          disabled={exporting || rows.length === 0}
        >
          {exporting ? 'Generando...' : 'Exportar a SQLite'}
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => setRows([])} 
          disabled={rows.length === 0}
        >
          Limpiar datos
        </button>
      </div>

      <section className="mt-4">
        <h2>Datos en memoria</h2>
        <p>Total filas: {rows.length} {filteredRows.length > 0 && `(mostrando ${filteredRows.length})`}</p>
        <div className="mb-3">
          <SearchPartidas options={partidasOptions} onFilter={handleFilter} />
        </div>
        
        {/* Detalle partida para las filas filtradas */}
        {filteredRows.length > 0 && (
          <DetallePartida rows={filteredRows} />
        )}

        {rows.length === 0 ? (
          <div>No hay datos cargados</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  {EXPORT_COLUMNS.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(filteredRows.length > 0 ? filteredRows : rows).map((r, i) => (
                  <tr key={i}>
                    {EXPORT_COLUMNS.map(col => (
                      <td key={col + i}>{r[col] != null ? String(r[col]) : ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
