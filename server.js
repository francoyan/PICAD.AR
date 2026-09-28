const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("."));

const partidas = new Map();


// ========================================
// CARGAR MAZOS
// ========================================

const mazoOriginal = JSON.parse(
    fs.readFileSync("./data/cards.json", "utf8")
);

const estadosOriginales = JSON.parse(
    fs.readFileSync("./data/estados.json", "utf8")
);

console.log(
    `Mazo cargado: ${mazoOriginal.length} cartas.`
);

console.log(
    `Estados cargados: ${estadosOriginales.length} cartas.`
);


// ========================================
// GENERAR CÓDIGO
// ========================================

function generarCodigo() {

    const caracteres =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let codigo = "";

    for (let i = 0; i < 4; i++) {

        codigo += caracteres[
            Math.floor(
                Math.random() *
                caracteres.length
            )
        ];

    }

    return codigo;
}


// ========================================
// MEZCLAR
// ========================================

function mezclarMazo(mazo) {

    const copia = [...mazo];

    for (
        let i = copia.length - 1;
        i > 0;
        i--
    ) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [
            copia[i],
            copia[j]
        ] = [
            copia[j],
            copia[i]
        ];

    }

    return copia;
}


// ========================================
// OBTENER PUNTOS SEGÚN RAREZA
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
// ESTADO DEL LOBBY
// ========================================

function enviarEstadoPartida(codigo) {

    const partida =
        partidas.get(codigo);

    if (!partida) return;

    io.to(codigo).emit(
        "estadoPartida",
        {

            codigo: codigo,

            jugadores:
                partida.jugadores.map(
                    jugador => ({

                        nombre:
                            jugador.nombre,

                        host:
                            jugador.host

                    })
                )

        }
    );
}


// ========================================
// ENVIAR ESTADO DEL JUEGO
// ========================================

function enviarEstadoJuego(codigo) {

    const partida =
        partidas.get(codigo);

    if (!partida) return;

    const jugadorActual =
        partida.jugadores[
            partida.turnoActual
        ];

    io.to(codigo).emit(
        "estadoJuego",
        {

            rondaActual:
                partida.rondaActual,

            turnoActual:
                partida.turnoActual,

            jugadorActual:
                jugadorActual
                    ? jugadorActual.nombre
                    : null,

            picadas:
                partida.picadas,

            // ====================================
            // MARCADOR
            // ====================================

            marcador:
                partida.jugadores.map(
                    jugador => ({

                        nombre:
                            jugador.nombre,

                        puntos:
                            jugador.puntos || 0

                    })
                ),

            // ====================================
            // GANADOR
            // ====================================

            ganador:

                partida.ganador

                    ? {

                        nombre:
                            partida.ganador.nombre,

                        puntos:
                            partida.ganador.puntos

                    }

                    : null,

            ganadores:

                (partida.ganadores || [])
                    .map(
                        jugador => ({

                            nombre:
                                jugador.nombre,

                            puntos:
                                jugador.puntos

                        })
                    )

        }
    );
}


// ========================================
// CONEXIÓN
// ========================================

