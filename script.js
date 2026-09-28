/* =========================================================
   SISTEMA DE GESTIÓN HOTELERA
   SCRIPT.JS
========================================================= */

let habitaciones = JSON.parse(localStorage.getItem("hotel_habitaciones")) || [
    { id: 1, numero: "101", tipo: "Simple", precio: 80, estado: "DISPONIBLE" },
    { id: 2, numero: "102", tipo: "Matrimonial", precio: 120, estado: "DISPONIBLE" },
    { id: 3, numero: "103", tipo: "Doble", precio: 140, estado: "DISPONIBLE" },
    { id: 4, numero: "104", tipo: "Suite", precio: 200, estado: "DISPONIBLE" }
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

});


/* =========================================================
   NORMALIZAR DATOS
========================================================= */

function normalizarDatos() {

    habitaciones = habitaciones.map(h => ({
        id: Number(h.id),
        numero: String(h.numero),
        tipo: h.tipo || "Simple",
        precio: Number(h.precio || 0),
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
        habitacionId: Number(r.habitacionId),
        total: Number(r.total || 0),
        estado: r.estado || "RESERVADA",
        creadoEn: r.creadoEn || new Date().toISOString()
    }));

    consumos = consumos.map(c => ({
        ...c,
        id: Number(c.id),
        reservaId: Number(c.reservaId),
        habitacionId: Number(c.habitacionId),
        productoId: Number(c.productoId),
        cantidad: Number(c.cantidad || 0),
        precio: Number(c.precio || 0),
        total: Number(c.total || 0)
    }));

    pagos = pagos.map(p => ({
        ...p,
        id: Number(p.id),
        reservaId: Number(p.reservaId),
        monto: Number(p.monto || 0)
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
}


/* =========================================================
   UTILIDADES
========================================================= */

function generarId(lista) {

    if (!lista.length) {
        return 1;
    }

    return Math.max(...lista.map(x => Number(x.id) || 0)) + 1;
}


function obtenerFechaHoy() {

    const ahora = new Date();

    const año = ahora.getFullYear();

    const mes = String(
        ahora.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        ahora.getDate()
    ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}


function fechaLocalDesdeISO(fecha) {

    if (!fecha) {
        return null;
    }

    return new Date(`${fecha}T00:00:00`);
}


function mostrarFecha() {

    const elemento = document.getElementById("fechaActual");

    if (!elemento) {
        return;
    }

    const ahora = new Date();

    elemento.textContent =
        ahora.toLocaleDateString(
            "es-PE",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}


function configurarFechas() {

    const hoy = obtenerFechaHoy();

    const entradaReserva =
        document.getElementById("entradaReserva");

    const salidaReserva =
        document.getElementById("salidaReserva");

    const checkinEntrada =
        document.getElementById("checkinEntrada");

    const fechaCaja =
        document.getElementById("fechaCaja");

    const reporteDesde =
        document.getElementById("reporteDesde");

    const reporteHasta =
        document.getElementById("reporteHasta");

    if (entradaReserva) {
        entradaReserva.min = hoy;
    }

    if (salidaReserva) {
        salidaReserva.min = hoy;
    }

    if (checkinEntrada) {
        checkinEntrada.value = hoy;
        checkinEntrada.min = hoy;
    }

    if (fechaCaja) {
        fechaCaja.value = hoy;
    }

    if (reporteDesde) {
        reporteDesde.value = hoy;
    }

    if (reporteHasta) {
        reporteHasta.value = hoy;
    }
}


function formatearFecha(fecha) {

    if (!fecha) {
        return "-";
    }

    const f = fechaLocalDesdeISO(fecha);

    return f.toLocaleDateString("es-PE");
}


function formatearFechaHora(fecha) {

    if (!fecha) {
        return "-";
    }

    return new Date(fecha).toLocaleString("es-PE");
}


function obtenerFechaISORegistro(fechaISO) {

    if (!fechaISO) {
        return "";
    }

    const fecha = new Date(fechaISO);

    const año = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}


function sumarDias(fecha, dias) {

    const f = fechaLocalDesdeISO(fecha);

    f.setDate(
        f.getDate() + Number(dias)
    );

    const año = f.getFullYear();

    const mes = String(
        f.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        f.getDate()
    ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}


function calcularNoches(entrada, salida) {

    if (!entrada || !salida) {
        return 0;
    }

    const inicio = fechaLocalDesdeISO(entrada);

    const fin = fechaLocalDesdeISO(salida);

    const diferencia =
        fin.getTime() - inicio.getTime();

    return Math.round(
        diferencia / 86400000
    );
}


function dinero(numero) {

    return `S/ ${Number(numero || 0).toFixed(2)}`;
}


function escaparHTML(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   HISTORIAL
========================================================= */

function registrarMovimiento(
    accion,
    habitacion = "-",
    detalle = ""
) {

    historial.unshift({

        id: generarId(historial),

        fecha: new Date().toISOString(),

        accion,

        habitacion: String(habitacion || "-"),

        detalle
    });

    guardarDatos();
}


function renderHistorial() {

    const tabla =
        document.getElementById("tablaHistorial");

    if (!tabla) {
        return;
    }

    const busqueda =
        (
            document.getElementById("buscarHistorial")?.value ||
            ""
        )
        .trim()
        .toLowerCase();

    let lista = [...historial];

    if (busqueda) {

        lista = lista.filter(item =>

            String(item.accion)
                .toLowerCase()
                .includes(busqueda)

            ||

            String(item.habitacion)
                .toLowerCase()
                .includes(busqueda)

            ||

            String(item.detalle)
                .toLowerCase()
                .includes(busqueda)
        );
    }

    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="4">
                    No hay movimientos registrados.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML = lista.map(item => `

        <tr>

            <td class="historial-fecha">
                ${formatearFechaHora(item.fecha)}
            </td>

            <td>
                <span class="historial-accion">
                    ${escaparHTML(item.accion)}
                </span>
            </td>

            <td class="historial-habitacion">
                ${escaparHTML(item.habitacion)}
            </td>

            <td class="historial-detalle">
                ${escaparHTML(item.detalle)}
            </td>

        </tr>

    `).join("");
}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function mostrarSeccion(id, boton) {

    document
        .querySelectorAll(".seccion")
        .forEach(seccion => {
            seccion.classList.remove("activa");
        });

    document
        .querySelectorAll(".menu-item")
        .forEach(item => {
            item.classList.remove("activo");
        });

    const seccion =
        document.getElementById(id);

    if (seccion) {
        seccion.classList.add("activa");
    }

    if (boton) {
        boton.classList.add("activo");
    }

    const titulos = {

        inicio: "Panel principal",

        habitaciones: "Habitaciones",

        reservas: "Reservas",

        huespedes: "Huéspedes",

        productos: "Productos",

        consumos: "Consumos",

        caja: "Caja diaria",

        reportes: "Reportes",

        historial: "Historial de movimientos",

        seguridad: "Respaldo"
    };

    const titulo =
        document.getElementById("tituloPagina");

    if (titulo) {
        titulo.textContent =
            titulos[id] || "Sistema Hotelero";
    }

    actualizarEstadosAutomaticos();

    renderTodo();
}


/* =========================================================
   MODALES
========================================================= */

function abrirModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.add("activo");
    }
}


function cerrarModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove("activo");
    }
}


/* =========================================================
   DISPONIBILIDAD POR FECHAS
========================================================= */

function hayCruceFechas(
    inicioA,
    finA,
    inicioB,
    finB
) {

    return (
        inicioA < finB &&
        finA > inicioB
    );
}


function habitacionDisponibleParaFechas(
    habitacionId,
    entrada,
    salida,
    ignorarReservaId = null
) {

    if (!entrada || !salida) {
        return true;
    }

    return !reservas.some(reserva => {

        if (
            Number(reserva.habitacionId) !==
            Number(habitacionId)
        ) {
            return false;
        }

        if (
            ignorarReservaId &&
            Number(reserva.id) ===
            Number(ignorarReservaId)
        ) {
            return false;
        }

        if (
            reserva.estado === "CANCELADA" ||
            reserva.estado === "FINALIZADA"
        ) {
            return false;
        }

        return hayCruceFechas(
            entrada,
            salida,
            reserva.entrada,
            reserva.salida
        );
    });
}


/* =========================================================
   ESTADOS AUTOMÁTICOS
========================================================= */

function actualizarEstadosAutomaticos() {

    const hoy = obtenerFechaHoy();

    reservas.forEach(reserva => {

        if (
            reserva.estado === "CANCELADA" ||
            reserva.estado === "FINALIZADA" ||
            reserva.estado === "OCUPADA"
        ) {
            return;
        }

        if (reserva.entrada > hoy) {
            reserva.estado = "RESERVADA";
        }

        if (
            reserva.entrada <= hoy &&
            reserva.salida > hoy
        ) {
            reserva.estado =
                reserva.estado === "CHECKIN"
                    ? "OCUPADA"
                    : "RESERVADA";
        }
    });

    habitaciones.forEach(habitacion => {

        if (
            habitacion.estado === "LIMPIEZA" ||
            habitacion.estado === "MANTENIMIENTO"
        ) {
            return;
        }

        const ocupada = reservas.some(r =>
            Number(r.habitacionId) ===
                Number(habitacion.id)
            &&
            r.estado === "OCUPADA"
        );

        habitacion.estado =
            ocupada
                ? "OCUPADA"
                : "DISPONIBLE";
    });

    guardarDatos();
}


/* =========================================================
   HABITACIONES
========================================================= */

function abrirModalHabitacion(id = null) {

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
        "estadoHabitacion"
    ).value = "DISPONIBLE";

    document.getElementById(
        "tituloModalHabitacion"
    ).textContent = "Nueva habitación";

    if (id !== null) {

        const habitacion =
            habitaciones.find(
                h => Number(h.id) === Number(id)
            );

        if (!habitacion) {
            return;
        }

        document.getElementById(
            "tituloModalHabitacion"
        ).textContent = "Editar habitación";

        document.getElementById(
            "habitacionEditandoId"
        ).value = habitacion.id;

        document.getElementById(
            "numeroHabitacion"
        ).value = habitacion.numero;

        document.getElementById(
            "tipoHabitacion"
        ).value = habitacion.tipo;

        document.getElementById(
            "precioHabitacion"
        ).value = habitacion.precio;

        document.getElementById(
            "estadoHabitacion"
        ).value =
            habitacion.estado === "OCUPADA"
                ? "DISPONIBLE"
                : habitacion.estado;
    }

    abrirModal("modalHabitacion");
}


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

    const estado =
        document.getElementById(
            "estadoHabitacion"
        ).value;

    if (!numero) {

        notificar(
            "Ingresa el número de habitación."
        );

        return;
    }

    if (precio <= 0) {

        notificar(
            "Ingresa un precio válido."
        );

        return;
    }

    const duplicada =
        habitaciones.some(h =>
            h.numero.toLowerCase() ===
                numero.toLowerCase()
            &&
            Number(h.id) !== id
        );

    if (duplicada) {

        notificar(
            "Ya existe una habitación con ese número."
        );

        return;
    }

    if (id) {

        const habitacion =
            habitaciones.find(
                h => Number(h.id) === id
            );

        if (!habitacion) {
            return;
        }

        const estadoAnterior =
            habitacion.estado;

        const numeroAnterior =
            habitacion.numero;

        const estaOcupada =
            reservas.some(r =>
                Number(r.habitacionId) === id &&
                r.estado === "OCUPADA"
            );

        habitacion.numero = numero;
        habitacion.tipo = tipo;
        habitacion.precio = precio;

        if (!estaOcupada) {
            habitacion.estado = estado;
        }

        registrarMovimiento(
            "HABITACIÓN EDITADA",
            numero,
            `Habitación ${numeroAnterior} actualizada. Estado anterior: ${estadoAnterior}.`
        );

        notificar(
            "Habitación actualizada."
        );

    } else {

        const nueva = {

            id: generarId(habitaciones),

            numero,

            tipo,

            precio,

            estado
        };

        habitaciones.push(nueva);

        registrarMovimiento(
            "HABITACIÓN CREADA",
            numero,
            `${tipo} - ${dinero(precio)} por noche.`
        );

        notificar(
            "Habitación creada."
        );
    }

    guardarDatos();

    cerrarModal("modalHabitacion");

    renderTodo();
}


function eliminarHabitacion(id) {

    const habitacion =
        habitaciones.find(
            h => Number(h.id) === Number(id)
        );

    if (!habitacion) {
        return;
    }

    const tieneReserva =
        reservas.some(r =>
            Number(r.habitacionId) ===
                Number(id)
            &&
            r.estado !== "CANCELADA" &&
            r.estado !== "FINALIZADA"
        );

    if (tieneReserva) {

        alert(
            "No puedes eliminar esta habitación porque tiene una reserva activa o futura."
        );

        return;
    }

    const confirmar =
        confirm(
            `¿Eliminar la habitación ${habitacion.numero}?`
        );

    if (!confirmar) {
        return;
    }

    habitaciones =
        habitaciones.filter(
            h => Number(h.id) !== Number(id)
        );

    registrarMovimiento(
        "HABITACIÓN ELIMINADA",
        habitacion.numero,
        `${habitacion.tipo} eliminada del sistema.`
    );

    guardarDatos();

    renderTodo();

    notificar(
        "Habitación eliminada."
    );
}


function filtrarHabitaciones(
    estado,
    boton
) {

    filtroHabitacionActual = estado;

    document
        .querySelectorAll(".filtro")
        .forEach(b => {
            b.classList.remove("activo");
        });

    if (boton) {
        boton.classList.add("activo");
    }

    renderHabitaciones();
}


function existeReservaFuturaHabitacion(
    habitacionId
) {

    const hoy = obtenerFechaHoy();

    return reservas.some(r =>

        Number(r.habitacionId) ===
            Number(habitacionId)

        &&

        r.estado === "RESERVADA"

        &&

        r.entrada > hoy
    );
}


function crearTarjetaHabitacion(
    habitacion,
    mostrarEdicion = true
) {

    const reservaOcupada =
        reservas.find(r =>
            Number(r.habitacionId) ===
                Number(habitacion.id)
            &&
            r.estado === "OCUPADA"
        );

    const reservaFutura =
        reservas
            .filter(r =>
                Number(r.habitacionId) ===
                    Number(habitacion.id)
                &&
                r.estado === "RESERVADA"
                &&
                r.entrada > obtenerFechaHoy()
            )
            .sort(
                (a, b) =>
                    a.entrada.localeCompare(b.entrada)
            )[0];

    let estadoTexto =
        habitacion.estado;

    let claseEstado =
        `estado-${habitacion.estado.toLowerCase()}`;

    let informacion = "";

    if (
        habitacion.estado === "DISPONIBLE" &&
        reservaFutura
    ) {

        informacion = `
            <div class="tipo-habitacion">
                📅 Próxima reserva:
                ${formatearFecha(reservaFutura.entrada)}
            </div>
        `;
    }

    if (reservaOcupada) {

        informacion = `
            <div class="tipo-habitacion">
                👤 ${escaparHTML(reservaOcupada.nombre)}
            </div>
        `;
    }

    let botones = "";

    if (mostrarEdicion) {

        botones += `
            <button
                class="btn-editar"
                onclick="abrirModalHabitacion(${habitacion.id})"
            >
                ✏️ Editar
            </button>
        `;

        if (habitacion.estado !== "OCUPADA") {

            botones += `
                <button
                    class="btn-eliminar"
                    onclick="eliminarHabitacion(${habitacion.id})"
                >
                    🗑 Eliminar
                </button>
            `;
        }
    }

    if (habitacion.estado === "OCUPADA") {

        botones += `
            <button
                onclick="abrirCuentaPorHabitacion(${habitacion.id})"
            >
                💳 Cuenta
            </button>

            <button
                onclick="abrirModalConsumo(${habitacion.id})"
            >
                🛒 Consumo
            </button>
        `;
    }

    if (habitacion.estado === "LIMPIEZA") {

        botones += `
            <button
                onclick="marcarHabitacionLimpia(${habitacion.id})"
            >
                ✓ Habitación limpia
            </button>
        `;
    }

    return `

        <div class="habitacion-card">

            <div class="numero-habitacion">
                ${escaparHTML(habitacion.numero)}
            </div>

            <div class="tipo-habitacion">
                ${escaparHTML(habitacion.tipo)}
            </div>

            <span class="estado ${claseEstado}">
                ${estadoTexto}
            </span>

            ${informacion}

            <div class="precio-habitacion">
                ${dinero(habitacion.precio)}
                / noche
            </div>

            <div class="acciones-habitacion">
                ${botones}
            </div>

        </div>
    `;
}


function renderHabitaciones() {

    const contenedor =
        document.getElementById(
            "listaHabitaciones"
        );

    if (!contenedor) {
        return;
    }

    let lista =
        [...habitaciones]
        .sort(
            (a, b) =>
                String(a.numero)
                    .localeCompare(
                        String(b.numero),
                        undefined,
                        { numeric: true }
                    )
        );

    if (
        filtroHabitacionActual !== "TODAS"
    ) {

        lista = lista.filter(
            h =>
                h.estado ===
                filtroHabitacionActual
        );
    }

    if (!lista.length) {

        contenedor.innerHTML = `
            <div class="panel">
                No hay habitaciones.
            </div>
        `;

        return;
    }

    contenedor.innerHTML =
        lista.map(
            h => crearTarjetaHabitacion(h, true)
        ).join("");
}


function renderHabitacionesInicio() {

    const contenedor =
        document.getElementById(
            "habitacionesInicio"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML =
        [...habitaciones]
            .sort(
                (a, b) =>
                    String(a.numero)
                        .localeCompare(
                            String(b.numero),
                            undefined,
                            { numeric: true }
                        )
            )
            .map(
                h => crearTarjetaHabitacion(h, false)
            )
            .join("");
}


function marcarHabitacionLimpia(id) {

    const habitacion =
        habitaciones.find(
            h => Number(h.id) === Number(id)
        );

    if (!habitacion) {
        return;
    }

    habitacion.estado =
        "DISPONIBLE";

    registrarMovimiento(
        "HABITACIÓN LIMPIA",
        habitacion.numero,
        "La habitación volvió a estar disponible."
    );

    guardarDatos();

    renderTodo();

    notificar(
        "Habitación disponible."
    );
}


/* =========================================================
   RESERVAS
========================================================= */

function abrirModalReserva(id = null) {

    document.getElementById(
        "reservaEditandoId"
    ).value = "";

    document.getElementById(
        "nombreReserva"
    ).value = "";

    document.getElementById(
        "dniReserva"
    ).value = "";

    document.getElementById(
        "telefonoReserva"
    ).value = "";

    document.getElementById(
        "entradaReserva"
    ).value = obtenerFechaHoy();

    document.getElementById(
        "salidaReserva"
    ).value =
        sumarDias(obtenerFechaHoy(), 1);

    document.getElementById(
        "totalReserva"
    ).textContent = dinero(0);

    document.getElementById(
        "tituloModalReserva"
    ).textContent = "Nueva reserva";

    if (id !== null) {

        const reserva =
            reservas.find(
                r => Number(r.id) === Number(id)
            );

        if (!reserva) {
            return;
        }

        if (
            reserva.estado === "FINALIZADA" ||
            reserva.estado === "CANCELADA"
        ) {

            alert(
                "Esta reserva ya no puede editarse."
            );

            return;
        }

        document.getElementById(
            "tituloModalReserva"
        ).textContent = "Editar reserva";

        document.getElementById(
            "reservaEditandoId"
        ).value = reserva.id;

        document.getElementById(
            "nombreReserva"
        ).value = reserva.nombre;

        document.getElementById(
            "dniReserva"
        ).value = reserva.dni;

        document.getElementById(
            "telefonoReserva"
        ).value =
            reserva.telefono || "";

        document.getElementById(
            "entradaReserva"
        ).value = reserva.entrada;

        document.getElementById(
            "salidaReserva"
        ).value = reserva.salida;
    }

    actualizarHabitacionesReserva();

    if (id !== null) {

        const reserva =
            reservas.find(
                r => Number(r.id) === Number(id)
            );

        document.getElementById(
            "habitacionReserva"
        ).value =
            reserva.habitacionId;
    }

    calcularReserva();

    abrirModal("modalReserva");
}


function actualizarHabitacionesReserva() {

    const select =
        document.getElementById(
            "habitacionReserva"
        );

    if (!select) {
        return;
    }

    const entrada =
        document.getElementById(
            "entradaReserva"
        ).value;

    const salida =
        document.getElementById(
            "salidaReserva"
        ).value;

    const editandoId =
        Number(
            document.getElementById(
                "reservaEditandoId"
            ).value
        ) || null;

    const valorAnterior =
        Number(select.value);

    let disponibles =
        habitaciones.filter(h => {

            if (
                h.estado === "MANTENIMIENTO"
            ) {
                return false;
            }

            return habitacionDisponibleParaFechas(
                h.id,
                entrada,
                salida,
                editandoId
            );
        });

    select.innerHTML =
        `<option value="">
            Seleccionar habitación
        </option>`

        +

        disponibles.map(h => `

            <option value="${h.id}">
                Hab. ${escaparHTML(h.numero)}
                - ${escaparHTML(h.tipo)}
                - ${dinero(h.precio)}
            </option>

        `).join("");

    if (
        disponibles.some(
            h =>
                Number(h.id) ===
                valorAnterior
        )
    ) {
        select.value = valorAnterior;
    }

    calcularReserva();
}


function calcularReserva() {

    const habitacionId =
        Number(
            document.getElementById(
                "habitacionReserva"
            )?.value
        );

    const entrada =
        document.getElementById(
            "entradaReserva"
        )?.value;

    const salida =
        document.getElementById(
            "salidaReserva"
        )?.value;

    const totalElemento =
        document.getElementById(
            "totalReserva"
        );

    if (!totalElemento) {
        return;
    }

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                habitacionId
        );

    const noches =
        calcularNoches(
            entrada,
            salida
        );

    if (
        !habitacion ||
        noches <= 0
    ) {

        totalElemento.textContent =
            dinero(0);

        return;
    }

    const total =
        noches * habitacion.precio;

    totalElemento.textContent =
        dinero(total);
}


function guardarReserva() {

    const editandoId =
        Number(
            document.getElementById(
                "reservaEditandoId"
            ).value
        ) || null;

    const nombre =
        document.getElementById(
            "nombreReserva"
        ).value.trim();

    const dni =
        document.getElementById(
            "dniReserva"
        ).value.trim();

    const telefono =
        document.getElementById(
            "telefonoReserva"
        ).value.trim();

    const habitacionId =
        Number(
            document.getElementById(
                "habitacionReserva"
            ).value
        );

    const entrada =
        document.getElementById(
            "entradaReserva"
        ).value;

    const salida =
        document.getElementById(
            "salidaReserva"
        ).value;

    if (
        !nombre ||
        !dni ||
        !habitacionId ||
        !entrada ||
        !salida
    ) {

        notificar(
            "Completa los datos obligatorios."
        );

        return;
    }

    if (dni.length !== 8) {

        notificar(
            "El DNI debe tener 8 dígitos."
        );

        return;
    }

    const noches =
        calcularNoches(
            entrada,
            salida
        );

    if (noches <= 0) {

        notificar(
            "La fecha de salida debe ser posterior a la entrada."
        );

        return;
    }

    if (
        !habitacionDisponibleParaFechas(
            habitacionId,
            entrada,
            salida,
            editandoId
        )
    ) {

        alert(
            "La habitación ya tiene una reserva que se cruza con esas fechas."
        );

        actualizarHabitacionesReserva();

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

    const total =
        noches * habitacion.precio;

    if (editandoId) {

        const reserva =
            reservas.find(
                r =>
                    Number(r.id) ===
                    editandoId
            );

        if (!reserva) {
            return;
        }

        const habitacionAnterior =
            habitaciones.find(
                h =>
                    Number(h.id) ===
                    Number(reserva.habitacionId)
            );

        reserva.nombre = nombre;
        reserva.dni = dni;
        reserva.telefono = telefono;
        reserva.habitacionId =
            habitacionId;
        reserva.entrada = entrada;
        reserva.salida = salida;
        reserva.total = total;

        if (
            reserva.estado !== "OCUPADA"
        ) {
            reserva.estado =
                entrada > obtenerFechaHoy()
                    ? "RESERVADA"
                    : "RESERVADA";
        }

        registrarMovimiento(
            "RESERVA EDITADA",
            habitacion.numero,
            `${nombre}. Habitación anterior: ${
                habitacionAnterior?.numero || "-"
            }. ${formatearFecha(entrada)} al ${formatearFecha(salida)}.`
        );

        notificar(
            "Reserva actualizada."
        );

    } else {

        const nuevaReserva = {

            id: generarId(reservas),

            nombre,

            dni,

            telefono,

            habitacionId,

            entrada,

            salida,

            total,

            estado: "RESERVADA",

            creadoEn:
                new Date().toISOString()
        };

        reservas.push(
            nuevaReserva
        );

        registrarMovimiento(
            "RESERVA CREADA",
            habitacion.numero,
            `${nombre} - ${formatearFecha(entrada)} al ${formatearFecha(salida)} - ${dinero(total)}.`
        );

        notificar(
            "Reserva registrada."
        );
    }

    guardarDatos();

    actualizarEstadosAutomaticos();

    cerrarModal("modalReserva");

    renderTodo();
}


function renderReservas() {

    const tabla =
        document.getElementById(
            "tablaReservas"
        );

    if (!tabla) {
        return;
    }

    const busqueda =
        (
            document.getElementById(
                "buscarReserva"
            )?.value || ""
        )
        .trim()
        .toLowerCase();

    let lista =
        [...reservas]
        .sort(
            (a, b) =>
                b.id - a.id
        );

    if (busqueda) {

        lista = lista.filter(r => {

            const habitacion =
                habitaciones.find(
                    h =>
                        Number(h.id) ===
                        Number(r.habitacionId)
                );

            return (
                r.nombre
                    .toLowerCase()
                    .includes(busqueda)

                ||

                String(r.dni)
                    .toLowerCase()
                    .includes(busqueda)

                ||

                String(
                    habitacion?.numero || ""
                )
                    .toLowerCase()
                    .includes(busqueda)
            );
        });
    }

    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="9">
                    No hay reservas.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML =
        lista.map(reserva => {

            const habitacion =
                habitaciones.find(
                    h =>
                        Number(h.id) ===
                        Number(reserva.habitacionId)
                );

            let clase =
                "reserva-futura";

            if (
                reserva.estado === "OCUPADA"
            ) {
                clase = "reserva-activa";
            }

            if (
                reserva.estado === "FINALIZADA"
            ) {
                clase =
                    "reserva-finalizada";
            }

            if (
                reserva.estado === "CANCELADA"
            ) {
                clase =
                    "reserva-cancelada";
            }

            let acciones = "";

            if (
                reserva.estado === "RESERVADA"
            ) {

                acciones += `
                    <button
                        class="tabla-boton verde"
                        onclick="realizarCheckInReserva(${reserva.id})"
                    >
                        Check-in
                    </button>

                    <button
                        class="tabla-boton azul"
                        onclick="abrirModalReserva(${reserva.id})"
                    >
                        Editar
                    </button>

                    <button
                        class="tabla-boton rojo"
                        onclick="cancelarReserva(${reserva.id})"
                    >
                        Cancelar
                    </button>
                `;
            }

            if (
                reserva.estado === "OCUPADA"
            ) {

                acciones += `
                    <button
                        class="tabla-boton azul"
                        onclick="abrirCuenta(${reserva.id})"
                    >
                        Cuenta
                    </button>

                    <button
                        class="tabla-boton verde"
                        onclick="abrirModalConsumo(${reserva.habitacionId})"
                    >
                        Consumo
                    </button>
                `;
            }

            if (
                reserva.estado === "CANCELADA" ||
                reserva.estado === "FINALIZADA"
            ) {

                acciones += `
                    <button
                        class="tabla-boton rojo"
                        onclick="eliminarReservaDefinitiva(${reserva.id})"
                    >
                        Eliminar
                    </button>
                `;
            }

            return `

                <tr>

                    <td>
                        ${reserva.id}
                    </td>

                    <td>
                        ${escaparHTML(reserva.nombre)}
                    </td>

                    <td>
                        ${escaparHTML(reserva.dni)}
                    </td>

                    <td>
                        ${escaparHTML(habitacion?.numero || "-")}
                    </td>

                    <td>
                        ${formatearFecha(reserva.entrada)}
                    </td>

                    <td>
                        ${formatearFecha(reserva.salida)}
                    </td>

                    <td>
                        ${dinero(reserva.total)}
                    </td>

                    <td>
                        <span class="${clase}">
                            ${reserva.estado}
                        </span>
                    </td>

                    <td>
                        ${acciones}
                    </td>

                </tr>
            `;

        }).join("");
}


function renderReservasInicio() {

    const tabla =
        document.getElementById(
            "reservasInicio"
        );

    if (!tabla) {
        return;
    }

    const lista =
        [...reservas]
            .sort(
                (a, b) =>
                    b.id - a.id
            )
            .slice(0, 6);

    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="5">
                    No hay reservas registradas.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML =
        lista.map(reserva => {

            const habitacion =
                habitaciones.find(
                    h =>
                        Number(h.id) ===
                        Number(reserva.habitacionId)
                );

            return `

                <tr>

                    <td>
                        ${escaparHTML(reserva.nombre)}
                    </td>

                    <td>
                        ${escaparHTML(habitacion?.numero || "-")}
                    </td>

                    <td>
                        ${formatearFecha(reserva.entrada)}
                    </td>

                    <td>
                        ${formatearFecha(reserva.salida)}
                    </td>

                    <td>
                        ${reserva.estado}
                    </td>

                </tr>
            `;

        }).join("");
}


/* =========================================================
   CHECK-IN DE RESERVA
========================================================= */

function realizarCheckInReserva(id) {

    const reserva =
        reservas.find(
            r => Number(r.id) === Number(id)
        );

    if (!reserva) {
        return;
    }

    if (
        reserva.estado !== "RESERVADA"
    ) {
        return;
    }

    const hoy =
        obtenerFechaHoy();

    if (hoy < reserva.entrada) {

        const confirmar =
            confirm(
                `La reserva empieza el ${formatearFecha(reserva.entrada)}. ¿Deseas hacer el check-in antes de la fecha programada?`
            );

        if (!confirmar) {
            return;
        }
    }

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(reserva.habitacionId)
        );

    if (!habitacion) {
        return;
    }

    if (
        habitacion.estado === "MANTENIMIENTO" ||
        habitacion.estado === "LIMPIEZA"
    ) {

        alert(
            `La habitación está en estado ${habitacion.estado}.`
        );

        return;
    }

    const otraOcupacion =
        reservas.some(r =>
            Number(r.id) !==
                Number(reserva.id)
            &&
            Number(r.habitacionId) ===
                Number(reserva.habitacionId)
            &&
            r.estado === "OCUPADA"
        );

    if (otraOcupacion) {

        alert(
            "La habitación ya está ocupada."
        );

        return;
    }

    reserva.estado =
        "OCUPADA";

    habitacion.estado =
        "OCUPADA";

    registrarMovimiento(
        "CHECK-IN",
        habitacion.numero,
        `${reserva.nombre} ingresó a la habitación.`
    );

    guardarDatos();

    renderTodo();

    notificar(
        "Check-in realizado."
    );
}


/* =========================================================
   CANCELAR RESERVA
========================================================= */

function cancelarReserva(id) {

    const reserva =
        reservas.find(
            r => Number(r.id) === Number(id)
        );

    if (!reserva) {
        return;
    }

    if (
        reserva.estado === "OCUPADA"
    ) {

        alert(
            "No puedes cancelar una reserva con el huésped alojado. Debes realizar el check-out."
        );

        return;
    }

    const consumosReserva =
        consumos.filter(
            c =>
                Number(c.reservaId) ===
                Number(id)
        );

    const pagosReserva =
        pagos.filter(
            p =>
                Number(p.reservaId) ===
                Number(id)
        );

    if (
        consumosReserva.length ||
        pagosReserva.length
    ) {

        alert(
            "Esta reserva tiene consumos o pagos registrados. No puede cancelarse directamente."
        );

        return;
    }

    const confirmar =
        confirm(
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
                Number(reserva.habitacionId)
        );

    registrarMovimiento(
        "RESERVA CANCELADA",
        habitacion?.numero || "-",
        `Reserva de ${reserva.nombre} cancelada.`
    );

    guardarDatos();

    actualizarEstadosAutomaticos();

    renderTodo();

    notificar(
        "Reserva cancelada."
    );
}


function eliminarReservaDefinitiva(id) {

    const reserva =
        reservas.find(
            r => Number(r.id) === Number(id)
        );

    if (!reserva) {
        return;
    }

    if (
        reserva.estado !== "CANCELADA" &&
        reserva.estado !== "FINALIZADA"
    ) {

        alert(
            "Solo puedes eliminar reservas canceladas o finalizadas."
        );

        return;
    }

    const confirmar =
        confirm(
            "¿Eliminar definitivamente esta reserva y sus registros relacionados?"
        );

    if (!confirmar) {
        return;
    }

    const consumosReserva =
        consumos.filter(
            c =>
                Number(c.reservaId) ===
                Number(id)
        );

    consumosReserva.forEach(consumo => {

        const producto =
            productos.find(
                p =>
                    Number(p.id) ===
                    Number(consumo.productoId)
            );

        if (producto) {
            producto.stock +=
                Number(consumo.cantidad);
        }
    });

    consumos =
        consumos.filter(
            c =>
                Number(c.reservaId) !==
                Number(id)
        );

    pagos =
        pagos.filter(
            p =>
                Number(p.reservaId) !==
                Number(id)
        );

    reservas =
        reservas.filter(
            r =>
                Number(r.id) !==
                Number(id)
        );

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(reserva.habitacionId)
        );

    registrarMovimiento(
        "RESERVA ELIMINADA",
        habitacion?.numero || "-",
        `Se eliminó definitivamente la reserva de ${reserva.nombre}.`
    );

    guardarDatos();

    renderTodo();

    notificar(
        "Reserva eliminada."
    );
}


