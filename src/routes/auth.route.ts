/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */

import logger from '@/config/logger'
import { User } from '@/models/user.model'
import ApiError from '@/utils/ApiError'
import { createAccessToken, createRefreshToken } from '@/utils/jwt'
import { validateAndParsePhone } from '@/utils/phone'
import express from 'express'
import httpStatus from 'http-status'
import passport from 'passport'

const router = express.Router()

router.post('/login', async (req, res, next) => {
  try {
    const { phone, password } = req.body
    const user = await User.findOne({ phone })
      .populate('friends', { name: 1, phone: 1, about: 1 });
    
    if (!user || !user.validPassword(password))
      throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Invalid phone or password')

    const accessToken = await createAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);


    res.json({
      user,
      tokens: {
        ...accessToken,
        ...refreshToken
      }
    });
  } catch (e) {
    next(e)
  }
});

router.post('/signup', async (req, res, next) => {
  try {
    const { name, phone, about, password } = req.body

    const { isValid: isValidPhone, phoneNumber } = validateAndParsePhone(phone);
    if (!isValidPhone) throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number is not valid');

    const user = new User();
    user.name = name;
    user.phone = phoneNumber;
    user.about = about;
    user.setPassword(password);
    user.isNew = true;

    logger.info({
      message: "Creating user",
      metadata: user.toJSON(),
    });

    await user.save();


    const accessToken = await createAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        about: user.about,
        friends: user.friends,
      },
      tokens: {
        ...accessToken,
        ...refreshToken
      }
    });
  } catch (e) {
    if (e.name === 'MongoError') return res.status(httpStatus.BAD_REQUEST).send(e)
    next(e)
  }
});

router.get('/restore', passport.authenticate('jwt-refresh', { session: false }), async (req, res, next) => {
  const { _id } = req.user as any;

  const user = await User
    .findById(_id, { name: 1, phone: 1, about: 1, friends: 1 })
    .populate('friends', { name: 1, phone: 1, about: 1 });

  if (!user) throw new ApiError(httpStatus.UNAVAILABLE_FOR_LEGAL_REASONS, 'Invalid token');

  const accessToken = await createAccessToken(user.id);

  res.status(httpStatus.OK).json({
    ...accessToken,
    user,
  });
});

router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  res.send(req.user)
});


export default router
