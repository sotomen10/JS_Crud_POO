// Definición de la clase Persona
class Persona {
    // Constructor que inicializa las propiedades de la persona: nombre, username y password
    constructor(nombre, username, password) {
        this.nombre = nombre; // Almacena el nombre de la persona
        this.username = username; // Almacena el nombre de usuario
        this.password = password; // Almacena la contraseña
    }

    // Método estático para crear un nuevo usuario
    static crearUsuario(nombre, username, password, role) {
        // Verifica si el usuario ya existe en localStorage
        if (localStorage.getItem(username)) {
            throw new Error('Usuario ya existe'); // Lanza un error si el usuario ya existe
        }
        // Si el rol es "admin", crea una instancia de Administrador
        if (role === 'admin') {
            return new Administrador(nombre, username, password);
        } else {
            // Si no, crea una instancia de UsuarioRegular
            return new UsuarioRegular(nombre, username, password);
        }
    }

    // Método para registrar un usuario guardándolo en localStorage
    registrarse() {
        localStorage.setItem(this.username, JSON.stringify(this)); // Convierte el objeto en una cadena JSON y lo guarda
    }

    // Método estático para iniciar sesión
    static iniciarSesion(username, password) {
        // Recupera el usuario de localStorage
        const user = JSON.parse(localStorage.getItem(username));
        // Verifica si el usuario existe y si la contraseña es correcta
        if (user && user.password === password) {
            // Si es admin, devuelve una instancia de Administrador; si no, devuelve una de UsuarioRegular
            return user.role === 'admin' ? new Administrador(user.nombre, user.username, user.password) : new UsuarioRegular(user.nombre, user.username, user.password);
        }
        return null; // Devuelve null si la autenticación falla
    }
}

// Definición de la clase UsuarioRegular que hereda de Persona
class UsuarioRegular extends Persona {
    // Constructor que llama al constructor de la clase base y define el rol
    constructor(nombre, username, password) {
        super(nombre, username, password); // Llama al constructor de Persona
        this.role = 'user'; // Define el rol como "user"
    }

    // Método para crear una reserva
    crearReserva(reserva) {
        let reservas = JSON.parse(localStorage.getItem('reservas')) || []; // Recupera las reservas existentes o crea un array vacío
        reservas.push({ ...reserva, usuario: this.username }); // Añade la nueva reserva con el nombre de usuario
        localStorage.setItem('reservas', JSON.stringify(reservas)); // Guarda las reservas actualizadas en localStorage
    }
}

// Definición de la clase Administrador que hereda de Persona
class Administrador extends Persona {
    // Constructor que llama al constructor de la clase base y define el rol
    constructor(nombre, username, password) {
        super(nombre, username, password); // Llama al constructor de Persona
        this.role = 'admin'; // Define el rol como "admin"
    }

    // Método para crear una reserva (similar al de UsuarioRegular, pero sin asociar usuario)
    crearReserva(reserva) {
        let reservas = JSON.parse(localStorage.getItem('reservas')) || []; // Recupera las reservas existentes o crea un array vacío
        reservas.push(reserva); // Añade la nueva reserva sin asociar un usuario
        localStorage.setItem('reservas', JSON.stringify(reservas)); // Guarda las reservas actualizadas en localStorage
    }

    // Método para eliminar una reserva
    eliminarReserva(id) {
        let reservas = JSON.parse(localStorage.getItem('reservas')) || []; // Recupera las reservas existentes
        reservas = reservas.filter(reserva => reserva.id !== id); // Filtra las reservas para eliminar la que coincide con el id
        localStorage.setItem('reservas', JSON.stringify(reservas)); // Guarda las reservas actualizadas en localStorage
    }

    // Método para actualizar una reserva existente
    actualizarReserva(id, nuevaReserva) {
        let reservas = JSON.parse(localStorage.getItem('reservas')) || []; // Recupera las reservas existentes
        reservas = reservas.map(reserva => reserva.id === id ? { ...reserva, ...nuevaReserva } : reserva); // Actualiza la reserva que coincide con el id
        localStorage.setItem('reservas', JSON.stringify(reservas)); // Guarda las reservas actualizadas en localStorage
    }
}

// Clase Auth para manejar la autenticación
class Auth {
    // Método estático para iniciar sesión
    static iniciarSesion(username, password) {
        const user = Persona.iniciarSesion(username, password); // Llama al método iniciarSesion de Persona
        if (user) {
            localStorage.setItem('session', JSON.stringify(user)); // Guarda la sesión del usuario en localStorage
            return user; // Devuelve el usuario autenticado
        }
        return null; // Devuelve null si la autenticación falla
    }

    // Método estático para cerrar sesión
    static cerrarSesion() {
        localStorage.removeItem('session'); // Elimina la sesión del usuario de localStorage
    }

    // Método estático para obtener el usuario actual
    static obtenerUsuarioActual() {
        return JSON.parse(localStorage.getItem('session')); // Recupera y devuelve el usuario autenticado actual
    }
}

// Funciones para manipular el DOM

