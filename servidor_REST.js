// cargar la librería
const exp = require("constants");
const cors= require("cors");
var express = require("express"); 
const { hostname, type } = require("os");

var servidor = express(); // crear el servidor express
servidor.use(express.json({ limit: "10mb" })); // establecer un límite alto para las fotos

var fs = require("fs"); // acceso al sistema de archivos

servidor.use("/map", express.static("clienteMAP")); // servir la web del cliente. El primer path es para la ruta en el navegador, y el egundo para buscarlo en los arcihvos
servidor.use("/me", express.static("clienteME")); // servir la web del cliente. El primer path es para la ruta en el navegador, y el egundo para buscarlo en los arcihvos
servidor.use("/comun", express.static("comun")); // servir la web del archivo css, que está en la carpeta común
servidor.use("/", express.json({ strict: false })); // interpretar el body de la solicitud como JSON 
servidor.use(cors());

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
})

// Muestra el listado de especialidades
servidor.get("/api/especialidades", function (req, res) {
    
    var sql = "SELECT * FROM especialidades"; //Lo q se devuelve es un array de los elementos pertinentes de la BD

    conexion.query(sql, function(err, especialidades) { //El metodo query ejecuta un consulta SQL
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).json("Error en la consulta");
        }
        else{
            res.status(200).json(especialidades); //Las especialidades se duevlen en forma de una array de objetos, donde cada objeto es una fila de la tabla
        }
    });
});


// Muestra un listado con todos los centros
servidor.get("/api/centros", function (req, res) {

    var sql = "SELECT * FROM centros";

    conexion.query(sql, function(err, centros) {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).json("Error en la consulta");
        }
        else{
            res.status(200).json(centros); //Devuelve array
        }
    });
});


// Realizar login para médico
servidor.post("/api/medico/login",function (req, res) {
    //Se extraen las propiedades del cuerpo de la solicitud
    //Tmb se puede hacer asi:  const { login, password } = req.body;
    const login = req.body.login;
    const password = req.body.password; 

    var medico = "SELECT * FROM medicos where login = ? AND password = ?";

    conexion.query(medico,[login,password], function(err, medicoLogin) { //Parámetros: la consulta, los valores q van en las interrogaciones de la consulta
        if (err) { // Si no hace bien la conexion
            console.error('Error en la query:', err);
        }else if (medicoLogin.length == 0){ // Si el array esta vacío, no se han encontrado resultados de la consulta 
            res.status(403).json("Error, credenciales incorrectas"); //No se encuentra el medico con las condiciones
        } else {
            //Comprobar que el médico que hace login sea MAP
            if (medicoLogin[0].especialidad == null){ // Es MAP
                res.status(200).json({id: medicoLogin[0].id, medico:medicoLogin}); //Se envía el id y el objeto médico
            } else { //Es ME
                res.status(403).json("Error, no es MAP");
            }
        }
    });
});



//Crear nuevo medico
servidor.post("/api/medico", function(req,res){
    const {nombre, apellidos, login, password, centro} = req.body; // Se extraen los datos del body
    
    var loginRepe = "SELECT * FROM medicos where login = ?"; //Se busca si hay médico con ese login
    
    conexion.query(loginRepe,[login], function(err, medico) {
        if (err){
            console.error('Error en la query:', err); 
        } else if (medico.length != 0){ //Si existe ya un medico con ese login
            res.status(403).json("Error, ya existe un médico con ese login");
        } else { // Si no se repite el login se crea el nuevo médico
            var newMedico = "INSERT INTO medicos (nombre, apellidos, login, password, centro) VALUES (?,?,?,?,?)";
            
            conexion.query(newMedico,[nombre,apellidos,login,password,centro], function(err, medicoCreado){
                if(err){
                    console.error('Error en la query:', err); 
                } else {
                    res.status(201).json(medicoCreado);
                }
            })
        }
    });
});

// Obtener todos los datos del médico, excepto la contraseña, linea 227 del main MAP
servidor.get("/api/medico/:id", function(req, res){
    var id = parseInt(req.params.id); //De string a entero, coges el parámetro id pasado en la ruta
    
    var medico = "SELECT id,nombre,apellidos,login,especialidad,centro FROM medicos where id = ?"; //Se coge todo menos la col password del medico con ese ID
    
    conexion.query(medico, id, function(err, datosMedico){
        if (err){
            console.error('Error en la query:', err); 
        } else if (datosMedico.length == 0){ //Array vacío
            res.status(403).json("Error, médico no encontrado");
        } else { // Si se encuentra se envian todos los datos
            res.status(200).json(datosMedico[0]); //Se envía el objeto médico directamente
        }
    });
})


