const express = require('express');
const router = express.Router();
const db = require('../config/db');
const sendEmail = require('../utils/mailer');

// POST: Crear nueva inscripción
router.post('/', async (req, res) => {
  const { nombre, correo, taller_id } = req.body;

  if (!nombre || !correo || !taller_id) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // 1. Verificar si el taller existe y tiene cupo
    const [tallerResult] = await db.promise().execute('SELECT titulo, fecha, lugar, instructor, cupo FROM talleres WHERE id = ?', [taller_id]);

    if (tallerResult.length === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }

    const taller = tallerResult[0];

    if (taller.cupo <= 0) {
      return res.status(400).json({ error: 'No hay cupos disponibles para este taller' });
    }

    // 2. Verificar si el estudiante ya está inscrito
    const [yaInscrito] = await db.promise().execute(
      'SELECT id FROM inscripciones WHERE correo = ? AND taller_id = ?',
      [correo, taller_id]
    );

    if (yaInscrito.length > 0) {
      return res.status(409).json({ error: 'Ya estás inscrito en este taller' });
    }

    // 3. Insertar inscripción
    await db.promise().execute(
      'INSERT INTO inscripciones (nombre, correo, taller_id) VALUES (?, ?, ?)',
      [nombre, correo, taller_id]
    );

    // 4. Actualizar cupo
    await db.promise().execute('UPDATE talleres SET cupo = cupo - 1 WHERE id = ?', [taller_id]);

    // 5. Enviar correo de confirmación
    await sendEmail(
      correo,
      `✅ Confirmación de inscripción: Taller "${taller.titulo}"`,
      `Hola ${nombre},\n\nHas sido inscrito exitosamente en el taller "${taller.titulo}".\n\n📅 Fecha: ${taller.fecha}\n📍 Lugar: ${taller.lugar}\n👨‍🏫 Instructor: ${taller.instructor}\n\n¡Gracias por registrarte!\n\nCapotillo Talleres`
    );

    // 6. Programar recordatorio (envío diferido simulado)
    const eventoFecha = new Date(taller.fecha);
    const recordatorioFecha = new Date(eventoFecha);
    recordatorioFecha.setDate(recordatorioFecha.getDate() - 1); // un día antes

    const tiempoRestante = recordatorioFecha.getTime() - Date.now();

    if (tiempoRestante > 0) {
      setTimeout(() => {
        sendEmail(
          correo,
          `📣 Recordatorio: Taller "${taller.titulo}" mañana`,
          `Hola ${nombre},\n\nTe recordamos que mañana tienes el taller "${taller.titulo}".\n\n🕘 No olvides asistir puntualmente.\n\n📍 Lugar: ${taller.lugar}\n👨‍🏫 Instructor: ${taller.instructor}\n\n¡Te esperamos!\n\nCapotillo Talleres`
        );
      }, tiempoRestante);
    }

    res.status(201).json({ message: '✅ Inscripción registrada con éxito. Correo de confirmación enviado.' });

  } catch (err) {
    console.error('❌ Error en la inscripción:', err);
    res.status(500).json({ error: 'Error al procesar la inscripción' });
  }
});

// GET: Obtener todas las inscripciones
router.get('/', (req, res) => {
  const sql = `
    SELECT i.id, i.nombre, i.correo, t.titulo AS taller
    FROM inscripciones i
    JOIN talleres t ON i.taller_id = t.id
    ORDER BY i.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener inscripciones:', err);
      return res.status(500).json({ error: 'Error al obtener inscripciones' });
    }

    res.status(200).json(results);
  });
});

module.exports = router;
