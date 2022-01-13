import { Request } from '@/models/request.model'
import { User } from '@/models/user.model'
import ApiError from '@/utils/ApiError'
import express from 'express'
import httpStatus from 'http-status'
import passport from 'passport'

const router = express.Router()

router.get('/:id/sent', passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  if (Boolean(req.params.id)) {
    const requests = await Request
      .find({ sender: req.params.id })
      .populate('receiver', { 'name': 1, 'phone': 1, 'about': 1 });
    res.json({
      error: false,
      message: "Requests fetched successfully.",
      requests
    });
  } else {
    res.json([]);
  }
});

router.get('/:id/received', passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  if (Boolean(req.params.id)) {
    const requests = await Request
      .find({ receiver: req.params.id })
      .populate('receiver', { 'name': 1, 'phone': 1, 'about': 1 });
    res.json({
      error: false,
      message: "Requests fetched successfully.",
      requests
    });
  } else {
    res.json([]);
  }
});

router.post('/', passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) throw new ApiError(httpStatus.BAD_REQUEST, 'senderId and receiverId requried.');

    const requestExists = await Request
      .findOne({ sender: senderId, receiver: receiverId })
      .populate('receiver', { name: 1, phone: 1, about: 1 });


    if (Boolean(requestExists)) {
      return res.status(httpStatus.OK).json({
        error: false,
        message: `You already requested ${requestExists?.receiver?.name}`,
        requestExists,
      });
    }

    const { friends } = await User
      .findById(senderId)
      .populate({
        path: 'friends',
        select: { _id: 1, name: 1 },
        match: { '_id': receiverId },
        options: { limit: 1 },
      });

    const alreadyFriend = friends[0];

    if (Boolean(alreadyFriend)) {
      return res.status(httpStatus.OK).json({
        error: false,
        message: `You are already friend with ${alreadyFriend?.name}`,
      });
    }

    const request = new Request({ sender: senderId, receiver: receiverId });

    await request.save();
    res.status(httpStatus.OK).json({
      error: false,
      message: "Request sent successfully.",
      request
    })
  } catch (e) {
    next(e)
  }
})

router.post('/:id/decline', passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');

    await request.delete();

    res.status(httpStatus.OK).send({
      error: false,
      message: "Request declined successfully."
    });
  } catch (e) {
    next(e)
  }
});

router.post('/:id/accept', passport.authenticate(['jwt'], { session: false }), async (req, res, next) => {
  try {
    const request = await Request
      .findById(req.params.id)
      .populate('sender', { name: 1, phone: 1, about: 1 })
      .populate('receiver', { name: 1, phone: 1, about: 1 });

    if (!Boolean(request)) throw new ApiError(httpStatus.BAD_REQUEST, `No request found with id: ${req.params.id}`);

    const senderId = request.sender._id.toString();
    const receiverId = request.receiver._id.toString();

    const { friends } = await User
      .findById(senderId)
      .populate({
        path: 'friends',
        select: { name: 1 },
        match: { _id: receiverId },
        options: { limit: 1 },
      });

    const alreadyFriend = friends[0];

    if (Boolean(alreadyFriend)) {
      return res.status(httpStatus.OK).json({
        error: false,
        message: `You are already friend with ${alreadyFriend?.name}`,
      });
    }

    // Add into friends field for both sender and receiver
    Promise.all([
      User.findByIdAndUpdate(senderId, { $addToSet: { friends: receiverId } }),
      User.findByIdAndUpdate(receiverId, { $addToSet: { friends: senderId } }),
      Request.findByIdAndDelete(request._id),
    ]);

    res.status(httpStatus.OK).send({
      error: false,
      message: `You are now friend with ${request.receiver.name}.`,
      request,
    });
  } catch (e) {
    next(e)
  }
})

export default router;
