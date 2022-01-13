import { User } from '@/models/user.model'
import ApiError from '@/utils/ApiError'
import { validateAndParsePhone } from '@/utils/phone'
import express from 'express'
import httpStatus from 'http-status'
import passport from 'passport'

const router = express.Router()

router.get('/', passport.authenticate(['jwt', 'anonymous'], { session: false }), async (req, res, next) => {
  let filters;
  if (req?.query?.input) {
    const input = req.query.input;
    filters = {
      "$or": [
        {
          phone: { "$regex": input, "$options": "i" }
        },
        {
          name: { "$regex": input, "$options": "i" }
        }
      ]
    };
  }

  if (Boolean(filters)) {
    const users = await User.find(filters, { name: 1, phone: 1, about: 1 });
    res.json({ users });
  } else {
    const users = await User.find({}, { name: 1, phone: 1, about: 1 });
    res.json({
      error: false,
      message: "User fetched successfully.",
      users
    });
  }
});

router.get('/:id', passport.authenticate(['jwt', 'anonymous'], { session: false }), async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).populate('friends', { name: 1, phone: 1, about: 1 });
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    res.json(user);
  } catch (e) {
    next(e);
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
});

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
});

router.delete('/:id', passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    await user.delete();
    res.status(httpStatus.OK).send({ message: "User deleted successfully." });
  } catch (e) {
    next(e)
  }
});

router.delete("/:id/friends/:friendId", passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  try {

    const id = req.params.id;
    const friendId = req.params.id;

    const { friends } = await User
      .findById(id)
      .populate({
        path: 'friends',
        select: { name: 1 },
        match: { _id: friendId },
        options: { limit: 1 },
      });

    const friend = friends[0];

    if (!Boolean(friend)) throw new ApiError(httpStatus.BAD_REQUEST, `Sorry but you don't have such a friend.`);

    // Remove the friend from friends list for both.
    Promise.all([
      User.findByIdAndUpdate(id, { $pull: { friends: friendId } }),
      User.findByIdAndUpdate(friendId, { $pull: { friends: id } }),
    ]);

    res.status(httpStatus.OK).send({ message: `You are no longer friend with ${friend.name}.` });
  } catch (e) {
    next(e)
  }
});

export default router;
