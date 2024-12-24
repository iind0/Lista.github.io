// Reference to the Firebase database
var database = firebase.database();

// Cargar la lista de animes al iniciar la página
window.onload = cargarLista;

function cargarLista() { 
    var user = auth.currentUser;
    if (user) {
        var userId = user.uid;
        var porVerUl = document.getElementById("por-ver-list");
        var viendoUl = document.getElementById("viendo-list");
        var terminadosUl = document.getElementById("terminados-list");
        porVerUl.innerHTML = '';
        viendoUl.innerHTML = '';
        terminadosUl.innerHTML = '';

        database.ref('users/' + userId + '/animes').once('value', function(snapshot) { 
            snapshot.forEach(function(childSnapshot) { 
                var anime = childSnapshot.val();
                var animeKey = childSnapshot.key;
                if (anime.status === "por-ver") {
                    crearElementoAnime(anime.name, anime.url, anime.status, animeKey, porVerUl);
                } else if (anime.status === "viendo") {
                    crearElementoAnime(anime.name, anime.url, anime.status, animeKey, viendoUl);
                } else if (anime.status === "terminados") {
                    crearElementoAnime(anime.name, anime.url, anime.status, animeKey, terminadosUl);
                }
            });
        });
    } else {
        console.error("No hay usuario autenticado");
    }
}


function agregarAnime() { 
    var input = document.getElementById("anime-input"); 
    var urlInput = document.getElementById("url-input"); 
    var animeName = input.value.trim(); 
    var animeUrl = urlInput.value.trim(); 

    var user = auth.currentUser;
    if (user && animeName !== "" && animeUrl !== "") { 
        var userId = user.uid;
        var newAnimeKey = database.ref().child('users/' + userId + '/animes').push().key; 
        var updates = {}; 
        updates['/users/' + userId + '/animes/' + newAnimeKey] = { 
            name: animeName, 
            url: animeUrl,
            status: "por-ver"  // Estado inicial por defecto
        }; 
        database.ref().update(updates, function(error) {
            if (error) {
                console.log("Error al agregar el anime:", error);
            } else {
                cargarLista(); // Recargar la lista para reflejar los cambios
            }
        });

        input.value = ""; 
        urlInput.value = "";
    } else {
        console.error("No hay usuario autenticado o datos inválidos");
    }
}


function crearElementoAnime(animeName, animeUrl, animeStatus, animeKey, ul) {
    const li = document.createElement("li");
    li.classList.add("anime-item");

    const span = document.createElement("span");
    span.textContent = animeName;
    span.style.cursor = "pointer";
    span.onclick = function() {
        window.open(animeUrl, "_blank");
    };

    // Contenedor para el select y el botón de eliminar
    const controlsDiv = document.createElement("div");
    controlsDiv.classList.add("controls");

    const select = document.createElement("select");
    const options = ["por-ver", "viendo", "terminados"];
    options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option.charAt(0).toUpperCase() + option.slice(1); // Capitaliza la primera letra
        opt.selected = option === animeStatus;
        select.appendChild(opt);
    });
    select.onchange = function() {
        actualizarEstadoAnime(animeKey, select.value);
    };
    controlsDiv.appendChild(select);

    const button = document.createElement("button");
    const img = document.createElement("img");
    img.src = 'DeletePng.png';
    img.alt = 'Eliminar';
    button.appendChild(img);
    button.onclick = function() {
        eliminarAnime(animeKey); // Llamar a la función eliminarAnime
    };
    controlsDiv.appendChild(button);

    li.appendChild(span);
    li.appendChild(controlsDiv);

    ul.appendChild(li); // Añadir al final de la lista visualmente
}

function actualizarEstadoAnime(animeKey, newStatus) {
    var updates = {};
    updates['/animes/' + animeKey + '/status'] = newStatus;
    database.ref().update(updates, function(error) {
        if (error) {
            console.log("Error al actualizar el estado del anime:", error);
        } else {
            cargarLista(); // Recargar la lista para reflejar los cambios
        }
    });
}

function eliminarAnime(animeKey) {
    database.ref('/animes/' + animeKey).remove(function(error) {
        if (error) {
            console.log("Error al eliminar el anime:", error);
        } else {
            cargarLista(); // Recargar la lista para reflejar los cambios
        }
    });
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