/* =========================================================
   CHECK-IN DIRECTO
========================================================= */

function abrirCheckInDirecto() {

    const disponibles =
        habitaciones.filter(
            h =>
                h.estado === "DISPONIBLE"
        );

    if (!disponibles.length) {

        alert(
            "No hay habitaciones disponibles."
        );

        return;
    }

    document.getElementById(
        "checkinNombre"
    ).value = "";

    document.getElementById(
        "checkinDni"
    ).value = "";

    document.getElementById(
        "checkinTelefono"
    ).value = "";

    document.getElementById(
        "checkinEntrada"
    ).value = obtenerFechaHoy();

    document.getElementById(
        "checkinNoches"
    ).value = 1;

    document.getElementById(
        "checkinAdultos"
    ).value = 1;

    document.getElementById(
        "checkinNinos"
    ).value = 0;

    actualizarHabitacionesCheckIn();

    calcularCheckIn();

    abrirModal("modalCheckIn");
}


function actualizarHabitacionesCheckIn() {

    const select =
        document.getElementById(
            "checkinHabitacion"
        );

    if (!select) {
        return;
    }

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

    const salida =
        sumarDias(
            entrada,
            noches
        );

    const disponibles =
        habitaciones.filter(h =>

            h.estado === "DISPONIBLE"

            &&

            habitacionDisponibleParaFechas(
                h.id,
                entrada,
                salida
            )
        );

    select.innerHTML =
        `<option value="">
            Seleccionar habitación
        </option>`

        +

        disponibles.map(h => `

            <option value="${h.id}">
                Hab. ${escaparHTML(h.numero)}
                - ${escaparHTML(h.tipo)}
                - ${dinero(h.precio)}
            </option>

        `).join("");
}


