import React, { useState, useEffect } from 'react'

export default function SearchPartidas({ options = [], onFilter }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    // if current selection is not in options, clear it
    if (query && !options.includes(query)) {
      setQuery('')
      onFilter('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])

  const handleSubmit = (e) => {
    e.preventDefault()
    onFilter(query)
  }

  const clear = () => {
    setQuery('')
    onFilter('')
  }

  return (
    <form onSubmit={handleSubmit} className="d-flex align-items-center" style={{ gap: 8 }}>
      <label className="d-flex align-items-center" style={{ gap: 6 }}>
        <span className="me-2 col-8">Seleccionar Partida:</span>
        <select className="form-select form-select-sm" style={{ minWidth: 200 }} value={query} onChange={(e) => setQuery(e.target.value)}>
          <option value="">-- seleccionar --</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
      <button type="button" onClick={clear} className="btn btn-secondary btn-sm">Limpiar</button>
    </form>
  )
}
