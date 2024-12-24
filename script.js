

// Cargar la lista de animes al iniciar la página
window.onload = cargarLista;

function cargarLista() { 
    var ul = document.getElementById("viendo-list");
    ul.innerHTML = '';
    database.ref('animes').once('value', function(snapshot) { snapshot.forEach(function(childSnapshot) { var anime = childSnapshot.val();
    crearElementoAnime(anime.name, anime.url, ul); 
        });
    });
}

//Reference to the Firebase database var database = 
firebase.database(); 
function agregarAnime() { var input = document.getElementById("anime-input"); 
    var urlInput = document.getElementById("url-input"); 
    var animeName = input.value.trim(); 
    var animeUrl = urlInput.value.trim(); 
    if (animeName !== "" && animeUrl !== "") { var newAnimeKey = database.ref().child('animes').push().key; 
        var updates = {}; updates['/animes/' + newAnimeKey] = { name: animeName, url: animeUrl }; 
        database.ref().update(updates); 
        input.value = ""; 
        urlInput.value = "";
    } 
}

function crearElementoAnime(animeName, animeUrl, index, ul, tipo) {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = animeName;
    span.style.cursor = "pointer"; // Añadir estilo de cursor
    span.onclick = function() {
        window.open(animeUrl, "_blank");
    };
    li.appendChild(span);

    const button = document.createElement("button");
    const img = document.createElement("img");
    img.src = 'DeletePng.png';
    img.alt = 'Eliminar';
    button.appendChild(img);
    button.onclick = function() {
        eliminarAnime(index, tipo);
    };

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.onchange = function() {
        if (checkbox.checked) {
            moverAnime(index, tipo);
        }
    };

    const container = document.createElement("div");
    container.appendChild(checkbox);
    container.appendChild(button);

    li.appendChild(container);
    ul.insertBefore(li, ul.firstChild); // Añadir al inicio de la lista visualmente
}

function eliminarAnime(index, tipo) {
    let animes = JSON.parse(localStorage.getItem(tipo + 'List'));
    animes.splice(index, 1);
    localStorage.setItem(tipo + 'List', JSON.stringify(animes));
    
    const ul = document.getElementById(tipo + "-list");
    ul.innerHTML = '';
    animes.forEach((anime, i) => {
        crearElementoAnime(anime.name, anime.url, i, ul, tipo);
    });

    // Actualizar contador
    document.getElementById(tipo + '-count').textContent = animes.length;
}

function moverAnime(index, tipo) {
    let origenAnimes = JSON.parse(localStorage.getItem(tipo + 'List'));
    let destinoAnimes;
    let destinoTipo;

    if (tipo === 'por-ver') {
        destinoTipo = 'viendo';
    } else if (tipo === 'viendo') {
        destinoTipo = 'terminados';
    }

    destinoAnimes = localStorage.getItem(destinoTipo + 'List') ? JSON.parse(localStorage.getItem(destinoTipo + 'List')) : [];
    const anime = origenAnimes.splice(index, 1)[0];
    destinoAnimes.unshift(anime); // Agregar al inicio de la lista
    localStorage.setItem(tipo + 'List', JSON.stringify(origenAnimes));
    localStorage.setItem(destinoTipo + 'List', JSON.stringify(destinoAnimes));

    const ulOrigen = document.getElementById(tipo + "-list");
    const ulDestino = document.getElementById(destinoTipo + "-list");
    ulOrigen.innerHTML = '';
    origenAnimes.forEach((anime, i) => {
        crearElementoAnime(anime.name, anime.url, i, ulOrigen, tipo);
    });
    ulDestino.innerHTML = '';
    destinoAnimes.forEach((anime, i) => {
        crearElementoAnime(anime.name, anime.url, i, ulDestino, destinoTipo);
    });

    // Actualizar contadores
    document.getElementById(tipo + '-count').textContent = origenAnimes.length;
    document.getElementById(destinoTipo + '-count').textContent = destinoAnimes.length;
}

function buscarAnime() {
    const input = document.getElementById("search-input").value.trim().toLowerCase();
    const porVer = JSON.parse(localStorage.getItem('por-verList')) || [];
    const viendos = JSON.parse(localStorage.getItem('viendoList')) || [];
    const terminados = JSON.parse(localStorage.getItem('terminadosList')) || [];
    const resultado = document.getElementById("search-result");

    let encontrado = false;
    let mensaje = "";

    if (porVer.some(anime => anime.name.toLowerCase() === input)) {
        mensaje = `El anime "${input}" está en la lista de "Por Ver".`;
        encontrado = true;
    }

    if (viendos.some(anime => anime.name.toLowerCase() === input)) {
        mensaje += encontrado ? ` También está en la lista de "Viendo".` : `El anime "${input}" está en la lista de "Viendo".`;
        encontrado = true;
    }

    if (terminados.some(anime => anime.name.toLowerCase() === input)) {
        mensaje += encontrado ? ` También está en la lista de "Terminados".` : `El anime "${input}" está en la lista de "Terminados".`;
        encontrado = true;
    }

    if (!encontrado) {
        mensaje = `El anime "${input}" no se encuentra en ninguna lista.`;
    }

    resultado.textContent = mensaje;
}