function calcularCheckIn() {

    actualizarHabitacionesCheckInSinRecursion();

    const habitacionId =
        Number(
            document.getElementById(
                "checkinHabitacion"
            )?.value
        );

    const noches =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "checkinNoches"
                )?.value || 1
            )
        );

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                habitacionId
        );

    const total =
        habitacion
            ? habitacion.precio * noches
            : 0;

    document.getElementById(
        "checkinTotal"
    ).textContent =
        dinero(total);
}


function actualizarHabitacionesCheckInSinRecursion() {

    const select =
        document.getElementById(
            "checkinHabitacion"
        );

    if (!select) {
        return;
    }

    const valorActual =
        Number(select.value);

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

    const salida =
        sumarDias(
            entrada,
            noches
        );

    const disponibles =
        habitaciones.filter(h =>

            h.estado === "DISPONIBLE"

            &&

            habitacionDisponibleParaFechas(
                h.id,
                entrada,
                salida
            )
        );

    select.innerHTML =
        `<option value="">
            Seleccionar habitación
        </option>`

        +

        disponibles.map(h => `

            <option value="${h.id}">
                Hab. ${escaparHTML(h.numero)}
                - ${escaparHTML(h.tipo)}
                - ${dinero(h.precio)}
            </option>

        `).join("");

    if (
        disponibles.some(
            h =>
                Number(h.id) ===
                valorActual
        )
    ) {
        select.value = valorActual;
    }
}


