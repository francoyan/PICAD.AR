const socket = io();

socket.on("connect", () => {
    console.log("¡Conectado al servidor!");
    console.log("Mi ID:", socket.id);
});

console.log("Bienvenido a Picad.AR");

const btnCrear =
    document.getElementById("btnCrear");

const btnUnirse =
    document.getElementById("btnUnirse");

const btnReglas =
    document.getElementById("btnReglas");

let miMano = [];

let estadoPartida = null;

let estadoJuego = {
    rondaActual: 1,
    turnoActual: 0,
    jugadorActual: null,

    picadas: [
        [],
        [],
        []
    ],

    // ========================================
    // MARCADOR
    // ========================================

    marcador: [],

    // ========================================
    // GANADOR
    // ========================================

    ganador: null,
    ganadores: []
};


// ========================================
// OBTENER PUNTOS
// ========================================

function obtenerPuntos(rareza) {

    const puntosRareza = {
        "Común": 1,
        "Rara": 2,
        "Épica": 3,
        "Legendaria": 4
    };

    return puntosRareza[rareza] || 0;
}


// ========================================
// CREAR PARTIDA
// ========================================

btnCrear.addEventListener(
    "click",
    () => {

        document.querySelector(
            ".contenedor"
        ).innerHTML = `

            <h1>CREAR PARTIDA</h1>

            <p class="subtitulo">
                Elegí tu nombre para comenzar.
            </p>

            <input
                id="nombreJugador"
                class="campo"
                type="text"
                maxlength="20"
                placeholder="Tu nombre"
            >

            <button id="confirmarCrear">
                🍻 Crear partida
            </button>

            <button
                id="volverMenu"
                class="botonSecundario"
            >
                Volver
            </button>

        `;


        document
            .getElementById(
                "confirmarCrear"
            )
            .addEventListener(
                "click",
                () => {

                    const nombre =
                        document
                            .getElementById(
                                "nombreJugador"
                            )
                            .value
                            .trim();


                    if (!nombre) {

                        alert(
                            "Poné tu nombre primero."
                        );

                        return;
                    }


                    console.log(
                        "Solicitando crear partida:",
                        nombre
                    );


                    socket.emit(
                        "crearPartida",
                        nombre
                    );
                }
            );


        document
            .getElementById(
                "volverMenu"
            )
            .addEventListener(
                "click",
                mostrarMenu
            );
    }
);


// ========================================
// UNIRSE
// ========================================

btnUnirse.addEventListener(
    "click",
    () => {

        document.querySelector(
            ".contenedor"
        ).innerHTML = `

            <h1>UNIRSE</h1>

            <p class="subtitulo">
                Introducí el código de la partida.
            </p>

            <input
                id="nombreJugador"
                class="campo"
                type="text"
                maxlength="20"
                placeholder="Tu nombre"
            >

            <input
                id="codigoPartida"
                class="campo codigo"
                type="text"
                maxlength="4"
                placeholder="ABCD"
            >

            <button id="confirmarUnirse">
                🎲 Unirse a la partida
            </button>

            <button
                id="volverMenu"
                class="botonSecundario"
            >
                Volver
            </button>

        `;


        document
            .getElementById(
                "confirmarUnirse"
            )
            .addEventListener(
                "click",
                () => {

                    const nombre =
                        document
                            .getElementById(
                                "nombreJugador"
                            )
                            .value
                            .trim();


                    const codigo =
                        document
                            .getElementById(
                                "codigoPartida"
                            )
                            .value
                            .trim()
                            .toUpperCase();


                    if (!nombre) {

                        alert(
                            "Poné tu nombre."
                        );

                        return;
                    }


                    if (
                        codigo.length !== 4
                    ) {

                        alert(
                            "El código debe tener 4 caracteres."
                        );

                        return;
                    }


                    console.log(
                        "Solicitando unirse:",
                        codigo,
                        nombre
                    );


                    socket.emit(
                        "unirsePartida",
                        {
                            codigo: codigo,
                            nombre: nombre
                        }
                    );
                }
            );


        document
            .getElementById(
                "volverMenu"
            )
            .addEventListener(
                "click",
                mostrarMenu
            );
    }
);


// ========================================
// REGLAS
// ========================================

