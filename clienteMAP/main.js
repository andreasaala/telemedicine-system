//Variables globales
var vistaActual=null;
let medicoActual //Variable con el objeto médico que hace login
let medicoActualId; //Variable con el id del médico actual
let arrayEsp;  //Variable que almacena los objetos especialidades
let expedienteActualId;//Variable que almacena el id de expediente actual
var camino =""; //Variable que controla por donde se entra a la interfaz de datos del médico (para crear o para modificar)
var caminoExp = ""; //Variable que controla por donde se entra a la interfaz de datos del expediente (para crear o para modificar)
var expedientesMapGlobal; // Variable que guarda los expedientes asignados a un MAP q hace login
var ip = "http://172.27.191.198:3000"
var datosCantabria = [];

//Cambiar fecha a String
function acortarFecha(fecha){
    if(fecha!=null){
        var fechaCorta = fecha.replace("T", " ");
        fechaCorta = fechaCorta.slice(0,-5);
        return fechaCorta
    }
    else{
        return null;
    }  
}
//Cambiar las Interfaces
function cambiarVista(id){
    if (vistaActual) {
        document.getElementById(vistaActual).classList.remove("visible");
    } 
    document.getElementById(id).classList.add("visible");
    vistaActual = id;
}
cambiarVista("InterfazInicio");

//Cargamos los centros
function cargarCentros(){
    //Poner los centros en el select
    var selectCentros = document.getElementById("centro"); //Obtenemos el elemento que almacena la lista de centros en el index
    rest.get(ip+"/api/centros", function(estado, centros){ //Obtenemos los centros desde el servidor
        centros.forEach(function(centro){ //Por cada centro médico, vamos a ir añadiendola a la lista de centros del index, como si fueran una opción dentro de un desplegable.
            var option = document.createElement("option");
            option.value = centro.id; // Valor interno de cada opción
            option.text = centro.nombre; // Valor del texto
            selectCentros.appendChild(option);
        })
    })
    
}
cargarCentros();

//Cargamos las especialidades
function cargarEspecialidades(){ //Funciona igual que en el caso de los centros
    var selectEsp = document.getElementById("especialidad");
    rest.get(ip+"/api/especialidades", function(estado, especialidades){
        especialidades.forEach(function(especialidad){
            var option = document.createElement("option");
            option.value = especialidad.id;
            option.text = especialidad.nombre;
            selectEsp.appendChild(option);
        })
        arrayEsp = especialidades;
    })
}
cargarEspecialidades();

//Realizamos el login. Se ejecuta al pulsar el botón ENTRAR de la InterfazInicio
function iniciarSesion(){
    var usuario = document.getElementById("usuario").value; //Obtenemos el valor del elemento que hace referencia al usuario en el index
    var contrasenya = document.getElementById("contraseña").value; //Obtenemos el valor del elemento que hace referencia a la contraseña en el index
    
    rest.post((ip+"/api/medico/login"),{login:usuario,password:contrasenya}, function(codigo, idYMedico){ //Hacer un post, es decir, crear una instancia en el servidor. Se pasa al servidor los valores de login y password
        if(codigo==200){ // Si el servidor devuelve código de ok
            cambiarVista("InterfazMedico");
            medicoActualId = parseInt(idYMedico.id);
            medicoActual = idYMedico.medico;
            cargarExpedientes(medicoActualId);

            //Párrafo indicando el médico que ha hecho login
            document.getElementById("medico").textContent = "Bienvenido: " + medicoActual[0].nombre + " " + medicoActual[0].apellidos;
        } else{
            window.alert(idYMedico);
        }
    });
}

//El boton GUARDAR de la InterfazRegistro. Sirve para registrar a un nuevo medico o para actualizar la info de uno ya existente
function guardar() { 
    var nombre = document.getElementById("nombre").value;
    var apellidos = document.getElementById("apellidos").value;
    var login = document.getElementById("login").value;
    var password = document.getElementById("password").value;
    var centro = document.getElementById("centro").value;

    if (camino == "registro"){ // Si se entra por el camino de registro, se guarda el nuevo médico.
        rest.post((ip+"/api/medico"),{nombre:nombre,apellidos:apellidos,login:login, password:password, centro:centro }, function(codigo,datosMedico){
            if (codigo==403){
                window.alert(datosMedico)
            } else if (codigo==201){
                cambiarVista("InterfazInicio");
            }
        });
    } else if (camino =="editarDatos"){  // Si se entra para editar datos de un médico ya existente
        rest.put((ip+"/api/medico/"+ medicoActualId),{nombre:nombre,apellidos:apellidos,login:login, password:password, centro:centro}, function(codigo,datosCambiadosMedico){
            if (codigo==403){
                window.alert(datosCambiadosMedico);
            } else if (codigo==200){
                medicoActual = datosCambiadosMedico;
                document.getElementById("medico").textContent = "Bienvenido: " + medicoActual[0].nombre + " " + medicoActual[0].apellidos;
                cambiarVista("InterfazMedico");
            }
        });
    }  
}