function guardarCheckInDirecto() {

    const nombre =
        document.getElementById(
            "checkinNombre"
        ).value.trim();

    const dni =
        document.getElementById(
            "checkinDni"
        ).value.trim();

    const telefono =
        document.getElementById(
            "checkinTelefono"
        ).value.trim();

    const habitacionId =
        Number(
            document.getElementById(
                "checkinHabitacion"
            ).value
        );

    const entrada =
        document.getElementById(
            "checkinEntrada"
        ).value;

    const noches =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "checkinNoches"
                ).value
            )
        );

    if (
        !nombre ||
        !dni ||
        !habitacionId
    ) {

        notificar(
            "Completa los datos obligatorios."
        );

        return;
    }

    if (dni.length !== 8) {

        notificar(
            "El DNI debe tener 8 dígitos."
        );

        return;
    }

    const salida =
        sumarDias(
            entrada,
            noches
        );

    if (
        !habitacionDisponibleParaFechas(
            habitacionId,
            entrada,
            salida
        )
    ) {

        alert(
            "La habitación tiene una reserva que se cruza con esas fechas."
        );

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

    const total =
        habitacion.precio * noches;

    const reserva = {

        id: generarId(reservas),

        nombre,

        dni,

        telefono,

        habitacionId,

        entrada,

        salida,

        total,

        adultos:
            Number(
                document.getElementById(
                    "checkinAdultos"
                ).value || 1
            ),

        ninos:
            Number(
                document.getElementById(
                    "checkinNinos"
                ).value || 0
            ),

        estado: "OCUPADA",

        creadoEn:
            new Date().toISOString()
    };

    reservas.push(reserva);

    habitacion.estado =
        "OCUPADA";

    registrarMovimiento(
        "CHECK-IN DIRECTO",
        habitacion.numero,
        `${nombre} - ${noches} noche(s) - ${dinero(total)}.`
    );

    guardarDatos();

    cerrarModal("modalCheckIn");

    renderTodo();

    notificar(
        "Check-in realizado."
    );
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

    const busqueda =
        (
            document.getElementById(
                "buscarHuesped"
            )?.value || ""
        )
        .trim()
        .toLowerCase();

    let lista =
        [...reservas]
        .filter(
            r =>
                r.estado !== "CANCELADA"
        )
        .sort(
            (a, b) =>
                b.id - a.id
        );

    if (busqueda) {

        lista =
            lista.filter(r =>

                r.nombre
                    .toLowerCase()
                    .includes(busqueda)

                ||

                String(r.dni)
                    .toLowerCase()
                    .includes(busqueda)
            );
    }

    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="5">
                    No hay huéspedes.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML =
        lista.map(r => {

            const habitacion =
                habitaciones.find(
                    h =>
                        Number(h.id) ===
                        Number(r.habitacionId)
                );

            return `

                <tr>

                    <td>
                        ${escaparHTML(r.nombre)}
                    </td>

                    <td>
                        ${escaparHTML(r.dni)}
                    </td>

                    <td>
                        ${escaparHTML(r.telefono || "-")}
                    </td>

                    <td>
                        ${escaparHTML(habitacion?.numero || "-")}
                    </td>

                    <td>
                        ${r.estado}
                    </td>

                </tr>
            `;

        }).join("");
}


