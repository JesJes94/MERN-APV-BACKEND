import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/DB.js";
import veterinarioRouter from "./routes/veterinarioRoutes.js";
import pacienteRouter from "./routes/pacienteRoutes.js";


const app = express();

app.use(express.json()); //Para leer los datos del request del servidor via POST.

dotenv.config();

conectarDB();

const dominiosPermitidos = [process.env.FRONTEND_URL]; 

const corsOptions = { //CORS es una política que impide que dominios no autorizados se conecten a la BD
    origin: function(origin, callback) {
        if(dominiosPermitidos.indexOf(origin) !== -1) { //Si el dominio esta permitido
            callback(null, true)
        } else {
            callback(new Error('No permitido por CORS'))
        }
    }
}

app.use(cors(corsOptions));

app.use('/api/veterinarios', veterinarioRouter);
app.use('/api/pacientes', pacienteRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});