btnReglas.addEventListener(
    "click",
    () => {

        document.querySelector(
            ".contenedor"
        ).innerHTML = `

            <h1>REGLAS</h1>

            <p class="subtitulo">
                Todo lo que necesitás saber para jugar.
            </p>


            <div
                class="reglas"
                style="
                    text-align: left;
                    margin-top: 20px;
                "
            >

                <h3>🍻 OBJETIVO</h3>

                <p>
                    Conseguí la mayor cantidad de
                    puntos al finalizar las
                    3 picadas.
                </p>


                <h3>🃏 LAS CARTAS</h3>

                <p>
                    Al comenzar la partida,
                    cada jugador recibe
                    <strong>3 cartas</strong>.
                </p>

                <p>
                    Cada carta posee una
                    <strong>rareza</strong>
                    que determina su valor
                    en puntos.
                </p>


                <h3>⭐ PUNTUACIÓN</h3>

                <div
                    style="
                        display: grid;
                        gap: 7px;
                        margin: 10px 0 22px;
                    "
                >

                    <div>
                        🟤 <strong>Común</strong>
                        — 1 punto
                    </div>

                    <div>
                        🔵 <strong>Rara</strong>
                        — 2 puntos
                    </div>

                    <div>
                        🟣 <strong>Épica</strong>
                        — 3 puntos
                    </div>

                    <div>
                        🟡 <strong>Legendaria</strong>
                        — 4 puntos
                    </div>

                </div>


                <h3>🪵 LAS PICADAS</h3>

                <p>
                    La partida tiene
                    <strong>3 picadas</strong>.
                </p>

                <p>
                    Cada picada dispone de
                    <strong>6 espacios</strong>
                    para colocar cartas.
                </p>


                <h3>🔄 TURNOS</h3>

                <p>
                    En cada turno, el jugador
                    elige una carta de su mano
                    y la coloca en la picada
                    correspondiente.
                </p>

                <p>
                    Las cartas jugadas quedan
                    visibles para todos los
                    jugadores.
                </p>


                <h3>👀 CARTAS JUGADAS</h3>

                <p>
                    Podés hacer click sobre una
                    carta jugada para consultar
                    su efecto.
                </p>


                <h3>🏆 FINAL DE LA PARTIDA</h3>

                <p>
                    Cuando termina la tercera
                    picada, se suman los puntos
                    obtenidos por cada jugador.
                </p>

                <p>
                    El jugador con mayor cantidad
                    de puntos es el ganador.
                </p>


                <h3>🤝 DESEMPATE</h3>

                <p>
                    Si dos o más jugadores terminan
                    con la misma cantidad de puntos,
                    se comparan sus cartas de mayor
                    valor.
                </p>

                <p>
                    Si continúan empatados,
                    se compara la siguiente carta
                    de mayor valor, y así
                    sucesivamente.
                </p>

                <p>
                    Si todos los valores coinciden,
                    el resultado es un
                    <strong>empate</strong>.
                </p>


                <h3>🍻 Y DESPUÉS...</h3>

                <p>
                    El ganador de Picad.AR es
                    quien haya obtenido la mayor
                    puntuación al finalizar la
                    partida.
                </p>

            </div>


            <button
                id="volverMenuReglas"
                class="botonSecundario"
                style="
                    margin-top: 25px;
                    width: 100%;
                "
            >
                ← VOLVER AL MENÚ
            </button>

        `;


        document
            .getElementById(
                "volverMenuReglas"
            )
            .addEventListener(
                "click",
                mostrarMenu
            );

    }
);


// ========================================
// ESTADO DEL LOBBY
// ========================================

socket.on(
    "estadoPartida",
    (partida) => {

        console.log(
            "Estado del lobby:",
            partida
        );

        mostrarLobby(partida);
    }
);