/* =========================================================
   PRODUCTOS
========================================================= */

function abrirModalProducto(id = null) {

    document.getElementById(
        "productoEditandoId"
    ).value = "";

    document.getElementById(
        "nombreProducto"
    ).value = "";

    document.getElementById(
        "categoriaProducto"
    ).value = "Bebida";

    document.getElementById(
        "precioProducto"
    ).value = "";

    document.getElementById(
        "stockProducto"
    ).value = "";

    document.getElementById(
        "tituloModalProducto"
    ).textContent = "Nuevo producto";

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

        document.getElementById(
            "productoEditandoId"
        ).value = producto.id;

        document.getElementById(
            "nombreProducto"
        ).value = producto.nombre;

        document.getElementById(
            "categoriaProducto"
        ).value = producto.categoria;

        document.getElementById(
            "precioProducto"
        ).value = producto.precio;

        document.getElementById(
            "stockProducto"
        ).value = producto.stock;

        document.getElementById(
            "tituloModalProducto"
        ).textContent = "Editar producto";
    }

    abrirModal("modalProducto");
}


function guardarProducto() {

    const id =
        Number(
            document.getElementById(
                "productoEditandoId"
            ).value
        ) || null;

    const nombre =
        document.getElementById(
            "nombreProducto"
        ).value.trim();

    const categoria =
        document.getElementById(
            "categoriaProducto"
        ).value;

    const precio =
        Number(
            document.getElementById(
                "precioProducto"
            ).value
        );

    const stock =
        Number(
            document.getElementById(
                "stockProducto"
            ).value
        );

    if (!nombre) {

        notificar(
            "Ingresa el nombre del producto."
        );

        return;
    }

    if (
        precio < 0 ||
        stock < 0
    ) {

        notificar(
            "Precio y stock no pueden ser negativos."
        );

        return;
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

        const stockAnterior =
            producto.stock;

        producto.nombre = nombre;
        producto.categoria = categoria;
        producto.precio = precio;
        producto.stock = stock;

        registrarMovimiento(
            "PRODUCTO EDITADO",
            "-",
            `${nombre}. Stock: ${stockAnterior} → ${stock}. Precio: ${dinero(precio)}.`
        );

        notificar(
            "Producto actualizado."
        );

    } else {

        productos.push({

            id: generarId(productos),

            nombre,

            categoria,

            precio,

            stock
        });

        registrarMovimiento(
            "PRODUCTO CREADO",
            "-",
            `${nombre} - Stock ${stock} - ${dinero(precio)}.`
        );

        notificar(
            "Producto agregado."
        );
    }

    guardarDatos();

    cerrarModal("modalProducto");

    renderTodo();
}


function eliminarProducto(id) {

    const producto =
        productos.find(
            p =>
                Number(p.id) === Number(id)
        );

    if (!producto) {
        return;
    }

    const tieneConsumos =
        consumos.some(
            c =>
                Number(c.productoId) ===
                Number(id)
        );

    if (tieneConsumos) {

        alert(
            "Este producto ya tiene consumos registrados y no puede eliminarse. Puedes dejar su stock en 0."
        );

        return;
    }

    const confirmar =
        confirm(
            `¿Eliminar ${producto.nombre}?`
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
        "-",
        `${producto.nombre} fue eliminado del inventario.`
    );

    guardarDatos();

    renderTodo();

    notificar(
        "Producto eliminado."
    );
}


