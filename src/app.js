import express from 'express';
import jwtStrategy from './middleware/jwtStrategy.js';
import passport from 'passport';
import 'dotenv/config';
import apiRouter from './routes/apiRouter.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { startR2CleanCron } from './tasks/scheduler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'prod'
        ? ['https://blog.twoneil.party', 'https://blog-back.twoneil.party']
        : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

passport.use(jwtStrategy);

app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || 'Internal server error.' });
});

startR2CleanCron();

app.listen(PORT, () =>
  console.log(`server running in http://localhost:${PORT} ...`)
);
