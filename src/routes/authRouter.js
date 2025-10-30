import { Router } from 'express';
import { checkLogin, login, logout } from '../controllers/authController.js';
import { authenticated } from '../middleware/authenticated.js';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/check-login', authenticated, checkLogin);
authRouter.post('/logout', logout);

export default authRouter;
