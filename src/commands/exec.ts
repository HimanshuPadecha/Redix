import type { Command, RedisSocket } from "../types";
import { commandDispatcher } from "./dispatcher";

export const exec = (socket: RedisSocket) => {
  if (!socket.inTransaction) {
    socket.write("-ERR EXEC without MULTI\r\n");
    return;
  }

  for (const fullCommand of socket.commandQueue) {
    const [command, ...args] = fullCommand.split(" ");
    commandDispatcher(socket, command as Command, args);
  }
};