io.on("connection", (socket) => {

    console.log(
        "Jugador conectado:",
        socket.id
    );


    // ====================================
    // CREAR PARTIDA
    // ====================================

    socket.on(
        "crearPartida",
        (nombre) => {

            let codigo;

            do {

                codigo =
                    generarCodigo();

            } while (
                partidas.has(codigo)
            );


            const partida = {

                host:
                    socket.id,

                estado:
                    "lobby",

                jugadores: [

                    {

                        id:
                            socket.id,

                        nombre:
                            nombre ||
                            "Jugador",

                        host:
                            true,

                        mano:
                            [],

                        puntos:
                            0

                    }

                ],

                estadoActivo:
                    null,

                // ====================================
                // MECÁNICA DE LAS PICADAS
                // ====================================

                rondaActual:
                    1,

                turnoActual:
                    0,

                picadas: [

                    [],
                    [],
                    []

                ],

                // ====================================
                // GANADOR
                // ====================================

                ganador:
                    null,

                ganadores:
                    []

            };


            partidas.set(
                codigo,
                partida
            );


            socket.join(codigo);

            socket.codigoPartida =
                codigo;


            console.log(
                `Partida ${codigo} creada por ${nombre}`
            );


            enviarEstadoPartida(
                codigo
            );

        }
    );


    // ====================================
    // UNIRSE
    // ====================================

    socket.on(
        "unirsePartida",
        ({ codigo, nombre }) => {

            codigo =
                codigo
                    .toUpperCase()
                    .trim();


            const partida =
                partidas.get(codigo);


            if (!partida) {

                socket.emit(
                    "errorPartida",
                    "No existe una partida con ese código."
                );

                return;
            }


            if (
                partida.estado !==
                "lobby"
            ) {

                socket.emit(
                    "errorPartida",
                    "La partida ya comenzó."
                );

                return;
            }


            if (
                partida.jugadores.length >= 6
            ) {

                socket.emit(
                    "errorPartida",
                    "La partida ya está completa."
                );

                return;
            }


            partida.jugadores.push({

                id:
                    socket.id,

                nombre:
                    nombre ||
                    "Jugador",

                host:
                    false,

                mano:
                    [],

                puntos:
                    0

            });


            socket.join(codigo);

            socket.codigoPartida =
                codigo;


            console.log(
                `${nombre} se unió a la partida ${codigo}`
            );


            enviarEstadoPartida(
                codigo
            );

        }
    );


    // ====================================
    // COMENZAR PARTIDA
    // ====================================

    socket.on(
        "comenzarPartida",
        () => {

            const codigo =
                socket.codigoPartida;


            const partida =
                partidas.get(codigo);


            if (!partida) return;


            if (
                partida.host !==
                socket.id
            ) {

                return;
            }


            if (
                partida.estado !==
                "lobby"
            ) {

                return;
            }


            if (
                partida.jugadores.length < 2
            ) {

                socket.emit(
                    "errorPartida",
                    "Necesitás al menos 2 jugadores para comenzar."
                );

                return;
            }


            console.log(
                `Partida ${codigo} comenzando.`
            );


            // ====================================
            // CREAR MAZO DE LA PARTIDA
            // ====================================

            const mazo =
                mezclarMazo(
                    mazoOriginal
                );


            // ====================================
            // REPARTIR 3 CARTAS
            // ====================================

            for (
                const jugador
                of partida.jugadores
            ) {

                jugador.mano =
                    mazo.splice(0, 3);

                jugador.puntos =
                    0;

            }


            // ====================================
            // ELEGIR ESTADO GLOBAL
            // ====================================

            const estados =
                mezclarMazo(
                    estadosOriginales
                );


            partida.estadoActivo =
                estados[0];


            // ====================================
            // CAMBIAR ESTADO
            // ====================================

            partida.estado =
                "jugando";


            // ====================================
            // INICIAR PICADAS
            // ====================================

            partida.rondaActual =
                1;

            partida.turnoActual =
                0;

            partida.picadas = [

                [],
                [],
                []

            ];

            partida.ganador =
                null;

            partida.ganadores =
                [];


            // ====================================
            // ENVIAR MANO PRIVADA
            // ====================================

            for (
                const jugador
                of partida.jugadores
            ) {

                io.to(jugador.id).emit(
                    "manoRecibida",
                    {

                        cartas:
                            jugador.mano

                    }
                );

            }


            // ====================================
            // ENVIAR ESTADO GLOBAL
            // ====================================

            io.to(codigo).emit(
                "estadoRevelado",
                {

                    estado:
                        partida.estadoActivo

                }
            );


            // ====================================
            // ENVIAR TABLERO INICIAL
            // ====================================

            enviarEstadoJuego(
                codigo
            );


            console.log(
                `Estado revelado en ${codigo}: ${partida.estadoActivo.nombre}`
            );


            console.log(
                `Cartas repartidas en ${codigo}.`
            );

        }
    );


    // ====================================
    // JUGAR CARTA
    // ====================================

    socket.on(
        "jugarCarta",
        (indiceCarta) => {

            const codigo =
                socket.codigoPartida;


            const partida =
                partidas.get(codigo);


            if (!partida) return;


            // ====================================
            // VERIFICAR PARTIDA
            // ====================================

            if (
                partida.estado !==
                "jugando"
            ) {

                socket.emit(
                    "errorPartida",
                    "La partida no está en juego."
                );

                return;
            }


            // ====================================
            // BUSCAR JUGADOR
            // ====================================

            const indiceJugador =
                partida.jugadores.findIndex(
                    jugador =>
                        jugador.id ===
                        socket.id
                );


            if (
                indiceJugador === -1
            ) {

                socket.emit(
                    "errorPartida",
                    "No se encontró tu jugador."
                );

                return;
            }


            const jugador =
                partida.jugadores[
                    indiceJugador
                ];


            // ====================================
            // VERIFICAR TURNO
            // ====================================

            if (
                indiceJugador !==
                partida.turnoActual
            ) {

                socket.emit(
                    "errorPartida",
                    "No es tu turno."
                );

                return;
            }


            // ====================================
            // VERIFICAR CARTA
            // ====================================

            if (
                indiceCarta < 0 ||
                indiceCarta >=
                    jugador.mano.length
            ) {

                socket.emit(
                    "errorPartida",
                    "Esa carta no existe."
                );

                return;
            }


            // ====================================
            // SACAR CARTA DE LA MANO
            // ====================================

            const carta =
                jugador.mano.splice(
                    indiceCarta,
                    1
                )[0];


            // ====================================
            // SUMAR PUNTOS
            // ====================================

            const puntosCarta =
                obtenerPuntos(
                    carta.rareza
                );


            jugador.puntos +=
                puntosCarta;


            console.log(
                `${jugador.nombre} jugó ${carta.nombre} (${carta.rareza}) y ganó ${puntosCarta} puntos. Total: ${jugador.puntos}`
            );


            // ====================================
            // AGREGAR CARTA A PICADA
            // ====================================

            const indicePicada =
                partida.rondaActual - 1;


            partida.picadas[
                indicePicada
            ].push({

                jugadorId:
                    jugador.id,

                jugadorNombre:
                    jugador.nombre,

                carta:
                    carta

            });


            // ====================================
            // ACTUALIZAR MANO PRIVADA
            // ====================================

            socket.emit(
                "manoActualizada",
                {

                    cartas:
                        jugador.mano

                }
            );


            // ====================================
            // ¿TERMINÓ LA RONDA?
            // ====================================

            if (
                partida.picadas[
                    indicePicada
                ].length ===
                partida.jugadores.length
            ) {


                // ====================================
                // ¿TERMINÓ LA PARTIDA?
                // ====================================

                if (
                    partida.rondaActual === 3
                ) {

                    partida.estado =
                        "finalizada";

                    partida.turnoActual =
                        null;


                    // ====================================
                    // DETERMINAR CARTAS JUGADAS
                    // ====================================

                    function obtenerCartasJugadas(
                        jugador
                    ) {

                        const cartas = [];


                        partida.picadas.forEach(
                            picada => {

                                picada.forEach(
                                    jugada => {

                                        if (
                                            jugada.jugadorId ===
                                            jugador.id
                                        ) {

                                            cartas.push(
                                                obtenerPuntos(
                                                    jugada.carta.rareza
                                                )
                                            );

                                        }

                                    }
                                );

                            }
                        );


                        return cartas.sort(
                            (a, b) =>
                                b - a
                        );

                    }


                    // ====================================
                    // ORDENAR JUGADORES
                    // ====================================

                    const jugadoresOrdenados =
                        [...partida.jugadores]
                            .sort(
                                (a, b) => {

                                    // PRIMERO:
                                    // PUNTOS TOTALES

                                    if (
                                        b.puntos !==
                                        a.puntos
                                    ) {

                                        return (
                                            b.puntos -
                                            a.puntos
                                        );

                                    }


                                    // SEGUNDO:
                                    // CARTAS DE MAYOR
                                    // A MENOR VALOR

                                    const cartasA =
                                        obtenerCartasJugadas(
                                            a
                                        );

                                    const cartasB =
                                        obtenerCartasJugadas(
                                            b
                                        );


                                    for (
                                        let i = 0;
                                        i <
                                        Math.max(
                                            cartasA.length,
                                            cartasB.length
                                        );
                                        i++
                                    ) {

                                        const valorA =
                                            cartasA[i] ||
                                            0;

                                        const valorB =
                                            cartasB[i] ||
                                            0;


                                        if (
                                            valorB !==
                                            valorA
                                        ) {

                                            return (
                                                valorB -
                                                valorA
                                            );

                                        }

                                    }


                                    // EXACTAMENTE EMPATADOS

                                    return 0;

                                }
                            );


                    const mejorJugador =
                        jugadoresOrdenados[0];


                    // ====================================
                    // DETERMINAR GANADORES
                    // ====================================

                    const ganadores =
                        jugadoresOrdenados.filter(
                            jugador => {

                                if (
                                    jugador.puntos !==
                                    mejorJugador.puntos
                                ) {

                                    return false;
                                }


                                const cartasJugador =
                                    obtenerCartasJugadas(
                                        jugador
                                    );


                                const cartasMejor =
                                    obtenerCartasJugadas(
                                        mejorJugador
                                    );


                                return (

                                    cartasJugador.length ===
                                    cartasMejor.length

                                    &&

                                    cartasJugador.every(
                                        (
                                            valor,
                                            indice
                                        ) =>
                                            valor ===
                                            cartasMejor[
                                                indice
                                            ]
                                    )

                                );

                            }
                        );


                    partida.ganadores =
                        ganadores;


                    partida.ganador =
                        ganadores.length === 1
                            ? ganadores[0]
                            : null;


                    if (
                        ganadores.length === 1
                    ) {

                        console.log(
                            `Partida ${codigo} finalizada. Ganador: ${ganadores[0].nombre} con ${ganadores[0].puntos} puntos.`
                        );

                    }

                    else {

                        console.log(
                            `Partida ${codigo} finalizada en empate entre: ${ganadores.map(j => j.nombre).join(", ")} con ${mejorJugador.puntos} puntos.`
                        );

                    }

                }


                else {

                    // ====================================
                    // SIGUIENTE PICADA
                    // ====================================

                    partida.rondaActual++;

                    partida.turnoActual =
                        0;

                }

            }


            else {

                // ====================================
                // SIGUIENTE JUGADOR
                // ====================================

                partida.turnoActual++;

            }


            // ====================================
            // ACTUALIZAR TABLERO
            // ====================================

            enviarEstadoJuego(
                codigo
            );

        }
    );


    // ====================================
    // DESCONECTAR
    // ====================================

    socket.on(
        "disconnect",
        () => {

            console.log(
                "Jugador desconectado:",
                socket.id
            );


            const codigo =
                socket.codigoPartida;


            if (!codigo) return;


            const partida =
                partidas.get(codigo);


            if (!partida) return;


            // ====================================
            // BUSCAR JUGADOR
            // ====================================

            const indiceJugador =
                partida.jugadores.findIndex(
                    jugador =>
                        jugador.id ===
                        socket.id
                );


            if (
                indiceJugador === -1
            ) {

                return;
            }


            const jugadorSaliente =
                partida.jugadores[
                    indiceJugador
                ];


            // ====================================
            // CASO: LOBBY
            // ====================================

            if (
                partida.estado ===
                "lobby"
            ) {

                const eraHost =
                    jugadorSaliente.host;


                // Eliminar jugador

                partida.jugadores =
                    partida.jugadores.filter(
                        jugador =>
                            jugador.id !==
                            socket.id
                    );


                // ====================================
                // SI ERA EL HOST
                // ====================================

                if (eraHost) {

                    if (
                        partida.jugadores.length ===
                        0
                    ) {

                        console.log(
                            `Partida ${codigo} eliminada: no quedan jugadores.`
                        );

                        partidas.delete(
                            codigo
                        );

                        return;
                    }


                    // ====================================
                    // TRANSFERIR HOST
                    // ====================================

                    const nuevoHost =
                        partida.jugadores[0];


                    // Primero todos dejan de ser host

                    partida.jugadores.forEach(
                        jugador => {
                            jugador.host =
                                false;
                        }
                    );


                    // El primero pasa a ser host

                    nuevoHost.host =
                        true;


                    partida.host =
                        nuevoHost.id;


                    console.log(
                        `El host abandonó ${codigo}. Nuevo host: ${nuevoHost.nombre}`
                    );

                }


                // ====================================
                // ACTUALIZAR LOBBY
                // ====================================

                enviarEstadoPartida(
                    codigo
                );


                return;

            }


            // ====================================
            // PARTIDA YA COMENZADA
            // ====================================

            /*
             * Por ahora no eliminamos jugadores
             * de una partida en curso.
             *
             * Esto evita romper los índices de
             * turnos y las picadas.
             *
             * Más adelante podemos implementar
             * correctamente la reconexión y/o
             * abandono durante una partida.
             */

            console.log(
                `${jugadorSaliente.nombre} abandonó una partida en curso.`
            );

        }
    );

});


// ========================================
// SERVIDOR
// ========================================

server.listen(
    3000,
    "0.0.0.0",
    () => {

        console.log(
            "PICAD.AR funcionando en http://localhost:3000"
        );

    }
);