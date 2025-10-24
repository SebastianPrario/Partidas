import React, { useState } from 'react'
import * as XLSX from 'xlsx'

const EXPECTED_HEADERS = [
  "COD_ARTICU",
  "DES_ARTICU",
  "DES_ADICIO",
  "LONG_FAM_A",
  "NOM_FAM_A",
  "LONG_IND_A",
  "LONG_GRU_A",
  "NOM_GRU_A",
  "COD_BARRA",
  "SINONIMO",
  "ALTA_ART",
  "PERFIL",
  "USA_ESCALA",
  "COD_BASE",
  "DESC_BASE",
  "ESCALA_1",
  "NOM_ESCA_1",
  "ESCALA_2",
  "NOM_ESCA_2",
  "VAL_ESC_1",
  "D_VAL_ESC1",
  "VAL_ESC_2",
  "D_VAL_ESC2",
  "U_MED_VTAS",
  "EQUIVA_VTA",
  "U_MED_STK",
  "U_MED_CPAS",
  "EQUIVA_CPA",
  "USA_PARTID",
  "USA_SERIE",
  "TIPO_COMP",
  "NUM_COMP",
  "DESC_TCOMP",
  "MOD_ORIGEN",
  "TALONARIO",
  "DIA",
  "MES",
  "ANIO",
  "FECHA_MOVI",
  "FECHA_MOV2",
  "HORA_COMP",
  "MONEDA_CTE",
  "VALORIZADO",
  "COMP_IMPOR",
  "TCOMP_ORIG",
  "NCOMP_ORIG",
  "SUC_ORIGEN",
  "SUC_DEST",
  "SUCURSAL",
  "EXPORTADO",
  "LOTE_EXPOR",
  "COD_CLIENT",
  "NOM_CLIENT",
  "FEC_ALTA_C",
  "LONG_FAM_C",
  "NOM_FAM_C",
  "LONG_IND_C",
  "LONG_GRU_C",
  "NOM_GRU_C",
  "COD_PROVEE",
  "NOM_PROVEE",
  "FEC_ALTA_P",
  "LONG_FAM_P",
  "NOM_FAM_P",
  "LONG_IND_P",
  "LONG_GRU_P",
  "NOM_GRU_P",
  "CANTIDAD",
  "PRECIO",
  "DEPOSITO",
  "NOM_DEP",
  "DIR_DEP",
  "COD_DEP_DD",
  "NOM_DEP_DD",
  "DIR_DEP_DD",
  "TOT_RENGL",
  "TIPO_MOVIM",
  "ENTRADA",
  "SALIDA",
  "NRO_PARTID",
  "NRO_DESPAC",
  "FECHA",
  "NRO_CARPET",
  "ADUANA",
  "PAIS",
  "FECHA_VTO",
  "CLA_CL_N2",
  "CLA_CL_N3",
  "CLA_CL_N4",
  "CLA_CL_N5",
  "CLA_CL_N6",
  "CLA_CL_N7",
  "CLA_CL_N8",
  "CLA_CL_N9",
  "CLA_CL_N10",
  "CLA_CL_N11",
  "CLA_CL_N12",
  "CLA_CL_N13",
  "CLA_CL_N14",
  "CLA_CL_N15",
  "CLA_CL_N16",
  "CLA_CL_N17",
  "CLA_CL_N18",
  "CLA_CL_N19",
  "CLA_CL_N20",
  "CLA_PR_N2",
  "CLA_PR_N3",
  "CLA_PR_N4",
  "CLA_PR_N5",
  "CLA_PR_N6",
  "CLA_PR_N7",
  "CLA_PR_N8",
  "CLA_PR_N9",
  "CLA_PR_N10",
  "CLA_PR_N11",
  "CLA_PR_N12",
  "CLA_PR_N13",
  "CLA_PR_N14",
  "CLA_PR_N15",
  "CLA_PR_N16",
  "CLA_PR_N17",
  "CLA_PR_N18",
  "CLA_PR_N19",
  "CLA_PR_N20",
  "CLA_AR_N2",
  "CLA_AR_N3",
  "CLA_AR_N4",
  "CLA_AR_N5",
  "CLA_AR_N6",
  "CLA_AR_N7",
  "CLA_AR_N8",
  "CLA_AR_N9",
  "CLA_AR_N10",
  "CLA_AR_N11",
  "CLA_AR_N12",
  "CLA_AR_N13",
  "CLA_AR_N14",
  "CLA_AR_N15",
  "CLA_AR_N16",
  "CLA_AR_N17",
  "CLA_AR_N18",
  "CLA_AR_N19",
  "CLA_AR_N20"
]

export default function UploadExcel({ onData }) {
  const [rows, setRows] = useState([])
  const [headers, setHeaders] = useState([])
  const [error, setError] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = evt.target.result
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // obtener la primera fila (encabezados) sin interpretar
        const sheetAsArray = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null })
        const headerRow = (sheetAsArray && sheetAsArray[0]) ? sheetAsArray[0].map(h => (h === null || h === undefined) ? '' : String(h).trim()) : []

        // Normalizar para comparación case-insensitive
        const receivedUpper = headerRow.map(h => h.toUpperCase())
        const expectedUpper = EXPECTED_HEADERS.map(h => h.toUpperCase())

        const missing = expectedUpper.filter(h => !receivedUpper.includes(h))

        if (missing.length > 0) {
          setRows([])
          setHeaders(headerRow)
          setError(`Encabezados inválidos. Faltan ${missing.length} encabezados: ${missing.join(', ')}`)
          // no enviamos datos hacia arriba
          onData([])
          return
        }

        // Si pasó la validación, parsear como objetos usando la primera fila como keys
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: null })
        setRows(json)
        setHeaders(headerRow)
        setError(null)
        onData(json)
      } catch (err) {
        console.error('Error parsing file', err)
        setError('Error al parsear el archivo')
        setRows([])
        onData([])
      }
    }
    reader.onerror = (err) => {
      console.error('Error reading file', err)
      setError('Error leyendo el archivo')
      setRows([])
      onData([])
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
      {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
      {!error && rows.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong>Filas cargadas:</strong> {rows.length}
        </div>
      )}
    </div>
  )
}
