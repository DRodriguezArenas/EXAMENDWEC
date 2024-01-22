document.addEventListener('DOMContentLoaded', () => {
  const iniciarJuegoBtn = document.getElementById('iniciarJuegoBtn');
  const pelearBtn = document.getElementById('pelearBtn');
  const reiniciarJuegoBtn = document.getElementById('reiniciarJuegoBtn');
  const template = document.getElementById('template');
  const resultDiv = document.getElementById('result');
  const ataques = document.getElementById('atac');

  let personajes = [];
  let cartasJugador1 = [];
  let cartasJugador2 = [];
  let turnoJugador1 = true;
  let cartasSeleccionadas = [];

  pelearBtn.style.display = 'none';
  reiniciarJuegoBtn.style.display = 'none';

  pelearBtn.addEventListener('click', pelear);
  reiniciarJuegoBtn.addEventListener('click', reiniciarJuego);

  iniciarJuegoBtn.addEventListener('click', async () => {
      await cargarPersonajes();
      distribuirCartas();

      document.getElementById('jugador1').style.display = 'flex';
      document.getElementById('jugador2').style.display = 'flex';


      pelearBtn.style.display = 'block';
      reiniciarJuegoBtn.style.display = 'block';

      iniciarJuegoBtn.style.display = 'none';
  });

  async function cargarPersonajes() {
      const response = await fetch('personajes.json');
      personajes = await response.json();
  }

  function distribuirCartas() {
      resultDiv.innerHTML = '';

      const personajesParaDistribuir = [...personajes];

      for (let jugador = 1; jugador <= 2; jugador++) {
          const cartasJugador = jugador === 1 ? cartasJugador1 : cartasJugador2;
          const cartasJugadorContainer = document.getElementById(`cartas-jugador${jugador}`);

          for (let i = 0; i < 5; i++) {
              if (personajesParaDistribuir.length > 0) {
                  const randomIndex = Math.floor(Math.random() * personajesParaDistribuir.length);
                  const personaje = personajesParaDistribuir.splice(randomIndex, 1)[0];

                  const card = template.content.cloneNode(true);
                  const cardElement = card.querySelector('.card');
                  cardElement.querySelector('#name').textContent = personaje.nom;
                  cardElement.querySelector('img').src = personaje.foto;
                  cardElement.querySelector('#stats').innerHTML = `Ataque: ${personaje.atac} <br> Defensa: ${personaje.defensa} <br> Velocidad: ${personaje.velocitat} <br> Salud: ${personaje.salut}`;

                  cartasJugadorContainer.appendChild(card);
                  cardElement.addEventListener('click', () => seleccionarCarta(cardElement, personaje));

              }
          }
      }
      resultDiv.classList.remove('hidden');
  }

  function seleccionarCarta(marioCard, personaje) {
      if (cartasSeleccionadas.length < 2) {
          cartasSeleccionadas.push(personaje);

          marioCard.classList.add('selected');

          console.log("Personaje seleccionado:", personaje.nom);

          if (cartasSeleccionadas.length === 2) {
              pelearBtn.disabled = false;
          }
      }
  }

  function pelear() {
    ataques.innerHTML = '';
    if (cartasSeleccionadas.length === 2) {
        const carta1 = cartasSeleccionadas[0];
        const carta2 = cartasSeleccionadas[1];

        // Obtener las velocidades de ambas cartas
        const velocidad1 = carta1.velocitat;
        const velocidad2 = carta2.velocitat;

        // Determinar el orden de ataque basado en la velocidad
        let atacante, defensor;
        if (velocidad1 > velocidad2) {
            atacante = carta1;
            defensor = carta2;
        } else {
            atacante = carta2;
            defensor = carta1;
        }

        let hpAtacante = atacante.salut;
        let hpDefensor = defensor.salut;

        resultDiv.innerHTML = `${atacante.nom} vs ${defensor.nom}<br>`;

        while (hpAtacante > 0 && hpDefensor > 0) {
            // Obtener los valores de ataque y defensa en cada turno
            const ataque = atacante.atac;
            const defensa = defensor.defensa;

            if (ataque > defensa) {
                const damage = ataque - defensa;
                hpDefensor -= damage;
                ataques.innerHTML += `⚔️ ${atacante.nom} inflige ${damage} de daño a 🛡️ ${defensor.nom}. ${defensor.nom} tiene ${hpDefensor} de salud.<br>`;
            } else {
                hpDefensor -= 10; // Reducción fija de 10 puntos de vida si el ataque es menor o igual a la defensa
                ataques.innerHTML += `⚔️ ${atacante.nom} inflige 10 de daño a 🛡️ ${defensor.nom}. ${defensor.nom} tiene ${hpDefensor} de salud.<br>`;
            }

            // Cambiar el turno para el siguiente ataque
            [atacante, defensor] = [defensor, atacante];
            [hpAtacante, hpDefensor] = [hpDefensor, hpAtacante];
        }

        if (hpAtacante <= 0) {
            ocultarCartaDerrotada(atacante);
            resultDiv.innerHTML += `${defensor.nom} gana.<br> ${atacante.nom} ha sido derrotado.`;

            // Actualizar salud del ganador
            const ganador = defensor;
            ganador.salut = hpDefensor;
        } else if (hpDefensor <= 0) {
            ocultarCartaDerrotada(defensor);
            resultDiv.innerHTML += `${atacante.nom} gana.<br> ${defensor.nom} ha sido derrotado.`;

            // Actualizar salud del ganador
            const ganador = atacante;
            ganador.salut = hpAtacante;
        }

        ataques.classList.remove("hidden");
        ataques.classList.add("visible");

        resultDiv.classList.remove("hidden");
        resultDiv.classList.add("visible");

        // Mantener las cartas seleccionadas después de la pelea
        cartasSeleccionadas.forEach(carta => {
            const selectedCard = document.querySelector('.selected');
            if (selectedCard) {
                selectedCard.classList.remove('selected');
            }
        });

        cartasSeleccionadas = [];
        pelearBtn.disabled = true;

        // Actualizar la información de salud en el DOM
        actualizarSaludEnDOM();
    }
}


  function ocultarCartaDerrotada(carta) {
      const cartas = document.querySelectorAll('.card');
      cartas.forEach(card => {
          if (card.querySelector('#name').textContent === carta.nom) {
              card.style.display = 'none';
          }
      });
  }

  // Función para actualizar la información de salud en el DOM
  function actualizarSaludEnDOM() {
      personajes.forEach(personaje => {
          const cartas = document.querySelectorAll('.card');
          cartas.forEach(card => {
              if (card.querySelector('#name').textContent === personaje.nom) {
                  card.querySelector('#stats').innerHTML = `Ataque: ${personaje.atac} <br> Defensa: ${personaje.defensa} <br> Velocidad: ${personaje.velocitat} <br> Salud: ${personaje.salut}`;
              }
          });
      });
  }

  function reiniciarJuego() {
      location.reload(); // Recarga la página
  }


});