//Rellena los campos de la InterfazRegistro con los datos del medicoActual. Se ejecuta al pulsar el botón EDITAR DATOS de la InterfazMedico
function editarDatos(){
    cambiarVista("InterfazRegistro");
    camino = "editarDatos";

    //Cargar datos del médico en la interfaz
    document.getElementById("nombre").value = medicoActual[0].nombre;
    document.getElementById("apellidos").value = medicoActual[0].apellidos;
    document.getElementById("login").value = medicoActual[0].login;
    document.getElementById("password").value = medicoActual[0].password;
    document.getElementById("centro").value = medicoActual[0].centro;
}



//Se ejecuta cnd se pulsa el botón de GUARDAR de la InterfazExpediente. Se puede crear uno nuevo o editar uno ya existente
function guardarExp(){
    //Se obtienen los datos de los campos
    var especialidad = document.getElementById("especialidad").value;
    var sip = document.getElementById("sip").value;
    var nombre = document.getElementById("nombreP").value;
    var apellidos = document.getElementById("apellidosP").value;
    var fechaNac = document.getElementById("fechaNac").value;
    var genero = document.getElementById("genero").value;
    var observaciones = document.getElementById("observaciones").value;
    var solicitud = document.getElementById("solicitud").value;

    if(caminoExp=="nuevoExp"){ //Si pulsa el botón de crear expediente
        rest.post((ip+"/api/map/:id/expedientes"),{medicoActualId,especialidad,sip,nombre,apellidos,fechaNac,genero,observaciones,solicitud }, function(codigo,datosExp){
            if (codigo==200) { //Si todo va bien se vuelve a la interfaz del médico
                cambiarVista("InterfazMedico");
                cargarExpedientes(medicoActualId);
            } else if (codigo==403) { //Si se repite el sip, se saca el mensaje de error
                window.alert(datosExp); 
            }  
        });
    } else if (caminoExp=="editarExp"){ //Si pulsamos el botón de editar expediente
        rest.put((ip+"/api/expediente/"+expedienteActualId), {medicoActualId,especialidad,sip,nombre,apellidos,fechaNac,genero,observaciones,solicitud }, function(codigo, expedienteActualizado){
            cambiarVista("InterfazMedico");
            cargarExpedientes(medicoActualId);
        });
    }
}

