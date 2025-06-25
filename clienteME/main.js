 //Obtener los procedimientos del servidor RCP
var app = rpc("localhost", "gestionME");
var obtenerCentros = app.procedure("obtenerCentros");
var obtenerEspecialidades = app.procedure("obtenerEspecialidades");
var login = app.procedure("login");
var actualizarme = app.procedure("actualizarme");
var creaME = app.procedure("crearME");
var obtenerDatosMedico = app.procedure("obtenerDatosMedico");
var obtenerExpDisponibles = app.procedure("obtenerExpDisponibles");
var asignarExp = app.procedure("asignarExp");
var obtenerExpAsignados = app.procedure("obtenerExpAsignados");
var resolverExp = app.procedure("resolverExp");
var fechaActual = app.procedure("fechaActual");
var formatearFecha = app.procedure("formatearFecha");
var obtenerFotos = app.procedure("obtenerFotos");
var filtrarImagen = app.procedure("filtrarImagen");

//Variables globales
var vistaActual=null;
let medicoActual; //Guardará el objeto médico que haga login
var camino="";
var caminoExp = "";
var chat=""
var expActualId; //Id del expediente. Usado para resolver expediente independientemente de la Interfaz desde la q se accede a la InterfazExpediente
    //2 Variables distintas para que no haya problemas de identificación del expediente cnd se va cambiando de interfaz
let expActualIdAsignados; //Id del expediente al pulsar el botón ASIGNAR de la InterfazAsignar
var expActualIdAsignar; //Id del expediente al pulsar la fila en la InterfazAsignados


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

cambiarVista("InterfazInicio"); //Primera interfaz al cargar la app

//Cargamos los centros
function cargarCentros(){
    obtenerCentros(function(centros){ //Se llama a la función obtenerCentros del servidor
        centros.forEach(function(centro){ //Añade los centros al desplegable
            var selectCentros = document.getElementById("centro");
            var option = document.createElement("option");
            option.value = centro.id;
            option.text = centro.nombre;
            selectCentros.appendChild(option);
        })
    })
}
cargarCentros();

//Cargamos las especialidades
function cargarEspecialidades(){
    obtenerEspecialidades(function(especialidades){ //Se llama a la función obtenerEspecialidades del servidor
        especialidades.forEach(function(especialidad){ //Añade las especialidades a los desplegables
            var selectEspIRegistro = document.getElementById("esp"); //Desplegable de especialidades de la InterfazRegistro
            var selectEspIExpediente = document.getElementById("especialidad"); //Desplegable de especialidades de la InterfazExpediente
            
            var option = document.createElement("option"); //Se crean las opciones
            option.value = especialidad.id;
            option.text = especialidad.nombre;

            var option2 = document.createElement("option"); //Se crean las opciones
            option2.value = especialidad.id;
            option2.text = especialidad.nombre;
            
            selectEspIRegistro.appendChild(option); //Se añaden a los dos desplegables
            selectEspIExpediente.appendChild(option2);
        })
    })
}
cargarEspecialidades();

//Realizamos el login. Se ejecuta al pulsar el botón ENTRAR de la InterfazInicio
function iniciarSesion(){
    //Se cogen los valores de los campos
    var usuario = document.getElementById("usuario").value;
    var password = document.getElementById("contrasenya").value;
    
    login(usuario,password,function(medico){ //Se llama a la función login del servidor
        if (medico){
            medicoActual = medico; //Se guarda el médico que inicia sesion en la variable global medicoActual
            document.getElementById("medico").textContent = "Bienvenido: " + medicoActual.nombre + " " + medicoActual.apellidos;
            cambiarVista("InterfazMedico");
        } else{
            window.alert("Credenciales incorrectas");
        }
    })
}

