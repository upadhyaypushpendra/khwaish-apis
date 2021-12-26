import { verifyAccessToken, verifyRefreshToken } from "./../utils/jwt";

export enum AuthenticationType {
  JWT = 'jwt-access',
  JWT_REFRESH= 'jwt-refresh'
}

export const authenticateAccessToken = (request: any, response: any, next: any) => {
  const token = request.headers["khwaish-access-token"];

  if (!token) {
    response.status(401).json(new Error("Token not provided"));
    return;
  }

  verifyAccessToken(token).then(userId => {
    request.headers.userId = userId;
    next();
  }).catch(err => {
    response.status(403).json(err);
  })
}

export const authenticateRefreshToken = (request: any, response: any, next: any) => {
  const token = request.headers["khwaish-refresh-token"];

  if (!token) {
    response.status(401).json(new Error("Token not provided"));
    return;
  }

  verifyRefreshToken(token).then(userId => {
    request.headers.userId = userId;
    next();
  }).catch(err => {
    response.status(403).json(err);
  })
}

const authenticate = {
  [AuthenticationType.JWT]: authenticateAccessToken,
  [AuthenticationType.JWT_REFRESH]: authenticateRefreshToken
};

export default authenticate;