//Cargamos los expedientes en la tabla del médico
function cargarExpedientes(idMedico){
    var tablaExp = document.getElementById("tablaExpedientes");
    while (tablaExp.rows.length > 0) {
        tablaExp.deleteRow(0);
    }
    rest.get(ip+"/api/map/"+idMedico+"/expedientes", function(estado,expedientesMap){
        expedientesMapGlobal = expedientesMap; // Se guarda en variable global
        expedientesMap.forEach(function(expediente){ // Se cogen los datos de cada expediente
            var fila = document.createElement("tr");
            var id = expediente.id;
            var fechaCre =acortarFecha(expediente.fecha_creacion);
            var fechaAsig = acortarFecha(expediente.fecha_asignacion);
            var fechaRes = acortarFecha(expediente.fecha_resolucion);
            var sip = expediente.sip;
            var idEsp = expediente.especialidad;
            var nomEsp = arrayEsp[idEsp-1].nombre;
            var datos = [id, fechaCre, fechaAsig, fechaRes, nomEsp, sip]; 
            if (fechaAsig!=null){
                var fechaAsigCortisima = fechaAsig.slice(0,10);
            } else{
                var fechaAsigCortisima = fechaAsig;
            }
            if (fechaRes!=null){
                var fechaResCortisima = fechaRes.slice(0,10);
            } else {
                var fechaResCortisima = fechaRes;
            }
            var datosSistema = {medico: medicoActual[0].nombre, especiladad:nomEsp,fecha_asig:fechaAsigCortisima, fecha_resol: fechaResCortisima};
            datosCantabria.push(datosSistema);
            // Array con los nombres de las columnas (para hacer el diseño responsive de la tabla)
            var titulos = ["ID", "Fecha Creación", "Fecha Asignación", "Fecha Resolución", "Especialidad", "SIP"];

            
            datos.forEach(function (dato, index) { // Se añaden los datos del expediente a una nueva fila en la tabla
                var celda = document.createElement("td");
                celda.textContent = dato;
                // Añadir atributo data-titulo con el nombre de la columna
                celda.setAttribute("data-titulo", titulos[index]);
                
                fila.appendChild(celda);

            });
            //Botón para eliminar expediente
            var botoonEliminar = document.createElement("button");
            botoonEliminar.textContent = "Borrar";
            botoonEliminar.className = "eliminar";
            botoonEliminar.addEventListener("click", function () {
                event.stopPropagation(); // Permite pulsar el botón independientemente d epulsar la fila
                eliminarExpediente(id);
            });
            var celdaBoton = document.createElement("td");
            celdaBoton.appendChild(botoonEliminar);
            fila.appendChild(celdaBoton); // Se añade el botón a la fila

            //Botón para CHATEAR
            var botonChat = document.createElement("button");
            botonChat.textContent = "Chat";
            botonChat.className = "chat";
            botonChat.addEventListener("click", function () {
                event.stopPropagation();
                cambiarVista("InterfazChat");
                expedienteActualId = id; // Para saber si está asignado, y de que especialidad es. 
                establecerConexionWS(); //Se establece conexión WS una vez iniciada la sesión

            });
            celdaBoton.appendChild(botonChat);

            fila.onclick = function () { //Cnd se pulsa la fila de cualquier expendiente se abre el expediente
                cambiarVista("InterfazExpediente");
                caminoExp = "editarExp";
                expedienteActualId = id;
                //Busca expediente con el id 
                var expedienteCorrecto = expedientesMap.find(expedienteCorrecto => expedienteCorrecto.id === expedienteActualId);
                
                // Formatear fecha de nacimiento para poder mostrarla por pantalla
                var fechaFormateada = formatearFecha(expedienteCorrecto.fecha_nacimiento);

                //Rellena campos del expediente a editar
                document.getElementById("id").value = expedienteCorrecto.id;
                document.getElementById("especialidad").value = expedienteCorrecto.especialidad;
                document.getElementById("sip").value = expedienteCorrecto.sip;
                document.getElementById("nombreP").value = expedienteCorrecto.nombre;
                document.getElementById("apellidosP").value = expedienteCorrecto.apellidos;
                document.getElementById("fechaNac").value = fechaFormateada;
                document.getElementById("genero").value = expedienteCorrecto.genero;
                document.getElementById("observaciones").value = expedienteCorrecto.observaciones;
                document.getElementById("solicitud").value = expedienteCorrecto.solicitud;
                document.getElementById("fechaSol").value = acortarFecha(expedienteCorrecto.fecha_creacion);
                document.getElementById("fechaAsig").value =acortarFecha(expedienteCorrecto.fecha_asignacion);
                document.getElementById("fechaRes").value = acortarFecha(expedienteCorrecto.fecha_resolucion);

                // Nuevo: Rellena el nombre del médico especialista si el expediente está asignado
                if (expedienteCorrecto.fecha_asignacion != null) {
                    console.log(expedienteCorrecto.me);
                    rest.get(ip+"/api/medico/" + expedienteCorrecto.me, function (codigo, medicoEspecialista) {
                        console.log(medicoEspecialista) // Es Nan si no tiene
                        if (codigo == 200) {
                            document.getElementById("medEsp").value = medicoEspecialista.nombre + " " + medicoEspecialista.apellidos;
                        }
                    })
                } 
                
                if (expedienteCorrecto.fecha_resolucion != null) {
                    document.getElementById("respuesta").value = expedienteCorrecto.respuesta;
                }
                cargarFotos(expedienteActualId); // Se carga la tabla con las fotos del expediente
            }
            tablaExp.append(fila);
        });
    })
}

//Elimina un expediente al pulsar su botón. Esta función se llama en el main, en cargarExpedientes()
function eliminarExpediente(idExpediente){
    rest.delete(ip+"/api/expediente/" + idExpediente, function(codigo, respuesta){
        if (codigo == 200){ //Si se ha borrado correctamente, se carga el array Expedientes actualizado
            cargarExpedientes(respuesta);
        }
    });
}