//Guardar los datos del médico. Se ejecuta al pulsar el botón GUARDAR de la InterfazRegistro
function guardar(){
    //Se cogen los valores de los campos
    var nombre = document.getElementById("nombre").value;
    var apellidos = document.getElementById("apellidos").value;
    var login = document.getElementById("login").value;
    var password = document.getElementById("password").value;
    var centro = document.getElementById("centro").value;
    var especialidad = document.getElementById("esp").value;

    if (camino == "registro"){ //Si se entra a la interfaz para crear otro médico
        creaME(nombre, apellidos, login, password, centro, especialidad, function(nuevoMedicoId){ //Se llama a la función crearME del servidor
            if (nuevoMedicoId){
                cambiarVista("InterfazInicio"); //Cnd creas un  médico y guardas, vuelves a la InterfazInicio
            } else {
                window.alert("No se ha podido crear el médico.");
            }
        });
    } else if (camino == "editarDatos"){ //Si se entra a la interfaz para editar los datos del medicoActual
        var datosMe = {nombre:nombre,apellidos:apellidos,login:login, password:password, centro:centro, especialidad: especialidad} //Se crea objeto con todos los valores de los campos
        actualizarme(medicoActual.id, datosMe, function(medicoActualizado,){ //Se llama a la función actualizarme del servidor
            console.log(medicoActualizado)
            if(medicoActualizado != null){
                medicoActual = medicoActualizado[0];
                cambiarVista("InterfazMedico");
                document.getElementById("medico").textContent = "Bienvenido: " + datosMe.nombre + " " + datosMe.apellidos;
            } else {
                window.alert("Error al editar datos del médico."); 
            }
        })
    }
}

//Rellena los campos de la InterfazRegistro con los datos del medicoActual. Se ejecuta al pulsar el botón EDITAR DATOS de la InterfazMedico
function editarDatos(){
    cambiarVista("InterfazRegistro");
    camino = "editarDatos";

    //Cargar datos actuales del médico en la interfaz
    document.getElementById("nombre").value = medicoActual.nombre;
    document.getElementById("apellidos").value = medicoActual.apellidos;
    document.getElementById("login").value = medicoActual.login;
    document.getElementById("password").value = medicoActual.password;
    document.getElementById("centro").value = medicoActual.centro;
    document.getElementById("esp").value = medicoActual.especialidad;
}

//Carga en la InterfazAsignar los expedientes con el id de la especialidad pasada por parámetro
function cargarExpDisponibles(id_especialidad){
    var tablaExp = document.getElementById("tablaExpDis");
    while (tablaExp.rows.length > 0) {
        tablaExp.deleteRow(0);
    }
    obtenerExpDisponibles(id_especialidad, function(expDisponibles){ //Se llama a la función obtenerExpDisponibles del servidor
        expDisponibles.forEach(function(expediente){ //Por cada expediente se recogen sus datos
            var fila = document.createElement("tr");
            var id  = expediente.id;
            var fechaCre = acortarFecha(expediente.fecha_creacion);
            console.log(fechaCre);
            var idmap = expediente.map;
            var nombreMap = obtenerDatosMedico(idmap).nombre;
            var apellidosMap = obtenerDatosMedico(idmap).apellidos;
            var datos = [id, fechaCre, nombreMap + " " + apellidosMap];
            datos.forEach(function (dato) { //Los datos de cada expediente se cargan en la tabla
                var celda = document.createElement("td");
                celda.textContent = dato;
                fila.appendChild(celda);

            });
            //Botón para asignar expediente
            var botonAsignar = document.createElement("button");
            botonAsignar.textContent = "Asignar";
            botonAsignar.className = "asignar";
            botonAsignar.addEventListener("click", function () { //Si se pulsa al botón ASIGNAR de un expediente
                caminoExp = "asignar";
                expActualIdAsignar = id;
                expActualId = id;
                asignar(expActualIdAsignar,medicoActual.id);
            });
            var celdaBoton = document.createElement("td");
            celdaBoton.appendChild(botonAsignar);
            fila.appendChild(celdaBoton);

            //Botón para chatear con el MAP que también tiene ese expediente
            var botonChatear = document.createElement("button");
            botonChatear.textContent = "Chat";
            botonChatear.className = 'chat';
            botonChatear.addEventListener("click", function(){
                event.stopPropagation();
                chat = "grupal"
                cambiarVista("InterfazChat")
                expActualIdAsignados = id;
                expActualId = id;
                establecerConexionWS(); //Se establece conexión WS

            })
            var celdaBoton1 = document.createElement("td");
            celdaBoton1.appendChild(botonChatear);
            fila.appendChild(celdaBoton1)

            tablaExp.append(fila);
        })
    })
}

