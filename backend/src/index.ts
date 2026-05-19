import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { createRepositories } from './persistence/factory';
import { authRouter } from './routes/auth';
import { businessRouter } from './routes/businesses';
import { circlesRouter } from './routes/circles';
import { feedRouter } from './routes/feed';

async function bootstrap(): Promise<void> {
  const app = express();
  const persistenceMode = process.env.PERSISTENCE_MODE ?? 'json';
  const repos = await createRepositories(persistenceMode);
  const otpStore = new Map<string, string>();

  app.use(cors());
  app.use(express.json());
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', persistenceMode });
  });

  app.get('/api/users/:id', async (req, res) => {
    const user = await repos.users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  });

  app.use('/api/auth', authRouter(repos, otpStore));
  app.use('/api', feedRouter(repos));
  app.use('/api', businessRouter(repos));
  app.use('/api', circlesRouter(repos));
  app.use(errorHandler);

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
