import { User } from '@/models/user.model'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { Strategy as AnonymousStrategy } from 'passport-anonymous'
import { publicKey, verifyOptions } from "../utils/jwt";

interface JWTPayload {
  userId: string
  name: string
  email: string
  iat: number
  exp: number
}

interface JWTTempPayload {
  iat: number
  exp: number
}


export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromHeader('khwaish-access-token'),
    secretOrKey: publicKey,
    jsonWebTokenOptions: verifyOptions,
  },
  async (payload: JWTPayload, done) => {
    try {
      const user = await User.findById(payload.userId)
      if (!user) return done(null, false)
      done(null, user.toJSON())
    } catch (e) {
      return done(e)
    }
  },
);

export const jwtRefreshStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromHeader('khwaish-refresh-token'),
    secretOrKey: publicKey,
    jsonWebTokenOptions: verifyOptions,
  },
  async (payload: JWTPayload, done) => {
    try {
      const user = await User.findById(payload.userId)
      if (!user) return done(null, false)
      done(null, user.toJSON())
    } catch (e) {
      return done(e)
    }
  },
);


export const jwtTemporaryStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromHeader('khwaish-temporary-token'),
    secretOrKey: publicKey,
    jsonWebTokenOptions: verifyOptions,
  },
  async (payload: JWTTempPayload, done) => {
    try {
      done(null, {})
    } catch (e) {
      return done(e)
    }
  },
);



export const anonymousStrategy = new AnonymousStrategy()
