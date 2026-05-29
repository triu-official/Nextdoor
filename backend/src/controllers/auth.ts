import { Request, Response } from 'express';
import { generateSalt, hashPassword, verifyPassword } from '../auth/hash';
import { usersDb } from '../storage/db';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-salted-hash';

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const allUsers = await usersDb.readAll();
  if (allUsers.find((u: any) => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);

  const newUser = {
    id: nanoid(),
    email,
    passwordHash,
    salt,
    name,
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  };

  await usersDb.insert(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, email: newUser.email, name: newUser.name }, token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const allUsers = await usersDb.readAll();
  const user = allUsers.find((u: any) => u.email === email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!verifyPassword(password, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

  res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name }, token });
};