//Cargar los expedientes asignados a un médico en la InterfazAsignados
function cargarExpAsignados(id_me){
    var tablaExp = document.getElementById("tablaExpAsig");
    while (tablaExp.rows.length > 0) {
        tablaExp.deleteRow(0);
    }
    obtenerExpAsignados(id_me, function(expAsignados){ //Se llama a la función obtenerExpAsignados del servidor
        expAsignados.forEach(function(expediente){ //Por cada expediente se recogen sus datos
            var fila = document.createElement("tr");
            fila.className = "filaAsignados"; //se le pone clase para cambiar color css a la fila cnd pasa el rotón x encima
            var id = expediente.id;
            var fechaCre = acortarFecha(expediente.fecha_creacion);
            var fechaAsig = acortarFecha(expediente.fecha_asignacion);
            var fechaRes = acortarFecha(expediente.fecha_resolucion);
            var sip = expediente.sip;
            var datos = [id, fechaCre, fechaAsig, fechaRes, sip];
            datos.forEach(function (dato) { //Los datos de cada expediente se cargan en la tabla
                var celda = document.createElement("td");
                celda.textContent = dato;
                fila.appendChild(celda);
            });

            fila.onclick = function(){
                caminoExp = "asignados";
                cambiarVista("InterfazExpediente");
                expActualIdAsignados = id;
                expActualId = id;
                //Busca expediente con el id 
                var expedienteCorrecto = expAsignados.find(expedienteCorrecto => expedienteCorrecto.id === expActualIdAsignados);
                //Rellena campos del expediente a editar

                var fecha_nacimiento = formatearFecha(expedienteCorrecto.fecha_nacimiento);

                document.getElementById("id").value = expedienteCorrecto.id;
                document.getElementById("especialidad").value = expedienteCorrecto.especialidad;
                document.getElementById("sip").value = expedienteCorrecto.sip;
                document.getElementById("nombreP").value = expedienteCorrecto.nombre;
                document.getElementById("apellidosP").value = expedienteCorrecto.apellidos;
                document.getElementById("fechaNac").value = fecha_nacimiento;
                document.getElementById("genero").value = expedienteCorrecto.genero;
                document.getElementById("observaciones").value = expedienteCorrecto.observaciones;
                document.getElementById("solicitud").value = expedienteCorrecto.solicitud;
                document.getElementById("fechaSol").value = acortarFecha(expedienteCorrecto.fecha_creacion);
                document.getElementById("fechaAsig").value = acortarFecha(expedienteCorrecto.fecha_asignacion);
                document.getElementById("fechaRes").value = acortarFecha(expedienteCorrecto.fecha_resolucion); 
                cargarFotos(expActualId); //Carga la fotos del expediente asignado, función implementada abajo
            };
            //Botón para chatear con el MAP que también tiene ese expediente
            var botonChatear = document.createElement("button");
            botonChatear.textContent = "Chat";
            botonChatear.className = 'chat';
            botonChatear.addEventListener("click", function(){
                event.stopPropagation();
                chat = "individual"
                expActualIdAsignados = id;
                expActualId = id;
                cambiarVista("InterfazChat")
                establecerConexionWS(); //Se establece conexión WS
            })
            var celdaBoton3 = document.createElement("td");
            celdaBoton3.appendChild(botonChatear);
            fila.appendChild(celdaBoton3)

            tablaExp.append(fila);
        })
    })
}

//Se ejecuta cuando se pulsa el botón ASIGNAR EXPEDIENTE desde la InterfazMedico
function asignarExpediente(){
    cambiarVista("InterfazAsignar");
    var especialidad = obtenerDatosMedico(medicoActual.id).especialidad;
    cargarExpDisponibles(especialidad); //Función del main, carga los Expedientes Disponibles
}

//Se ejecuta al pulsar el botón EXPEDIENTES ASIGNADOS de la InterfazMedico
function expedientesAsig(){
    cambiarVista("InterfazAsignados");
    cargarExpAsignados(medicoActual.id); //Función del main, carga los Expedientes Asignados
}


