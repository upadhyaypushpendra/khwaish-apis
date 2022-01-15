import { connection, server as WebSocketServer } from "websocket";
import getCloseConnectionHanlder from "./closeConnectionHandler";
import getRequestHanlder from "./requestHandler";

export type ConnectionMap = Map<string, connection>;

const activeClients: ConnectionMap = new Map();
const tempClients: ConnectionMap = new Map();

const startWebSocketServer = async (httpServer: any) => {
  const webServer = new WebSocketServer({
    httpServer,
    autoAcceptConnections: false
  });

  webServer.on('request', getRequestHanlder(activeClients, tempClients));
  webServer.on('close', getCloseConnectionHanlder(activeClients));
};

export default startWebSocketServer;