//Obtener array con expedientes creados por un MAP
servidor.get("/api/map/:id/expedientes",  function(req, res){
    var idMedico = parseInt(req.params.id);

    var expedientes = "SELECT * FROM expedientes WHERE map = ?";

    conexion.query(expedientes, [idMedico], function(err, expedientesMap){
        if (err){
            console.error('Error en la query:', err); 
        } else if (expedientesMap.length == 0){
            res.status(200).json("No hay expedientes");
        } else { //Si hay expedientes, el resultado de la consulta será un Array de ellos.
            res.status(200).json(expedientesMap); // Se devuelve el array con los expedientes de ese médico
        }
    })
})

//Crear un nuevo expediente
servidor.post("/api/map/:id/expedientes", function(req,res){
    const {medicoActualId,especialidad,sip,nombre,apellidos,fechaNac,genero,observaciones,solicitud} = req.body; // Se cogen los parámetros del body

    var sipRep = "SELECT * FROM expedientes WHERE sip = ?" // Se comprueba que no se repita el sip, pq significaría que ya existe ese paciente
    
    conexion.query(sipRep, [sip], function(err,expediente){
        if (err){
            console.error('Error en la query:', err); 
        } else if (expediente.length !=0){ //Hay expediente con un SIP repetido
            res.status(403).json("Error, ya existe un expediente con ese SIP");  
        } else { // Si no se repite el SIP, se añade el expediente
            var newExpediente = "INSERT INTO expedientes (map,especialidad,sip,nombre,apellidos,fecha_nacimiento,genero,observaciones,solicitud) VALUES (?,?,?,?,?,?,?,?,?)";
            
            conexion.query(newExpediente, [medicoActualId,especialidad,sip,nombre,apellidos,fechaNac,genero,observaciones,solicitud], function(err,expedienteCreado){
                if (err){
                    console.error('Error en la query:', err); 
                } else { //Se ha creado el expediente correctamente
                    res.status(200).json(expedienteCreado);
                }
            })
        }
    })
});


//Borra un expediente
servidor.delete("/api/expediente/:id",function (req,res){
    var id = parseInt(req.params.id);

    var expediente = "SELECT * FROM expedientes WHERE id = ?";

    conexion.query(expediente, [id], function(err, expedienteEncontrado){
        if (err){
            console.error('Error en la query:', err); 
        } else if (expedienteEncontrado.length == 0){ //No se ha encontrado el expediente a borrar
            res.status(404).json("Expediente no encontrado");
        } else { //Se borra el expediente
            var eliminarExpediente = "DELETE FROM expedientes WHERE id = ?";
            conexion.query(eliminarExpediente, [id], function(err, expedienteEliminado){
                if(err) {
                    console.error('Error en la query:', err); 
                } else {
                    res.status(200).json(expedienteEncontrado[0].map);
                }
            })
        }
    })
});

//Cambia info del médico indicado en el id
servidor.put("/api/medico/:id", function (req,res){
    var id = parseInt(req.params.id); //Se coge id de la URL
    var nuevaInfo = req.body; 

    var loginRepe = "SELECT * FROM medicos WHERE login = ? AND id != (SELECT id FROM medicos WHERE id= ?)";
        conexion.query(loginRepe, [nuevaInfo.login, id], function(err, medico){
            if (err) {
                console.error('Error en la query:', err);
            } else if(medico.length != 0){ //Login está repetido
                res.status(403).json("Ya existe un usuario con ese login. Elija otro"); 
            } else { //Si el login no está repetido
                 //Se actualizan los datos en la BD
                 var actualizarMedico = "UPDATE medicos SET nombre = ?, apellidos = ?, login = ?, password = ?, centro = ? WHERE id = ?"
                 
                 conexion.query(actualizarMedico, [nuevaInfo.nombre,nuevaInfo.apellidos,nuevaInfo.login,nuevaInfo.password, nuevaInfo.centro,id], function(err,actualizado){
                    if (err) {
                        console.error('Error en la query:', err);
                    } else { //Se busca al médico para devolverlo al main
                        var medico = "SELECT * FROM medicos WHERE id = ?";
                        
                        conexion.query(medico,[id], function(err,medicoActualizado){
                            if (err) {
                                console.error('Error en la query:', err); 
                            } else if (medicoActualizado.length == 0){ // No se ha encontrado al médico
                                res.status(403).json("Error, médico no encontrado");
                            } else { // Se ha encontrado al médico
                                res.status(200).json(medicoActualizado);
                            }
                        })
                    }
                 })
            }
        }) 
});


