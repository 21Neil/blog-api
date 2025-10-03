import { Router } from 'express';
import authRouter from './authRouter.js';
import postRouter from './postRouter.js';
import { authenticated } from '../middleware/authenticated.js';
import adminRouter from './adminRouter.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/posts', postRouter);
apiRouter.use('/admin', authenticated, adminRouter);

export default apiRouter;
