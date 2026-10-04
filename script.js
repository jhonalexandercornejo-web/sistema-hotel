/* =========================================================
   SISTEMA DE GESTIÓN HOTELERA
   SCRIPT.JS
========================================================= */

let habitaciones = JSON.parse(localStorage.getItem("hotel_habitaciones")) || [
    { id: 1, numero: "101", tipo: "Simple", precio: 80, precioHora: 20, estado: "DISPONIBLE" },
    { id: 2, numero: "102", tipo: "Matrimonial", precio: 120, precioHora: 30, estado: "DISPONIBLE" },
    { id: 3, numero: "103", tipo: "Doble", precio: 140, precioHora: 35, estado: "DISPONIBLE" },
    { id: 4, numero: "104", tipo: "Suite", precio: 200, precioHora: 50, estado: "DISPONIBLE" }
];

let productos = JSON.parse(localStorage.getItem("hotel_productos")) || [
    { id: 1, nombre: "Shampoo", categoria: "Higiene", precio: 5, stock: 20 },
    { id: 2, nombre: "Agua", categoria: "Bebida", precio: 4, stock: 30 },
    { id: 3, nombre: "Gaseosa", categoria: "Bebida", precio: 6, stock: 20 },
    { id: 4, nombre: "Cerveza", categoria: "Bebida", precio: 8, stock: 24 },
    { id: 5, nombre: "Snack", categoria: "Snack", precio: 5, stock: 20 },
    { id: 6, nombre: "Jabón", categoria: "Higiene", precio: 3, stock: 20 },
    { id: 7, nombre: "Pasta dental", categoria: "Higiene", precio: 6, stock: 15 }
];

let reservas =
    JSON.parse(localStorage.getItem("hotel_reservas")) || [];

let consumos =
    JSON.parse(localStorage.getItem("hotel_consumos")) || [];

let pagos =
    JSON.parse(localStorage.getItem("hotel_pagos")) || [];

let historial =
    JSON.parse(localStorage.getItem("hotel_historial")) || [];

let aperturasCaja =
    JSON.parse(localStorage.getItem("hotel_aperturas_caja")) || {};

let filtroHabitacionActual = "TODAS";

let ultimaReservaCuenta = null;


/* =========================================================
   INICIO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    normalizarDatos();

    mostrarFecha();

    configurarFechas();

    actualizarEstadosAutomaticos();

    renderTodo();

    iniciarControlEstadiasPorHora();

});


/* =========================================================
   NORMALIZAR DATOS
========================================================= */

function normalizarDatos() {

    habitaciones = habitaciones.map(h => ({
        id: Number(h.id),
        numero: String(h.numero),
        tipo: h.tipo || "Simple",

        // PRECIO POR DÍA
        precio: Number(h.precio || 0),

        // PRECIO POR HORA
        precioHora: Number(h.precioHora || 0),

        estado: h.estado || "DISPONIBLE"
    }));


    productos = productos.map(p => ({
        id: Number(p.id),
        nombre: p.nombre || "",
        categoria: p.categoria || "Otro",
        precio: Number(p.precio || 0),
        stock: Number(p.stock || 0)
    }));


    reservas = reservas.map(r => ({
        ...r,

        id: Number(r.id),

        habitacionId:
            Number(r.habitacionId),

        total:
            Number(r.total || 0),

        estado:
            r.estado || "RESERVADA",

        creadoEn:
            r.creadoEn ||
            new Date().toISOString(),

        tipoEstadia:
            r.tipoEstadia || "DIA",

        horas:
            Number(r.horas || 0),

        precioAplicado:
            Number(r.precioAplicado || 0),

        fechaHoraEntrada:
            r.fechaHoraEntrada || null,

        fechaHoraSalida:
            r.fechaHoraSalida || null,

        aviso15:
            Boolean(r.aviso15),

        avisoFin:
            Boolean(r.avisoFin)
    }));


    consumos = consumos.map(c => ({
        ...c,

        id: Number(c.id),

        reservaId:
            Number(c.reservaId),

        habitacionId:
            Number(c.habitacionId),

        productoId:
            Number(c.productoId),

        cantidad:
            Number(c.cantidad || 0),

        precio:
            Number(c.precio || 0),

        total:
            Number(c.total || 0)
    }));


    pagos = pagos.map(p => ({
        ...p,

        id:
            Number(p.id),

        reservaId:
            Number(p.reservaId),

        monto:
            Number(p.monto || 0)
    }));


    historial = historial.map(h => ({
        ...h,
        id: Number(h.id)
    }));


    guardarDatos();
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function guardarDatos() {

    localStorage.setItem(
        "hotel_habitaciones",
        JSON.stringify(habitaciones)
    );

    localStorage.setItem(
        "hotel_productos",
        JSON.stringify(productos)
    );

    localStorage.setItem(
        "hotel_reservas",
        JSON.stringify(reservas)
    );

    localStorage.setItem(
        "hotel_consumos",
        JSON.stringify(consumos)
    );

    localStorage.setItem(
        "hotel_pagos",
        JSON.stringify(pagos)
    );

    localStorage.setItem(
        "hotel_historial",
        JSON.stringify(historial)
    );

    localStorage.setItem(
        "hotel_aperturas_caja",
        JSON.stringify(aperturasCaja)
    );
}


/* =========================================================
   FECHAS
========================================================= */

function obtenerFechaHoy() {

    const fecha =
        new Date();

    const anio =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            fecha.getDate()
        ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


function fechaLocalDesdeISO(fechaISO) {

    if (!fechaISO) {
        return null;
    }

    const partes =
        fechaISO.split("-");

    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2]),
        12,
        0,
        0
    );
}


