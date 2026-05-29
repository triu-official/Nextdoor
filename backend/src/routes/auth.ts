import { Router } from 'express';
import { register, login } from '../controllers/auth';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);

export { router as authRouter };
