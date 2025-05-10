const cron = require('node-cron');
const db = require('../config/db');
const sendEmail = require('../utils/mailer');

// Helper para enviar correos
async function enviarCorreosRecordatorio(diasAntes, descripcion) {
  try {
    const [rows] = await db.promise().execute(`
      SELECT i.nombre, i.correo, t.titulo AS taller, t.fecha, t.lugar, t.instructor
      FROM inscripciones i
      JOIN talleres t ON i.taller_id = t.id
      WHERE DATE(t.fecha) = CURDATE() + INTERVAL ? DAY
    `, [diasAntes]);

    for (const r of rows) {
      await sendEmail(
        r.correo,
        `Recordatorio: Taller "${r.taller}" es ${descripcion}`,
        `Hola ${r.nombre},\n\nEste es un recordatorio de que el taller "${r.taller}" será ${descripcion}.\n\n📍 Lugar: ${r.lugar}\n👨‍🏫 Instructor: ${r.instructor}\n🕒 Fecha: ${new Date(r.fecha).toLocaleString()}\n\n¡Te esperamos!\n\nCapotillo Talleres`
      );
    }

    console.log(`✅ Recordatorios enviados (${descripcion}).`);
  } catch (error) {
    console.error(`❌ Error enviando recordatorios (${descripcion}):`, error);
  }
}

// 3 días antes
cron.schedule('0 8 * * *', () => enviarCorreosRecordatorio(3, 'en 3 días'));

// 1 día antes
cron.schedule('0 8 * * *', () => enviarCorreosRecordatorio(1, 'mañana'));

// 1 hora antes (cada 10 min verificamos los que están exactamente a 1 hora)
cron.schedule('*/10 * * * *', async () => {
  try {
    const [rows] = await db.promise().execute(`
      SELECT i.nombre, i.correo, t.titulo AS taller, t.fecha, t.lugar, t.instructor
      FROM inscripciones i
      JOIN talleres t ON i.taller_id = t.id
      WHERE TIMESTAMPDIFF(MINUTE, NOW(), t.fecha) BETWEEN 55 AND 65
    `);

    for (const r of rows) {
      await sendEmail(
        r.correo,
        `¡Falta 1 hora para tu taller "${r.taller}"!`,
        `Hola ${r.nombre},\n\nTe recordamos que tu taller "${r.taller}" inicia en 1 hora.\n\n📍 Lugar: ${r.lugar}\n👨‍🏫 Instructor: ${r.instructor}\n🕒 Hora: ${new Date(r.fecha).toLocaleString()}\n\n¡Nos vemos pronto!\n\nCapotillo Talleres`
      );
    }

    console.log("✅ Recordatorios enviados (1 hora antes).");
  } catch (error) {
    console.error("❌ Error enviando recordatorios (1 hora antes):", error);
  }
});
