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

enum WebSocketMessageEvent {
  verify = 'verify',
  send_message = 'send_message',
  message_received = 'message_received',
  verified = 'verified',
  connected = 'connected',
  active_status = 'active_status',
  typing = 'typing',
}

type WebSocketMessageData = {
  status: 'ok' | 'error',
  event: WebSocketMessageEvent,
  data: Record<string, any>,
}