// Devuelve la fecha actual
function fechaActual(){
    var fa = new Date();
    var mes = (fa.getMonth() + 1).toString().padStart(2, '0');  //A getMonth se le suma 1 pq los meses van de 0-11. Y par que sea tipo MM
    var fecha = fa.getDate() + "/"  + mes + "/"  + fa.getFullYear() + " "  + fa.getHours() + ":"  + fa.getMinutes() + ":" + fa.getSeconds();
    return fecha;
}

// Devuelve la fecha actual sin la hora
function fechaActualSinHora(){
    var fa = new Date();
    var mes = (fa.getMonth() + 1).toString().padStart(2, '0');  //A getMonth se le suma 1 pq los meses van de 0-11. Y par que sea tipo MM
    var fecha =  fa.getFullYear()+ "-"  + mes + "-"  + fa.getDate();
    return fecha;
}

// Para formatear la fecha desde la BD para q se pueda mostrar por pantalla ya que están en diatinto formato
function formatearFecha(fechaBD) {
    const fecha = new Date(fechaBD); // Crear un objeto Date a partir de la fecha ISO
    
    // Obtener el año, mes y día
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son indexados desde 0
    const day = String(fecha.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`; // Formatear la fecha como YYYY-MM-DD
}

//CREAMOS EL SOCKET PARA EL CHAT
var ws; 
function establecerConexionWS(){ // Se llama al iniciar sesión, para ya saber el médico que es
    ws = new WebSocket("ws://localhost:4444");

    // Se establece conexión y se indica que MAP es. 
    ws.onopen = function(e){
        console.log(" Conexión establecida!");
        ws.send(JSON.stringify({
            operacion: "identificarse",
            medico: medicoActual, //Envía objeto médico MAP actual
            expedienteActual: expedienteActualId
        }));
    };

    // Evento de conexión cerrada
    ws.addEventListener("close", function () {
        console.log("Desconectado del servidor!!!");
    });

    // Evento de error
    ws.onerror = function (error) {
        console.log("Error con la conexión!!!");
    };

    // Evento de recepción del mensaje
    ws.addEventListener("message", function (event) {
        console.log("Mensaje del servidor:", event.data);
        var msg = JSON.parse(event.data);
        switch (msg.operacion) {
            case "identificarse":
                // No se necesita hacer nada. 
                break;
            case "chatIndividual":
                document.getElementById("listaMensajes").innerHTML += "<li>("+msg.fecha +") <strong>"+ msg.origen+"</strong>: "+msg.mensaje+"</li>";
                break;
    
            case "chatGrupal":
                document.getElementById("listaMensajes").innerHTML += "<li>("+msg.fecha +") <strong>"+ msg.origen+"</strong>: "+msg.mensaje+"</li>";
                break;
        }
    });
};


function enviarMensaje(){ //Cuando se pulsa el botón enviar del chat
    // Comprobar si el expediente del boton pulsado, esta asignado y que especialidad tiene
    var expedientePulsado = expedientesMapGlobal.find(expedientePulsado => expedientePulsado.id === expedienteActualId); // Se obtiene el expediente, del boton chat pulsado
    if (expedientePulsado.fecha_asignacion == ""){ // Si el expediente no esta asignado
        //Chat grupal, con los ME de la especialidad del expendiente
        ws.send(JSON.stringify({
            operacion: "chatGrupal",
            origen: medicoActual.nombre,
            destinatario: expedientePulsado.especialidad, // id especialidad del expediente
            mensaje: document.getElementById("mensaje").value,
            fecha: fechaActual(),
            expediente: expedienteActualId
        }));
    } else { 
        // Chat individual
        ws.send(JSON.stringify({
            operacion: "chatIndividual",
            origen: medicoActual.nombre,
            destinatario: expedientePulsado.me, // El id del ME concreto
            mensaje: document.getElementById("mensaje").value,
            fecha: fechaActual(),
            expediente: expedienteActualId
        })); 
    }
    // Se imprime el mensaje en pantalla
    var listaMensajes = document.getElementById("listaMensajes");
    var nuevoMensaje = document.createElement("li");
    var textoMensaje = document.getElementById("mensaje").value;
    nuevoMensaje.innerHTML = "("+ fechaActual() + ") <strong>"+ medicoActual.nombre +"</strong>: " + textoMensaje ; 
    listaMensajes.appendChild(nuevoMensaje);
    document.getElementById("mensaje").value = ""; // Se vacía el campo de mensaje
}



//FUNCIONALIDAD DE LAS FOTOS

// Toma y aLmacena una nueva foto, función que se ejecuta al pulsar el botón de tomar foto
function guardarFoto() {
    // Obtener foto de la cámara
    navigator.camera.getPicture(onSuccess, onFail, { // opciones. El método abre la cámara del dispositivo y permite tomar una foto
        quality: 25, //Espera un valor de 0 a 100. Cuanto más alto, mejor calidad de imagen
        destinationType: Camera.DestinationType.DATA_URL //Especifica el formato de retorno de la imagen, que en este caso es una cadena base64
    });

    function onSuccess(imageData) {
        //La imagen se envía en el POST codificada en base64
        rest.post(ip+ "/api/expediente/"+ expedienteActualId + "/fotos", {imagen: imageData}, function(codigo,respuesta){
            if(codigo==200){ //Si va bien den la respuesta estará el valor de id de la foto nueva
                window.alert(respuesta);
                cargarFotos(expedienteActualId);
            } else {
                window.alert(respuesta);
            }
        });
    }

    function onFail(message) {
        alert("Error en la foto: " + message);
    }
}

// Carga en la tabla las fotos del expedinte
function cargarFotos(expedienteActualId) {
    var tablaFotos = document.getElementById("tablaFotos");
    while (tablaFotos.rows.length > 0) {
        tablaFotos.deleteRow(0);
    }
    rest.get(ip + "/api/expediente/"+expedienteActualId+"/fotos", function (estado, datos) {
        if (estado == 200) {
            var idFotos = datos.idFotos;
            for (var i=0; i<idFotos.length; i++){ 
                var fila = document.createElement("tr");
                var id = idFotos[i].id;
                var fecha =acortarFecha(idFotos[i].fecha);
                var foto = datos.fotos[i];
                var datosFila = [id, fecha];
                // Array con los nombres de las columnas (para hacer el diseño responsive de la tabla)
                var titulos = ["ID", "Fecha Creación"];
                datosFila.forEach(function (dato, index) {
                    var celda = document.createElement("td");
                    celda.textContent = dato;
                    celda.setAttribute("data-titulo", titulos[index]); //Para el responsive
                    fila.appendChild(celda);
                });
                //hacer la celda específica para la foto
                var celdaFoto = document.createElement("td")
                var imagen = document.createElement("img");
                imagen.src = "data:image/jpeg;base64," + foto;
                // Aplicar estilos para que la imagen se ajuste al tamaño de la celda
                imagen.style.width = "100%"; 
                imagen.style.height = "auto";
                imagen.style.objectFit = "contain";
                
                celdaFoto.appendChild(imagen);
                fila.appendChild(celdaFoto);

                //Botón para eliminar foto
                var botonEliminar = document.createElement("button");
                botonEliminar.textContent = "Borrar";
                botonEliminar.className = "eliminar";
                botonEliminar.addEventListener("click", function () {
                    event.stopPropagation();
                    eliminarFoto(id);
                });
                var celdaBoton = document.createElement("td");
                celdaBoton.appendChild(botonEliminar);
                fila.appendChild(celdaBoton);

                tablaFotos.append(fila);
            }
        }
    });
}

function eliminarFoto(idFoto){
    rest.delete(ip+"/api/foto/"+idFoto, function(codigo, respuesta){
        if (codigo == 200){
            cargarFotos(expedienteActualId);
        }
    });
}

//Introducir datos de una comunidad autonoma, id_area = 6
function recopilarDatosCantabria() {
    var body = {id_area : 6,
        fecha : fechaActualSinHora(), 
        datos : datosCantabria}
    console.log(body);

    rest.post("https://undefined.ua.es/telemedicina/api/datos", body, function(codigo, respuesta){  
        if(codigo == 201){
            window.alert("Se ha enviado")
        } else {
            window.alert("Error al enviar")
        }
        
    })
}

//Registros de Cantabria subidos
function obtenerNumRegistro(){
    rest.get("https://undefined.ua.es/telemedicina/api/datos", function(codigo, respuesta){
        if(codigo == 200){
            var i = 0;
            respuesta.forEach(function(registro){
                if (registro.id_area == 6){
                    i++;
                }
            })
            window.alert("En el Ministerio de Sanidad de Cantabria hay: "+ i +" registros");
        } else {
            window.alert("Error")
        }
    })
}