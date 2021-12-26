import fs from "fs";
import * as config from "@/config/config";
import jwt, { Algorithm } from "jsonwebtoken";
import path from "path";

const privateKey = fs.readFileSync(path.join(__dirname + config.private_key_file))
export const publicKey = fs.readFileSync(path.join(__dirname + config.public_key_file))
export const jwtSigningAlogrithm: Algorithm = 'RS256';

const privateSecret = {
  key: privateKey,
  passphrase: config.private_key_passphrase
}

export const accessSignOptions = {
  algorithm: jwtSigningAlogrithm,
  expiresIn: config.access_token_expiry_after
}

export const refreshSignOptions = {
  algorithm: jwtSigningAlogrithm,
  expiresIn: config.refresh_token_expiry_after
}

export const verifyOptions = {
  algorithms: [jwtSigningAlogrithm]
}

/**
 * Creates a AccessToken with userId
 * @param userId string
 * @returns AccessToken
 */
export function createAccessToken(userId: string): Promise<AccessToken> {
  return new Promise((resolve, reject) => {
    jwt.sign({ userId }, privateSecret, accessSignOptions, (err, encoded) => {
      if (err === null && encoded !== undefined) {
        const expireAfter = config.access_token_expiry_after /* two weeks */
        const expireAt = new Date()
        expireAt.setSeconds(expireAt.getSeconds() + expireAfter)
        resolve({ accessToken: encoded, accessExpireAt: expireAt })
      } else {
        reject(err)
      }
    })
  })
}

/**
 * Creates a AccessToken with visitorId
 * @param visitorId string
 * @returns AccessToken
 */
export function createTemporaryTokenWithVisitorId(visitorId: string): Promise<AccessToken> {
  return new Promise((resolve, reject) => {
    jwt.sign({ visitorId }, privateSecret, accessSignOptions, (err, encoded) => {
      if (err === null && encoded !== undefined) {
        const expireAfter = 600 /*10min*/;
        const expireAt = new Date();
        expireAt.setSeconds(expireAt.getSeconds() + expireAfter);
        resolve({ accessToken: encoded, accessExpireAt: expireAt })
      } else {
        reject(err)
      }
    })
  })
}

/**
 * Creates a RefreshToken with userId
 * @param userId string
 * @returns RefreshToken
 */
export function createRefreshToken(userId: string): Promise<RefreshToken> {
  return new Promise((resolve, reject) => {
    jwt.sign({ userId }, privateSecret, refreshSignOptions, (err, encoded) => {
      if (err === null && encoded !== undefined) {
        const expireAfter = config.refresh_token_expiry_after /* two weeks */
        const expireAt = new Date()
        expireAt.setSeconds(expireAt.getSeconds() + expireAfter)
        resolve({ refreshToken: encoded, refreshExpireAt: expireAt })
      } else {
        reject(err)
      }
    })
  })
}

/**
 * Creates a AccessToken and RefreshToken with userId
 * @param userId string
 * @returns access and refresh tokens
 */
export async function createTokens(userId: string): Promise<Partial<AccessToken | RefreshToken>> {
  try {
    const accessToken = await createAccessToken(userId)
    const refreshToken = await createRefreshToken(userId)
    return {
      accessToken: accessToken.accessToken,
      accessExpireAt: accessToken.accessExpireAt,
      refreshToken: refreshToken.refreshToken,
      refreshExpireAt: refreshToken.refreshExpireAt
    }
  } catch (error) {
    throw new Error("Can't generate token")
  }
}

/**
 * Creates a Temporary AccessToken with userId
 * @param userId string
 * @returns AccessToken
 */
export async function createTemporaryTokens(userId: string): Promise<AccessToken> {
  return new Promise((resolve, reject) => {
    jwt.sign({ userId }, privateSecret, accessSignOptions, (err, encoded) => {
      if (err === null && encoded !== undefined) {
        const expireAfter = 600 /* 10 min */
        const expireAt = new Date()
        expireAt.setSeconds(expireAt.getSeconds() + expireAfter)
        resolve({ accessToken: encoded, accessExpireAt: expireAt })
      } else {
        reject(err)
      }
    })
  })
}

/**
 * Decode jwt token to return user id
 * @param accessToken
 * @returns Returns decoded user id from the token
 */
export async function verifyAccessToken(accessToken: string): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, publicKey, verifyOptions, async (err, decoded: DecodedToken) => {
      if (err === null && decoded !== undefined) {
        const userId = decoded.userId;

        resolve(userId)
      } else {
        reject(err)
      }
    })
  })
}

/**
 * Decode jwt token to return user id
 * @param tempToken
 * @returns Returns decode visitor id from the temp access token
 */
export async function verifyTemporaryTokenWithVisitorId(tempToken: string): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.verify(tempToken, publicKey, verifyOptions, async (err, decoded: DecodedToken) => {
      if (err === null && decoded !== undefined) {
        resolve(decoded.visitorId)
      } else {
        reject(err)
      }
    })
  })
}

/**
 * Decode jwt token to return user id
 * @param refreshToken
 * @returns Returns decoded user id from refresh token
 */
export async function verifyRefreshToken(refreshToken: string): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, publicKey, verifyOptions, async (err, decoded: DecodedToken) => {
      if (err === null && decoded !== undefined) {
        const userId = decoded.userId;

        resolve(userId);
      } else {
        reject(err);
      }
    })
  })
}
