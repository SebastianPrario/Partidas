import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function RangoBusqueda({ show, onHide, onBuscar, partidasOptions }) {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar(desde, hasta);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Búsqueda por Rango de Partidas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Desde Partida</Form.Label>
            <Form.Select 
              value={desde} 
              onChange={(e) => setDesde(e.target.value)}
              required
            >
              <option value="">Seleccione partida inicial...</option>
              {partidasOptions.map(partida => (
                <option key={partida} value={partida}>{partida}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Hasta Partida</Form.Label>
            <Form.Select 
              value={hasta} 
              onChange={(e) => setHasta(e.target.value)}
              required
            >
              <option value="">Seleccione partida final...</option>
              {partidasOptions.map(partida => (
                <option key={partida} value={partida}>{partida}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Listar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}