//cambiar datos de un expediente
servidor.put("/api/expediente/:id", function(req,res){
    var id = parseInt(req.params.id); //Se coge id del expediente de la URL
    var datosNuevos = req.body; 
    
    var actualizarExpediente = "UPDATE expedientes SET especialidad =?, sip =?, nombre=?, apellidos=?,fecha_nacimiento=?, genero=?, observaciones=?,solicitud=? WHERE id = ?";
    
    conexion.query(actualizarExpediente,[datosNuevos.especialidad,datosNuevos.sip,datosNuevos.nombre,datosNuevos.apellidos,datosNuevos.fechaNac,datosNuevos.genero,datosNuevos.observaciones,datosNuevos.solicitud,id], function(err,cambios){
        if (err) {
            console.error('Error en la query:', err);
            return res.status(500).json("Error al actualizar expediente"); 
        } else {
            var expediente = "SELECT * FROM expedientes WHERE id = ?";
            
            conexion.query(expediente, [id], function(err,expedienteActualizado){
                if (err) {
                    console.error('Error en la query:', err);
                } else if (expedienteActualizado.length == 0) { //No se ha encontrado el expediente
                    res.status(404).json("Error, expediente no encontrado");
                } else { //Se ha encontrado el expediente y se devuelve al cliente
                    res.status(200).json(expedienteActualizado);
                }

            })
        }
        
    })
});

// Subir foto
servidor.post("/api/expediente/:id/fotos", function (req, res) {
    
    var idExpediente = parseInt(req.params.id);
    //Crear la fila en la tabla de fotos de la base de datos
    conexion.query("INSERT INTO fotos (expediente) VALUES(?)", idExpediente, function(err, foto){
        if (err){
            console.error('Error en la query:', err); 
            res.status(400).json("Error al guardar la imagen");
        } else { //Se ha creado la foto correctamente. (req.body.imagen, es el contenido de la imagen enviada desde el cliente)
            fs.writeFileSync("comun/imagenes/imagen"+foto.insertId+".jpg", req.body.imagen, { encoding: "base64" }); //Crea la imagen en la carpeta de imagenes
            res.status(200).json("Imagen guardada correctamente");
        }
    });
});

// Obtener todas las fotos de un expediente
servidor.get("/api/expediente/:id/fotos", function (req, res) {
    var fotos = []; //Array con las fotos codificadas en base64 para q el cliente pueda mostrarlas
    var idExpediente = parseInt(req.params.id);   
    console.log(idExpediente)
    try { // por si no existe
        conexion.query("SELECT * FROM fotos WHERE expediente = ?", [idExpediente], function(err, idFotos){ //Obtenemos todos los id de las fotos que hay en ese expedinete. Pero en forma de objeto
            if (err){
                console.error('Error en la query:', err); 
            } 
            else if (idFotos.length == 0){  //Si no hay fotos asociadas a ese expediente
                console.log("Este expediente no tiene imágenes");
            }
            else { //Si hay fotos
                idFotos.forEach(function (idFoto) { //Esto nos da un array de objetos idFoto
                    var foto = fs.readFileSync("comun/imagenes/imagen" + idFoto.id + ".jpg", { encoding: "base64" });
                    fotos.push(foto);
                });
                res.status(200).json({fotos : fotos, idFotos: idFotos});
            }  
        });
    } catch (err) {
        img = null;
    }  
});

//Borrar foto
servidor.delete("/api/foto/:id", function (req, res) {
    var idFoto = parseInt(req.params.id);
    conexion.query("DELETE FROM fotos WHERE id = ?", [idFoto], function(err, foto){
        if (err){
            res.status(400).json(false); 
        } else { //Se borra el expediente
            res.status(200).json(true)
            fs.unlinkSync("comun/imagenes/imagen" + idFoto + ".jpg"); // Se borra de la carpeta
        }
    })
});

// Devuelve la fecha actual formateada
function fechaActual(){
    var fa = new Date();
    var mes = (fa.getMonth() + 1).toString().padStart(2, '0');  //A getMonth se le suma 1 pq los meses van de 0-11. Y par que sea tipo MM
    var fecha = fa.getDate() + "/"  + mes + "/"  + fa.getFullYear() + " "  + fa.getHours() + ":"  + fa.getMinutes() + ":" + fa.getSeconds();
    return fecha;
}

// Poner en marcha el servidor en un puerto
var puerto = 3000;
servidor.listen(puerto, function () {
    console.log("Servidor REST en marcha en puerto:", puerto);
})
