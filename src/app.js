import express from 'express';
import postRouter from './routes/postRouter.js';
import commentRouter from './routes/commentRouter.js';
import authRouter from './routes/authRouter.js';
import passport from 'passport';
import 'dotenv/config';
import jwtStrategy from './middleware/jwtStrategy.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

passport.use(jwtStrategy);

app.use('/auth', authRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error.'})
  
})

app.listen(PORT, () =>
  console.log(`server running in http://localhost:${PORT} ...`)
);
