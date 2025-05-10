const sendEmail = require('../utils/mailer');

await sendEmail(
  correo, // correo que recibe el estudiante
  `Inscripción confirmada para el taller: ${taller.nombre}`,
  `Hola ${nombre},\n\nTe has inscrito al taller "${taller.nombre}" que se llevará a cabo el ${taller.fecha}.\n\n¡Gracias por participar!\n\n- Equipo Capotillo Talleres`
);
