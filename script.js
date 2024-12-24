// Cargar la lista de animes al iniciar la página
window.onload = function() {
    cargarLista('por-ver');
    cargarLista('viendo');
    cargarLista('terminados');
};

function cargarLista(tipo) {
    const storedAnimes = localStorage.getItem(tipo + 'List');
    const countSpan = document.getElementById(tipo + '-count');
    if (storedAnimes) {
        const animes = JSON.parse(storedAnimes);
        const ul = document.getElementById(tipo + "-list");
        ul.innerHTML = ''; // Limpiar la lista antes de recargar
        animes.forEach((anime, index) => {
            crearElementoAnime(anime.name, anime.url, index, ul, tipo);
        });
        countSpan.textContent = animes.length;
    } else {
        countSpan.textContent = 0;
    }
}

function agregarAnime() {
    var input = document.getElementById("anime-input");
    var urlInput = document.getElementById("url-input");
    var animeName = input.value.trim();
    var animeUrl = urlInput.value.trim();

    if (animeName !== "" && animeUrl !== "") {
        const ul = document.getElementById("por-ver-list");
        const newIndex = 0; // Siempre agregará en la posición 0
        let animes = localStorage.getItem('por-verList') ? JSON.parse(localStorage.getItem('por-verList')) : [];
        animes.unshift({ name: animeName, url: animeUrl }); // Agregar al inicio de la lista
        localStorage.setItem('por-verList', JSON.stringify(animes));

        // Recargar la lista para reflejar los cambios
        ul.innerHTML = ''; // Limpiar la lista antes de recargar
        animes.forEach((anime, i) => {
            crearElementoAnime(anime.name, anime.url, i, ul, 'por-ver');
        });

        // Actualizar contador
        document.getElementById('por-ver-count').textContent = animes.length;

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
