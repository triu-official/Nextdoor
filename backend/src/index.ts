import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRouter);

// Posts endpoints for e2e testing later
import { postsDb, businessesDb } from './storage/db';
import { nanoid } from 'nanoid';
import { authenticate } from './middleware/auth';

app.post('/api/posts', authenticate, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  const post = await postsDb.insert({
    id: nanoid(),
    // @ts-ignore
    userId: req.user.id,
    authorName: (req as any).user.name,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  });
  res.status(201).json({ post });
});

app.get('/api/posts', authenticate, async (req, res) => {
  const posts = await postsDb.readAll();
  res.status(200).json({ posts });
});

app.get('/api/businesses', authenticate, async (req, res) => {
  const businesses = await businessesDb.readAll();
  res.status(200).json({ businesses });
});

// Societies and Channels (Community Circles)
import { societiesDb, channelsDb, messagesDb, commentsDb } from './storage/db';

app.get('/api/societies', authenticate, async (req, res) => {
  const societies = await societiesDb.readAll();
  res.status(200).json({ societies });
});

app.get('/api/channels/:societyId', authenticate, async (req, res) => {
  const channels = await channelsDb.readAll();
  const filtered = channels.filter((c: any) => c.societyId === req.params.societyId);
  res.status(200).json({ channels: filtered });
});

app.get('/api/messages/:channelId', authenticate, async (req, res) => {
  const messages = await messagesDb.readAll();
  const filtered = messages.filter((m: any) => m.channelId === req.params.channelId);
  res.status(200).json({ messages: filtered });
});

app.post('/api/messages/:channelId', authenticate, async (req, res) => {
  const message = await messagesDb.insert({
    id: nanoid(),
    channelId: req.params.channelId,
    // @ts-ignore
    userId: req.user.id,
    authorName: (req as any).user.name,
    content: req.body.content,
    createdAt: new Date().toISOString()
  });
  res.status(201).json({ message });
});

app.post('/api/posts/:postId/comments', authenticate, async (req, res) => {
  const comment = await commentsDb.insert({
    id: nanoid(),
    postId: req.params.postId,
    // @ts-ignore
    userId: req.user.id,
    authorName: (req as any).user.name,
    content: req.body.content,
    createdAt: new Date().toISOString()
  });
  res.status(201).json({ comment });
});

app.get('/api/posts/:postId/comments', authenticate, async (req, res) => {
  const comments = await commentsDb.readAll();
  const filtered = comments.filter((c: any) => c.postId === req.params.postId);
  res.status(200).json({ comments: filtered });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