function fechaLocalYYYYMMDD(fecha) {

    const f =
        new Date(fecha);

    const anio =
        f.getFullYear();

    const mes =
        String(
            f.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            f.getDate()
        ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


function formatearFecha(fechaISO) {

    if (!fechaISO) {
        return "-";
    }

    const fecha =
        fechaLocalDesdeISO(
            fechaISO
        );

    return fecha.toLocaleDateString(
        "es-PE"
    );
}


function formatearFechaHora(fechaISO) {

    if (!fechaISO) {
        return "-";
    }

    return new Date(
        fechaISO
    ).toLocaleString(
        "es-PE"
    );
}


function formatearHora(fechaISO) {

    if (!fechaISO) {
        return "-";
    }

    return new Date(
        fechaISO
    ).toLocaleTimeString(
        "es-PE",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function sumarDias(
    fechaISO,
    dias
) {

    const fecha =
        fechaLocalDesdeISO(
            fechaISO
        );

    fecha.setDate(
        fecha.getDate() +
        Number(dias)
    );

    return fechaLocalYYYYMMDD(
        fecha
    );
}


function calcularNoches(
    entrada,
    salida
) {

    if (
        !entrada ||
        !salida
    ) {
        return 0;
    }

    const inicio =
        fechaLocalDesdeISO(
            entrada
        );

    const fin =
        fechaLocalDesdeISO(
            salida
        );

    const diferencia =
        fin.getTime() -
        inicio.getTime();

    return Math.max(
        1,
        Math.round(
            diferencia /
            86400000
        )
    );
}


/* =========================================================
   DINERO
========================================================= */

function dinero(valor) {

    return new Intl.NumberFormat(
        "es-PE",
        {
            style: "currency",
            currency: "PEN"
        }
    ).format(
        Number(valor || 0)
    );
}


/* =========================================================
   SEGURIDAD TEXTO
========================================================= */

function escaparHTML(texto) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        texto ?? "";

    return div.innerHTML;
}


/* =========================================================
   GENERAR ID
========================================================= */

function generarId(lista) {

    if (!lista.length) {
        return 1;
    }

    return (
        Math.max(
            ...lista.map(
                item =>
                    Number(item.id) || 0
            )
        ) + 1
    );
}


/* =========================================================
   MOSTRAR FECHA
========================================================= */

function mostrarFecha() {

    const elemento =
        document.getElementById(
            "fechaActual"
        );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        new Date().toLocaleDateString(
            "es-PE",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}


/* =========================================================
   CONFIGURAR FECHAS
========================================================= */

function configurarFechas() {

    const hoy =
        obtenerFechaHoy();

    const fechaReserva =
        document.getElementById(
            "reservaEntrada"
        );

    const fechaCaja =
        document.getElementById(
            "fechaCaja"
        );

    const checkinEntrada =
        document.getElementById(
            "checkinEntrada"
        );

    if (
        fechaReserva &&
        !fechaReserva.value
    ) {
        fechaReserva.value = hoy;
    }

    if (
        fechaCaja &&
        !fechaCaja.value
    ) {
        fechaCaja.value = hoy;
    }

    if (
        checkinEntrada &&
        !checkinEntrada.value
    ) {
        checkinEntrada.value = hoy;
    }
}


/* =========================================================
   MODALES
========================================================= */

function abrirModal(id) {

    const modal =
        document.getElementById(
            id
        );

    if (!modal) {
        return;
    }

    modal.classList.add(
        "activo"
    );
}


function cerrarModal(id) {

    const modal =
        document.getElementById(
            id
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "activo"
    );
}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function mostrarSeccion(
    nombre
) {

    document
        .querySelectorAll(
            ".seccion"
        )
        .forEach(
            seccion =>
                seccion.classList.remove(
                    "activa"
                )
        );


    const seccion =
        document.getElementById(
            nombre
        );

    if (seccion) {

        seccion.classList.add(
            "activa"
        );
    }


    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            boton =>
                boton.classList.remove(
                    "activo"
                )
        );


    const boton =
        document.querySelector(
            `[data-seccion="${nombre}"]`
        );

    if (boton) {

        boton.classList.add(
            "activo"
        );
    }


    renderTodo();
}


/* =========================================================
   REGISTRO DE MOVIMIENTOS
========================================================= */

function registrarMovimiento(
    tipo,
    referencia,
    detalle
) {

    historial.unshift({

        id:
            generarId(
                historial
            ),

        tipo,

        referencia:
            referencia || "",

        detalle:
            detalle || "",

        fecha:
            new Date().toISOString()
    });


    guardarDatos();
}


/* =========================================================
   ACTUALIZAR ESTADOS
========================================================= */

function actualizarEstadosAutomaticos() {

    habitaciones.forEach(
        habitacion => {

            const ocupada =
                reservas.some(
                    reserva =>
                        Number(
                            reserva.habitacionId
                        ) ===
                            Number(
                                habitacion.id
                            )
                        &&
                        reserva.estado ===
                            "OCUPADA"
                );


            if (ocupada) {

                habitacion.estado =
                    "OCUPADA";

            } else if (
                habitacion.estado ===
                "OCUPADA"
            ) {

                habitacion.estado =
                    "DISPONIBLE";
            }
        }
    );


    guardarDatos();
}


/* =========================================================
   HABITACIONES
========================================================= */

function abrirModalHabitacion(
    id = null
) {

    document.getElementById(
        "habitacionEditandoId"
    ).value = "";

    document.getElementById(
        "numeroHabitacion"
    ).value = "";

    document.getElementById(
        "tipoHabitacion"
    ).value = "Simple";

    document.getElementById(
        "precioHabitacion"
    ).value = "";

    document.getElementById(
        "precioHoraHabitacion"
    ).value = "";

    document.getElementById(
        "estadoHabitacion"
    ).value =
        "DISPONIBLE";

    document.getElementById(
        "tituloModalHabitacion"
    ).textContent =
        "Nueva habitación";


    if (id !== null) {

        const habitacion =
            habitaciones.find(
                h =>
                    Number(h.id) ===
                    Number(id)
            );


        if (!habitacion) {
            return;
        }


        document.getElementById(
            "tituloModalHabitacion"
        ).textContent =
            "Editar habitación";


        document.getElementById(
            "habitacionEditandoId"
        ).value =
            habitacion.id;


        document.getElementById(
            "numeroHabitacion"
        ).value =
            habitacion.numero;


        document.getElementById(
            "tipoHabitacion"
        ).value =
            habitacion.tipo;


        document.getElementById(
            "precioHabitacion"
        ).value =
            habitacion.precio;


        document.getElementById(
            "precioHoraHabitacion"
        ).value =
            habitacion.precioHora;


        document.getElementById(
            "estadoHabitacion"
        ).value =
            habitacion.estado ===
            "OCUPADA"
                ? "DISPONIBLE"
                : habitacion.estado;
    }


    abrirModal(
        "modalHabitacion"
    );
}
/* =========================================================
   GUARDAR HABITACIÓN
========================================================= */

function guardarHabitacion() {

    const id =
        Number(
            document.getElementById(
                "habitacionEditandoId"
            ).value
        );

    const numero =
        document.getElementById(
            "numeroHabitacion"
        ).value.trim();

    const tipo =
        document.getElementById(
            "tipoHabitacion"
        ).value;

    const precio =
        Number(
            document.getElementById(
                "precioHabitacion"
            ).value
        );

    const precioHora =
        Number(
            document.getElementById(
                "precioHoraHabitacion"
            ).value
        );

    const estado =
        document.getElementById(
            "estadoHabitacion"
        ).value;


    if (!numero) {

        return notificar(
            "Ingresa el número de habitación."
        );
    }


    if (precio <= 0) {

        return notificar(
            "Ingresa un precio por día válido."
        );
    }


    if (precioHora <= 0) {

        return notificar(
            "Ingresa un precio por hora válido."
        );
    }


    const duplicada =
        habitaciones.some(
            h =>
                String(h.numero).toLowerCase() ===
                    numero.toLowerCase()
                &&
                Number(h.id) !== id
        );


    if (duplicada) {

        return notificar(
            "Ya existe una habitación con ese número."
        );
    }


    if (id) {

        const habitacion =
            habitaciones.find(
                h =>
                    Number(h.id) === id
            );


        if (!habitacion) {

            return;
        }


        const numeroAnterior =
            habitacion.numero;


        const estaOcupada =
            reservas.some(
                r =>
                    Number(
                        r.habitacionId
                    ) === id
                    &&
                    r.estado ===
                    "OCUPADA"
            );


        habitacion.numero =
            numero;

        habitacion.tipo =
            tipo;

        habitacion.precio =
            precio;

        habitacion.precioHora =
            precioHora;


        if (!estaOcupada) {

            habitacion.estado =
                estado;
        }


        registrarMovimiento(
            "HABITACIÓN EDITADA",
            numero,
            `Habitación ${numeroAnterior}. Día: ${dinero(precio)}. Hora: ${dinero(precioHora)}.`
        );


        notificar(
            "Habitación actualizada."
        );

    } else {

        habitaciones.push({

            id:
                generarId(
                    habitaciones
                ),

            numero,

            tipo,

            precio,

            precioHora,

            estado
        });


        registrarMovimiento(
            "HABITACIÓN CREADA",
            numero,
            `${tipo} - ${dinero(precio)} por día - ${dinero(precioHora)} por hora.`
        );


        notificar(
            "Habitación creada."
        );
    }


    guardarDatos();

    cerrarModal(
        "modalHabitacion"
    );

    renderTodo();
}


/* =========================================================
   ELIMINAR HABITACIÓN
========================================================= */

function eliminarHabitacion(id) {

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(id)
        );


    if (!habitacion) {

        return;
    }


    const tieneReservaActiva =
        reservas.some(
            r =>
                Number(
                    r.habitacionId
                ) ===
                    Number(id)
                &&
                (
                    r.estado ===
                    "OCUPADA"
                    ||
                    r.estado ===
                    "RESERVADA"
                )
        );


    if (tieneReservaActiva) {

        return notificar(
            "No puedes eliminar una habitación con una reserva activa."
        );
    }


    const confirmar =
        window.confirm(
            `¿Eliminar la habitación ${habitacion.numero}?`
        );


    if (!confirmar) {

        return;
    }


    habitaciones =
        habitaciones.filter(
            h =>
                Number(h.id) !==
                Number(id)
        );


    registrarMovimiento(
        "HABITACIÓN ELIMINADA",
        habitacion.numero,
        `${habitacion.tipo}`
    );


    guardarDatos();

    renderTodo();

    notificar(
        "Habitación eliminada."
    );
}


/* =========================================================
   CAMBIAR ESTADO HABITACIÓN
========================================================= */

function cambiarEstadoHabitacion(
    id,
    nuevoEstado
) {

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(id)
        );


    if (!habitacion) {

        return;
    }


    const ocupada =
        reservas.some(
            r =>
                Number(
                    r.habitacionId
                ) ===
                    Number(id)
                &&
                r.estado ===
                "OCUPADA"
        );


    if (ocupada) {

        return notificar(
            "La habitación está ocupada."
        );
    }


    habitacion.estado =
        nuevoEstado;


    registrarMovimiento(
        "ESTADO HABITACIÓN",
        habitacion.numero,
        `Nuevo estado: ${nuevoEstado}`
    );


    guardarDatos();

    renderTodo();
}


/* =========================================================
   FILTRO HABITACIONES
========================================================= */

function filtrarHabitaciones(
    filtro
) {

    filtroHabitacionActual =
        filtro || "TODAS";


    document
        .querySelectorAll(
            ".filtro-habitacion"
        )
        .forEach(
            boton =>
                boton.classList.remove(
                    "activo"
                )
        );


    if (event?.currentTarget) {

        event.currentTarget.classList.add(
            "activo"
        );
    }


    renderHabitaciones();
}


/* =========================================================
   INFORMACIÓN DE ESTADÍA POR HORAS
========================================================= */

function obtenerTiempoRestante(
    fechaHoraSalida
) {

    if (!fechaHoraSalida) {

        return "";
    }


    const ahora =
        Date.now();


    const fin =
        new Date(
            fechaHoraSalida
        ).getTime();


    let diferencia =
        fin - ahora;


    if (diferencia <= 0) {

        return "TIEMPO TERMINADO";
    }


    const minutosTotales =
        Math.ceil(
            diferencia /
            60000
        );


    const horas =
        Math.floor(
            minutosTotales / 60
        );


    const minutos =
        minutosTotales % 60;


    if (horas <= 0) {

        return `${minutos} min`;
    }


    return `${horas} h ${minutos} min`;
}


/* =========================================================
   CREAR TARJETA HABITACIÓN
========================================================= */

function crearTarjetaHabitacion(
    habitacion
) {

    const reservaOcupada =
        reservas.find(
            r =>
                Number(
                    r.habitacionId
                ) ===
                    Number(
                        habitacion.id
                    )
                &&
                r.estado ===
                "OCUPADA"
        );


    const reservaFutura =
        reservas
            .filter(
                r =>
                    Number(
                        r.habitacionId
                    ) ===
                        Number(
                            habitacion.id
                        )
                    &&
                    r.estado ===
                        "RESERVADA"
            )
            .sort(
                (a, b) =>
                    String(
                        a.entrada
                    ).localeCompare(
                        String(
                            b.entrada
                        )
                    )
            )[0];


    let informacionOcupacion =
        "";


    if (reservaOcupada) {

        if (
            reservaOcupada.tipoEstadia ===
            "HORAS"
        ) {

            const tiempo =
                obtenerTiempoRestante(
                    reservaOcupada.fechaHoraSalida
                );


            const terminado =
                tiempo ===
                "TIEMPO TERMINADO";


            informacionOcupacion = `
                <div class="info-ocupacion">
                    <strong>
                        ${escaparHTML(
                            reservaOcupada.nombre
                        )}
                    </strong>

                    <span>
                        ⏱️ POR HORAS
                    </span>

                    <span>
                        Entrada:
                        ${formatearHora(
                            reservaOcupada.fechaHoraEntrada
                        )}
                    </span>

                    <span>
                        Termina:
                        ${formatearHora(
                            reservaOcupada.fechaHoraSalida
                        )}
                    </span>

                    <span class="${
                        terminado
                            ? "tiempo-terminado"
                            : ""
                    }">
                        ${
                            terminado
                                ? "🔴 TIEMPO TERMINADO"
                                : `⏳ Faltan ${tiempo}`
                        }
                    </span>
                </div>
            `;

        } else {

            informacionOcupacion = `
                <div class="info-ocupacion">
                    <strong>
                        ${escaparHTML(
                            reservaOcupada.nombre
                        )}
                    </strong>

                    <span>
                        📅 POR DÍA
                    </span>

                    <span>
                        Salida:
                        ${formatearFecha(
                            reservaOcupada.salida
                        )}
                    </span>
                </div>
            `;
        }

    } else if (reservaFutura) {

        informacionOcupacion = `
            <div class="reserva-proxima">
                <span>
                    Próxima reserva
                </span>

                <strong>
                    ${escaparHTML(
                        reservaFutura.nombre
                    )}
                </strong>

                <small>
                    ${formatearFecha(
                        reservaFutura.entrada
                    )}
                </small>
            </div>
        `;
    }


    const precioHora =
        Number(
            habitacion.precioHora || 0
        );


    const card =
        document.createElement(
            "div"
        );


    card.className =
        `habitacion-card estado-${String(
            habitacion.estado
        ).toLowerCase()}`;


    card.innerHTML = `
        <div class="habitacion-card-superior">

            <div>
                <span class="habitacion-etiqueta">
                    HABITACIÓN
                </span>

                <h3>
                    ${escaparHTML(
                        habitacion.numero
                    )}
                </h3>
            </div>

            <span class="estado-habitacion">
                ${escaparHTML(
                    habitacion.estado
                )}
            </span>

        </div>

        <div class="habitacion-tipo">
            ${escaparHTML(
                habitacion.tipo
            )}
        </div>

        <div class="precio-habitacion">

            <div>
                <strong>
                    ${dinero(
                        habitacion.precio
                    )}
                </strong>
                <span>
                    / día
                </span>
            </div>

            <div>
                <strong>
                    ${dinero(
                        precioHora
                    )}
                </strong>
                <span>
                    / hora
                </span>
            </div>

        </div>

        ${informacionOcupacion}

        <div class="acciones-habitacion">

            <button
                class="btn-secundario"
                onclick="abrirModalHabitacion(${habitacion.id})"
            >
                Editar
            </button>

            ${
                habitacion.estado ===
                "DISPONIBLE"
                    ?
                    `
                    <button
                        class="btn-principal"
                        onclick="abrirCheckInDirecto(${habitacion.id})"
                    >
                        Check-in
                    </button>
                    `
                    :
                    ""
            }

            ${
                habitacion.estado ===
                "LIMPIEZA"
                    ?
                    `
                    <button
                        class="btn-principal"
                        onclick="cambiarEstadoHabitacion(${habitacion.id}, 'DISPONIBLE')"
                    >
                        Habitación lista
                    </button>
                    `
                    :
                    ""
            }

            ${
                reservaOcupada
                    ?
                    `
                    <button
                        class="btn-secundario"
                        onclick="abrirCuenta(${reservaOcupada.id})"
                    >
                        Cuenta
                    </button>
                    `
                    :
                    ""
            }

            ${
                !reservaOcupada
                    ?
                    `
                    <button
                        class="btn-peligro"
                        onclick="eliminarHabitacion(${habitacion.id})"
                    >
                        Eliminar
                    </button>
                    `
                    :
                    ""
            }

        </div>
    `;


    return card;
}


/* =========================================================
   RENDER HABITACIONES
========================================================= */

function renderHabitaciones() {

    const contenedor =
        document.getElementById(
            "habitacionesGrid"
        );


    if (!contenedor) {

        return;
    }


    contenedor.innerHTML = "";


    let lista =
        [...habitaciones];


    if (
        filtroHabitacionActual !==
        "TODAS"
    ) {

        lista =
            lista.filter(
                h =>
                    h.estado ===
                    filtroHabitacionActual
            );
    }


    lista.sort(
        (a, b) =>
            String(
                a.numero
            ).localeCompare(
                String(
                    b.numero
                ),
                undefined,
                {
                    numeric: true
                }
            )
    );


    if (!lista.length) {

        contenedor.innerHTML = `
            <div class="sin-datos">
                No hay habitaciones para mostrar.
            </div>
        `;

        return;
    }


    lista.forEach(
        habitacion => {

            contenedor.appendChild(
                crearTarjetaHabitacion(
                    habitacion
                )
            );
        }
    );
}


/* =========================================================
   HABITACIONES EN INICIO
========================================================= */

function renderHabitacionesInicio() {

    const contenedor =
        document.getElementById(
            "habitacionesInicio"
        );


    if (!contenedor) {

        return;
    }


    contenedor.innerHTML = "";


    habitaciones
        .slice()
        .sort(
            (a, b) =>
                String(
                    a.numero
                ).localeCompare(
                    String(
                        b.numero
                    ),
                    undefined,
                    {
                        numeric: true
                    }
                )
        )
        .forEach(
            habitacion => {

                contenedor.appendChild(
                    crearTarjetaHabitacion(
                        habitacion
                    )
                );
            }
        );
}


/* =========================================================
   RESUMEN GENERAL
========================================================= */

function renderResumen() {

    const totalHabitaciones =
        habitaciones.length;


    const disponibles =
        habitaciones.filter(
            h =>
                h.estado ===
                "DISPONIBLE"
        ).length;


    const ocupadas =
        habitaciones.filter(
            h =>
                h.estado ===
                "OCUPADA"
        ).length;


    const limpieza =
        habitaciones.filter(
            h =>
                h.estado ===
                "LIMPIEZA"
        ).length;


    const mantenimiento =
        habitaciones.filter(
            h =>
                h.estado ===
                "MANTENIMIENTO"
        ).length;


    const asignar =
        (
            id,
            valor
        ) => {

            const elemento =
                document.getElementById(
                    id
                );

            if (elemento) {

                elemento.textContent =
                    valor;
            }
        };


    asignar(
        "totalHabitaciones",
        totalHabitaciones
    );

    asignar(
        "habitacionesDisponibles",
        disponibles
    );

    asignar(
        "habitacionesOcupadas",
        ocupadas
    );

    asignar(
        "habitacionesLimpieza",
        limpieza
    );

    asignar(
        "habitacionesMantenimiento",
        mantenimiento
    );
}


/* =========================================================
   DISPONIBILIDAD POR FECHAS
========================================================= */

function habitacionDisponibleParaFechas(
    habitacionId,
    entrada,
    salida,
    ignorarReservaId = null
) {

    const inicioNueva =
        fechaLocalDesdeISO(
            entrada
        );


    const finNueva =
        fechaLocalDesdeISO(
            salida
        );


    return !reservas.some(
        reserva => {

            if (
                Number(
                    reserva.habitacionId
                ) !==
                    Number(
                        habitacionId
                    )
            ) {

                return false;
            }


            if (
                ignorarReservaId &&
                Number(
                    reserva.id
                ) ===
                    Number(
                        ignorarReservaId
                    )
            ) {

                return false;
            }


            if (
                reserva.estado ===
                    "CANCELADA"
                ||
                reserva.estado ===
                    "FINALIZADA"
            ) {

                return false;
            }


            /*
             * Una estadía POR HORAS que está ocupada
             * también bloquea la habitación.
             */

            if (
                reserva.tipoEstadia ===
                    "HORAS"
                &&
                reserva.estado ===
                    "OCUPADA"
            ) {

                return true;
            }


            if (
                !reserva.entrada ||
                !reserva.salida
            ) {

                return false;
            }


            const inicioExistente =
                fechaLocalDesdeISO(
                    reserva.entrada
                );


            const finExistente =
                fechaLocalDesdeISO(
                    reserva.salida
                );


            return (
                inicioNueva <
                    finExistente
                &&
                finNueva >
                    inicioExistente
            );
        }
    );
}


/* =========================================================
   DISPONIBILIDAD POR HORAS
========================================================= */

function habitacionDisponibleParaHoras(
    habitacionId,
    inicio,
    fin
) {

    return !reservas.some(
        reserva => {

            if (
                Number(
                    reserva.habitacionId
                ) !==
                    Number(
                        habitacionId
                    )
            ) {

                return false;
            }


            if (
                reserva.estado ===
                    "CANCELADA"
                ||
                reserva.estado ===
                    "FINALIZADA"
            ) {

                return false;
            }


            if (
                reserva.tipoEstadia ===
                    "HORAS"
                &&
                reserva.fechaHoraEntrada
                &&
                reserva.fechaHoraSalida
            ) {

                const inicioExistente =
                    new Date(
                        reserva.fechaHoraEntrada
                    );


                const finExistente =
                    new Date(
                        reserva.fechaHoraSalida
                    );


                return (
                    inicio <
                        finExistente
                    &&
                    fin >
                        inicioExistente
                );
            }


            /*
             * Para una reserva normal por día,
             * se protege el día reservado.
             */

            if (
                reserva.entrada &&
                reserva.salida
            ) {

                const inicioExistente =
                    new Date(
                        `${reserva.entrada}T00:00:00`
                    );


                const finExistente =
                    new Date(
                        `${reserva.salida}T00:00:00`
                    );


                return (
                    inicio <
                        finExistente
                    &&
                    fin >
                        inicioExistente
                );
            }


            return false;
        }
    );
}
/* =========================================================
   CHECK-IN DIRECTO
   POR DÍA / POR HORAS
========================================================= */

function abrirCheckInDirecto(habitacionId = null) {

    const nombre =
        document.getElementById("checkinNombre");

    const dni =
        document.getElementById("checkinDni");

    const telefono =
        document.getElementById("checkinTelefono");

    const entrada =
        document.getElementById("checkinEntrada");

    const noches =
        document.getElementById("checkinNoches");

    const adultos =
        document.getElementById("checkinAdultos");

    const ninos =
        document.getElementById("checkinNinos");

    const tipoEstadia =
        document.getElementById("checkinTipoEstadia");

    const horaEntrada =
        document.getElementById("checkinHoraEntrada");

    const horas =
        document.getElementById("checkinHoras");

    const precio =
        document.getElementById("checkinPrecio");


    if (nombre) nombre.value = "";
    if (dni) dni.value = "";
    if (telefono) telefono.value = "";

    if (entrada) {
        entrada.value = obtenerFechaHoy();
    }

    if (noches) {
        noches.value = 1;
    }

    if (adultos) {
        adultos.value = 1;
    }

    if (ninos) {
        ninos.value = 0;
    }

    if (tipoEstadia) {
        tipoEstadia.value = "DIA";
    }

    if (horaEntrada) {

        const ahora =
            new Date();

        horaEntrada.value =
            `${String(
                ahora.getHours()
            ).padStart(2, "0")}:${String(
                ahora.getMinutes()
            ).padStart(2, "0")}`;
    }

    if (horas) {
        horas.value = 1;
    }

    if (precio) {
        precio.value = "";
    }


    cambiarTipoEstadiaCheckIn();

    actualizarHabitacionesCheckIn(
        habitacionId
    );


    abrirModal(
        "modalCheckIn"
    );
}


/* =========================================================
   CAMBIAR TIPO DE ESTADÍA
========================================================= */

function cambiarTipoEstadiaCheckIn() {

    const tipo =
        document.getElementById(
            "checkinTipoEstadia"
        )?.value || "DIA";


    const grupoDias =
        document.getElementById(
            "grupoCheckinNoches"
        );


    const grupoHora =
        document.getElementById(
            "grupoCheckinHoraEntrada"
        );


    const grupoHoras =
        document.getElementById(
            "grupoCheckinHoras"
        );


    const grupoSalidaHora =
        document.getElementById(
            "grupoCheckinHoraSalida"
        );


    if (tipo === "HORAS") {

        if (grupoDias) {
            grupoDias.style.display =
                "none";
        }

        if (grupoHora) {
            grupoHora.style.display =
                "";
        }

        if (grupoHoras) {
            grupoHoras.style.display =
                "";
        }

        if (grupoSalidaHora) {
            grupoSalidaHora.style.display =
                "";
        }

    } else {

        if (grupoDias) {
            grupoDias.style.display =
                "";
        }

        if (grupoHora) {
            grupoHora.style.display =
                "none";
        }

        if (grupoHoras) {
            grupoHoras.style.display =
                "none";
        }

        if (grupoSalidaHora) {
            grupoSalidaHora.style.display =
                "none";
        }
    }


    actualizarHabitacionesCheckIn();

    cargarPrecioCheckIn();

    calcularCheckIn();
}


/* =========================================================
   ACTUALIZAR HABITACIONES DEL CHECK-IN
========================================================= */

function actualizarHabitacionesCheckIn(
    habitacionSeleccionada = null
) {

    const select =
        document.getElementById(
            "checkinHabitacion"
        );


    if (!select) {
        return;
    }


    const seleccionAnterior =
        habitacionSeleccionada ||
        Number(select.value) ||
        null;


    const tipoEstadia =
        document.getElementById(
            "checkinTipoEstadia"
        )?.value || "DIA";


    const entrada =
        document.getElementById(
            "checkinEntrada"
        )?.value ||
        obtenerFechaHoy();


    const noches =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "checkinNoches"
                )?.value || 1
            )
        );


    const horaEntrada =
        document.getElementById(
            "checkinHoraEntrada"
        )?.value ||
        "12:00";


    const cantidadHoras =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "checkinHoras"
                )?.value || 1
            )
        );


    select.innerHTML = `
        <option value="">
            Seleccionar habitación
        </option>
    `;


    habitaciones
        .filter(
            habitacion =>
                habitacion.estado ===
                "DISPONIBLE"
        )
        .sort(
            (a, b) =>
                String(
                    a.numero
                ).localeCompare(
                    String(
                        b.numero
                    ),
                    undefined,
                    {
                        numeric: true
                    }
                )
        )
        .forEach(
            habitacion => {

                let disponible =
                    true;


                if (
                    tipoEstadia ===
                    "HORAS"
                ) {

                    const inicio =
                        new Date(
                            `${entrada}T${horaEntrada}:00`
                        );


                    const fin =
                        new Date(
                            inicio.getTime() +
                            (
                                cantidadHoras *
                                60 *
                                60 *
                                1000
                            )
                        );


                    disponible =
                        habitacionDisponibleParaHoras(
                            habitacion.id,
                            inicio,
                            fin
                        );

                } else {

                    const salida =
                        sumarDias(
                            entrada,
                            noches
                        );


                    disponible =
                        habitacionDisponibleParaFechas(
                            habitacion.id,
                            entrada,
                            salida
                        );
                }


                if (!disponible) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    habitacion.id;


                if (
                    tipoEstadia ===
                    "HORAS"
                ) {

                    option.textContent =
                        `Habitación ${habitacion.numero} - ${habitacion.tipo} - ${dinero(habitacion.precioHora)} / hora`;

                } else {

                    option.textContent =
                        `Habitación ${habitacion.numero} - ${habitacion.tipo} - ${dinero(habitacion.precio)} / día`;
                }


                select.appendChild(
                    option
                );
            }
        );


    if (
        seleccionAnterior &&
        [...select.options].some(
            option =>
                Number(option.value) ===
                Number(
                    seleccionAnterior
                )
        )
    ) {

        select.value =
            seleccionAnterior;
    }


    cargarPrecioCheckIn();

    calcularCheckIn();
}


