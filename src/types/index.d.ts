type Hash = {
  salt: string;
  hashedValue: string;
};

type AccessToken = {
  accessToken: string,
  accessExpireAt: Date
}

type RefreshToken = {
  refreshToken: string,
  refreshExpireAt: Date
}

type DecodedToken = {
  userId?: string,
  visitorId?: string,
};
