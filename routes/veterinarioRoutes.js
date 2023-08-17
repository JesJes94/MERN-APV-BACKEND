import express from "express";
import { registrar, perfil, confirmar, autenticar, resetear, comprobarToken, nuevoPassword, actualizarPerfil, actualizarPassword } from "../controllers/veterinarioController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

//Area pública

router.post('/', registrar);
router.get('/confirmar/:token', confirmar) //":" Añade un parametro dinamico al router
router.post('/login', autenticar);
router.post('/resetear-password', resetear);
router.route('/resetear-password/:token').get(comprobarToken).post(nuevoPassword);

//Area privada

router.get('/perfil', checkAuth, perfil);
router.put('/perfil/:id', checkAuth, actualizarPerfil);
router.put('/cambiar-password', checkAuth, actualizarPassword)


export default router;