function renderProductos() {

    const tabla =
        document.getElementById(
            "tablaProductos"
        );

    if (!tabla) {
        return;
    }

    const busqueda =
        (
            document.getElementById(
                "buscarProducto"
            )?.value || ""
        )
        .trim()
        .toLowerCase();

    let lista =
        [...productos]
        .sort(
            (a, b) =>
                a.nombre.localeCompare(
                    b.nombre
                )
        );

    if (busqueda) {

        lista =
            lista.filter(p =>

                p.nombre
                    .toLowerCase()
                    .includes(busqueda)

                ||

                p.categoria
                    .toLowerCase()
                    .includes(busqueda)
            );
    }

    tabla.innerHTML =
        lista.length

        ?

        lista.map(p => `

            <tr>

                <td>
                    ${escaparHTML(p.nombre)}
                </td>

                <td>
                    ${escaparHTML(p.categoria)}
                </td>

                <td>
                    ${dinero(p.precio)}
                </td>

                <td>
                    ${p.stock}
                </td>

                <td>

                    <button
                        class="tabla-boton azul"
                        onclick="abrirModalProducto(${p.id})"
                    >
                        ✏️ Editar
                    </button>

                    <button
                        class="tabla-boton rojo"
                        onclick="eliminarProducto(${p.id})"
                    >
                        🗑 Eliminar
                    </button>

                </td>

            </tr>

        `).join("")

        :

        `
            <tr>
                <td colspan="5">
                    No hay productos.
                </td>
            </tr>
        `;

    const totalProductos =
        document.getElementById(
            "totalProductos"
        );

    const stockTotal =
        document.getElementById(
            "stockTotal"
        );

    if (totalProductos) {
        totalProductos.textContent =
            productos.length;
    }

    if (stockTotal) {

        stockTotal.textContent =
            productos.reduce(
                (total, p) =>
                    total + Number(p.stock),
                0
            );
    }
}


/* =========================================================
   CONSUMOS
========================================================= */

function abrirModalConsumo(
    habitacionId = null
) {

    const select =
        document.getElementById(
            "habitacionConsumo"
        );

    const ocupadas =
        habitaciones.filter(
            h =>
                h.estado === "OCUPADA"
        );

    if (!ocupadas.length) {

        alert(
            "No hay habitaciones ocupadas."
        );

        return;
    }

    select.innerHTML =
        ocupadas.map(h => {

            const reserva =
                obtenerReservaOcupadaHabitacion(
                    h.id
                );

            return `

                <option value="${h.id}">
                    Hab. ${escaparHTML(h.numero)}
                    - ${escaparHTML(reserva?.nombre || "")}
                </option>
            `;

        }).join("");

    if (
        habitacionId &&
        ocupadas.some(
            h =>
                Number(h.id) ===
                Number(habitacionId)
        )
    ) {
        select.value =
            habitacionId;
    }

    actualizarProductosConsumo();

    abrirModal("modalConsumo");
}


function actualizarProductosConsumo() {

    const contenedor =
        document.getElementById(
            "listaProductosConsumo"
        );

    if (!contenedor) {
        return;
    }

    const lista =
        productos.filter(
            p =>
                Number(p.stock) > 0
        );

    if (!lista.length) {

        contenedor.innerHTML = `
            <div style="padding:15px;">
                No hay productos con stock.
            </div>
        `;

        document.getElementById(
            "totalProductosConsumo"
        ).textContent = dinero(0);

        return;
    }

    contenedor.innerHTML =
        lista.map(p => `

            <div class="producto-consumo-fila">

                <strong>
                    ${escaparHTML(p.nombre)}
                </strong>

                <span>
                    ${dinero(p.precio)}
                </span>

                <span>
                    ${p.stock}
                </span>

                <input
                    class="cantidad-producto"
                    type="number"
                    min="0"
                    max="${p.stock}"
                    value="0"
                    data-producto="${p.id}"
                    oninput="calcularTotalConsumos()"
                >

            </div>

        `).join("");

    calcularTotalConsumos();
}


function calcularTotalConsumos() {

    let total = 0;

    document
        .querySelectorAll(
            ".cantidad-producto"
        )
        .forEach(input => {

            const productoId =
                Number(
                    input.dataset.producto
                );

            const cantidad =
                Number(
                    input.value || 0
                );

            const producto =
                productos.find(
                    p =>
                        Number(p.id) ===
                        productoId
                );

            if (producto) {

                total +=
                    cantidad *
                    producto.precio;
            }
        });

    const elemento =
        document.getElementById(
            "totalProductosConsumo"
        );

    if (elemento) {
        elemento.textContent =
            dinero(total);
    }
}


function guardarVariosConsumos() {

    const habitacionId =
        Number(
            document.getElementById(
                "habitacionConsumo"
            ).value
        );

    const reserva =
        obtenerReservaOcupadaHabitacion(
            habitacionId
        );

    if (!reserva) {

        alert(
            "No se encontró una estadía activa para esa habitación."
        );

        return;
    }

    const seleccionados = [];

    document
        .querySelectorAll(
            ".cantidad-producto"
        )
        .forEach(input => {

            const cantidad =
                Number(
                    input.value || 0
                );

            if (cantidad > 0) {

                seleccionados.push({

                    productoId:
                        Number(
                            input.dataset.producto
                        ),

                    cantidad
                });
            }
        });

    if (!seleccionados.length) {

        notificar(
            "Selecciona al menos un producto."
        );

        return;
    }

    for (
        const item of seleccionados
    ) {

        const producto =
            productos.find(
                p =>
                    Number(p.id) ===
                    item.productoId
            );

        if (!producto) {
            continue;
        }

        if (
            item.cantidad >
            producto.stock
        ) {

            alert(
                `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}.`
            );

            return;
        }
    }

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                habitacionId
        );

    const detalles = [];

    seleccionados.forEach(item => {

        const producto =
            productos.find(
                p =>
                    Number(p.id) ===
                    item.productoId
            );

        if (!producto) {
            return;
        }

        const total =
            producto.precio *
            item.cantidad;

        producto.stock -=
            item.cantidad;

        consumos.push({

            id: generarId(consumos),

            reservaId:
                reserva.id,

            habitacionId,

            productoId:
                producto.id,

            producto:
                producto.nombre,

            cantidad:
                item.cantidad,

            precio:
                producto.precio,

            total,

            fecha:
                new Date().toISOString()
        });

        detalles.push(
            `${item.cantidad} x ${producto.nombre}`
        );
    });

    registrarMovimiento(
        "CONSUMO",
        habitacion?.numero || "-",
        `${reserva.nombre}: ${detalles.join(", ")}.`
    );

    guardarDatos();

    cerrarModal("modalConsumo");

    renderTodo();

    notificar(
        "Productos agregados a la habitación."
    );
}


function renderConsumos() {

    const tabla =
        document.getElementById(
            "tablaConsumos"
        );

    if (!tabla) {
        return;
    }

    const lista =
        [...consumos]
        .sort(
            (a, b) =>
                new Date(b.fecha) -
                new Date(a.fecha)
        );

    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="7">
                    No hay consumos.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML =
        lista.map(c => {

            const reserva =
                reservas.find(
                    r =>
                        Number(r.id) ===
                        Number(c.reservaId)
                );

            const habitacion =
                habitaciones.find(
                    h =>
                        Number(h.id) ===
                        Number(c.habitacionId)
                );

            return `

                <tr>

                    <td>
                        ${formatearFechaHora(c.fecha)}
                    </td>

                    <td>
                        ${escaparHTML(habitacion?.numero || "-")}
                    </td>

                    <td>
                        ${escaparHTML(reserva?.nombre || "-")}
                    </td>

                    <td>
                        ${escaparHTML(c.producto)}
                    </td>

                    <td>
                        ${c.cantidad}
                    </td>

                    <td>
                        ${dinero(c.precio)}
                    </td>

                    <td>
                        ${dinero(c.total)}
                    </td>

                </tr>
            `;

        }).join("");
}


/* =========================================================
   CUENTA
========================================================= */

function obtenerReservaOcupadaHabitacion(
    habitacionId
) {

    return reservas.find(r =>

        Number(r.habitacionId) ===
            Number(habitacionId)

        &&

        r.estado === "OCUPADA"
    );
}


function abrirCuentaPorHabitacion(
    habitacionId
) {

    const reserva =
        obtenerReservaOcupadaHabitacion(
            habitacionId
        );

    if (!reserva) {

        alert(
            "No hay una estadía activa."
        );

        return;
    }

    abrirCuenta(
        reserva.id
    );
}


function obtenerCuentaReserva(
    reservaId
) {

    const reserva =
        reservas.find(
            r =>
                Number(r.id) ===
                Number(reservaId)
        );

    if (!reserva) {
        return null;
    }

    const listaConsumos =
        consumos.filter(
            c =>
                Number(c.reservaId) ===
                Number(reservaId)
        );

    const listaPagos =
        pagos.filter(
            p =>
                Number(p.reservaId) ===
                Number(reservaId)
        );

    const hospedaje =
        Number(reserva.total || 0);

    const totalConsumos =
        listaConsumos.reduce(
            (total, c) =>
                total + Number(c.total),
            0
        );

    const totalPagos =
        listaPagos.reduce(
            (total, p) =>
                total + Number(p.monto),
            0
        );

    const total =
        hospedaje +
        totalConsumos;

    const saldo =
        total -
        totalPagos;

    return {

        reserva,

        listaConsumos,

        listaPagos,

        hospedaje,

        totalConsumos,

        totalPagos,

        total,

        saldo
    };
}


