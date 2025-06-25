console.log("Servidor RCP en marcha")

var rpc = require("./rpc.js"); // otener ref a la librería RPC


var servidor = rpc.server(); // creo el servidor
var app = servidor.createApp("gestionME"); // crear una aplicación dentro del servidor
var fs = require("fs"); // acceso al sistema de archivos

//CONEXIÓN CON LA BD
const mysql = require("mysql")

const database = {
	host : 'localhost',
	user : 'anley',
	password : 'anley123',
	database : 'sistema_sanitario'
};

var conexion = mysql.createConnection(database);

conexion.connect(function (err) {
	if (err) {
		console.error('Error en  la conexión de la base de datos:', err);
		process.exit();
	}
    else{
        console.log("Conexión exitosa")
    }
});

//FUNCIONES (PROCEDIMIENTOS REMOTOS) QUE SE VAN A UTILIZAR

//Esta función devuelve la fecha actual formateada
function fechaActual(){
    var fa = new Date();
    var mes = (fa.getMonth() + 1).toString().padStart(2, '0');  //A getMonth se le suma 1 pq los meses van de 0-11. Y par que sea tipo MM
    var fecha = fa.getFullYear() + "-"  + mes + "-"  + fa.getDate() + " "  + fa.getHours() + ":"  + fa.getMinutes() + ":" + fa.getSeconds();
    return fecha;
}

// Para formatear la fecha desde la BD para q se pueda mostrar por pantalla ya que están en diatinto formato
function formatearFecha(fechaBD,callback) {
    const fecha = new Date(fechaBD); // Crear un objeto Date a partir de la fecha ISO
    
    // Obtener el año, mes y día
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son indexados desde 0
    const day = String(fecha.getDate()).padStart(2, '0');
    
    callback(`${year}-${month}-${day}`); // Formatear la fecha como YYYY-MM-DD
}

//Obtener las especialidades
function obtenerEspecialidades(callback){
    conexion.query("SELECT * FROM especialidades", function(err, especialidades) {
        if (err) {
            console.error('Error en la consulta:', err);
            callback(null);
        }
        else{
            callback(especialidades);
        }
    });
}

//Obtener los centros
function obtenerCentros(callback){
    conexion.query("SELECT * FROM centros", function(err, centros) {  
        if (err) {
            console.error('Error en la consulta:', err);
            callback(null);
        }
        else{
            callback(centros);
        }
    });
}

//Realizar el login de un médico
function login(login, password,callback){
    conexion.query("SELECT * FROM medicos WHERE login = ? AND password = ?",[login,password], function(err, medico) {   //Las consultas tambien se peuden poner con ? y luego se pasan los valores en un array. Esta consulta nos devuelve la fila del médico que coincide con el login y la contraseña. Es decir, un array con un solo objeto.
        if (err) {
            console.error('Error en la consulta:', err);
            callback(null);
        }
        if(medico.length == 0){ //Si no se encuentra el médico
            console.log("No he encontrado al médico");
            callback(null);
        }
        else if(medico[0].especialidad != null){ //Devuleve el médico si es ME
            callback(medico[0]); //Devuelve directamente el objeto médico
        }
        else{
            console.log("No es ME")
            callback(null);
        }
        
    });
}

//Crear un médico 
function crearME(nombre,apellidos,login,password,centro,especialidad,callback){
    conexion.query("INSERT INTO medicos (nombre, apellidos, login, password, centro, especialidad) VALUES (?,?,?,?,?,?)",[nombre,apellidos,login,password,centro,especialidad], function(err, medico) {
        if (err) {
            callback(null);
        }
        else{
            callback(medico.insertId); //Devuelve el id del médico creado
        }
    });
}

//Actualiza los datos del médico
function actualizarme(id_me, datosMe, callback){ //datosMe es un objeto con toda la info del medico nueva
    conexion.query("UPDATE medicos SET nombre = ?, apellidos = ?, login = ?, password = ?, centro = ?, especialidad = ? WHERE id = ?",[datosMe.nombre,datosMe.apellidos,datosMe.login,datosMe.password,datosMe.centro,datosMe.especialidad,id_me], function(err, medico) {
        if (err) {
            callback(null);
        }
        else{
            conexion.query("SELECT * FROM medicos WHERE id = ?", id_me, function(err, medico) {
                if (err) {
                    callback(null);
                }
                else{
                    callback(medico); //Devuelve el médico actualizado
                }
            });
        }
    })
}

