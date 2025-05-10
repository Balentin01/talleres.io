const API_URL = 'http://localhost:3000/api/talleres';

// Ejecutar cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
  const listaTalleres = document.getElementById('listaTalleres');
  const tallerForm = document.getElementById('tallerForm');
  const btnFiltrar = document.getElementById('btnFiltrar');

  if (listaTalleres) {
    cargarTalleres();

    // Si hay filtro, configúralo
    if (btnFiltrar) {
      btnFiltrar.addEventListener('click', () => {
        const valorFiltro = parseInt(document.getElementById('filtroCupo').value);
        if (isNaN(valorFiltro)) {
          cargarTalleres();
        } else {
          cargarTalleres(valorFiltro);
        }
      });
    }
  }

  // Si estamos en la página con el formulario
  if (tallerForm) {
    tallerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const titulo = document.getElementById('titulo').value.trim();
      const descripcion = document.getElementById('descripcion').value.trim();
      const cupo = parseInt(document.getElementById('cupo').value);
      const fecha = document.getElementById('fecha').value;

      if (!titulo || !descripcion || isNaN(cupo) || cupo <= 0 || !fecha) {
        alert('Por favor, completa todos los campos correctamente.');
        return;
      }

      const nuevoTaller = { titulo, descripcion, cupo, fecha };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoTaller)
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: '¡Taller creado!',
            text: 'El taller fue agregado correctamente.',
            confirmButtonColor: '#3085d6'
          });
          cargarTalleres();
          tallerForm.reset();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear el taller.',
            confirmButtonColor: '#d33'
          });
        }
      } catch (error) {
        console.error('Error al enviar taller:', error);
        alert('Error al conectar con el servidor.');
      }
    });
  }

  // Si ninguno de los elementos clave está presente, avisa
  if (!listaTalleres && !tallerForm) {
    console.warn('Error al cargar los elementos de la página. Verifica el HTML.');
  }
});

async function cargarTalleres(cupoMinimo = 0) {
  try {
    const response = await fetch(API_URL);
    const talleres = await response.json();

    const lista = document.getElementById('listaTalleres');
    if (!lista) return;

    lista.innerHTML = '';

    const filtrados = talleres.filter(t => t.cupo >= cupoMinimo);

    if (filtrados.length === 0) {
      lista.innerHTML = '<p class="mensaje-vacio">No hay talleres con ese cupo.</p>';
      return;
    }

    filtrados.forEach(taller => {
      const card = document.createElement('div');
      card.className = 'taller-card';
      card.innerHTML = `
        <h3>${taller.titulo}</h3>
        <p><strong>Descripción:</strong> ${taller.descripcion}</p>
        <p><strong>Fecha:</strong> ${new Date(taller.fecha).toLocaleString()}</p>
        <p><strong>Cupo:</strong> ${taller.cupo}</p>
      `;
      lista.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar talleres:', error);
    alert('Error al cargar los talleres.');
  }
}
