import jwt from "jsonwebtoken";
import Veterinario from "../models/Veterinario.js";

const checkAuth = async (req, res, next) => {
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        let token;
        
        try {
            token = req.headers.authorization.substring(7);
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.veterinario = await Veterinario.findById(decoded.id).select("-password -token -confirmado"); //select ignora informacion importante dentro de la BD

            return next();
            
        } catch (error) {
            const e = new Error('Token no válido')
            res.status(403).json({msg: e.message});
        }
        
    } 

    if(!token) {
        const error = new Error('Token no válido o inexistente');
        res.status(403).json({msg: error.message});
    }
    
    next();
}

export default checkAuth;