function mostrarLobby(partida) {

    const soyHost =
        partida.jugadores.length > 0 &&
        partida.jugadores[0].host;


    document.querySelector(
        ".contenedor"
    ).innerHTML = `

        <h1>LOBBY</h1>

        <div class="codigoLobby">

            <small>
                CÓDIGO DE PARTIDA
            </small>

            <strong>
                ${partida.codigo}
            </strong>

        </div>


        <h3>
            JUGADORES
        </h3>


        <div class="listaJugadores">

            ${partida.jugadores
                .map(
                    (jugador) => `

                        <div class="jugador">

                            <span>
                                ${
                                    jugador.host
                                        ? "👑"
                                        : "🧑"
                                }
                            </span>

                            <span>
                                ${jugador.nombre}
                            </span>

                            ${
                                jugador.host
                                    ? `<small>HOST</small>`
                                    : ""
                            }

                        </div>

                    `
                )
                .join("")}

        </div>


        <p class="esperando">

            ${
                partida.jugadores.length < 6
                    ? "Esperando jugadores..."
                    : "Partida completa."
            }

        </p>


        ${
            soyHost
                ? `

                    <button
                        id="btnComenzar"
                        ${
                            partida.jugadores.length < 2
                                ? "disabled"
                                : ""
                        }
                    >
                        🍻 Comenzar partida
                    </button>

                `
                : `

                    <p class="esperando">
                        Esperando al anfitrión...
                    </p>

                `
        }

    `;


    if (soyHost) {

        const btnComenzar =
            document.getElementById(
                "btnComenzar"
            );


        if (btnComenzar) {

            btnComenzar.addEventListener(
                "click",
                () => {

                    console.log(
                        "Solicitando comenzar partida..."
                    );


                    socket.emit(
                        "comenzarPartida"
                    );
                }
            );
        }
    }
}


// ========================================
// PARTIDA COMENZADA
// ========================================

socket.on(
    "partidaComenzada",
    () => {

        console.log(
            "La partida comenzó."
        );
    }
);


// ========================================
// MANO RECIBIDA
// ========================================

socket.on(
    "manoRecibida",
    (datos) => {

        console.log(
            "¡RECIBÍ MI MANO!",
            datos.cartas
        );


        miMano =
            datos.cartas || [];


        renderizarJuego();
    }
);


// ========================================
// MANO ACTUALIZADA
// ========================================

socket.on(
    "manoActualizada",
    (datos) => {

        console.log(
            "Mi mano fue actualizada:",
            datos.cartas
        );


        miMano =
            datos.cartas || [];


        renderizarJuego();
    }
);


// ========================================
// ESTADO REVELADO
// ========================================

socket.on(
    "estadoRevelado",
    (datos) => {

        console.log(
            "Estado de la partida:",
            datos.estado
        );


        estadoPartida =
            datos.estado;


        renderizarJuego();
    }
);


// ========================================
// ESTADO DEL JUEGO
// ========================================

socket.on(
    "estadoJuego",
    (datos) => {

        console.log(
            "ESTADO DEL JUEGO:",
            datos
        );


        estadoJuego = {

            rondaActual:
                datos.rondaActual,

            turnoActual:
                datos.turnoActual,

            jugadorActual:
                datos.jugadorActual,

            picadas:
                datos.picadas || [
                    [],
                    [],
                    []
                ],

            // ====================================
            // MARCADOR
            // ====================================

            marcador:
                datos.marcador || [],

            // ====================================
            // GANADOR
            // ====================================

            ganador:
                datos.ganador || null,

            ganadores:
                datos.ganadores || []
        };


        renderizarJuego();
    }
);


// ========================================
// RENDERIZAR JUEGO
// ========================================

