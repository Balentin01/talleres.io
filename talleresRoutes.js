const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ Crear un nuevo taller
router.post('/', (req, res) => {
  const { titulo, descripcion, cupo, fecha } = req.body;

  // Validaciones básicas
  if (!titulo || !descripcion || !cupo || !fecha) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const sql = 'INSERT INTO talleres (titulo, descripcion, cupo, fecha) VALUES (?, ?, ?, ?)';
  db.query(sql, [titulo, descripcion, cupo, fecha], (err, result) => {
    if (err) {
      console.error('❌ Error al insertar taller:', err);
      return res.status(500).json({ error: 'Error al guardar el taller' });
    }

    res.status(201).json({
      message: '✅ Taller creado con éxito',
      tallerId: result.insertId
    });
  });
});

// ✅ Listar talleres con cupos disponibles
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM talleres WHERE cupo > 0 ORDER BY fecha ASC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener talleres:', err);
      return res.status(500).json({ error: 'Error al obtener talleres' });
    }

    res.status(200).json(results);
  });
});

module.exports = router;