//Obtener los expedientes disponibles para una especialidad concreta pasando como parámetro el id de la especialidad
function obtenerExpDisponibles(id_especialidad,callback){
    //Obtenemos todos los expedientes de la especialidad indica
    conexion.query("SELECT * FROM expedientes WHERE (especialidad = ? AND me IS NULL )", id_especialidad, function(err, expedientes) {
        if(err){
            callback(null);
        }
        else{
            callback(expedientes);
        }
    });
}

//Obtener los datos del médico
function obtenerDatosMedico(id_medico, callback){
    //Buscamos al médico cuyo id coincide con el que se le ha pasado
    conexion.query("SELECT id, nombre, apellidos, login, especialidad, centro FROM medicos WHERE id = ?", id_medico, function(err, medico) {
        if (err) {
            console.error('Error en la consulta:', err);
            callback(null);
        }
        else if(medico.length == 0){ //Si no se encuentra el médico
            callback(null);
        }
        else{
            callback(medico[0]); //Devuelve el médico
        }
    });
}

//Obtener los expedientes que tiene asignados un ME, nos devuelve un array con todos los expedientes que tien ese ME
function obtenerExpAsignados(id_me, callback){
    conexion.query("SELECT * FROM expedientes WHERE me = ? ", id_me, function(err, expedientes) {
        if(err){
            callback(null);
        }
        else{
            callback(expedientes);
        }
    });
}

//Asignar un expediente a una médico especialista, rellenando la fecha de asignación
function asignarExp(id_exp, id_me, callback){
    conexion.query("SELECT * FROM expedientes WHERE id = ?", id_exp, function(err, expediente) {
        if (err) {
            callback(null);
        }
        else{
            conexion.query("UPDATE expedientes SET me = ?, fecha_asignacion = ? WHERE id = ?",[id_me,fechaActual(),id_exp], function(err) {
                if (err) {
                    callback(false);
                }
                else{
                    console.log("Esta es la fecha "+ fechaActual());
                    callback(true); //Devuelve el expediente actualizado
                }
            });
        }
    });
}

//Resolvemos un expediente, rellenando la respuesta y asignado la fecha de resolución
function resolverExp(id_exp, respuesta,callback){
    conexion.query("SELECT * FROM expedientes WHERE id = ?", id_exp, function(err, expediente) {
        if (err) {
            callback(null);
        }
        else{
            conexion.query("UPDATE expedientes SET fecha_resolucion = ?, respuesta = ? WHERE id = ?",[fechaActual(),respuesta, id_exp], function(err) {
                if (err) {
                    callback(false);
                }
                else{
                    callback(true); //Devuelve el expediente actualizado
                }
            });
        }
    });
}

function obtenerFotos(idExpediente, callback){
    var fotos = [];
    conexion.query("SELECT * FROM fotos WHERE expediente = ?", idExpediente, function(err, fotosExp) {
        if(err){
            callback(null);
        }
        else if (fotosExp.length == 0) {
            callback(null);
        } else {
            console.log(fotosExp);
            fotosExp.forEach(function (fotoExp) { //Esto nos da un array de objetos
                var foto = fs.readFileSync("comun/imagenes/imagen" + fotoExp.id + ".jpg", { encoding: "base64" });
                fotos.push(foto);
            });
            callback({fotos : fotos, fotosExp: fotosExp});
        }
    });
}

// Filtrar imágenes
function filtrarImagen(idimagen, operacion, opcion, callback){
    var exec = require('child_process').exec;
    var comando = "ttimagen comun/imagenes/imagen" + idimagen + ".jpg comun/imagenes/imagen" + idimagen + "_filtrada.jpg " + operacion + " " + opcion;
    exec(comando, function(error){
        if(error){
            console.error('Error en la ejecución del comando:', error);
        }
        else{
            console.log("Id de la imagen: " + idimagen);
            var foto = fs.readFileSync("comun/imagenes/imagen" + idimagen + "_filtrada.jpg", { encoding: "base64" });
            fs.unlinkSync("comun/imagenes/imagen" + idimagen + "_filtrada.jpg"); //Borrar el archivo
            console.log("Imagen filtrada");
            callback(foto);
        }
    });

}

//Registro de los procedimeintos (funciones) de la app
app.registerAsync(obtenerEspecialidades);
app.registerAsync(obtenerCentros);
app.registerAsync(login);
app.registerAsync(crearME);
app.registerAsync(actualizarme);
app.registerAsync(obtenerDatosMedico);
app.registerAsync(obtenerExpDisponibles);
app.registerAsync(asignarExp);
app.registerAsync(obtenerExpAsignados);
app.registerAsync(resolverExp);
app.registerAsync(fechaActual);
app.registerAsync(formatearFecha);
app.registerAsync(obtenerFotos);
app.registerAsync(filtrarImagen);