function renderizarJuego() {

    const contenedor =
        document.querySelector(
            ".contenedor"
        );


    if (!contenedor) {
        return;
    }


    if (
        !miMano ||
        !estadoPartida
    ) {

        console.log(
            "Esperando datos de partida..."
        );

        return;
    }


    // ========================================
    // ESTADO GLOBAL
    // ========================================

    let estadoHTML = `

        <h3>
            ESTADO DE LA PARTIDA
        </h3>

        <div
            class="carta estadoCarta"
            style="
                border-color: #D89B3C;
            "
        >

            <div class="iconoCarta">

                ${
                    estadoPartida.icono ||
                    "🃏"
                }

            </div>


            <h2>
                ${estadoPartida.nombre}
            </h2>


            <p>
                ${estadoPartida.descripcion}
            </p>

        </div>

    `;


    // ========================================
    // RONDA
    // ========================================

    let numeroRonda =
        estadoJuego.rondaActual || 1;


    let rondaTexto = "";


    if (numeroRonda <= 3) {

        rondaTexto = `

            <p class="esperando">

                Ronda

                <strong>
                    ${numeroRonda}
                </strong>

                de 3

            </p>

        `;
    }


    else {

        rondaTexto = `

            <p class="esperando">

                <strong>
                    PARTIDA FINALIZADA
                </strong>

            </p>

        `;
    }


    // ========================================
    // TURNO
    // ========================================

    let turnoHTML = "";


    if (
        estadoJuego.jugadorActual
    ) {

        turnoHTML = `

            <p class="turnoActual">

                Turno de:

                <strong>
                    ${estadoJuego.jugadorActual}
                </strong>

            </p>

        `;
    }


    // ========================================
    // MARCADOR
    // ========================================

    let marcadorHTML = `

        <div
            class="marcador"
            style="
                margin: 18px auto 22px;
                max-width: 620px;
                padding: 14px;
                background: linear-gradient(145deg, #3b2415, #24150c);
                border: 2px solid #8f5c24;
                border-radius: 14px;
                box-shadow:
                    inset 0 0 15px rgba(0,0,0,.25),
                    0 6px 14px rgba(0,0,0,.3);
            "
        >

            <h3
                style="
                    margin-bottom: 10px;
                    color: #ffd071;
                    letter-spacing: 2px;
                "
            >
                MARCADOR
            </h3>

            <div
                class="listaMarcador"
                style="
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                "
            >

                ${
                    [...(estadoJuego.marcador || [])]
                        .sort(
                            (a, b) =>
                                (b.puntos || 0) -
                                (a.puntos || 0)
                        )
                        .map(
                            (jugador, indice) => `

                                <div
                                    class="filaMarcador"
                                    style="
                                        display: flex;
                                        align-items: center;
                                        justify-content: space-between;
                                        padding: 7px 10px;
                                        background: rgba(0,0,0,.18);
                                        border-radius: 8px;
                                        color: #ead9b8;
                                    "
                                >

                                    <span
                                        style="
                                            font-weight: 600;
                                        "
                                    >

                                        ${
                                            indice === 0 &&
                                            jugador.puntos > 0
                                                ? "🥇"
                                                : "🧑"
                                        }

                                        ${jugador.nombre}

                                    </span>


                                    <strong
                                        style="
                                            color: #ffd071;
                                            font-size: 15px;
                                        "
                                    >

                                        ${jugador.puntos || 0}
                                        pts

                                    </strong>

                                </div>

                            `
                        )
                        .join("")
                }

            </div>

        </div>

    `;


    // ========================================
    // RESULTADO FINAL
    // ========================================

    let resultadoFinalHTML = "";


    // ========================================
    // GANADOR ÚNICO
    // ========================================

    if (
        estadoJuego.ganador
    ) {

        resultadoFinalHTML = `

            <div
                class="resultadoFinal"
                style="
                    margin: 18px auto 25px;
                    max-width: 620px;
                    padding: 22px 18px;
                    background:
                        linear-gradient(
                            145deg,
                            #55351c,
                            #2d1a0f
                        );
                    border: 3px solid #ffd071;
                    border-radius: 18px;
                    box-shadow:
                        0 0 20px rgba(255,208,113,.18),
                        inset 0 0 20px rgba(0,0,0,.25);
                "
            >

                <div
                    style="
                        font-size: 42px;
                        margin-bottom: 5px;
                    "
                >
                    🏆
                </div>


                <div
                    style="
                        color: #c9b38e;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 2px;
                        margin-bottom: 6px;
                    "
                >
                    GANADOR DE LA PARTIDA
                </div>


                <div
                    style="
                        color: #ffd071;
                        font-family: Cinzel, serif;
                        font-size: 27px;
                        font-weight: 700;
                    "
                >
                    ${estadoJuego.ganador.nombre}
                </div>


                <div
                    style="
                        margin-top: 5px;
                        color: #ead9b8;
                        font-size: 14px;
                    "
                >
                    ${estadoJuego.ganador.puntos} puntos
                </div>

            </div>

        `;
    }


    // ========================================
    // EMPATE
    // ========================================

    else if (
        estadoJuego.ganadores &&
        estadoJuego.ganadores.length > 1
    ) {

        resultadoFinalHTML = `

            <div
                class="resultadoFinal"
                style="
                    margin: 18px auto 25px;
                    max-width: 620px;
                    padding: 22px 18px;
                    background:
                        linear-gradient(
                            145deg,
                            #55351c,
                            #2d1a0f
                        );
                    border: 3px solid #ffd071;
                    border-radius: 18px;
                    box-shadow:
                        0 0 20px rgba(255,208,113,.18),
                        inset 0 0 20px rgba(0,0,0,.25);
                "
            >

                <div
                    style="
                        font-size: 42px;
                        margin-bottom: 5px;
                    "
                >
                    🤝
                </div>


                <div
                    style="
                        color: #c9b38e;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 2px;
                        margin-bottom: 8px;
                    "
                >
                    EMPATE
                </div>


                <div
                    style="
                        color: #ffd071;
                        font-family: Cinzel, serif;
                        font-size: 24px;
                        font-weight: 700;
                        line-height: 1.4;
                    "
                >

                    ${estadoJuego.ganadores
                        .map(
                            jugador =>
                                jugador.nombre
                        )
                        .join(" · ")}

                </div>


                <div
                    style="
                        margin-top: 8px;
                        color: #ead9b8;
                        font-size: 14px;
                    "
                >

                    ${estadoJuego.ganadores[0].puntos}
                    puntos

                </div>

            </div>

        `;
    }


    // ========================================
    // BOTÓN VOLVER AL MENÚ
    // ========================================

    let botonFinalHTML = "";


    if (
        !estadoJuego.jugadorActual &&
        (
            estadoJuego.ganador ||
            (
                estadoJuego.ganadores &&
                estadoJuego.ganadores.length > 1
            )
        )
    ) {

        botonFinalHTML = `

            <button
                id="btnVolverMenuFinal"
                class="botonSecundario"
                style="
                    margin-top: 5px;
                    width: 100%;
                    max-width: 620px;
                "
            >
                🍻 VOLVER AL MENÚ
            </button>

        `;
    }


    // ========================================
    // PICADAS
    // ========================================

    const picadas =
        estadoJuego.picadas || [
            [],
            [],
            []
        ];


    let picadasHTML = `

        <h3>
            PICADAS
        </h3>

        <div class="picadas">

    `;


    picadas.forEach(
        (picada, indicePicada) => {

            const activa =
                numeroRonda ===
                indicePicada + 1;


            picadasHTML += `

                <div
                    class="picada"
                    ${
                        activa
                            ? 'style="border-color:#FFD071;"'
                            : ""
                    }
                >

                    <div class="picadaTitulo">
                        PICADA ${indicePicada + 1}
                    </div>


                    <div class="picadaSubtitulo">
                        ${picada.length} / 6 elementos
                    </div>


                    <div class="slotsPicada">

            `;


            for (
                let indiceSlot = 0;
                indiceSlot < 6;
                indiceSlot++
            ) {

                const jugada =
                    picada[indiceSlot];


                if (!jugada) {

                    picadasHTML += `

                        <div class="slotPicada slotVacio">

                            <div class="huecoMadera">
                                ·
                            </div>

                        </div>

                    `;

                    continue;
                }


                const carta =
                    jugada.carta;


                let icono =
                    carta.icono ||
                    "🃏";


                if (
                    carta.icono &&
                    carta.icono.startsWith(
                        "assets/"
                    )
                ) {

                    icono = `

                        <img
                            src="${carta.icono}"
                            class="imagenCarta"
                            alt="${carta.nombre}"
                        >

                    `;
                }


                picadasHTML += `

                    <div
                        class="slotPicada"
                    >

                        <div
                            class="cartaJugada"
                            data-descripcion="${String(
                                carta.descripcion || ""
                            ).replace(
                                /"/g,
                                "&quot;"
                            )}"
                            style="
                                border-color:
                                ${
                                    carta.color ||
                                    "#9b6b32"
                                };
                            "
                            title="Hacé click para ver el efecto"
                        >

                            <div class="jugadorCarta">
                                ${jugada.jugadorNombre}
                            </div>


                            <div class="iconoCarta">
                                ${icono}
                            </div>


                            <strong
                                class="nombreCartaJugada"
                            >
                                ${carta.nombre}
                            </strong>


                            <div
                                class="descripcionCartaJugada"
                                style="
                                    display:none;
                                    margin-top:5px;
                                    color:#ead9b8;
                                    font-size:9px;
                                    line-height:1.25;
                                "
                            >
                                ${
                                    carta.descripcion ||
                                    "Sin descripción."
                                }
                            </div>

                        </div>

                    </div>

                `;
            }


            picadasHTML += `

                    </div>

                </div>

            `;
        }
    );


    picadasHTML += `

        </div>

    `;


    // ========================================
    // MANO
    // ========================================

    let manoHTML = `

        <h3>
            TUS CARTAS
        </h3>

        <div class="mano">

    `;


    if (
        miMano.length === 0
    ) {

        manoHTML += `

            <p class="esperando">

                No te quedan cartas en la mano.

            </p>

        `;
    }


    miMano.forEach(
        (carta, indice) => {

            const puntos =
                obtenerPuntos(
                    carta.rareza
                );


            let icono =
                carta.icono ||
                "🃏";


            if (
                carta.icono &&
                carta.icono.startsWith(
                    "assets/"
                )
            ) {

                icono = `

                    <img
                        src="${carta.icono}"
                        class="imagenCarta"
                        alt="${carta.nombre}"
                    >

                `;
            }


            manoHTML += `

                <div
                    class="cartaMano cartaJugable"
                    data-indice="${indice}"
                    style="
                        border-color:
                        ${carta.color};
                    "
                    title="Jugar esta carta"
                >

                    <div class="iconoCarta">

                        ${icono}

                    </div>


                    <h2>
                        ${carta.nombre}
                    </h2>


                    <p>
                        ${carta.descripcion}
                    </p>


                    <small>

                        ${carta.rareza}

                        ·

                        ${puntos}
                        puntos

                    </small>

                </div>

            `;
        }
    );


    manoHTML += `

        </div>

    `;


    // ========================================
    // RENDER FINAL
    // ========================================

    contenedor.innerHTML = `

        <h1>PICAD.AR</h1>

        ${estadoHTML}

        ${rondaTexto}

        ${resultadoFinalHTML}

        ${turnoHTML}

        ${marcadorHTML}

        ${picadasHTML}

        ${manoHTML}

        ${botonFinalHTML}

        <p class="esperando">

            ${
                estadoJuego.jugadorActual
                    ? `Elegí una carta para jugarla en la PICADA ${numeroRonda}.`
                    : estadoJuego.ganador ||
                      (
                          estadoJuego.ganadores &&
                          estadoJuego.ganadores.length > 1
                      )
                        ? "La partida terminó."
                        : ""
            }

        </p>

    `;


    // ========================================
    // BOTÓN VOLVER AL MENÚ
    // ========================================

    const btnVolverMenuFinal =
        document.getElementById(
            "btnVolverMenuFinal"
        );


    if (btnVolverMenuFinal) {

        btnVolverMenuFinal.addEventListener(
            "click",
            mostrarMenu
        );
    }


    // ========================================
    // CARTAS JUGADAS — CLICK PARA EFECTO
    // ========================================

    const cartasJugadas =
        document.querySelectorAll(
            ".cartaJugada"
        );


    cartasJugadas.forEach(
        (cartaElemento) => {

            cartaElemento.addEventListener(
                "click",
                (evento) => {

                    evento.stopPropagation();


                    const descripcion =
                        cartaElemento.querySelector(
                            ".descripcionCartaJugada"
                        );


                    if (!descripcion) {
                        return;
                    }


                    const abierta =
                        cartaElemento.dataset.expandida ===
                        "true";


                    if (abierta) {

                        descripcion.style.display =
                            "none";


                        cartaElemento.dataset.expandida =
                            "false";


                        cartaElemento.style.boxShadow =
                            "0 4px 8px rgba(0,0,0,.45)";

                    }


                    else {

                        descripcion.style.display =
                            "block";


                        cartaElemento.dataset.expandida =
                            "true";


                        cartaElemento.style.boxShadow =
                            "0 0 0 2px #FFD071, 0 8px 16px rgba(0,0,0,.5)";
                    }
                }
            );
        }
    );


    // ========================================
    // CARTAS JUGABLES
    // ========================================

    const cartasJugables =
        document.querySelectorAll(
            ".cartaJugable"
        );


    cartasJugables.forEach(
        (cartaElemento) => {

            cartaElemento.addEventListener(
                "click",
                () => {

                    const indice =
                        Number(
                            cartaElemento.dataset.indice
                        );


                    console.log(
                        "================================"
                    );


                    console.log(
                        "QUIERO JUGAR LA CARTA:",
                        indice
                    );


                    console.log(
                        "CARTA:",
                        miMano[indice]
                    );


                    console.log(
                        "================================"
                    );


                    socket.emit(
                        "jugarCarta",
                        indice
                    );
                }
            );
        }
    );
}


// ========================================
// ERROR DE PARTIDA
// ========================================

socket.on(
    "errorPartida",
    (mensaje) => {

        console.error(
            "ERROR DE PARTIDA:",
            mensaje
        );

        alert(mensaje);
    }
);


// ========================================
// VOLVER AL MENÚ
// ========================================

function mostrarMenu() {

    location.reload();

}