//Se ejecuta el pulsar el botón ASIGNAR de la tabla de la InterfazAsignar
function asignar(id_exp,id_me){ //Se ejecuta en la funcion cargarExpDisponibles del main
    cambiarVista("InterfazExpediente");
    asignarExp(id_exp,id_me); //Se llama a la función asignarExp del servidor
    var expedientes = obtenerExpAsignados(id_me); 
    var expediente = expedientes.find(expediente => expediente.id == id_exp);
    //Cargar datos del expediente asignado en la interfaz
    document.getElementById("id").value = expediente.id;
    var me = obtenerDatosMedico(id_me);

    var fecha_nacimiento = formatearFecha(expediente.fecha_nacimiento)
    document.getElementById("medEsp").value = me.nombre + " " + me.apellidos;
    document.getElementById("especialidad").value = me.especialidad;
    document.getElementById("sip").value = expediente.sip;
    document.getElementById("nombreP").value = expediente.nombre;
    document.getElementById("apellidosP").value = expediente.apellidos;
    document.getElementById("fechaNac").value = fecha_nacimiento;
    document.getElementById("genero").value = expediente.genero;
    document.getElementById("observaciones").value = expediente.observaciones;
    document.getElementById("solicitud").value = expediente.solicitud;
    document.getElementById("fechaSol").value = acortarFecha(expediente.fecha_creacion); 
    document.getElementById("fechaAsig").value = acortarFecha(expediente.fecha_asignacion);  
}

//Botón resolver expediente de la InterfazExpediente
function resolverExpediente(){
    var respuesta = document.getElementById("respuesta").value;
    resolverExp(expActualId,respuesta, function(){ //Se llama a la función resolverExp del servidor
        if(true){
            window.alert("Expediente resuelto con éxito");
            if (caminoExp == "asignar"){
                cambiarVista("InterfazAsignar");
                cargarExpDisponibles(medicoActual.especialidad); //Se actualizan los expedientes disponibles
            } else if (caminoExp == "asignados"){
                cambiarVista("InterfazAsignados");
                cargarExpAsignados(medicoActual.id); //Se actualizan los expedientes asignados
            }
        }
    })

}

//Botón volver al listado de la InterfazExpediente
function volverListado(){
    if (caminoExp == "asignar"){
        cambiarVista("InterfazAsignar");
        cargarExpDisponibles(medicoActual.especialidad); //Se actualizan los expedientes disponibles
    } else if (caminoExp == "asignados"){
        cambiarVista("InterfazAsignados");
        cargarExpAsignados(medicoActual.id); //Se actualizan los expedientes asignados
    }
}
//Carga las fotos de un expediente, se llama al hacer onclick en la fila de la tabla de expedientes asignados
function cargarFotos(idExpediente){
    var tablaFotos = document.getElementById("tablaFotos");
    while (tablaFotos.rows.length > 0) {
        tablaFotos.deleteRow(0);
    }
    obtenerFotos(idExpediente, function(datos){
        if (datos != null){ //Si hay fotos, se muestran en la tabla
            var fotosExp = datos.fotosExp;
            fotosExp.forEach(function(fotoExp, i){ 
                var fila = document.createElement("tr");
                var id = fotoExp.id;
                var fecha =acortarFecha(fotoExp.fecha);
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
                imagen.src = "data:image/jpeg;base64," + foto; //document.getElementById('imagen').src = "data:image/jpeg;base64," + datos.imagen;
                // Aplicar estilos para que la imagen se ajuste al tamaño de la celda
                imagen.style.width = "100%"; 
                imagen.style.height = "auto";
                imagen.style.objectFit = "contain";
                
                celdaFoto.appendChild(imagen);
                fila.appendChild(celdaFoto);

                //Hacer columna para filtrado de imágenes
                var celdaFiltros = document.createElement("td")
                var selectOperacion = document.createElement("select");
                selectOperacion.id = "selectOperacion"+id;
                var operaciones = ["blur", "invert", "grayscale", "rotate", "flip", "flop", "threshold"];
                var descripciones = {
                    "blur": "Desenfoque",
                    "invert": "Invertir colores",
                    "grayscale": "Escala de grises",
                    "rotate": "Rotar imagen",
                    "flip": "Voltear horizontal",
                    "flop": "Voltear vertical",
                    "threshold": "Umbral binario"
                };
                operaciones.forEach(function(operacion) {
                    var opcion = document.createElement("option");
                    opcion.value = operacion;
                    opcion.textContent = descripciones[operacion];                    
                    selectOperacion.appendChild(opcion);
                });

                var input = document.createElement("input"); //Para indicar una opcion(solo valido para los filtros con opcion: Threshod, Rotate, blur)
                input.type = "text";
                input.id = "inputFiltro"+id; 
                input.disabled = true; //Por defecto deshabilitado

                var operacionesConOpcion = ["threshold", "rotate", "blur"];
                selectOperacion.addEventListener("change", function(){
                    if (operacionesConOpcion.includes(selectOperacion.value)){
                        input.disabled = false;
                        input.placeholder = "Introduce un valor";
                    } else {
                        input.disabled = true;
                    }
                });

                var botonFiltrar = document.createElement("button");
                botonFiltrar.textContent = "Filtrar";
                botonFiltrar.addEventListener("click", function(){
                    event.stopPropagation();
                    //Llamar al procedimiento de filtrado
                    var operacion = document.getElementById("selectOperacion"+id).value;
                    var opcion = document.getElementById("inputFiltro"+id).value;
                    filtrarImagen(id, operacion, opcion, function(fotoFiltrada){
                        imagen.src = "data:image/jpeg;base64," + fotoFiltrada; //Muestra la imagen 

                    });
                })

                celdaFiltros.appendChild(selectOperacion); //Añadir los elementos a la celda
                celdaFiltros.appendChild(input);
                celdaFiltros.appendChild(botonFiltrar);
                fila.appendChild(celdaFiltros);

                tablaFotos.append(fila);
            })
        } else {
            console.log("Este expediente no tiene fotos")
        }
    })
}

