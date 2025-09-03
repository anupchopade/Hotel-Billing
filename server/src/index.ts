import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { json } from 'express';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import menuRouter from './routes/menu.js';
import billsRouter from './routes/bills.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || '*', credentials: true }));
app.use(json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/menu', menuRouter);
app.use('/bills', billsRouter);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});