/* =========================================================
   ACTUALIZAR HABITACIONES SIN REINICIAR PRECIO
========================================================= */

function actualizarHabitacionesCheckInSinRecursion() {

    const select =
        document.getElementById(
            "checkinHabitacion"
        );


    if (!select) {
        return;
    }


    const seleccionAnterior =
        Number(
            select.value
        ) || null;


    const tipoEstadia =
        document.getElementById(
            "checkinTipoEstadia"
        )?.value || "DIA";


    const entrada =
        document.getElementById(
            "checkinEntrada"
        )?.value ||
        obtenerFechaHoy();


    const noches =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "checkinNoches"
                )?.value || 1
            )
        );


    const horaEntrada =
        document.getElementById(
            "checkinHoraEntrada"
        )?.value ||
        "12:00";


    const cantidadHoras =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "checkinHoras"
                )?.value || 1
            )
        );


    select.innerHTML = `
        <option value="">
            Seleccionar habitación
        </option>
    `;


    habitaciones.forEach(
        habitacion => {

            if (
                habitacion.estado !==
                "DISPONIBLE"
            ) {
                return;
            }


            let disponible =
                true;


            if (
                tipoEstadia ===
                "HORAS"
            ) {

                const inicio =
                    new Date(
                        `${entrada}T${horaEntrada}:00`
                    );


                const fin =
                    new Date(
                        inicio.getTime() +
                        (
                            cantidadHoras *
                            3600000
                        )
                    );


                disponible =
                    habitacionDisponibleParaHoras(
                        habitacion.id,
                        inicio,
                        fin
                    );

            } else {

                const salida =
                    sumarDias(
                        entrada,
                        noches
                    );


                disponible =
                    habitacionDisponibleParaFechas(
                        habitacion.id,
                        entrada,
                        salida
                    );
            }


            if (!disponible) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                habitacion.id;


            option.textContent =
                tipoEstadia === "HORAS"
                    ?
                    `Habitación ${habitacion.numero} - ${dinero(habitacion.precioHora)} / hora`
                    :
                    `Habitación ${habitacion.numero} - ${dinero(habitacion.precio)} / día`;


            select.appendChild(
                option
            );
        }
    );


    if (
        seleccionAnterior &&
        [...select.options].some(
            option =>
                Number(option.value) ===
                seleccionAnterior
        )
    ) {

        select.value =
            seleccionAnterior;
    }


    calcularCheckIn();
}


/* =========================================================
   CARGAR PRECIO DEL CHECK-IN
========================================================= */

function cargarPrecioCheckIn() {

    const habitacionId =
        Number(
            document.getElementById(
                "checkinHabitacion"
            )?.value
        );


    const precioInput =
        document.getElementById(
            "checkinPrecio"
        );


    if (!precioInput) {
        return;
    }


    if (!habitacionId) {

        precioInput.value = "";

        calcularCheckIn();

        return;
    }


    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                habitacionId
        );


    if (!habitacion) {
        return;
    }


    const tipo =
        document.getElementById(
            "checkinTipoEstadia"
        )?.value || "DIA";


    if (tipo === "HORAS") {

        precioInput.value =
            Number(
                habitacion.precioHora || 0
            ).toFixed(2);

    } else {

        precioInput.value =
            Number(
                habitacion.precio || 0
            ).toFixed(2);
    }


    calcularCheckIn();
}


/* =========================================================
   CALCULAR CHECK-IN
========================================================= */

function calcularCheckIn() {

    const tipo =
        document.getElementById(
            "checkinTipoEstadia"
        )?.value || "DIA";


    const precio =
        Number(
            document.getElementById(
                "checkinPrecio"
            )?.value || 0
        );


    const totalElemento =
        document.getElementById(
            "checkinTotal"
        );


    const salidaElemento =
        document.getElementById(
            "checkinHoraSalida"
        );


    let total = 0;


    if (
        tipo ===
        "HORAS"
    ) {

        const horas =
            Math.max(
                1,
                Number(
                    document.getElementById(
                        "checkinHoras"
                    )?.value || 1
                )
            );


        total =
            precio * horas;


        const fecha =
            document.getElementById(
                "checkinEntrada"
            )?.value;


        const hora =
            document.getElementById(
                "checkinHoraEntrada"
            )?.value;


        if (
            fecha &&
            hora &&
            salidaElemento
        ) {

            const inicio =
                new Date(
                    `${fecha}T${hora}:00`
                );


            const fin =
                new Date(
                    inicio.getTime() +
                    (
                        horas *
                        3600000
                    )
                );


            salidaElemento.value =
                fin.toLocaleString(
                    "es-PE",
                    {
                        dateStyle:
                            "short",

                        timeStyle:
                            "short"
                    }
                );
        }

    } else {

        const dias =
            Math.max(
                1,
                Number(
                    document.getElementById(
                        "checkinNoches"
                    )?.value || 1
                )
            );


        total =
            precio * dias;


        if (salidaElemento) {

            salidaElemento.value = "";
        }
    }


    if (totalElemento) {

        totalElemento.textContent =
            dinero(total);
    }


    return total;
}


/* =========================================================
   GUARDAR CHECK-IN DIRECTO
========================================================= */

function guardarCheckInDirecto() {

    const nombre =
        document.getElementById(
            "checkinNombre"
        )?.value.trim();


    const dni =
        document.getElementById(
            "checkinDni"
        )?.value.trim();


    const telefono =
        document.getElementById(
            "checkinTelefono"
        )?.value.trim();


    const habitacionId =
        Number(
            document.getElementById(
                "checkinHabitacion"
            )?.value
        );


    const entrada =
        document.getElementById(
            "checkinEntrada"
        )?.value;


    const adultos =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "checkinAdultos"
                )?.value || 1
            )
        );


    const ninos =
        Math.max(
            0,
            Number(
                document.getElementById(
                    "checkinNinos"
                )?.value || 0
            )
        );


    const tipoEstadia =
        document.getElementById(
            "checkinTipoEstadia"
        )?.value || "DIA";


    const precioAplicado =
        Number(
            document.getElementById(
                "checkinPrecio"
            )?.value || 0
        );


    if (!nombre) {

        return notificar(
            "Ingresa el nombre del huésped."
        );
    }


    if (!habitacionId) {

        return notificar(
            "Selecciona una habitación."
        );
    }


    if (!entrada) {

        return notificar(
            "Selecciona la fecha de entrada."
        );
    }


    if (
        precioAplicado <= 0
    ) {

        return notificar(
            "Ingresa un precio válido."
        );
    }


    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                habitacionId
        );


    if (!habitacion) {

        return notificar(
            "Habitación no encontrada."
        );
    }


    let salida = entrada;

    let total = 0;

    let horas = 0;

    let fechaHoraEntrada = null;

    let fechaHoraSalida = null;

    let noches = 1;


    /* =============================================
       CHECK-IN POR HORAS
    ============================================= */

    if (
        tipoEstadia ===
        "HORAS"
    ) {

        horas =
            Math.max(
                1,
                Number(
                    document.getElementById(
                        "checkinHoras"
                    )?.value || 1
                )
            );


        const horaEntrada =
            document.getElementById(
                "checkinHoraEntrada"
            )?.value;


        if (!horaEntrada) {

            return notificar(
                "Selecciona la hora de entrada."
            );
        }


        const inicio =
            new Date(
                `${entrada}T${horaEntrada}:00`
            );


        const fin =
            new Date(
                inicio.getTime() +
                (
                    horas *
                    3600000
                )
            );


        if (
            isNaN(
                inicio.getTime()
            )
        ) {

            return notificar(
                "La fecha u hora de entrada no es válida."
            );
        }


        const disponible =
            habitacionDisponibleParaHoras(
                habitacionId,
                inicio,
                fin
            );


        if (!disponible) {

            return notificar(
                "La habitación no está disponible en ese horario."
            );
        }


        fechaHoraEntrada =
            inicio.toISOString();


        fechaHoraSalida =
            fin.toISOString();


        salida =
            fechaLocalYYYYMMDD(
                fin
            );


        total =
            precioAplicado *
            horas;


        noches = 0;

    } else {

        /* =============================================
           CHECK-IN POR DÍA
        ============================================= */

        noches =
            Math.max(
                1,
                Number(
                    document.getElementById(
                        "checkinNoches"
                    )?.value || 1
                )
            );


        salida =
            sumarDias(
                entrada,
                noches
            );


        const disponible =
            habitacionDisponibleParaFechas(
                habitacionId,
                entrada,
                salida
            );


        if (!disponible) {

            return notificar(
                "La habitación no está disponible para esas fechas."
            );
        }


        total =
            precioAplicado *
            noches;
    }


    const nuevaReserva = {

        id:
            generarId(
                reservas
            ),

        nombre,

        dni,

        telefono,

        habitacionId,

        entrada,

        salida,

        noches,

        adultos,

        ninos,

        total,

        estado:
            "OCUPADA",

        tipoEstadia,

        horas,

        precioAplicado,

        fechaHoraEntrada,

        fechaHoraSalida,

        aviso15:
            false,

        avisoFin:
            false,

        creadoEn:
            new Date().toISOString()
    };


    reservas.push(
        nuevaReserva
    );


    habitacion.estado =
        "OCUPADA";


    if (
        tipoEstadia ===
        "HORAS"
    ) {

        registrarMovimiento(
            "CHECK-IN",
            habitacion.numero,
            `${nombre} - POR HORAS - ${horas} hora(s) - termina ${formatearHora(fechaHoraSalida)} - ${dinero(total)}`
        );

    } else {

        registrarMovimiento(
            "CHECK-IN",
            habitacion.numero,
            `${nombre} - POR DÍA - ${noches} día(s) - ${dinero(total)}`
        );
    }


    guardarDatos();


    cerrarModal(
        "modalCheckIn"
    );


    renderTodo();


    if (
        tipoEstadia ===
        "HORAS"
    ) {

        notificar(
            `Check-in registrado. Habitación ${habitacion.numero}. Termina a las ${formatearHora(fechaHoraSalida)}.`
        );

    } else {

        notificar(
            `Check-in registrado en la habitación ${habitacion.numero}.`
        );
    }
}


