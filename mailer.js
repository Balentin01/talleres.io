const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función básica de envío de texto plano
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Capotillo Talleres" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
    console.log(`📤 Correo enviado a ${to}`);
  } catch (error) {
    console.error(`❌ Error enviando correo a ${to}:`, error);
  }
};

// Función para enviar correo con HTML personalizado
const sendEmailHTML = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"Capotillo Talleres" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    });
    console.log(`📤 Correo HTML enviado a ${to}`);
  } catch (error) {
    console.error(`❌ Error enviando HTML a ${to}:`, error);
  }
};

// Función específica: Notificación de bajo rendimiento académico
const sendAcademicAlert = async (to, nombre, calificacion) => {
  const subject = '🚨 Alerta académica: Rendimiento bajo detectado';
  const text = `
Hola ${nombre},

Hemos notado que tu calificación más reciente fue de ${calificacion}. Esto indica que podrías estar en riesgo académico.

📌 Recomendaciones:
- Asiste a los talleres de refuerzo disponibles.
- Solicita tutoría individual.
- Consulta con tu orientador académico.

¡Queremos ayudarte a mejorar y tener éxito!

— Capotillo Talleres
  `;

  await sendEmail(to, subject, text);
};

module.exports = {
  sendEmail,
  sendEmailHTML,
  sendAcademicAlert
};