//CREAMOS EL SOCKET PARA EL CHAT

let ws;
 
function establecerConexionWS(){
    ws = new WebSocket("ws://localhost:4444");
    //Escuchamos los eventos que suceden en el socket
    ws.onopen = function(e){
        console.log("Conexión establecida!");
        ws.send(JSON.stringify({
            operacion: "identificarse",
            medico: medicoActual, //Envía objeto médico ME actual     
            expedienteActual: expActualId //Envía el id del expediente actual               
        }));
    };
    // Evento de conexión cerrada
    ws.onclose = function () {
        console.log("Desconectado del servidor!!!");
    };

    // Evento de error
    ws.onerror = function (error) {
        console.log("Error con la conexión!!!");
    };

    //Cada vez que el ME recibe un mensaje del MAP
    ws.onmessage = function(event){
        var mensaje = JSON.parse(event.data);
        document.getElementById("listaMensajes").innerHTML += "<li>("+mensaje.fecha +") <strong>"+ mensaje.origen+"</strong>: "+mensaje.mensaje+"</li>";
    }
}

function enviarMensaje(){ //Cuando se pulsa el botón enviar del chat
    var expedientesDisp = obtenerExpDisponibles(medicoActual.especialidad);
    var expedientesAsig = obtenerExpAsignados(medicoActual.id);

    //Comprobamos si se ha pulsado el botón desde los asignados o los que no
    if (chat == "individual"){ //Cuando se pulsa el chat desde los expedientes asignados, solo tendremos la conversación con el map de ese paciente
        var expediente = expedientesAsig.find(expediente => expediente.id === expActualId)
        console.log(expediente)
        ws.send(JSON.stringify({
            operacion: "chatIndividual",
            origen: medicoActual.nombre, //Nombre del medico especialista
            destinatario: expediente.map, // Id del MAP
            mensaje: document.getElementById("mensaje").value,
            expediente: expActualId,
            fecha: fechaActual()
        })); 
    }
    else { //Chat grupal
        var expediente= expedientesDisp.find(expediente => expediente.id === expActualId)
        ws.send(JSON.stringify({
            operacion: "chatGrupal",
            origen: medicoActual.nombre, //Nombre del medico especialista
            destinatario: medicoActual.especialidad, // Id de la especialidad
            map: expediente.map,
            mensaje: document.getElementById("mensaje").value,
            expediente: expActualId,
            fecha: fechaActual()
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