/* =========================================================
   CONTROL AUTOMÁTICO DE ESTADÍAS POR HORAS
========================================================= */

function controlarEstadiasPorHora() {

    const ahora =
        Date.now();


    let huboCambios =
        false;


    reservas.forEach(
        reserva => {

            if (
                reserva.estado !==
                    "OCUPADA"
                ||
                reserva.tipoEstadia !==
                    "HORAS"
                ||
                !reserva.fechaHoraSalida
            ) {

                return;
            }


            const fin =
                new Date(
                    reserva.fechaHoraSalida
                ).getTime();


            const diferencia =
                fin - ahora;


            const minutos =
                Math.ceil(
                    diferencia /
                    60000
                );


            const habitacion =
                habitaciones.find(
                    h =>
                        Number(h.id) ===
                        Number(
                            reserva.habitacionId
                        )
                );


            const numero =
                habitacion
                    ? habitacion.numero
                    : "";


            /*
             * AVISO CUANDO FALTAN 15 MINUTOS
             */

            if (
                diferencia > 0
                &&
                minutos <= 15
                &&
                !reserva.aviso15
            ) {

                reserva.aviso15 =
                    true;


                huboCambios =
                    true;


                notificar(
                    `⚠️ Habitación ${numero}: faltan ${minutos} minutos para terminar.`
                );
            }


            /*
             * AVISO CUANDO TERMINA EL TIEMPO
             */

            if (
                diferencia <= 0
                &&
                !reserva.avisoFin
            ) {

                reserva.avisoFin =
                    true;


                huboCambios =
                    true;


                notificar(
                    `🔴 Habitación ${numero}: el tiempo terminó.`
                );


                registrarMovimiento(
                    "TIEMPO TERMINADO",
                    numero,
                    `${reserva.nombre} terminó su tiempo de estadía por horas.`
                );
            }
        }
    );


    if (huboCambios) {

        guardarDatos();
    }


    /*
     * Solo actualizamos las habitaciones.
     * NO hacemos checkout automático.
     */

    renderHabitaciones();

    renderHabitacionesInicio();
}


/* =========================================================
   INICIAR RELOJ DE ESTADÍAS POR HORAS
========================================================= */

function iniciarControlEstadiasPorHora() {

    controlarEstadiasPorHora();


    setInterval(
        () => {

            controlarEstadiasPorHora();

        },
        60000
    );
}


/* =========================================================
   ACTUALIZAR CÁLCULO AL CAMBIAR HORAS / DÍAS
========================================================= */

function cambioDatosCheckIn() {

    actualizarHabitacionesCheckInSinRecursion();

    calcularCheckIn();
}


/* =========================================================
   CAMBIAR HABITACIÓN DEL CHECK-IN
========================================================= */

function cambiarHabitacionCheckIn() {

    cargarPrecioCheckIn();

    calcularCheckIn();
}
/* =========================================================
   RESERVAS
========================================================= */

function abrirModalReserva(id = null) {

    const idInput =
        document.getElementById("reservaEditandoId");

    const nombre =
        document.getElementById("reservaNombre");

    const dni =
        document.getElementById("reservaDni");

    const telefono =
        document.getElementById("reservaTelefono");

    const entrada =
        document.getElementById("reservaEntrada");

    const salida =
        document.getElementById("reservaSalida");

    const adultos =
        document.getElementById("reservaAdultos");

    const ninos =
        document.getElementById("reservaNinos");

    const titulo =
        document.getElementById("tituloModalReserva");


    if (idInput) idInput.value = "";
    if (nombre) nombre.value = "";
    if (dni) dni.value = "";
    if (telefono) telefono.value = "";

    if (entrada) {
        entrada.value = obtenerFechaHoy();
    }

    if (salida) {
        salida.value =
            sumarDias(
                obtenerFechaHoy(),
                1
            );
    }

    if (adultos) adultos.value = 1;
    if (ninos) ninos.value = 0;

    if (titulo) {
        titulo.textContent =
            "Nueva reserva";
    }


    if (id !== null) {

        const reserva =
            reservas.find(
                r =>
                    Number(r.id) ===
                    Number(id)
            );


        if (!reserva) {

            return notificar(
                "Reserva no encontrada."
            );
        }


        if (
            reserva.estado ===
            "OCUPADA"
        ) {

            return notificar(
                "La reserva ya está ocupada. Edítala desde la cuenta de la habitación."
            );
        }


        if (
            reserva.estado ===
            "FINALIZADA" ||
            reserva.estado ===
            "CANCELADA"
        ) {

            return notificar(
                "Esta reserva ya no se puede editar."
            );
        }


        if (idInput) {
            idInput.value =
                reserva.id;
        }

        if (nombre) {
            nombre.value =
                reserva.nombre || "";
        }

        if (dni) {
            dni.value =
                reserva.dni || "";
        }

        if (telefono) {
            telefono.value =
                reserva.telefono || "";
        }

        if (entrada) {
            entrada.value =
                reserva.entrada || "";
        }

        if (salida) {
            salida.value =
                reserva.salida || "";
        }

        if (adultos) {
            adultos.value =
                Number(
                    reserva.adultos || 1
                );
        }

        if (ninos) {
            ninos.value =
                Number(
                    reserva.ninos || 0
                );
        }

        if (titulo) {
            titulo.textContent =
                "Editar reserva";
        }
    }


    actualizarHabitacionesReserva(
        id
    );

    calcularReserva();

    abrirModal(
        "modalReserva"
    );
}


/* =========================================================
   ACTUALIZAR HABITACIONES EN RESERVA
========================================================= */

function actualizarHabitacionesReserva(
    reservaId = null
) {

    const select =
        document.getElementById(
            "reservaHabitacion"
        );


    if (!select) {
        return;
    }


    const idEditando =
        Number(
            document.getElementById(
                "reservaEditandoId"
            )?.value ||
            reservaId ||
            0
        );


    const reservaEditando =
        reservas.find(
            r =>
                Number(r.id) ===
                idEditando
        );


    const seleccionAnterior =
        Number(
            select.value
        ) ||
        Number(
            reservaEditando?.habitacionId
        ) ||
        null;


    const entrada =
        document.getElementById(
            "reservaEntrada"
        )?.value;


    const salida =
        document.getElementById(
            "reservaSalida"
        )?.value;


    select.innerHTML = `
        <option value="">
            Seleccionar habitación
        </option>
    `;


    if (
        !entrada ||
        !salida
    ) {

        habitaciones.forEach(
            habitacion => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    habitacion.id;

                option.textContent =
                    `Habitación ${habitacion.numero} - ${habitacion.tipo} - ${dinero(habitacion.precio)} / día`;

                select.appendChild(
                    option
                );
            }
        );

        return;
    }


    habitaciones
        .slice()
        .sort(
            (a, b) =>
                String(a.numero)
                    .localeCompare(
                        String(b.numero),
                        undefined,
                        {
                            numeric: true
                        }
                    )
        )
        .forEach(
            habitacion => {

                const disponible =
                    habitacionDisponibleParaFechas(
                        habitacion.id,
                        entrada,
                        salida,
                        idEditando || null
                    );


                if (!disponible) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    habitacion.id;


                option.textContent =
                    `Habitación ${habitacion.numero} - ${habitacion.tipo} - ${dinero(habitacion.precio)} / día`;


                select.appendChild(
                    option
                );
            }
        );


    if (
        seleccionAnterior &&
        [...select.options].some(
            option =>
                Number(option.value) ===
                Number(seleccionAnterior)
        )
    ) {

        select.value =
            seleccionAnterior;
    }


    calcularReserva();
}


/* =========================================================
   CALCULAR RESERVA
========================================================= */

function calcularReserva() {

    const habitacionId =
        Number(
            document.getElementById(
                "reservaHabitacion"
            )?.value
        );


    const entrada =
        document.getElementById(
            "reservaEntrada"
        )?.value;


    const salida =
        document.getElementById(
            "reservaSalida"
        )?.value;


    const nochesElemento =
        document.getElementById(
            "reservaNoches"
        );


    const totalElemento =
        document.getElementById(
            "reservaTotal"
        );


    let noches = 0;
    let total = 0;


    if (
        entrada &&
        salida
    ) {

        noches =
            calcularNoches(
                entrada,
                salida
            );
    }


    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                habitacionId
        );


    if (habitacion) {

        total =
            Number(
                habitacion.precio || 0
            ) *
            noches;
    }


    if (nochesElemento) {

        nochesElemento.textContent =
            noches;
    }


    if (totalElemento) {

        totalElemento.textContent =
            dinero(total);
    }


    return {
        noches,
        total
    };
}


/* =========================================================
   GUARDAR RESERVA
========================================================= */

function guardarReserva() {

    const id =
        Number(
            document.getElementById(
                "reservaEditandoId"
            )?.value
        );


    const nombre =
        document.getElementById(
            "reservaNombre"
        )?.value.trim();


    const dni =
        document.getElementById(
            "reservaDni"
        )?.value.trim();


    const telefono =
        document.getElementById(
            "reservaTelefono"
        )?.value.trim();


    const habitacionId =
        Number(
            document.getElementById(
                "reservaHabitacion"
            )?.value
        );


    const entrada =
        document.getElementById(
            "reservaEntrada"
        )?.value;


    const salida =
        document.getElementById(
            "reservaSalida"
        )?.value;


    const adultos =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "reservaAdultos"
                )?.value || 1
            )
        );


    const ninos =
        Math.max(
            0,
            Number(
                document.getElementById(
                    "reservaNinos"
                )?.value || 0
            )
        );


    if (!nombre) {

        return notificar(
            "Ingresa el nombre del huésped."
        );
    }


    if (!habitacionId) {

        return notificar(
            "Selecciona una habitación."
        );
    }


    if (
        !entrada ||
        !salida
    ) {

        return notificar(
            "Selecciona la fecha de entrada y salida."
        );
    }


    const fechaEntrada =
        fechaLocalDesdeISO(
            entrada
        );


    const fechaSalida =
        fechaLocalDesdeISO(
            salida
        );


    if (
        fechaSalida <=
        fechaEntrada
    ) {

        return notificar(
            "La fecha de salida debe ser posterior a la entrada."
        );
    }


    const disponible =
        habitacionDisponibleParaFechas(
            habitacionId,
            entrada,
            salida,
            id || null
        );


    if (!disponible) {

        return notificar(
            "La habitación ya está reservada u ocupada en esas fechas."
        );
    }


    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                habitacionId
        );


    if (!habitacion) {

        return notificar(
            "Habitación no encontrada."
        );
    }


    const noches =
        calcularNoches(
            entrada,
            salida
        );


    const total =
        Number(
            habitacion.precio
        ) *
        noches;


    if (id) {

        const reserva =
            reservas.find(
                r =>
                    Number(r.id) === id
            );


        if (!reserva) {

            return;
        }


        reserva.nombre =
            nombre;

        reserva.dni =
            dni;

        reserva.telefono =
            telefono;

        reserva.habitacionId =
            habitacionId;

        reserva.entrada =
            entrada;

        reserva.salida =
            salida;

        reserva.noches =
            noches;

        reserva.adultos =
            adultos;

        reserva.ninos =
            ninos;

        reserva.total =
            total;

        reserva.tipoEstadia =
            "DIA";

        reserva.precioAplicado =
            Number(
                habitacion.precio
            );


        registrarMovimiento(
            "RESERVA EDITADA",
            habitacion.numero,
            `${nombre} - ${formatearFecha(entrada)} al ${formatearFecha(salida)}`
        );


        notificar(
            "Reserva actualizada."
        );

    } else {

        const nuevaReserva = {

            id:
                generarId(
                    reservas
                ),

            nombre,

            dni,

            telefono,

            habitacionId,

            entrada,

            salida,

            noches,

            adultos,

            ninos,

            total,

            estado:
                "RESERVADA",

            tipoEstadia:
                "DIA",

            horas:
                0,

            precioAplicado:
                Number(
                    habitacion.precio
                ),

            fechaHoraEntrada:
                null,

            fechaHoraSalida:
                null,

            aviso15:
                false,

            avisoFin:
                false,

            creadoEn:
                new Date().toISOString()
        };


        reservas.push(
            nuevaReserva
        );


        registrarMovimiento(
            "RESERVA CREADA",
            habitacion.numero,
            `${nombre} - ${formatearFecha(entrada)} al ${formatearFecha(salida)} - ${dinero(total)}`
        );


        notificar(
            "Reserva creada correctamente."
        );
    }


    guardarDatos();

    cerrarModal(
        "modalReserva"
    );

    renderTodo();
}


/* =========================================================
   CANCELAR RESERVA
========================================================= */

function cancelarReserva(id) {

    const reserva =
        reservas.find(
            r =>
                Number(r.id) ===
                Number(id)
        );


    if (!reserva) {

        return;
    }


    if (
        reserva.estado ===
        "OCUPADA"
    ) {

        return notificar(
            "No puedes cancelar una reserva con el huésped alojado."
        );
    }


    if (
        reserva.estado ===
        "FINALIZADA"
    ) {

        return notificar(
            "Esta estadía ya fue finalizada."
        );
    }


    if (
        reserva.estado ===
        "CANCELADA"
    ) {

        return;
    }


    const confirmar =
        window.confirm(
            `¿Cancelar la reserva de ${reserva.nombre}?`
        );


    if (!confirmar) {

        return;
    }


    reserva.estado =
        "CANCELADA";


    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(
                    reserva.habitacionId
                )
        );


    registrarMovimiento(
        "RESERVA CANCELADA",
        habitacion?.numero || "",
        reserva.nombre
    );


    guardarDatos();

    renderTodo();

    notificar(
        "Reserva cancelada."
    );
}


/* =========================================================
   ELIMINAR RESERVA
========================================================= */

function eliminarReserva(id) {

    const reserva =
        reservas.find(
            r =>
                Number(r.id) ===
                Number(id)
        );


    if (!reserva) {

        return;
    }


    if (
        reserva.estado ===
        "OCUPADA"
    ) {

        return notificar(
            "Primero debes realizar el checkout."
        );
    }


    const confirmar =
        window.confirm(
            `¿Eliminar definitivamente la reserva de ${reserva.nombre}?`
        );


    if (!confirmar) {

        return;
    }


    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(
                    reserva.habitacionId
                )
        );


    reservas =
        reservas.filter(
            r =>
                Number(r.id) !==
                Number(id)
        );


    registrarMovimiento(
        "RESERVA ELIMINADA",
        habitacion?.numero || "",
        reserva.nombre
    );


    guardarDatos();

    renderTodo();

    notificar(
        "Reserva eliminada."
    );
}


/* =========================================================
   HACER CHECK-IN DE RESERVA FUTURA
========================================================= */

