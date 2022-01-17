import logger from "@/config/logger";
import { verifyAccessToken } from "@/utils/jwt";
import { connection } from "websocket";

export default function getCloseConnectionHanlder(activeClients: Map<string, connection>) {
  return async (connection: connection, reason: number, desc: string) => {
    logger.info('DEBUG::onCloseConnectionHandler -> ');
    try {

      let userId;
      for (const [clientId, clientConnection] of activeClients) {
        if (clientConnection === connection) {
          userId = clientId;
          break;
        }
      }

      if (!Boolean(userId)) {
        logger.info('DEBUG::onCloseConnectionHandler: No user found');
        return;
      }

      if (!activeClients.has(userId)) {
        logger.info('DEBUG::onCloseConnectionHandler: No active client found');
        return;
      }

      activeClients.delete(userId);

      for (const [clientId, clientConnection] of activeClients) {
        clientConnection.send(JSON.stringify({
          status: 'ok',
          event: 'active_status',
          data: {
            userId: userId,
            active: false,
          }
        }));
        clientConnection.send(JSON.stringify({
          status: 'ok',
          event: 'typing',
          data: {
            from: userId,
            to: clientId,
            isTyping: false,
          }
        }));
      };

      logger.info('DEBUG::Connection close by the client: %s with reason: %d', userId, reason);
    } catch (error) {
      logger.error('Error in closing the connection: ', error);
    }
  }
};