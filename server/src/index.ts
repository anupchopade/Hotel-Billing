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
// General rate limiting - more generous for development
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1200, // Increased to 1200 for development
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (_req, res) => res.json({ 
  ok: true, 
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  environment: process.env.NODE_ENV || 'development'
}));

app.use('/auth', authLimiter, authRouter);
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