function hacerCheckInReserva(id) {

    const reserva =
        reservas.find(
            r =>
                Number(r.id) ===
                Number(id)
        );


    if (!reserva) {

        return notificar(
            "Reserva no encontrada."
        );
    }


    if (
        reserva.estado !==
        "RESERVADA"
    ) {

        return notificar(
            "Esta reserva no está pendiente de check-in."
        );
    }


    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(
                    reserva.habitacionId
                )
        );


    if (!habitacion) {

        return notificar(
            "Habitación no encontrada."
        );
    }


    const otraOcupacion =
        reservas.some(
            r =>
                Number(r.id) !==
                    Number(reserva.id)
                &&
                Number(
                    r.habitacionId
                ) ===
                    Number(
                        habitacion.id
                    )
                &&
                r.estado ===
                    "OCUPADA"
        );


    if (otraOcupacion) {

        return notificar(
            "La habitación está ocupada actualmente."
        );
    }


    reserva.estado =
        "OCUPADA";

    reserva.tipoEstadia =
        "DIA";


    if (
        !reserva.precioAplicado
    ) {

        reserva.precioAplicado =
            Number(
                habitacion.precio
            );
    }


    habitacion.estado =
        "OCUPADA";


    registrarMovimiento(
        "CHECK-IN RESERVA",
        habitacion.numero,
        `${reserva.nombre} ingresó a la habitación.`
    );


    guardarDatos();

    renderTodo();

    notificar(
        `Check-in realizado en la habitación ${habitacion.numero}.`
    );
}


/* =========================================================
   TARJETA / FILA DE RESERVA
========================================================= */

function crearHTMLReserva(reserva) {

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(
                    reserva.habitacionId
                )
        );


    const numeroHabitacion =
        habitacion
            ? habitacion.numero
            : "-";


    let modalidad = "POR DÍA";


    if (
        reserva.tipoEstadia ===
        "HORAS"
    ) {

        modalidad =
            `POR HORAS (${reserva.horas} h)`;
    }


    return `
        <tr>

            <td>
                ${escaparHTML(
                    reserva.nombre
                )}
            </td>

            <td>
                ${escaparHTML(
                    reserva.dni || "-"
                )}
            </td>

            <td>
                Hab. ${escaparHTML(
                    numeroHabitacion
                )}
            </td>

            <td>
                ${modalidad}
            </td>

            <td>
                ${
                    reserva.tipoEstadia ===
                    "HORAS"
                        ?
                        formatearFechaHora(
                            reserva.fechaHoraEntrada
                        )
                        :
                        formatearFecha(
                            reserva.entrada
                        )
                }
            </td>

            <td>
                ${
                    reserva.tipoEstadia ===
                    "HORAS"
                        ?
                        formatearFechaHora(
                            reserva.fechaHoraSalida
                        )
                        :
                        formatearFecha(
                            reserva.salida
                        )
                }
            </td>

            <td>
                ${dinero(
                    reserva.total
                )}
            </td>

            <td>
                <span class="estado-reserva estado-${String(
                    reserva.estado
                ).toLowerCase()}">
                    ${reserva.estado}
                </span>
            </td>

            <td class="acciones-tabla">

                ${
                    reserva.estado ===
                    "RESERVADA"
                        ?
                        `
                        <button
                            class="btn-tabla"
                            onclick="hacerCheckInReserva(${reserva.id})"
                        >
                            Check-in
                        </button>

                        <button
                            class="btn-tabla"
                            onclick="abrirModalReserva(${reserva.id})"
                        >
                            Editar
                        </button>

                        <button
                            class="btn-tabla peligro"
                            onclick="cancelarReserva(${reserva.id})"
                        >
                            Cancelar
                        </button>
                        `
                        :
                        ""
                }

                ${
                    reserva.estado ===
                    "OCUPADA"
                        ?
                        `
                        <button
                            class="btn-tabla"
                            onclick="abrirCuenta(${reserva.id})"
                        >
                            Cuenta
                        </button>
                        `
                        :
                        ""
                }

                ${
                    reserva.estado ===
                        "CANCELADA"
                    ||
                    reserva.estado ===
                        "FINALIZADA"
                        ?
                        `
                        <button
                            class="btn-tabla peligro"
                            onclick="eliminarReserva(${reserva.id})"
                        >
                            Eliminar
                        </button>
                        `
                        :
                        ""
                }

            </td>

        </tr>
    `;
}


/* =========================================================
   RENDER RESERVAS
========================================================= */

function renderReservas() {

    const tabla =
        document.getElementById(
            "tablaReservas"
        );


    if (!tabla) {

        return;
    }


    const lista =
        reservas
            .slice()
            .sort(
                (a, b) => {

                    const fechaA =
                        a.fechaHoraEntrada ||
                        `${a.entrada || "9999-12-31"}T00:00:00`;

                    const fechaB =
                        b.fechaHoraEntrada ||
                        `${b.entrada || "9999-12-31"}T00:00:00`;

                    return new Date(fechaB) -
                        new Date(fechaA);
                }
            );


    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="sin-datos"
                >
                    No hay reservas registradas.
                </td>
            </tr>
        `;

        return;
    }


    tabla.innerHTML =
        lista
            .map(
                crearHTMLReserva
            )
            .join("");
}


/* =========================================================
   RESERVAS EN INICIO
========================================================= */

function renderReservasInicio() {

    const contenedor =
        document.getElementById(
            "reservasInicio"
        );


    if (!contenedor) {

        return;
    }


    const activas =
        reservas
            .filter(
                r =>
                    r.estado ===
                    "RESERVADA"
            )
            .sort(
                (a, b) =>
                    String(
                        a.entrada
                    ).localeCompare(
                        String(
                            b.entrada
                        )
                    )
            )
            .slice(
                0,
                5
            );


    if (!activas.length) {

        contenedor.innerHTML = `
            <div class="sin-datos">
                No hay próximas reservas.
            </div>
        `;

        return;
    }


    contenedor.innerHTML =
        activas
            .map(
                reserva => {

                    const habitacion =
                        habitaciones.find(
                            h =>
                                Number(h.id) ===
                                Number(
                                    reserva.habitacionId
                                )
                        );


                    return `
                        <div class="reserva-inicio-item">

                            <div>
                                <strong>
                                    ${escaparHTML(
                                        reserva.nombre
                                    )}
                                </strong>

                                <span>
                                    Habitación
                                    ${escaparHTML(
                                        habitacion?.numero || "-"
                                    )}
                                </span>
                            </div>

                            <div>
                                <strong>
                                    ${formatearFecha(
                                        reserva.entrada
                                    )}
                                </strong>

                                <span>
                                    ${dinero(
                                        reserva.total
                                    )}
                                </span>
                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}
/* =========================================================
   HUÉSPEDES
========================================================= */