function abrirCuenta(reservaId) {

    const cuenta =
        obtenerCuentaReserva(
            reservaId
        );

    if (!cuenta) {
        return;
    }

    ultimaReservaCuenta =
        reservaId;

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(cuenta.reserva.habitacionId)
        );

    let productosHTML = "";

    if (
        cuenta.listaConsumos.length
    ) {

        productosHTML = `
            <div style="margin-top:15px;">
                <strong>Consumos</strong>
            </div>

            ${cuenta.listaConsumos.map(c => `

                <div class="cuenta-linea">

                    <span>
                        ${c.cantidad} x
                        ${escaparHTML(c.producto)}
                    </span>

                    <strong>
                        ${dinero(c.total)}
                    </strong>

                </div>

            `).join("")}
        `;
    }

    document.getElementById(
        "detalleCuenta"
    ).innerHTML = `

        <div class="cuenta-cabecera">

            <h3>
                Habitación
                ${escaparHTML(habitacion?.numero || "-")}
            </h3>

            <p>
                Huésped:
                ${escaparHTML(cuenta.reserva.nombre)}
            </p>

            <p>
                ${formatearFecha(cuenta.reserva.entrada)}
                -
                ${formatearFecha(cuenta.reserva.salida)}
            </p>

        </div>


        <div class="cuenta-linea">

            <span>
                Hospedaje
            </span>

            <strong>
                ${dinero(cuenta.hospedaje)}
            </strong>

        </div>

        ${productosHTML}


        <div class="cuenta-linea total">

            <span>
                Total consumos
            </span>

            <strong>
                ${dinero(cuenta.totalConsumos)}
            </strong>

        </div>


        <div class="cuenta-linea total">

            <span>
                Total cuenta
            </span>

            <strong>
                ${dinero(cuenta.total)}
            </strong>

        </div>


        <div class="cuenta-linea">

            <span>
                Pagado
            </span>

            <strong>
                ${dinero(cuenta.totalPagos)}
            </strong>

        </div>


        <div class="cuenta-linea saldo">

            <span>
                Saldo
            </span>

            <strong>
                ${dinero(Math.max(0, cuenta.saldo))}
            </strong>

        </div>


        <div class="cuenta-acciones">

            <button
                class="btn-principal"
                onclick="abrirPago(${reservaId})"
            >
                💰 Registrar pago
            </button>


            <button
                class="btn-secundario"
                onclick="realizarCheckOut(${reservaId})"
            >
                Check-out
            </button>

        </div>
    `;

    abrirModal("modalCuenta");
}


/* =========================================================
   PAGOS
========================================================= */

function abrirPago(reservaId) {

    const cuenta =
        obtenerCuentaReserva(
            reservaId
        );

    if (!cuenta) {
        return;
    }

    if (
        cuenta.saldo <= 0.009
    ) {

        alert(
            "La cuenta ya está pagada."
        );

        return;
    }

    document.getElementById(
        "pagoReservaId"
    ).value = reservaId;

    document.getElementById(
        "pagoSaldo"
    ).textContent =
        dinero(cuenta.saldo);

    document.getElementById(
        "pagoMonto"
    ).value =
        cuenta.saldo.toFixed(2);

    document.getElementById(
        "pagoMetodo"
    ).value = "EFECTIVO";

    cerrarModal("modalCuenta");

    abrirModal("modalPago");
}


function confirmarPago() {

    const reservaId =
        Number(
            document.getElementById(
                "pagoReservaId"
            ).value
        );

    const monto =
        Number(
            document.getElementById(
                "pagoMonto"
            ).value
        );

    const metodo =
        document.getElementById(
            "pagoMetodo"
        ).value;

    const cuenta =
        obtenerCuentaReserva(
            reservaId
        );

    if (!cuenta) {
        return;
    }

    if (monto <= 0) {

        notificar(
            "Ingresa un monto válido."
        );

        return;
    }

    if (
        monto >
        cuenta.saldo + 0.009
    ) {

        alert(
            "El monto no puede ser mayor al saldo pendiente."
        );

        return;
    }

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(cuenta.reserva.habitacionId)
        );

    const pago = {

        id: generarId(pagos),

        reservaId,

        monto,

        metodo,

        fecha:
            new Date().toISOString()
    };

    pagos.push(pago);

    registrarMovimiento(
        "PAGO",
        habitacion?.numero || "-",
        `${cuenta.reserva.nombre} pagó ${dinero(monto)} mediante ${metodo}.`
    );

    guardarDatos();

    cerrarModal("modalPago");

    renderTodo();

    mostrarComprobante(
        pago.id
    );

    notificar(
        "Pago registrado."
    );
}


/* =========================================================
   COMPROBANTE
========================================================= */

function mostrarComprobante(
    pagoId
) {

    const pago =
        pagos.find(
            p =>
                Number(p.id) ===
                Number(pagoId)
        );

    if (!pago) {
        return;
    }

    const reserva =
        reservas.find(
            r =>
                Number(r.id) ===
                Number(pago.reservaId)
        );

    if (!reserva) {
        return;
    }

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(reserva.habitacionId)
        );

    document.getElementById(
        "contenidoComprobante"
    ).innerHTML = `

        <div class="comprobante">

            <div class="comprobante-encabezado">

                <h2>
                    GRAND HOTEL
                </h2>

                <p>
                    COMPROBANTE INTERNO DE PAGO
                </p>

                <p>
                    No es comprobante electrónico SUNAT
                </p>

            </div>


            <div class="comprobante-dato">

                <span>N.º operación</span>

                <strong>
                    ${pago.id}
                </strong>

            </div>


            <div class="comprobante-dato">

                <span>Fecha</span>

                <strong>
                    ${formatearFechaHora(pago.fecha)}
                </strong>

            </div>


            <div class="comprobante-dato">

                <span>Huésped</span>

                <strong>
                    ${escaparHTML(reserva.nombre)}
                </strong>

            </div>


            <div class="comprobante-dato">

                <span>DNI</span>

                <strong>
                    ${escaparHTML(reserva.dni)}
                </strong>

            </div>


            <div class="comprobante-dato">

                <span>Habitación</span>

                <strong>
                    ${escaparHTML(habitacion?.numero || "-")}
                </strong>

            </div>


            <div class="comprobante-dato">

                <span>Método</span>

                <strong>
                    ${pago.metodo}
                </strong>

            </div>


            <div class="comprobante-total">

                <span>PAGO</span>

                <span>
                    ${dinero(pago.monto)}
                </span>

            </div>

        </div>
    `;

    abrirModal(
        "modalComprobante"
    );
}


function imprimirComprobante() {

    window.print();
}


/* =========================================================
   CHECK-OUT
========================================================= */

function realizarCheckOut(
    reservaId
) {

    const cuenta =
        obtenerCuentaReserva(
            reservaId
        );

    if (!cuenta) {
        return;
    }

    if (
        cuenta.saldo > 0.009
    ) {

        alert(
            `No puedes realizar el check-out. Falta pagar ${dinero(cuenta.saldo)}.`
        );

        return;
    }

    const confirmar =
        confirm(
            `¿Realizar check-out de ${cuenta.reserva.nombre}?`
        );

    if (!confirmar) {
        return;
    }

    cuenta.reserva.estado =
        "FINALIZADA";

    const habitacion =
        habitaciones.find(
            h =>
                Number(h.id) ===
                Number(cuenta.reserva.habitacionId)
        );

    if (habitacion) {
        habitacion.estado =
            "LIMPIEZA";
    }

    registrarMovimiento(
        "CHECK-OUT",
        habitacion?.numero || "-",
        `${cuenta.reserva.nombre} finalizó su estadía. Habitación enviada a limpieza.`
    );

    guardarDatos();

    cerrarModal("modalCuenta");

    renderTodo();

    notificar(
        "Check-out realizado. Habitación en limpieza."
    );
}


/* =========================================================
   CAJA DIARIA
========================================================= */

