const db = require('../db');

// Crear nuevo taller
exports.crearTaller = (req, res) => {
  const { titulo, descripcion, cupo, fecha } = req.body;
  const sql = 'INSERT INTO talleres (titulo, descripcion, cupo, fecha) VALUES (?, ?, ?, ?)';
  db.query(sql, [titulo, descripcion, cupo, fecha], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ mensaje: 'Taller creado correctamente' });
  });
};

// Ver todos los talleres
exports.verTalleres = (req, res) => {
  db.query('SELECT * FROM talleres', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};