function renderHuespedes() {

    const tabla =
        document.getElementById(
            "tablaHuespedes"
        );

    if (!tabla) {
        return;
    }


    const lista =
        reservas
            .filter(
                reserva =>
                    reserva.estado ===
                        "OCUPADA"
                    ||
                    reserva.estado ===
                        "RESERVADA"
            )
            .slice()
            .sort(
                (a, b) =>
                    String(
                        a.nombre
                    ).localeCompare(
                        String(
                            b.nombre
                        )
                    )
            );


    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="sin-datos"
                >
                    No hay huéspedes registrados.
                </td>
            </tr>
        `;

        return;
    }


    tabla.innerHTML =
        lista
            .map(
                reserva => {

                    const habitacion =
                        habitaciones.find(
                            h =>
                                Number(h.id) ===
                                Number(
                                    reserva.habitacionId
                                )
                        );


                    let estadia =
                        "POR DÍA";


                    if (
                        reserva.tipoEstadia ===
                        "HORAS"
                    ) {

                        estadia =
                            `POR HORAS (${reserva.horas} h)`;
                    }


                    return `
                        <tr>

                            <td>
                                ${escaparHTML(
                                    reserva.nombre
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    reserva.dni || "-"
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    reserva.telefono || "-"
                                )}
                            </td>

                            <td>
                                Hab.
                                ${escaparHTML(
                                    habitacion?.numero || "-"
                                )}
                            </td>

                            <td>
                                ${estadia}
                            </td>

                            <td>
                                ${reserva.estado}
                            </td>

                            <td>
                                ${
                                    reserva.estado ===
                                    "OCUPADA"
                                        ?
                                        `
                                        <button
                                            class="btn-tabla"
                                            onclick="abrirCuenta(${reserva.id})"
                                        >
                                            Ver cuenta
                                        </button>
                                        `
                                        :
                                        "-"
                                }
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   PRODUCTOS
========================================================= */

function abrirModalProducto(
    id = null
) {

    const idInput =
        document.getElementById(
            "productoEditandoId"
        );

    const nombre =
        document.getElementById(
            "productoNombre"
        );

    const categoria =
        document.getElementById(
            "productoCategoria"
        );

    const precio =
        document.getElementById(
            "productoPrecio"
        );

    const stock =
        document.getElementById(
            "productoStock"
        );

    const titulo =
        document.getElementById(
            "tituloModalProducto"
        );


    if (idInput) {
        idInput.value = "";
    }

    if (nombre) {
        nombre.value = "";
    }

    if (categoria) {
        categoria.value = "Bebida";
    }

    if (precio) {
        precio.value = "";
    }

    if (stock) {
        stock.value = "";
    }

    if (titulo) {
        titulo.textContent =
            "Nuevo producto";
    }


    if (id !== null) {

        const producto =
            productos.find(
                p =>
                    Number(p.id) ===
                    Number(id)
            );


        if (!producto) {
            return;
        }


        if (idInput) {
            idInput.value =
                producto.id;
        }

        if (nombre) {
            nombre.value =
                producto.nombre;
        }

        if (categoria) {
            categoria.value =
                producto.categoria;
        }

        if (precio) {
            precio.value =
                producto.precio;
        }

        if (stock) {
            stock.value =
                producto.stock;
        }

        if (titulo) {
            titulo.textContent =
                "Editar producto";
        }
    }


    abrirModal(
        "modalProducto"
    );
}


/* =========================================================
   GUARDAR PRODUCTO
========================================================= */

function guardarProducto() {

    const id =
        Number(
            document.getElementById(
                "productoEditandoId"
            )?.value
        );


    const nombre =
        document.getElementById(
            "productoNombre"
        )?.value.trim();


    const categoria =
        document.getElementById(
            "productoCategoria"
        )?.value ||
        "Otro";


    const precio =
        Number(
            document.getElementById(
                "productoPrecio"
            )?.value
        );


    const stock =
        Number(
            document.getElementById(
                "productoStock"
            )?.value
        );


    if (!nombre) {

        return notificar(
            "Ingresa el nombre del producto."
        );
    }


    if (
        !Number.isFinite(precio)
        ||
        precio < 0
    ) {

        return notificar(
            "Ingresa un precio válido."
        );
    }


    if (
        !Number.isFinite(stock)
        ||
        stock < 0
    ) {

        return notificar(
            "Ingresa un stock válido."
        );
    }


    if (id) {

        const producto =
            productos.find(
                p =>
                    Number(p.id) === id
            );


        if (!producto) {
            return;
        }


        producto.nombre =
            nombre;

        producto.categoria =
            categoria;

        producto.precio =
            precio;

        producto.stock =
            stock;


        registrarMovimiento(
            "PRODUCTO EDITADO",
            nombre,
            `Precio: ${dinero(precio)} - Stock: ${stock}`
        );


        notificar(
            "Producto actualizado."
        );

    } else {

        productos.push({

            id:
                generarId(
                    productos
                ),

            nombre,

            categoria,

            precio,

            stock
        });


        registrarMovimiento(
            "PRODUCTO CREADO",
            nombre,
            `Precio: ${dinero(precio)} - Stock: ${stock}`
        );


        notificar(
            "Producto agregado."
        );
    }


    guardarDatos();

    cerrarModal(
        "modalProducto"
    );

    renderTodo();
}


/* =========================================================
   ELIMINAR PRODUCTO
========================================================= */

function eliminarProducto(id) {

    const producto =
        productos.find(
            p =>
                Number(p.id) ===
                Number(id)
        );


    if (!producto) {
        return;
    }


    const confirmar =
        window.confirm(
            `¿Eliminar el producto ${producto.nombre}?`
        );


    if (!confirmar) {
        return;
    }


    productos =
        productos.filter(
            p =>
                Number(p.id) !==
                Number(id)
        );


    registrarMovimiento(
        "PRODUCTO ELIMINADO",
        producto.nombre,
        ""
    );


    guardarDatos();

    renderTodo();

    notificar(
        "Producto eliminado."
    );
}


/* =========================================================
   RENDER PRODUCTOS
========================================================= */

function renderProductos() {

    const tabla =
        document.getElementById(
            "tablaProductos"
        );


    if (!tabla) {
        return;
    }


    const lista =
        productos
            .slice()
            .sort(
                (a, b) =>
                    String(
                        a.nombre
                    ).localeCompare(
                        String(
                            b.nombre
                        )
                    )
            );


    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="sin-datos"
                >
                    No hay productos registrados.
                </td>
            </tr>
        `;

        return;
    }


    tabla.innerHTML =
        lista
            .map(
                producto => `
                    <tr>

                        <td>
                            ${producto.id}
                        </td>

                        <td>
                            ${escaparHTML(
                                producto.nombre
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                producto.categoria
                            )}
                        </td>

                        <td>
                            ${dinero(
                                producto.precio
                            )}
                        </td>

                        <td>
                            ${producto.stock}
                        </td>

                        <td class="acciones-tabla">

                            <button
                                class="btn-tabla"
                                onclick="abrirModalProducto(${producto.id})"
                            >
                                Editar
                            </button>

                            <button
                                class="btn-tabla peligro"
                                onclick="eliminarProducto(${producto.id})"
                            >
                                Eliminar
                            </button>

                        </td>

                    </tr>
                `
            )
            .join("");
}


/* =========================================================
   ABRIR MODAL CONSUMO
========================================================= */

function abrirModalConsumo(
    reservaId = null
) {

    const selectReserva =
        document.getElementById(
            "consumoReserva"
        );


    const selectProducto =
        document.getElementById(
            "consumoProducto"
        );


    const cantidad =
        document.getElementById(
            "consumoCantidad"
        );


    if (
        !selectReserva ||
        !selectProducto
    ) {

        return;
    }


    selectReserva.innerHTML = `
        <option value="">
            Seleccionar habitación
        </option>
    `;


    reservas
        .filter(
            r =>
                r.estado ===
                "OCUPADA"
        )
        .forEach(
            reserva => {

                const habitacion =
                    habitaciones.find(
                        h =>
                            Number(h.id) ===
                            Number(
                                reserva.habitacionId
                            )
                    );


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    reserva.id;


                option.textContent =
                    `Hab. ${habitacion?.numero || "-"} - ${reserva.nombre}`;


                selectReserva.appendChild(
                    option
                );
            }
        );


    selectProducto.innerHTML = `
        <option value="">
            Seleccionar producto
        </option>
    `;


    productos
        .filter(
            p =>
                Number(p.stock) > 0
        )
        .forEach(
            producto => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    producto.id;


                option.textContent =
                    `${producto.nombre} - ${dinero(producto.precio)} - Stock ${producto.stock}`;


                selectProducto.appendChild(
                    option
                );
            }
        );


    if (
        reservaId &&
        [...selectReserva.options].some(
            option =>
                Number(option.value) ===
                Number(reservaId)
        )
    ) {

        selectReserva.value =
            reservaId;
    }


    if (cantidad) {

        cantidad.value = 1;
    }


    calcularConsumo();

    abrirModal(
        "modalConsumo"
    );
}


/* =========================================================
   CALCULAR CONSUMO
========================================================= */

function calcularConsumo() {

    const productoId =
        Number(
            document.getElementById(
                "consumoProducto"
            )?.value
        );


    const cantidad =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "consumoCantidad"
                )?.value || 1
            )
        );


    const producto =
        productos.find(
            p =>
                Number(p.id) ===
                productoId
        );


    const total =
        producto
            ?
            Number(
                producto.precio
            ) * cantidad
            :
            0;


    const elemento =
        document.getElementById(
            "consumoTotal"
        );


    if (elemento) {

        elemento.textContent =
            dinero(total);
    }


    return total;
}


/* =========================================================
   GUARDAR CONSUMO
========================================================= */

function guardarConsumo() {

    const reservaId =
        Number(
            document.getElementById(
                "consumoReserva"
            )?.value
        );


    const productoId =
        Number(
            document.getElementById(
                "consumoProducto"
            )?.value
        );


    const cantidad =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "consumoCantidad"
                )?.value || 1
            )
        );


    if (!reservaId) {

        return notificar(
            "Selecciona una habitación."
        );
    }


    if (!productoId) {

        return notificar(
            "Selecciona un producto."
        );
    }


    const reserva =
        reservas.find(
            r =>
                Number(r.id) ===
                reservaId
        );


    const producto =
        productos.find(
            p =>
                Number(p.id) ===
                productoId
        );


    if (
        !reserva ||
        reserva.estado !==
        "OCUPADA"
    ) {

        return notificar(
            "La habitación no tiene una estadía activa."
        );
    }


    if (!producto) {

        return notificar(
            "Producto no encontrado."
        );
    }


    if (
        Number(producto.stock) <
        cantidad
    ) {

        return notificar(
            `Stock insuficiente. Disponible: ${producto.stock}.`
        );
    }


    const total =
        Number(
            producto.precio
        ) *
        cantidad;


    consumos.push({

        id:
            generarId(
                consumos
            ),

        reservaId:
            reserva.id,

        habitacionId:
            reserva.habitacionId,

        productoId:
            producto.id,

        producto:
            producto.nombre,

        cantidad,

        precio:
            Number(
                producto.precio
            ),

        total,

        fecha:
            new Date().toISOString()
    });


    producto.stock =
        Number(
            producto.stock
        ) -
        cantidad;


    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(
                    reserva.habitacionId
                )
        );


    registrarMovimiento(
        "CONSUMO",
        habitacion?.numero || "",
        `${cantidad} x ${producto.nombre} = ${dinero(total)}`
    );


    guardarDatos();

    cerrarModal(
        "modalConsumo"
    );

    renderTodo();


    notificar(
        "Consumo agregado a la habitación."
    );
}


/* =========================================================
   ELIMINAR CONSUMO
========================================================= */

function eliminarConsumo(id) {

    const consumo =
        consumos.find(
            c =>
                Number(c.id) ===
                Number(id)
        );


    if (!consumo) {
        return;
    }


    const confirmar =
        window.confirm(
            "¿Eliminar este consumo?"
        );


    if (!confirmar) {
        return;
    }


    const producto =
        productos.find(
            p =>
                Number(p.id) ===
                Number(
                    consumo.productoId
                )
        );


    /*
     * Al eliminar el consumo devolvemos
     * la cantidad al stock.
     */

    if (producto) {

        producto.stock =
            Number(
                producto.stock
            ) +
            Number(
                consumo.cantidad
            );
    }


    consumos =
        consumos.filter(
            c =>
                Number(c.id) !==
                Number(id)
        );


    registrarMovimiento(
        "CONSUMO ELIMINADO",
        "",
        `${consumo.cantidad} x ${consumo.producto || "Producto"}`
    );


    guardarDatos();

    renderTodo();

    notificar(
        "Consumo eliminado."
    );
}


/* =========================================================
   RENDER CONSUMOS
========================================================= */

function renderConsumos() {

    const tabla =
        document.getElementById(
            "tablaConsumos"
        );


    if (!tabla) {
        return;
    }


    const lista =
        consumos
            .slice()
            .sort(
                (a, b) =>
                    new Date(
                        b.fecha
                    ) -
                    new Date(
                        a.fecha
                    )
            );


    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="sin-datos"
                >
                    No hay consumos registrados.
                </td>
            </tr>
        `;

        return;
    }


    tabla.innerHTML =
        lista
            .map(
                consumo => {

                    const reserva =
                        reservas.find(
                            r =>
                                Number(r.id) ===
                                Number(
                                    consumo.reservaId
                                )
                        );


                    const habitacion =
                        habitaciones.find(
                            h =>
                                Number(h.id) ===
                                Number(
                                    consumo.habitacionId
                                )
                        );


                    return `
                        <tr>

                            <td>
                                ${formatearFechaHora(
                                    consumo.fecha
                                )}
                            </td>

                            <td>
                                Hab.
                                ${escaparHTML(
                                    habitacion?.numero || "-"
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    reserva?.nombre || "-"
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    consumo.producto || "-"
                                )}
                            </td>

                            <td>
                                ${consumo.cantidad}
                            </td>

                            <td>
                                ${dinero(
                                    consumo.total
                                )}
                            </td>

                            <td>
                                ${
                                    reserva?.estado ===
                                    "OCUPADA"
                                        ?
                                        `
                                        <button
                                            class="btn-tabla peligro"
                                            onclick="eliminarConsumo(${consumo.id})"
                                        >
                                            Eliminar
                                        </button>
                                        `
                                        :
                                        "-"
                                }
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}
/* =========================================================
   CUENTA DE LA HABITACIÓN
========================================================= */

function obtenerCuentaReserva(reservaId) {

    const reserva = reservas.find(
        r => Number(r.id) === Number(reservaId)
    );

    if (!reserva) {
        return null;
    }

    const consumosReserva = consumos.filter(
        c => Number(c.reservaId) === Number(reservaId)
    );

    const pagosReserva = pagos.filter(
        p => Number(p.reservaId) === Number(reservaId)
    );

    const totalHabitacion =
        Number(reserva.total || 0);

    const totalConsumos =
        consumosReserva.reduce(
            (total, consumo) =>
                total + Number(consumo.total || 0),
            0
        );

    const totalGeneral =
        totalHabitacion + totalConsumos;

    const totalPagado =
        pagosReserva.reduce(
            (total, pago) =>
                total + Number(pago.monto || 0),
            0
        );

    const saldo =
        Math.max(
            0,
            totalGeneral - totalPagado
        );

    return {
        reserva,
        consumosReserva,
        pagosReserva,
        totalHabitacion,
        totalConsumos,
        totalGeneral,
        totalPagado,
        saldo
    };
}


/* =========================================================
   ABRIR CUENTA
========================================================= */

function abrirCuenta(reservaId) {

    const cuenta =
        obtenerCuentaReserva(reservaId);

    if (!cuenta) {

        return notificar(
            "No se encontró la cuenta."
        );
    }

    ultimaReservaCuenta =
        Number(reservaId);

    const reserva =
        cuenta.reserva;

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(reserva.habitacionId)
        );


    const titulo =
        document.getElementById(
            "cuentaTitulo"
        );

    const huesped =
        document.getElementById(
            "cuentaHuesped"
        );

    const estadia =
        document.getElementById(
            "cuentaEstadia"
        );

    const alojamiento =
        document.getElementById(
            "cuentaAlojamiento"
        );

    const consumo =
        document.getElementById(
            "cuentaConsumos"
        );

    const total =
        document.getElementById(
            "cuentaTotal"
        );

    const pagado =
        document.getElementById(
            "cuentaPagado"
        );

    const saldo =
        document.getElementById(
            "cuentaSaldo"
        );


    if (titulo) {

        titulo.textContent =
            `Cuenta - Habitación ${habitacion?.numero || "-"}`;
    }


    if (huesped) {

        huesped.textContent =
            reserva.nombre;
    }


    if (estadia) {

        if (
            reserva.tipoEstadia ===
            "HORAS"
        ) {

            estadia.textContent =
                `Por horas - ${reserva.horas} hora(s)`;

        } else {

            estadia.textContent =
                `Por día - ${reserva.noches || 1} día(s)`;
        }
    }


    if (alojamiento) {

        alojamiento.textContent =
            dinero(
                cuenta.totalHabitacion
            );
    }


    if (consumo) {

        consumo.textContent =
            dinero(
                cuenta.totalConsumos
            );
    }


    if (total) {

        total.textContent =
            dinero(
                cuenta.totalGeneral
            );
    }


    if (pagado) {

        pagado.textContent =
            dinero(
                cuenta.totalPagado
            );
    }


    if (saldo) {

        saldo.textContent =
            dinero(
                cuenta.saldo
            );
    }


    renderConsumosCuenta(
        reservaId
    );

    renderPagosCuenta(
        reservaId
    );

    abrirModal(
        "modalCuenta"
    );
}


/* =========================================================
   CONSUMOS DENTRO DE CUENTA
========================================================= */

function renderConsumosCuenta(
    reservaId
) {

    const tabla =
        document.getElementById(
            "tablaConsumosCuenta"
        );

    if (!tabla) {
        return;
    }


    const lista =
        consumos.filter(
            c =>
                Number(c.reservaId) ===
                Number(reservaId)
        );


    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="sin-datos"
                >
                    Sin consumos.
                </td>
            </tr>
        `;

        return;
    }


    tabla.innerHTML =
        lista.map(
            consumo => `
                <tr>

                    <td>
                        ${escaparHTML(
                            consumo.producto || "-"
                        )}
                    </td>

                    <td>
                        ${consumo.cantidad}
                    </td>

                    <td>
                        ${dinero(
                            consumo.precio
                        )}
                    </td>

                    <td>
                        ${dinero(
                            consumo.total
                        )}
                    </td>

                </tr>
            `
        ).join("");
}


/* =========================================================
   PAGOS DENTRO DE CUENTA
========================================================= */

function renderPagosCuenta(
    reservaId
) {

    const tabla =
        document.getElementById(
            "tablaPagosCuenta"
        );

    if (!tabla) {
        return;
    }


    const lista =
        pagos
            .filter(
                p =>
                    Number(p.reservaId) ===
                    Number(reservaId)
            )
            .sort(
                (a, b) =>
                    new Date(b.fecha) -
                    new Date(a.fecha)
            );


    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="sin-datos"
                >
                    Sin pagos registrados.
                </td>
            </tr>
        `;

        return;
    }


    tabla.innerHTML =
        lista.map(
            pago => `
                <tr>

                    <td>
                        ${formatearFechaHora(
                            pago.fecha
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            pago.metodo
                        )}
                    </td>

                    <td>
                        ${dinero(
                            pago.monto
                        )}
                    </td>

                </tr>
            `
        ).join("");
}


/* =========================================================
   ABRIR PAGO
========================================================= */

function abrirPago(
    reservaId = null
) {

    const id =
        Number(
            reservaId ||
            ultimaReservaCuenta
        );


    if (!id) {

        return notificar(
            "Primero selecciona una cuenta."
        );
    }


    const cuenta =
        obtenerCuentaReserva(id);


    if (!cuenta) {

        return notificar(
            "Cuenta no encontrada."
        );
    }


    if (
        cuenta.saldo <= 0
    ) {

        return notificar(
            "La cuenta ya está pagada."
        );
    }


    const reservaInput =
        document.getElementById(
            "pagoReservaId"
        );

    const monto =
        document.getElementById(
            "pagoMonto"
        );

    const metodo =
        document.getElementById(
            "pagoMetodo"
        );


    if (reservaInput) {

        reservaInput.value =
            id;
    }


    if (monto) {

        monto.value =
            cuenta.saldo.toFixed(2);
    }


    if (metodo) {

        metodo.value =
            "EFECTIVO";
    }


    abrirModal(
        "modalPago"
    );
}


/* =========================================================
   CONFIRMAR PAGO
========================================================= */

function confirmarPago() {

    const reservaId =
        Number(
            document.getElementById(
                "pagoReservaId"
            )?.value ||
            ultimaReservaCuenta
        );


    const monto =
        Number(
            document.getElementById(
                "pagoMonto"
            )?.value
        );


    const metodo =
        document.getElementById(
            "pagoMetodo"
        )?.value;


    if (!reservaId) {

        return notificar(
            "No se encontró la reserva."
        );
    }


    if (
        !Number.isFinite(monto) ||
        monto <= 0
    ) {

        return notificar(
            "Ingresa un monto válido."
        );
    }


    if (!metodo) {

        return notificar(
            "Selecciona un método de pago."
        );
    }


    const cuenta =
        obtenerCuentaReserva(
            reservaId
        );


    if (!cuenta) {

        return notificar(
            "Cuenta no encontrada."
        );
    }


    if (
        monto >
        cuenta.saldo + 0.01
    ) {

        return notificar(
            `El saldo pendiente es ${dinero(cuenta.saldo)}.`
        );
    }


    pagos.push({

        id:
            generarId(
                pagos
            ),

        reservaId,

        monto,

        metodo,

        fecha:
            new Date().toISOString()
    });


    const reserva =
        reservas.find(
            r =>
                Number(r.id) ===
                reservaId
        );


    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(
                    reserva?.habitacionId
                )
        );


    registrarMovimiento(
        "PAGO",
        habitacion?.numero || "",
        `${metodo} - ${dinero(monto)} - ${reserva?.nombre || ""}`
    );


    guardarDatos();


    cerrarModal(
        "modalPago"
    );


    renderTodo();


    abrirCuenta(
        reservaId
    );


    notificar(
        `Pago de ${dinero(monto)} registrado.`
    );
}


/* =========================================================
   PAGAR SALDO COMPLETO
========================================================= */

function pagarSaldoCompleto() {

    if (!ultimaReservaCuenta) {

        return notificar(
            "No hay una cuenta seleccionada."
        );
    }


    const cuenta =
        obtenerCuentaReserva(
            ultimaReservaCuenta
        );


    if (!cuenta) {

        return;
    }


    if (
        cuenta.saldo <= 0
    ) {

        return notificar(
            "La cuenta ya está pagada."
        );
    }


    abrirPago(
        ultimaReservaCuenta
    );
}


/* =========================================================
   CHECKOUT
========================================================= */

function realizarCheckOut(
    reservaId = null
) {

    const id =
        Number(
            reservaId ||
            ultimaReservaCuenta
        );


    if (!id) {

        return notificar(
            "No se encontró la estadía."
        );
    }


    const reserva =
        reservas.find(
            r =>
                Number(r.id) === id
        );


    if (!reserva) {

        return notificar(
            "Reserva no encontrada."
        );
    }


    if (
        reserva.estado !==
        "OCUPADA"
    ) {

        return notificar(
            "Esta habitación no tiene una estadía activa."
        );
    }


    const cuenta =
        obtenerCuentaReserva(
            id
        );


    if (!cuenta) {

        return;
    }


    if (
        cuenta.saldo > 0.01
    ) {

        return notificar(
            `Todavía falta pagar ${dinero(cuenta.saldo)}.`
        );
    }


    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(
                    reserva.habitacionId
                )
        );


    const confirmar =
        window.confirm(
            `¿Realizar checkout de ${reserva.nombre} en la habitación ${habitacion?.numero || "-"}?`
        );


    if (!confirmar) {
        return;
    }


    reserva.estado =
        "FINALIZADA";


    reserva.checkoutEn =
        new Date().toISOString();


    if (habitacion) {

        habitacion.estado =
            "LIMPIEZA";
    }


    registrarMovimiento(
        "CHECKOUT",
        habitacion?.numero || "",
        `${reserva.nombre} - Total ${dinero(cuenta.totalGeneral)}`
    );


    guardarDatos();


    cerrarModal(
        "modalCuenta"
    );


    ultimaReservaCuenta =
        null;


    renderTodo();


    notificar(
        `Checkout realizado. Habitación ${habitacion?.numero || ""} pasó a LIMPIEZA.`
    );
}


/* =========================================================
   AGREGAR CONSUMO DESDE CUENTA
========================================================= */

function agregarConsumoDesdeCuenta() {

    if (!ultimaReservaCuenta) {

        return notificar(
            "Selecciona una cuenta."
        );
    }


    abrirModalConsumo(
        ultimaReservaCuenta
    );
}


/* =========================================================
   ACTUALIZAR CUENTA DESPUÉS DE CAMBIOS
========================================================= */

function actualizarCuentaAbierta() {

    if (!ultimaReservaCuenta) {
        return;
    }


    const reserva =
        reservas.find(
            r =>
                Number(r.id) ===
                Number(
                    ultimaReservaCuenta
                )
        );


    if (!reserva) {

        ultimaReservaCuenta =
            null;

        return;
    }


    abrirCuenta(
        ultimaReservaCuenta
    );
}
/* =========================================================
   CAJA DIARIA
========================================================= */

function obtenerAperturaCaja(fecha) {

    return Number(
        aperturasCaja[fecha] || 0
    );
}


/* =========================================================
   GUARDAR MONTO INICIAL DE CAJA
========================================================= */

function guardarAperturaCaja() {

    const fecha =
        document.getElementById(
            "fechaCaja"
        )?.value ||
        obtenerFechaHoy();


    const monto =
        Number(
            document.getElementById(
                "montoAperturaCaja"
            )?.value
        );


    if (
        !Number.isFinite(monto) ||
        monto < 0
    ) {

        return notificar(
            "Ingresa un monto inicial válido."
        );
    }


    aperturasCaja[fecha] =
        monto;


    registrarMovimiento(
        "APERTURA DE CAJA",
        fecha,
        `Monto inicial: ${dinero(monto)}`
    );


    guardarDatos();

    renderCaja();


    notificar(
        `Caja iniciada con ${dinero(monto)}.`
    );
}


/* =========================================================
   RENDER CAJA
========================================================= */

function renderCaja() {

    const fecha =
        document.getElementById(
            "fechaCaja"
        )?.value ||
        obtenerFechaHoy();


    const pagosFecha =
        pagos.filter(
            pago =>
                fechaLocalYYYYMMDD(
                    pago.fecha
                ) === fecha
        );


    const totales = {

        EFECTIVO: 0,

        YAPE: 0,

        PLIN: 0,

        TARJETA: 0
    };


    pagosFecha.forEach(
        pago => {

            const metodo =
                String(
                    pago.metodo || ""
                ).toUpperCase();


            if (
                Object.prototype.hasOwnProperty.call(
                    totales,
                    metodo
                )
            ) {

                totales[metodo] +=
                    Number(
                        pago.monto || 0
                    );
            }
        }
    );


    const montoInicial =
        obtenerAperturaCaja(
            fecha
        );


    const efectivoEsperado =
        montoInicial +
        totales.EFECTIVO;


    const totalVentas =
        totales.EFECTIVO +
        totales.YAPE +
        totales.PLIN +
        totales.TARJETA;


    const inputApertura =
        document.getElementById(
            "montoAperturaCaja"
        );


    if (inputApertura) {

        inputApertura.value =
            montoInicial.toFixed(2);
    }


    const cajaMontoInicial =
        document.getElementById(
            "cajaMontoInicial"
        );


    if (cajaMontoInicial) {

        cajaMontoInicial.textContent =
            dinero(
                montoInicial
            );
    }


    const cajaEfectivo =
        document.getElementById(
            "cajaEfectivo"
        );


    if (cajaEfectivo) {

        cajaEfectivo.textContent =
            dinero(
                totales.EFECTIVO
            );
    }


    const cajaYape =
        document.getElementById(
            "cajaYape"
        );


    if (cajaYape) {

        cajaYape.textContent =
            dinero(
                totales.YAPE
            );
    }


    const cajaPlin =
        document.getElementById(
            "cajaPlin"
        );


    if (cajaPlin) {

        cajaPlin.textContent =
            dinero(
                totales.PLIN
            );
    }


    const cajaTarjeta =
        document.getElementById(
            "cajaTarjeta"
        );


    if (cajaTarjeta) {

        cajaTarjeta.textContent =
            dinero(
                totales.TARJETA
            );
    }


    const cajaTotal =
        document.getElementById(
            "cajaTotal"
        );


    if (cajaTotal) {

        cajaTotal.textContent =
            dinero(
                totalVentas
            );
    }


    const cajaEfectivoEsperado =
        document.getElementById(
            "cajaEfectivoEsperado"
        );


    if (cajaEfectivoEsperado) {

        cajaEfectivoEsperado.textContent =
            dinero(
                efectivoEsperado
            );
    }


    renderTablaCaja(
        pagosFecha
    );
}


/* =========================================================
   TABLA DE MOVIMIENTOS DE CAJA
========================================================= */

function renderTablaCaja(
    pagosFecha
) {

    const tabla =
        document.getElementById(
            "tablaCaja"
        );


    if (!tabla) {

        return;
    }


    const lista =
        pagosFecha
            .slice()
            .sort(
                (a, b) =>
                    new Date(
                        b.fecha
                    ) -
                    new Date(
                        a.fecha
                    )
            );


    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="sin-datos"
                >
                    No hay pagos registrados en esta fecha.
                </td>
            </tr>
        `;

        return;
    }


    tabla.innerHTML =
        lista.map(
            pago => {

                const reserva =
                    reservas.find(
                        r =>
                            Number(r.id) ===
                            Number(
                                pago.reservaId
                            )
                    );


                const habitacion =
                    habitaciones.find(
                        h =>
                            Number(h.id) ===
                            Number(
                                reserva?.habitacionId
                            )
                    );


                return `
                    <tr>

                        <td>
                            ${formatearFechaHora(
                                pago.fecha
                            )}
                        </td>

                        <td>
                            Hab.
                            ${escaparHTML(
                                habitacion?.numero || "-"
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                reserva?.nombre || "-"
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                pago.metodo
                            )}
                        </td>

                        <td>
                            ${dinero(
                                pago.monto
                            )}
                        </td>

                        <td>
                            Pago
                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* =========================================================
   CAMBIAR FECHA DE CAJA
========================================================= */

function cambiarFechaCaja() {

    renderCaja();
}


/* =========================================================
   RESUMEN DE CAJA
========================================================= */

function obtenerResumenCaja(
    fecha
) {

    const pagosFecha =
        pagos.filter(
            pago =>
                fechaLocalYYYYMMDD(
                    pago.fecha
                ) === fecha
        );


    let efectivo = 0;
    let yape = 0;
    let plin = 0;
    let tarjeta = 0;


    pagosFecha.forEach(
        pago => {

            const metodo =
                String(
                    pago.metodo
                ).toUpperCase();


            if (
                metodo ===
                "EFECTIVO"
            ) {

                efectivo +=
                    Number(
                        pago.monto
                    );
            }


            if (
                metodo ===
                "YAPE"
            ) {

                yape +=
                    Number(
                        pago.monto
                    );
            }


            if (
                metodo ===
                "PLIN"
            ) {

                plin +=
                    Number(
                        pago.monto
                    );
            }


            if (
                metodo ===
                "TARJETA"
            ) {

                tarjeta +=
                    Number(
                        pago.monto
                    );
            }
        }
    );


    const apertura =
        obtenerAperturaCaja(
            fecha
        );


    return {

        fecha,

        apertura,

        efectivo,

        yape,

        plin,

        tarjeta,

        efectivoEsperado:
            apertura +
            efectivo,

        ventas:
            efectivo +
            yape +
            plin +
            tarjeta
    };
}


/* =========================================================
   REPORTE POR FECHAS
========================================================= */

function generarReporte() {

    const desde =
        document.getElementById(
            "reporteDesde"
        )?.value;


    const hasta =
        document.getElementById(
            "reporteHasta"
        )?.value;


    const tabla =
        document.getElementById(
            "tablaReporte"
        );


    if (
        !desde ||
        !hasta
    ) {

        return notificar(
            "Selecciona las fechas del reporte."
        );
    }


    if (
        desde >
        hasta
    ) {

        return notificar(
            "La fecha inicial no puede ser mayor que la fecha final."
        );
    }


    const pagosFiltrados =
        pagos.filter(
            pago => {

                const fecha =
                    fechaLocalYYYYMMDD(
                        pago.fecha
                    );


                return (
                    fecha >= desde &&
                    fecha <= hasta
                );
            }
        );


    let efectivo = 0;
    let yape = 0;
    let plin = 0;
    let tarjeta = 0;


    pagosFiltrados.forEach(
        pago => {

            const metodo =
                String(
                    pago.metodo
                ).toUpperCase();


            if (metodo === "EFECTIVO") {

                efectivo +=
                    Number(
                        pago.monto
                    );
            }


            if (metodo === "YAPE") {

                yape +=
                    Number(
                        pago.monto
                    );
            }


            if (metodo === "PLIN") {

                plin +=
                    Number(
                        pago.monto
                    );
            }


            if (metodo === "TARJETA") {

                tarjeta +=
                    Number(
                        pago.monto
                    );
            }
        }
    );


    const total =
        efectivo +
        yape +
        plin +
        tarjeta;


    const elementoEfectivo =
        document.getElementById(
            "reporteEfectivo"
        );


    const elementoYape =
        document.getElementById(
            "reporteYape"
        );


    const elementoPlin =
        document.getElementById(
            "reportePlin"
        );


    const elementoTarjeta =
        document.getElementById(
            "reporteTarjeta"
        );


    const elementoTotal =
        document.getElementById(
            "reporteTotal"
        );


    if (elementoEfectivo) {

        elementoEfectivo.textContent =
            dinero(
                efectivo
            );
    }


    if (elementoYape) {

        elementoYape.textContent =
            dinero(
                yape
            );
    }


    if (elementoPlin) {

        elementoPlin.textContent =
            dinero(
                plin
            );
    }


    if (elementoTarjeta) {

        elementoTarjeta.textContent =
            dinero(
                tarjeta
            );
    }


    if (elementoTotal) {

        elementoTotal.textContent =
            dinero(
                total
            );
    }


    if (!tabla) {

        return;
    }


    if (!pagosFiltrados.length) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="sin-datos"
                >
                    No hay movimientos en este periodo.
                </td>
            </tr>
        `;

        return;
    }


    tabla.innerHTML =
        pagosFiltrados
            .slice()
            .sort(
                (a, b) =>
                    new Date(
                        b.fecha
                    ) -
                    new Date(
                        a.fecha
                    )
            )
            .map(
                pago => {

                    const reserva =
                        reservas.find(
                            r =>
                                Number(r.id) ===
                                Number(
                                    pago.reservaId
                                )
                        );


                    const habitacion =
                        habitaciones.find(
                            h =>
                                Number(h.id) ===
                                Number(
                                    reserva?.habitacionId
                                )
                        );


                    return `
                        <tr>

                            <td>
                                ${formatearFechaHora(
                                    pago.fecha
                                )}
                            </td>

                            <td>
                                Hab.
                                ${escaparHTML(
                                    habitacion?.numero || "-"
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    reserva?.nombre || "-"
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    pago.metodo
                                )}
                            </td>

                            <td>
                                ${dinero(
                                    pago.monto
                                )}
                            </td>

                            <td>
                                PAGO
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   CONFIGURAR FECHAS DE REPORTE
========================================================= */

function configurarFechasReporte() {

    const hoy =
        obtenerFechaHoy();


    const desde =
        document.getElementById(
            "reporteDesde"
        );


    const hasta =
        document.getElementById(
            "reporteHasta"
        );


    if (
        desde &&
        !desde.value
    ) {

        desde.value =
            hoy;
    }


    if (
        hasta &&
        !hasta.value
    ) {

        hasta.value =
            hoy;
    }
}
/* =========================================================
   HISTORIAL
========================================================= */

function renderHistorial() {

    const tabla =
        document.getElementById(
            "tablaHistorial"
        );

    if (!tabla) {
        return;
    }

    const lista =
        historial
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.fecha) -
                    new Date(a.fecha)
            );

    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="sin-datos">
                    No hay movimientos registrados.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML =
        lista.map(
            movimiento => `
                <tr>
                    <td>
                        ${formatearFechaHora(
                            movimiento.fecha
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            movimiento.tipo || "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            movimiento.referencia || "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            movimiento.detalle || "-"
                        )}
                    </td>
                </tr>
            `
        ).join("");
}


/* =========================================================
   COMPROBANTE
========================================================= */

function generarComprobante(
    reservaId = null
) {

    const id =
        Number(
            reservaId ||
            ultimaReservaCuenta
        );

    if (!id) {

        return notificar(
            "Selecciona una cuenta."
        );
    }

    const cuenta =
        obtenerCuentaReserva(id);

    if (!cuenta) {

        return notificar(
            "Cuenta no encontrada."
        );
    }

    const reserva =
        cuenta.reserva;

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(reserva.habitacionId)
        );

    let detalleEstadia = "";

    if (
        reserva.tipoEstadia ===
        "HORAS"
    ) {

        detalleEstadia =
            `${reserva.horas} hora(s)`;

    } else {

        detalleEstadia =
            `${reserva.noches || 1} día(s)`;
    }

    const ventana =
        window.open(
            "",
            "_blank",
            "width=800,height=700"
        );

    if (!ventana) {

        return notificar(
            "El navegador bloqueó el comprobante."
        );
    }

    const consumosHTML =
        cuenta.consumosReserva.length
            ?
            cuenta.consumosReserva.map(
                consumo => `
                    <tr>
                        <td>
                            ${escaparHTML(
                                consumo.producto || "-"
                            )}
                        </td>

                        <td>
                            ${consumo.cantidad}
                        </td>

                        <td>
                            ${dinero(
                                consumo.precio
                            )}
                        </td>

                        <td>
                            ${dinero(
                                consumo.total
                            )}
                        </td>
                    </tr>
                `
            ).join("")
            :
            `
                <tr>
                    <td colspan="4">
                        Sin consumos
                    </td>
                </tr>
            `;

    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">

            <title>
                Comprobante
            </title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 35px;
                    color: #222;
                }

                h1 {
                    margin-bottom: 5px;
                }

                .datos {
                    margin: 25px 0;
                    line-height: 1.8;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th,
                td {
                    border: 1px solid #ccc;
                    padding: 10px;
                    text-align: left;
                }

                th {
                    background: #f1f1f1;
                }

                .totales {
                    margin-top: 25px;
                    text-align: right;
                    line-height: 1.8;
                }

                .total {
                    font-size: 22px;
                    font-weight: bold;
                }

                .pie {
                    margin-top: 50px;
                    text-align: center;
                    color: #666;
                }

                @media print {
                    button {
                        display: none;
                    }
                }
            </style>
        </head>

        <body>

            <h1>
                COMPROBANTE DE HOTEL
            </h1>

            <div>
                Fecha:
                ${new Date().toLocaleString("es-PE")}
            </div>

            <div class="datos">

                <strong>Huésped:</strong>
                ${escaparHTML(reserva.nombre)}
                <br>

                <strong>DNI:</strong>
                ${escaparHTML(reserva.dni || "-")}
                <br>

                <strong>Habitación:</strong>
                ${escaparHTML(habitacion?.numero || "-")}
                <br>

                <strong>Tipo:</strong>
                ${escaparHTML(habitacion?.tipo || "-")}
                <br>

                <strong>Modalidad:</strong>
                ${
                    reserva.tipoEstadia === "HORAS"
                        ? "POR HORAS"
                        : "POR DÍA"
                }
                <br>

                <strong>Estadía:</strong>
                ${detalleEstadia}

            </div>

            <h3>
                Detalle
            </h3>

            <table>

                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>

                    <tr>
                        <td>
                            Alojamiento
                        </td>

                        <td>
                            ${
                                reserva.tipoEstadia === "HORAS"
                                    ? reserva.horas
                                    : reserva.noches || 1
                            }
                        </td>

                        <td>
                            ${dinero(
                                reserva.precioAplicado ||
                                (
                                    reserva.tipoEstadia === "HORAS"
                                        ? habitacion?.precioHora
                                        : habitacion?.precio
                                )
                            )}
                        </td>

                        <td>
                            ${dinero(
                                cuenta.totalHabitacion
                            )}
                        </td>
                    </tr>

                    ${consumosHTML}

                </tbody>

            </table>

            <div class="totales">

                <div>
                    Alojamiento:
                    <strong>
                        ${dinero(
                            cuenta.totalHabitacion
                        )}
                    </strong>
                </div>

                <div>
                    Consumos:
                    <strong>
                        ${dinero(
                            cuenta.totalConsumos
                        )}
                    </strong>
                </div>

                <div class="total">
                    TOTAL:
                    ${dinero(
                        cuenta.totalGeneral
                    )}
                </div>

                <div>
                    Pagado:
                    ${dinero(
                        cuenta.totalPagado
                    )}
                </div>

                <div>
                    Saldo:
                    ${dinero(
                        cuenta.saldo
                    )}
                </div>

            </div>

            <div class="pie">
                Gracias por su preferencia.
            </div>

            <br>

            <button onclick="window.print()">
                Imprimir comprobante
            </button>

        </body>

        </html>
    `);

    ventana.document.close();
}


/* =========================================================
   CREAR RESPALDO
========================================================= */

function crearRespaldo() {

    const respaldo = {

        version: 3,

        sistema:
            "Sistema Hotel",

        creadoEn:
            new Date().toISOString(),

        habitaciones,

        reservas,

        productos,

        consumos,

        pagos,

        historial,

        aperturasCaja
    };

    const contenido =
        JSON.stringify(
            respaldo,
            null,
            2
        );

    const blob =
        new Blob(
            [contenido],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const enlace =
        document.createElement(
            "a"
        );

    enlace.href =
        url;

    enlace.download =
        `respaldo-hotel-${obtenerFechaHoy()}.json`;

    document.body.appendChild(
        enlace
    );

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(
        url
    );

    registrarMovimiento(
        "RESPALDO CREADO",
        obtenerFechaHoy(),
        "Respaldo manual del sistema."
    );

    guardarDatos();

    notificar(
        "Respaldo creado correctamente."
    );
}


/* =========================================================
   SELECCIONAR RESPALDO PARA RESTAURAR
========================================================= */

function seleccionarRespaldo() {

    const input =
        document.getElementById(
            "archivoRespaldo"
        );

    if (!input) {

        return notificar(
            "No se encontró el selector de respaldo."
        );
    }

    input.click();
}


/* =========================================================
   RESTAURAR RESPALDO
========================================================= */

function restaurarRespaldo(
    event
) {

    const archivo =
        event?.target?.files?.[0];

    if (!archivo) {
        return;
    }

    const lector =
        new FileReader();

    lector.onload =
        function (e) {

            try {

                const datos =
                    JSON.parse(
                        e.target.result
                    );

                if (
                    !Array.isArray(
                        datos.habitaciones
                    )
                    ||
                    !Array.isArray(
                        datos.reservas
                    )
                    ||
                    !Array.isArray(
                        datos.productos
                    )
                ) {

                    throw new Error(
                        "Formato no válido"
                    );
                }

                const confirmar =
                    window.confirm(
                        "¿Restaurar este respaldo? Los datos actuales serán reemplazados."
                    );

                if (!confirmar) {
                    return;
                }

                habitaciones =
                    datos.habitaciones || [];

                reservas =
                    datos.reservas || [];

                productos =
                    datos.productos || [];

                consumos =
                    datos.consumos || [];

                pagos =
                    datos.pagos || [];

                historial =
                    datos.historial || [];

                aperturasCaja =
                    datos.aperturasCaja || {};

                normalizarDatos();

                actualizarEstadosAutomaticos();

                guardarDatos();

                renderTodo();

                notificar(
                    "Respaldo restaurado correctamente."
                );

            } catch (error) {

                console.error(
                    error
                );

                notificar(
                    "El archivo de respaldo no es válido."
                );
            }

            event.target.value = "";
        };

    lector.readAsText(
        archivo
    );
}


/* =========================================================
   RESPALDO AUTOMÁTICO LOCAL
========================================================= */

function crearRespaldoAutomaticoLocal() {

    const respaldo = {

        version: 3,

        creadoEn:
            new Date().toISOString(),

        habitaciones,

        reservas,

        productos,

        consumos,

        pagos,

        historial,

        aperturasCaja
    };

    localStorage.setItem(
        "hotel_respaldo_automatico",
        JSON.stringify(
            respaldo
        )
    );
}


/* =========================================================
   RESTAURAR RESPALDO AUTOMÁTICO
========================================================= */

function restaurarRespaldoAutomaticoLocal() {

    const contenido =
        localStorage.getItem(
            "hotel_respaldo_automatico"
        );

    if (!contenido) {

        return notificar(
            "No existe un respaldo automático."
        );
    }

    const confirmar =
        window.confirm(
            "¿Restaurar el último respaldo automático?"
        );

    if (!confirmar) {
        return;
    }

    try {

        const datos =
            JSON.parse(
                contenido
            );

        habitaciones =
            datos.habitaciones || [];

        reservas =
            datos.reservas || [];

        productos =
            datos.productos || [];

        consumos =
            datos.consumos || [];

        pagos =
            datos.pagos || [];

        historial =
            datos.historial || [];

        aperturasCaja =
            datos.aperturasCaja || {};

        normalizarDatos();

        actualizarEstadosAutomaticos();

        guardarDatos();

        renderTodo();

        notificar(
            "Respaldo automático restaurado."
        );

    } catch (error) {

        console.error(
            error
        );

        notificar(
            "No se pudo restaurar el respaldo."
        );
    }
}


/* =========================================================
   LIMPIAR HISTORIAL
========================================================= */

function limpiarHistorial() {

    const confirmar =
        window.confirm(
            "¿Seguro que deseas borrar todo el historial?"
        );

    if (!confirmar) {
        return;
    }

    historial = [];

    guardarDatos();

    renderHistorial();

    notificar(
        "Historial eliminado."
    );
}
/* =========================================================
   NOTIFICACIONES
========================================================= */

function notificar(mensaje) {

    let notificacion =
        document.getElementById(
            "notificacion"
        );


    if (!notificacion) {

        notificacion =
            document.createElement(
                "div"
            );

        notificacion.id =
            "notificacion";

        notificacion.className =
            "notificacion";

        document.body.appendChild(
            notificacion
        );
    }


    notificacion.textContent =
        mensaje;


    notificacion.classList.add(
        "mostrar"
    );


    clearTimeout(
        notificacion._temporizador
    );


    notificacion._temporizador =
        setTimeout(
            () => {

                notificacion.classList.remove(
                    "mostrar"
                );

            },
            2800
        );
}


/* =========================================================
   CORREGIR FILTRO DE HABITACIONES
========================================================= */

function filtrarHabitaciones(
    filtro,
    elemento = null
) {

    filtroHabitacionActual =
        filtro || "TODAS";


    document
        .querySelectorAll(
            ".filtro-habitacion"
        )
        .forEach(
            boton => {

                boton.classList.remove(
                    "activo"
                );
            }
        );


    if (elemento) {

        elemento.classList.add(
            "activo"
        );
    }


    renderHabitaciones();
}


/* =========================================================
   MARCAR HABITACIÓN COMO LISTA
========================================================= */

function marcarHabitacionLista(
    habitacionId
) {

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(habitacionId)
        );


    if (!habitacion) {

        return;
    }


    if (
        habitacion.estado !==
        "LIMPIEZA"
    ) {

        return notificar(
            "La habitación no está en limpieza."
        );
    }


    habitacion.estado =
        "DISPONIBLE";


    registrarMovimiento(
        "HABITACIÓN LISTA",
        habitacion.numero,
        "Habitación disponible nuevamente."
    );


    guardarDatos();

    renderTodo();


    notificar(
        `Habitación ${habitacion.numero} disponible.`
    );
}


/* =========================================================
   ACTUALIZAR ESTADOS DE HABITACIONES
========================================================= */

function actualizarEstadosHabitaciones() {

    habitaciones.forEach(
        habitacion => {

            const ocupada =
                reservas.some(
                    reserva =>
                        Number(
                            reserva.habitacionId
                        ) ===
                            Number(
                                habitacion.id
                            )
                        &&
                        reserva.estado ===
                            "OCUPADA"
                );


            if (ocupada) {

                habitacion.estado =
                    "OCUPADA";

                return;
            }


            /*
             * Si está en LIMPIEZA no la cambiamos
             * automáticamente.
             */

            if (
                habitacion.estado ===
                "LIMPIEZA"
            ) {

                return;
            }


            habitacion.estado =
                "DISPONIBLE";
        }
    );
}


/* =========================================================
   BUSCAR RESERVAS
========================================================= */

function buscarReservas() {

    const texto =
        document.getElementById(
            "buscarReserva"
        )?.value
            .trim()
            .toLowerCase() || "";


    const filas =
        document.querySelectorAll(
            "#tablaReservas tr"
        );


    filas.forEach(
        fila => {

            const contenido =
                fila.textContent
                    .toLowerCase();


            fila.style.display =
                contenido.includes(
                    texto
                )
                    ?
                    ""
                    :
                    "none";
        }
    );
}


/* =========================================================
   BUSCAR HUÉSPEDES
========================================================= */

function buscarHuespedes() {

    const texto =
        document.getElementById(
            "buscarHuesped"
        )?.value
            .trim()
            .toLowerCase() || "";


    const filas =
        document.querySelectorAll(
            "#tablaHuespedes tr"
        );


    filas.forEach(
        fila => {

            const contenido =
                fila.textContent
                    .toLowerCase();


            fila.style.display =
                contenido.includes(
                    texto
                )
                    ?
                    ""
                    :
                    "none";
        }
    );
}


/* =========================================================
   BUSCAR PRODUCTOS
========================================================= */

function buscarProductos() {

    const texto =
        document.getElementById(
            "buscarProducto"
        )?.value
            .trim()
            .toLowerCase() || "";


    const filas =
        document.querySelectorAll(
            "#tablaProductos tr"
        );


    filas.forEach(
        fila => {

            const contenido =
                fila.textContent
                    .toLowerCase();


            fila.style.display =
                contenido.includes(
                    texto
                )
                    ?
                    ""
                    :
                    "none";
        }
    );
}


/* =========================================================
   CERRAR MODAL HACIENDO CLIC FUERA
========================================================= */

window.addEventListener(
    "click",
    function (event) {

        const elemento =
            event.target;


        if (
            elemento.classList &&
            elemento.classList.contains(
                "modal"
            )
        ) {

            elemento.classList.remove(
                "activo"
            );
        }
    }
);


/* =========================================================
   TECLA ESC PARA CERRAR MODALES
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            document
                .querySelectorAll(
                    ".modal.activo"
                )
                .forEach(
                    modal => {

                        modal.classList.remove(
                            "activo"
                        );
                    }
                );
        }
    }
);


/* =========================================================
   ACTUALIZAR RELOJES DE ESTADÍAS POR HORA
========================================================= */

function actualizarRelojesEstadias() {

    const elementos =
        document.querySelectorAll(
            "[data-fin-estadia]"
        );


    elementos.forEach(
        elemento => {

            const fechaFin =
                elemento.getAttribute(
                    "data-fin-estadia"
                );


            if (!fechaFin) {
                return;
            }


            elemento.textContent =
                obtenerTiempoRestante(
                    fechaFin
                );
        }
    );
}


/* =========================================================
   INICIAR RELOJ VISUAL
========================================================= */

setInterval(
    actualizarRelojesEstadias,
    1000
);


/* =========================================================
   CONFIGURACIÓN INICIAL DE CAJA
========================================================= */

function configurarCajaInicial() {

    const fechaCaja =
        document.getElementById(
            "fechaCaja"
        );


    if (
        fechaCaja &&
        !fechaCaja.value
    ) {

        fechaCaja.value =
            obtenerFechaHoy();
    }


    configurarFechasReporte();
}


/* =========================================================
   RENDER GENERAL
========================================================= */

function renderTodo() {

    actualizarEstadosAutomaticos();

    actualizarEstadosHabitaciones();


    renderResumen();

    renderHabitaciones();

    renderHabitacionesInicio();

    renderReservas();

    renderReservasInicio();

    renderHuespedes();

    renderProductos();

    renderConsumos();

    renderCaja();

    renderHistorial();


    crearRespaldoAutomaticoLocal();
}


/* =========================================================
   INICIALIZACIÓN FINAL
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        configurarCajaInicial();

        renderTodo();


        /*
         * Revisar estadías por hora
         * inmediatamente.
         */

        controlarEstadiasPorHora();


        /*
         * Actualizar reloj visual.
         */

        actualizarRelojesEstadias();
    }
);


/* =========================================================
   GUARDADO AUTOMÁTICO ANTES DE CERRAR
========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        guardarDatos();

        crearRespaldoAutomaticoLocal();
    }
);


/* =========================================================
   FIN DEL SCRIPT
========================================================= */

console.log(
    "Sistema Hotel cargado correctamente."
);
