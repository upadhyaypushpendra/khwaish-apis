import express from 'express';

import auth from './auth.route';
import users from './users.route'
import requests from './requests.route'

const router = express.Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/requests', requests);

export default router;
