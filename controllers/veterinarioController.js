import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {

    //const {nombre, email, password} = req.body;

    const {email, nombre} = req.body; //Aplica destructuring y guarda el valor email del request

    const existeUsuario = await Veterinario.findOne({email}); //Busca en la BD si ya existe ese email.

    if(existeUsuario) { //En caso de que exista
        const error = new Error('Usuario ya registrado'); //Crea un objeto de tipo error
        return res.status(400).json({msg: error.message}); //Detiene la ejecución del código con return y envía el mensaje de error con el status 400 al frontend
    }

    try {
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        //Enviando email

        emailRegistro({
            email, nombre, token: veterinarioGuardado.token
        });

        res.json(veterinarioGuardado);

    } catch (error) {
        console.log(error);
    }
};

const confirmar = async (req, res) => { //Comparar el token en el router para confirmar al usuario (veterinario)

    const {token} = req.params

    const usuario = await Veterinario.findOne({token}); //Busca si el token del router es igual al veterinario guardado en la BD

    if(!usuario) { //Si el token no es igual entonces manda un error y detiene la ejecución del código
        const error = new Error('Token no válido');
        return res.status(404).json({msg: error.message});
    }

    try { // De lo contrario elimina el token y confirma al usuario.
        usuario.token = null;
        usuario.confirmado = true;
        await usuario.save(); //Guarda los cambios en el perfil del usuario.
        res.json({msg:'Usuario confirmado correctamente'});
    
    } catch (error) {
        console.log(error);
    }
}

const autenticar = async (req, res) => {
    const {email,password} = req.body; 

    const usuario = await Veterinario.findOne({email});

    if(!usuario) { //Comprobar si el usuario existe
        const error = new Error('El Usuario no existe');
        return res.status(401).json({msg: error.message});
    } 

    if(!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confimada');
        return res.status(403).json({msg: error.message});
    }

    //Revisar el password.

    if(await usuario.comprobarPassword(password)) {
        res.json(
            {
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,    
                token: generarJWT(usuario.id)
            });
    } else {
        const error = new Error('El password es incorrecto');
        return res.status(403).json({msg: error.message});
    }

}

const resetear = async (req, res) => {
    const {email} = req.body;

    const usuario = await Veterinario.findOne({email});
    
    if(!usuario) {
        const error = new Error('No existe el usuario')
        return res.status(400).json({msg: error.message});
    } 

    try {
        usuario.token = generarId();
        await usuario.save();

        emailOlvidePassword({
           email, nombre: usuario.nombre, token: usuario.token  
        })

        res.json({msg:'Hemos enviado un email'});
         
    } catch (error) {
        console.log(error);
    }

}

const comprobarToken =  async (req, res) => {
    const {token} = req.params;

    const tokenValido = await Veterinario.findOne({token});

    if(!tokenValido) {
        const error = new Error('El token no es válido');
        return res.status(400).json({msg: error.message});
    }
    
    res.json({msg:'Token válido, el usuario puede resetear su password'})
}

const nuevoPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;
    
    const veterinario = await Veterinario.findOne({token});

    if(!veterinario) {
        const error = new Error('Token no válido');
        return res.status(400).json({msg: error.message});
    }

    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        res.json({msg:'Password modificado correctamente'});

    } catch (error) {
        console.log(error);
    }
}

const perfil = (req, res) => {
    const {veterinario} = req;
    res.json(veterinario);
};

const actualizarPerfil = async (req, res) => {
    
    const {id} = req.params;
    const {nombre, email, web, telefono} = req.body;
    
    const veterinario = await Veterinario.findById(id);

    if(!perfil) {
        const error = new Error('No se encontro el perfil');
        return res.status(400).json({msg:error.message});
    }

    if(veterinario.email !== email) {
        const existeEmail = await Veterinario.findOne(email);

        if(existeEmail) {
            const error = new Error('El email ya esta registrado');
            return res.json({msg: error.message})
        }
    }

    try {
        veterinario.nombre = nombre;
        veterinario.email = email; 
        veterinario.web = web; 
        veterinario.telefono = telefono; 
        
        const veterinarioActualizado = await veterinario.save();
        res.json(veterinarioActualizado);

    } catch (error) {
        console.log(error);
    }

}

const actualizarPassword = async (req, res) => {
    const {id} = req.veterinario;
    const {pwd_actual, pwd_nuevo} = req.body;

    const veterinario = await Veterinario.findById(id);

    if(!veterinario) {
        const error = new Error('El veterinario no existe');
        return res.status(400).json({msg: error.message});
    }

    if(await veterinario.comprobarPassword(pwd_actual)) {
        try {
            veterinario.password = pwd_nuevo;
            await veterinario.save();
            res.json({msg: 'Password Almacenado Correctamente'})
            
        } catch (error) {
            console.log(error);
        }
        
    } else {
        const error = new Error('El password actual no coincide con el de la sesión');
        return res.status(400).json({msg: error.message});
    }

}

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    resetear,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
};