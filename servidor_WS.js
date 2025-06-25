// Crear un servidor HTTP
var http = require("http");
var httpServer = http.createServer();

// Crear servidor WS
var WebSocketServer = require("websocket").server; // instalar previamente: npm install websocket
var wsServer = new WebSocketServer({
	httpServer: httpServer
});

// Iniciar el servidor HTTP en un puerto
var puerto = 4444; //Este servidor tiene que estar escuchando en un puerto diferente al de las aplicaciones
httpServer.listen(puerto, function () {
	console.log("Servidor de WebSocket iniciado en puerto:", puerto);
});

//var conexionesME = [];
//var conexionesMAP = [];
var conexiones = [];


wsServer.on("request", function (request) { // este callback se ejecuta cuando llega una nueva conexión de un cliente
	var connection = request.accept(null, request.origin); // aceptar conexión. Pongo null porque la comunicación que va a haber entre los médicos no va a seguir ninguna regla específica. y este parámetro es para implementar un subprotocolo.
	var cliente = { // asocio a la conexión un nombre
		conexion: connection,
		medico: null, // aun no se quien es
		expedienteActual: null // aun no se cual es
	};
	conexiones.push(cliente); // Se añade el objeto cliente al array de conexiones
	console.log("Cliente conectado. Ahora son:", conexiones.length);
	
	connection.on("message", function (message) { // mensaje recibido del cliente
		if (message.type ==="utf8"){
			console.log("Mensaje recibido de cliente: " + message.utf8Data);
		}
		var msg = JSON.parse(message.utf8Data); // paso el mensaje de texto al objeto original
		
		switch(msg.operacion){
			case "identificarse":
				console.log("Se ha identificado", msg.medico.nombre);
				cliente.medico = msg.medico;
				cliente.expedienteActual = msg.expedienteActual;
				break; 
			case "chatIndividual": 
			    console.log("Mensaje recibido por el servidor, CHAT INDIVIDUAL")
				for (var i = 0; i < conexiones.length; i++) { // Bucle que busca el ME concreto al que se le debe enviar el mensaje
					if (conexiones[i].medico.id == msg.destinatario && conexiones[i].expedienteActual == msg.expediente) { // Si coinciden los id del médico
						conexiones[i].conexion.sendUTF(message.utf8Data); // Enviar mensaje
					}
				}
				break;
			case "chatGrupal":
				console.log("Mensaje recibido por el servidor, CHAT GRUPAL"); 
				for (var i = 0; i < conexiones.length; i++) {
					if ((conexiones[i] !== cliente) && ((conexiones[i].medico.especialidad == msg.destinatario) || (conexiones[i].medico.id == msg.map)) && conexiones[i].expedienteActual == msg.expediente) { // Si no es cliente actual y es de cierta especialidad
						conexiones[i].conexion.sendUTF(message.utf8Data);
					}
				}
				break;
		}
	});
	connection.on("close", function () { // conexión cerrada
		conexiones.splice(conexiones.indexOf(cliente), 1); // elimino la conexión del array de conexiones
		console.log("Cliente desconectado. Ahora son", conexiones.length);
	});
});
