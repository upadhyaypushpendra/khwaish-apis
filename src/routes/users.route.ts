import logger from '@/config/logger'
import { User } from '@/models/user.model'
import ApiError from '@/utils/ApiError'
import { validateAndParsePhone } from '@/utils/phone'
import express from 'express'
import httpStatus from 'http-status'
import passport from 'passport'

const router = express.Router()

router.get('/', passport.authenticate(['jwt', 'anonymous'], { session: false }), async (req, res, next) => {
  logger.debug('%o', req.user)
  const user = await User.find();
  res.json(user)
})

router.get('/:id', passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
    res.json(user)
  } catch (e) {
    next(e)
  }
});

router.post('/', passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  try {
    const { name, phone, about } = req.body.user;

    const { isValid: isValidPhone, phoneNumber } = validateAndParsePhone(phone);
    if (!isValidPhone) throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number is not valid');

    const user = new User({ name, phone: phoneNumber, about });

    await user.save();
    res.json(user)
  } catch (e) {
    next(e)
  }
})

router.patch('/:id', passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
    const { name, phone, about } = req.body.user

    const { isValid: isValidPhone, phoneNumber } = validateAndParsePhone(phone);

    if (!isValidPhone) throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number is not valid');

    if (name) {
      user.name = name
    }
    if (about) {
      user.about = about;
    }
    if (phone) {
      user.phone = phoneNumber;
    }
    user.updated_at = new Date().toISOString();

    await user.save();
    res.json(user)
  } catch (e) {
    next(e)
  }
})

router.delete('/:id', passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    await user.delete();
    res.status(httpStatus.OK).send({ message: "User deleted successfully." });
  } catch (e) {
    next(e)
  }
})

export default router;
