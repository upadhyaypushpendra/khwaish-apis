import logger from "@/config/logger";
import { request } from "websocket";
import getMessageHanlder from "./messageHandler";
import { ConnectionMap } from ".";

function originIsAllowed(origin: string) {
  return process.env.ALLOWED_ORIGINS.split(",").includes(origin);
  // return true;
}

export default function getRequestHanlder(activeClients: ConnectionMap, tempClients: ConnectionMap) {
  return async (request: request) => {
    logger.info('DEBUG::onRequestHandler -> New Request received');

    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      logger.info(' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    try {
      const tempId = Date.now().toString() + (Math.random() * 100000).toString();

      const connection = request.accept('echo-protocol', request.origin);

      tempClients.set(tempId, connection);

      connection.on('message', getMessageHanlder({ activeClients, connection, tempClients }));

      logger.info('DEBUG::onRequestHandler -> new client connected: %s , %s', connection.remoteAddress, tempId);

      connection.send(JSON.stringify({
        status: 'ok',
        event: 'connected',
        data: {
          tempId,
        }
      }))

    } catch (error) {
      logger.error(error);
      logger.info(' Connection from origin ' + request.origin + ' rejected.');
      request.reject();
    }
  };
};