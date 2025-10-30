import { Router } from 'express';
import { checkLogin, login, logout } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/check-login', checkLogin);
authRouter.post('/logout', logout);

export default authRouter;
