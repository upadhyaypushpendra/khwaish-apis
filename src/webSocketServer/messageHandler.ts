import logger from "@/config/logger";
import { verifyAccessToken } from "@/utils/jwt";
import { connection, Message } from "websocket";
import { ConnectionMap } from ".";

type MessageActionHandlerArgs = {
  activeClients?: ConnectionMap;
  tempClients?: ConnectionMap;
  data?: Record<string, any>;
  connection?: connection;
};

const messageActions = {
  "send_message": async ({ activeClients, data }: MessageActionHandlerArgs) => {
    logger.debug('DEBUG::onMessageHanlder -> send_message');

    if (activeClients.has(data.to)) {
      activeClients.get(data.to).sendUTF(JSON.stringify({
        status: 'ok',
        event: "message_received",
        data
      }))
    }
  },
  "verify": async ({ activeClients, tempClients, data, connection }: MessageActionHandlerArgs) => {
    logger.debug('DEBUG::onMessageHanlder -> verify', data);

    const tempId = data.tempId;
    const accessToken = data.token;
    logger.debug('DEBUG::onMessageHanlder -> verify', tempId, accessToken);
    try {
      // Close the connection if tempId not available, token not available or tempClient not available.
      if (!(Boolean(tempId) && Boolean(accessToken) && tempClients.has(tempId))) {
        logger.info('onMessageHanlder -> verify: Invalid data: %o, closing connection', data);
        connection.close();
        return;
      }

      const userId = await verifyAccessToken(accessToken);

      activeClients.set(userId, tempClients.get(tempId));

      connection.send(JSON.stringify({
        status: 'ok',
        event: "verified",
      }));

      for (const [clientId, clientConnection] of activeClients) {
        clientConnection.send(JSON.stringify({
          status: 'ok',
          event: 'active_status',
          data: {
            userId: userId,
            active: activeClients.has(userId),
          }
        }));
        connection.send(JSON.stringify({
          status: 'ok',
          event: 'active_status',
          data: {
            userId: clientId,
            active: activeClients.has(clientId),
          }
        }));
      };

    } catch (error) {
      logger.error(error);
      logger.info('onMessageHanlder -> verify: Invalid token, closing connection, for user: %s', tempId);
    }
  },

  "active_status": async ({ activeClients, data, connection }: MessageActionHandlerArgs) => {
    logger.debug('DEBUG::onMessageHanlder -> active_status');

    const { toUser, forUser } = data;

    if (!activeClients.has(toUser)) {
      logger.warn('DEBUG::onMessageHanlder -> active_status: Inactive client asking for status.');
      return;
    };

    connection.send(JSON.stringify({
      status: 'ok',
      event: 'active_status',
      data: {
        userId: forUser,
        active: activeClients.has(forUser),
      }
    }));
  },

  "typing": async ({ activeClients, data, connection }: MessageActionHandlerArgs) => {
    logger.debug('DEBUG::onMessageHanlder -> active_status');

    const { from, to, isTyping } = data;

    if (!activeClients.has(from)) {
      logger.warn('DEBUG::onMessageHanlder -> active_status: Inactive client sending event.');
      return;
    };

    if (!activeClients.has(to)) {
      logger.warn('DEBUG::onMessageHanlder -> active_status: Client is not longer active: %s', to);
      return;
    };

    activeClients.get(to).send(JSON.stringify({
      status: 'ok',
      event: 'typing',
      data,
    }));
  }
};

export type GetMessageHandlerArgs = {
  activeClients: ConnectionMap;
  tempClients: ConnectionMap;
  connection: connection;
};

export default function getMessageHanlder({ activeClients, connection, tempClients }: GetMessageHandlerArgs) {
  const messageHandler = async (message: Message) => {
    logger.debug('DEBUG::onMessageHanlder -> New message received: %o', message);
    if (message.type === 'utf8') {
      const webSocketMessage = JSON.parse(message.utf8Data) as WebSocketMessageData;

      //@ts-ignore
      const messageAction = messageActions[webSocketMessage.event];

      if (messageAction)
        await messageAction({ activeClients, tempClients, connection, data: webSocketMessage.data });
      else {
        logger.warn('onMessageHanlder -> MESSAGE_ACTION_NOT_IMPLEMENTED: ', webSocketMessage.event);
      }
    } else {
      logger.warn('onMessageHanlder -> Invalid message type: ', message.type);
    }
  };
  return messageHandler;
};