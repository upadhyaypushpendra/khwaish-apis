import express from 'express';

import auth from './auth.route';
import users from './users.route'

const router = express.Router();

router.use('/auth', auth);
router.use('/users', users);

export default router;
