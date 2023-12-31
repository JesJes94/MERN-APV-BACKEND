import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generarId from "../helpers/generarId.js";

const veterinarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    telefono: {
        type: String,
        default: null,
        trim: true
    },
    web: {
        type: String,
        default: null
    },
    token: {
        type: String,
        default: generarId()
    },
    confirmado: {
        type: Boolean,
        default:false
    }
});

veterinarioSchema.pre('save', async function(next) { //This se refiere al registro del veterinario, de esta manera accedemos al password del objeto
    if(!this.isModified("password")){ //Si el password ya esta hasheado
        next(); //Se salta al siguiente middleware del index.js
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); //Metodo para hashear el password.
});

veterinarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password); //this.password es el password hasheado del usuario en la BD
}

const Veterinario = mongoose.model('veterinario', veterinarioSchema);

export default Veterinario;

//Instalar dependencia bcrypt para hashear los passwords: npm i bcrypt