function renderCaja() {

    const fecha =
        document.getElementById(
            "fechaCaja"
        )?.value ||
        obtenerFechaHoy();

    const pagosDia =
        pagos.filter(
            p =>
                obtenerFechaISORegistro(
                    p.fecha
                ) === fecha
        );

    const totales = {

        EFECTIVO: 0,

        YAPE: 0,

        PLIN: 0,

        TARJETA: 0
    };

    pagosDia.forEach(p => {

        if (
            totales[p.metodo] !==
            undefined
        ) {

            totales[p.metodo] +=
                Number(p.monto);
        }
    });

    document.getElementById(
        "cajaEfectivo"
    ).textContent =
        dinero(totales.EFECTIVO);

    document.getElementById(
        "cajaYape"
    ).textContent =
        dinero(totales.YAPE);

    document.getElementById(
        "cajaPlin"
    ).textContent =
        dinero(totales.PLIN);

    document.getElementById(
        "cajaTarjeta"
    ).textContent =
        dinero(totales.TARJETA);

    const total =
        Object.values(totales)
            .reduce(
                (a, b) => a + b,
                0
            );

    document.getElementById(
        "cajaTotal"
    ).textContent =
        dinero(total);

    const tabla =
        document.getElementById(
            "tablaCaja"
        );

    if (!tabla) {
        return;
    }

    if (!pagosDia.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="6">
                    No hay pagos para esta fecha.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML =
        [...pagosDia]
            .sort(
                (a, b) =>
                    new Date(b.fecha) -
                    new Date(a.fecha)
            )
            .map(p => {

                const reserva =
                    reservas.find(
                        r =>
                            Number(r.id) ===
                            Number(p.reservaId)
                    );

                const habitacion =
                    habitaciones.find(
                        h =>
                            Number(h.id) ===
                            Number(reserva?.habitacionId)
                    );

                return `

                    <tr>

                        <td>
                            ${new Date(p.fecha).toLocaleTimeString(
                                "es-PE",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }
                            )}
                        </td>

                        <td>
                            ${escaparHTML(habitacion?.numero || "-")}
                        </td>

                        <td>
                            ${escaparHTML(reserva?.nombre || "-")}
                        </td>

                        <td>
                            ${p.metodo}
                        </td>

                        <td>
                            ${dinero(p.monto)}
                        </td>

                        <td>

                            <button
                                class="tabla-boton azul"
                                onclick="mostrarComprobante(${p.id})"
                            >
                                Ver
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");
}


/* =========================================================
   REPORTES
========================================================= */

function generarReporte() {

    const desde =
        document.getElementById(
            "reporteDesde"
        ).value;

    const hasta =
        document.getElementById(
            "reporteHasta"
        ).value;

    if (
        !desde ||
        !hasta
    ) {

        notificar(
            "Selecciona las fechas."
        );

        return;
    }

    if (desde > hasta) {

        alert(
            "La fecha inicial no puede ser posterior a la fecha final."
        );

        return;
    }

    const pagosRango =
        pagos.filter(p => {

            const fecha =
                obtenerFechaISORegistro(
                    p.fecha
                );

            return (
                fecha >= desde &&
                fecha <= hasta
            );
        });

    const reservasRango =
        reservas.filter(r => {

            const fecha =
                obtenerFechaISORegistro(
                    r.creadoEn
                );

            return (
                fecha >= desde &&
                fecha <= hasta
            );
        });

    const consumosRango =
        consumos.filter(c => {

            const fecha =
                obtenerFechaISORegistro(
                    c.fecha
                );

            return (
                fecha >= desde &&
                fecha <= hasta
            );
        });

    const ingresos =
        pagosRango.reduce(
            (total, p) =>
                total + Number(p.monto),
            0
        );

    const totalConsumos =
        consumosRango.reduce(
            (total, c) =>
                total + Number(c.total),
            0
        );

    const canceladas =
        reservasRango.filter(
            r =>
                r.estado === "CANCELADA"
        ).length;

    document.getElementById(
        "reporteIngresos"
    ).textContent =
        dinero(ingresos);

    document.getElementById(
        "reporteReservas"
    ).textContent =
        reservasRango.length;

    document.getElementById(
        "reporteConsumos"
    ).textContent =
        dinero(totalConsumos);

    document.getElementById(
        "reporteCanceladas"
    ).textContent =
        canceladas;

    const tabla =
        document.getElementById(
            "tablaReporte"
        );

    if (!pagosRango.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="5">
                    No hay pagos en este rango.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML =
        pagosRango
            .sort(
                (a, b) =>
                    new Date(b.fecha) -
                    new Date(a.fecha)
            )
            .map(p => {

                const reserva =
                    reservas.find(
                        r =>
                            Number(r.id) ===
                            Number(p.reservaId)
                    );

                const habitacion =
                    habitaciones.find(
                        h =>
                            Number(h.id) ===
                            Number(reserva?.habitacionId)
                    );

                return `

                    <tr>

                        <td>
                            ${formatearFechaHora(p.fecha)}
                        </td>

                        <td>
                            ${escaparHTML(reserva?.nombre || "-")}
                        </td>

                        <td>
                            ${escaparHTML(habitacion?.numero || "-")}
                        </td>

                        <td>
                            ${p.metodo}
                        </td>

                        <td>
                            ${dinero(p.monto)}
                        </td>

                    </tr>
                `;

            }).join("");
}


/* =========================================================
   RESUMEN
========================================================= */

function renderResumen() {

    const total =
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

    document.getElementById(
        "totalHabitaciones"
    ).textContent = total;

    document.getElementById(
        "totalDisponibles"
    ).textContent =
        disponibles;

    document.getElementById(
        "totalOcupadas"
    ).textContent =
        ocupadas;

    document.getElementById(
        "totalLimpieza"
    ).textContent =
        limpieza;
}


/* =========================================================
   RESPALDO
========================================================= */

function crearRespaldo() {

    const respaldo = {

        version: 2,

        sistema:
            "Sistema de Gestión Hotelera",

        creadoEn:
            new Date().toISOString(),

        habitaciones,

        reservas,

        productos,

        consumos,

        pagos,

        historial
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
        URL.createObjectURL(blob);

    const enlace =
        document.createElement("a");

    const fecha =
        obtenerFechaHoy();

    enlace.href = url;

    enlace.download =
        `respaldo-hotel-${fecha}.json`;

    document.body.appendChild(
        enlace
    );

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);

    registrarMovimiento(
        "RESPALDO",
        "-",
        "Se creó una copia de seguridad manual."
    );

    notificar(
        "Respaldo creado correctamente."
    );
}


function seleccionarRespaldo() {

    const input =
        document.getElementById(
            "archivoRespaldo"
        );

    input.value = "";

    input.click();
}


function restaurarRespaldo(event) {

    const archivo =
        event.target.files[0];

    if (!archivo) {
        return;
    }

    const lector =
        new FileReader();

    lector.onload = e => {

        try {

            const datos =
                JSON.parse(
                    e.target.result
                );

            if (
                !Array.isArray(datos.habitaciones) ||
                !Array.isArray(datos.reservas) ||
                !Array.isArray(datos.productos)
            ) {

                throw new Error(
                    "Formato incorrecto"
                );
            }

            const confirmar =
                confirm(
                    "Restaurar este respaldo reemplazará los datos actuales. ¿Deseas continuar?"
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

            normalizarDatos();

            registrarMovimiento(
                "RESTAURACIÓN",
                "-",
                "Se restauró una copia de seguridad."
            );

            actualizarEstadosAutomaticos();

            renderTodo();

            notificar(
                "Respaldo restaurado correctamente."
            );

        } catch (error) {

            alert(
                "El archivo seleccionado no es un respaldo válido."
            );
        }
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

        fecha:
            new Date().toISOString(),

        habitaciones,

        reservas,

        productos,

        consumos,

        pagos,

        historial
    };

    localStorage.setItem(
        "hotel_respaldo_automatico",
        JSON.stringify(respaldo)
    );
}


function restaurarRespaldoAutomaticoLocal() {

    const contenido =
        localStorage.getItem(
            "hotel_respaldo_automatico"
        );

    if (!contenido) {

        alert(
            "No existe un respaldo automático."
        );

        return;
    }

    const confirmar =
        confirm(
            "¿Restaurar el último respaldo automático?"
        );

    if (!confirmar) {
        return;
    }

    try {

        const datos =
            JSON.parse(contenido);

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

        guardarDatos();

        renderTodo();

        notificar(
            "Respaldo automático restaurado."
        );

    } catch {

        alert(
            "No se pudo restaurar el respaldo automático."
        );
    }
}


/* =========================================================
   NOTIFICACIONES
========================================================= */

let temporizadorNotificacion;

function notificar(mensaje) {

    const elemento =
        document.getElementById(
            "notificacion"
        );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        mensaje;

    elemento.classList.add(
        "mostrar"
    );

    clearTimeout(
        temporizadorNotificacion
    );

    temporizadorNotificacion =
        setTimeout(() => {

            elemento.classList.remove(
                "mostrar"
            );

        }, 2800);
}


/* =========================================================
   RENDER GENERAL
========================================================= */

function renderTodo() {

    actualizarEstadosAutomaticos();

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
   CERRAR MODAL HACIENDO CLIC FUERA
========================================================= */

window.addEventListener(
    "click",
    event => {

        if (
            event.target.classList &&
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "activo"
            );
        }
    }
);


/* =========================================================
   ESC PARA CERRAR MODALES
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            document
                .querySelectorAll(
                    ".modal.activo"
                )
                .forEach(
                    modal =>
                        modal.classList.remove(
                            "activo"
                        )
                );
        }
    }
);