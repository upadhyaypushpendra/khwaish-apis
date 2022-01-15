import logger from "@/config/logger";
import { verifyAccessToken } from "@/utils/jwt";
import { connection } from "websocket";

export default function getCloseConnectionHanlder(activeClients: Map<string, connection>) {
  return async (connection: connection, reason: number, desc: string) => {
    try {
      const userId = await verifyAccessToken(desc);

      activeClients.delete(userId);

      logger.info('DEBUG::Connection close by the client: %s with reason: %d', userId, reason);
    } catch (error) {
      logger.error('Error in closing the connection: ', error);
    }
  }
};