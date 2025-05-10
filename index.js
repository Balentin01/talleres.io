const express = require('express');
const cors = require('cors');
require('dotenv').config();


require('./cron/reminderJob');


const talleresRoutes = require('./routes/talleresRoutes');
const inscripcionesRoutes = require('./routes/inscripcionesRoutes');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


// Rutas principales
app.use('/api/talleres', talleresRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);


// Ruta de prueba (una sola vez)
app.post('/test', (req, res) => {
  res.json({ message: 'POST funciona' });
});

// Puerto y escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  
});