// Maneja el evento de envío del formulario de registro
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previene la acción por defecto del formulario
    const nombre = document.getElementById('name').value; // Obtiene el valor del campo nombre
    const username = document.getElementById('username').value; // Obtiene el valor del campo username
    const password = document.getElementById('password').value; // Obtiene el valor del campo password
    const role = document.getElementById('role').value; // Obtiene el valor del campo role

    try {
        const usuario = Persona.crearUsuario(nombre, username, password, role); // Crea un nuevo usuario
        usuario.registrarse(); // Registra el usuario en localStorage
        alert('Usuario registrado exitosamente'); // Muestra un mensaje de éxito
    } catch (error) {
        alert(error.message); // Muestra un mensaje de error si algo falla
    }
});

// Maneja el evento de envío del formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previene la acción por defecto del formulario
    const username = document.getElementById('loginUsername').value; // Obtiene el valor del campo username
    const password = document.getElementById('loginPassword').value; // Obtiene el valor del campo password

    const usuario = Auth.iniciarSesion(username, password); // Intenta iniciar sesión
    if (usuario) {
        mostrarReservas(); // Muestra las reservas si la autenticación es exitosa
        document.getElementById('auth').style.display = 'none'; // Oculta el formulario de autenticación
        document.getElementById('reservations').style.display = 'block'; // Muestra la sección de reservas
    } else {
        alert('Usuario o contraseña incorrectos'); // Muestra un mensaje de error si la autenticación falla
    }
});

// Maneja el evento de clic para cerrar sesión
document.getElementById('logout').addEventListener('click', function() {
    Auth.cerrarSesion(); // Cierra la sesión
    document.getElementById('auth').style.display = 'block'; // Muestra el formulario de autenticación
    document.getElementById('reservations').style.display = 'none'; // Oculta la sección de reservas
});

// Maneja el evento de clic para crear una nueva reserva
document.getElementById('createReservation').addEventListener('click', function() {
    const usuario = Auth.obtenerUsuarioActual(); // Obtiene el usuario autenticado actual
    if (usuario) {
        const reserva = {
            id: Date.now(), // Asigna un ID único basado en el timestamp actual
            descripcion: prompt('Ingrese la descripción de la reserva:') // Pide al usuario que ingrese la descripción de la reserva
        };

        // Dependiendo del rol del usuario, crea la reserva usando la clase correspondiente
        if (usuario.role === 'admin') {
            new Administrador(usuario.nombre, usuario.username, usuario.password).crearReserva(reserva);
        } else {
            new UsuarioRegular(usuario.nombre, usuario.username, usuario.password).crearReserva(reserva);
        }

        mostrarReservas(); // Muestra las reservas actualizadas
    } else {
        alert('Debe iniciar sesión para crear una reserva'); // Muestra un mensaje si no hay un usuario autenticado
    }
});

// Función para mostrar las reservas en la interfaz
function mostrarReservas() {
    const usuario = Auth.obtenerUsuarioActual(); // Obtiene el usuario autenticado actual
    const reservas = JSON.parse(localStorage.getItem('reservas')) || []; // Recupera las reservas de localStorage
    const listaReservas = document.getElementById('reservationList'); // Obtiene el elemento de la lista de reservas en el DOM
    listaReservas.innerHTML = ''; // Limpia la lista de reservas

    reservas.forEach(reserva => {
        const li = document.createElement('li'); // Crea un nuevo elemento de lista
        li.textContent = `Reserva: ${reserva.descripcion} - Usuario: ${reserva.usuario}`; // Establece el contenido del elemento de lista

        if (usuario.role === 'admin') {
            const eliminarBtn = document.createElement('button'); // Crea un botón para eliminar la reserva
            eliminarBtn.textContent = 'Eliminar'; // Establece el texto del botón
            eliminarBtn.addEventListener('click', function() {
                new Administrador(usuario.nombre, usuario.username, usuario.password).eliminarReserva(reserva.id); // Elimina la reserva cuando se hace clic
                mostrarReservas(); // Actualiza la lista de reservas
            });

            const editarBtn = document.createElement('button'); // Crea un botón para editar la reserva
            editarBtn.textContent = 'Editar'; // Establece el texto del botón
            editarBtn.addEventListener('click', function() {
                const nuevaDescripcion = prompt('Ingrese la nueva descripción de la reserva:', reserva.descripcion); // Pide al usuario que ingrese la nueva descripción
                new Administrador(usuario.nombre, usuario.username, usuario.password).actualizarReserva(reserva.id, { descripcion: nuevaDescripcion }); // Actualiza la reserva
                mostrarReservas(); // Actualiza la lista de reservas
            });

            li.appendChild(editarBtn); // Añade el botón de editar al elemento de lista
            li.appendChild(eliminarBtn); // Añade el botón de eliminar al elemento de lista
        }

        listaReservas.appendChild(li); // Añade el elemento de lista a la lista de reservas
    });
}

// Función que se ejecuta cuando se carga la página
window.onload = function() {
    const usuario = Auth.obtenerUsuarioActual(); // Obtiene el usuario autenticado actual
    if (usuario) {
        document.getElementById('auth').style.display = 'none'; // Oculta el formulario de autenticación
        document.getElementById('reservations').style.display = 'block'; // Muestra la sección de reservas
        mostrarReservas(); // Muestra las reservas
    }
};
