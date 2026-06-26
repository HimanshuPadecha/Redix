import type { Command, RedisSocket } from "../types";
import { commandDispatcher } from "../dispatcher";
import { encoder } from "../core/encoder";

export const exec = (socket: RedisSocket) => {
  if (!socket.inTransaction) {
    return "-ERR EXEC without MULTI\r\n";
  }

  let responses: string[] = [];

  socket.inTransaction = false;

  for (const fullCommand of socket.commandQueue) {
    console.log(fullCommand);
    const [command, ...args] = fullCommand.split(" ");
    responses.push(commandDispatcher(socket, command as Command, args));
  }

  socket.inTransaction = false;
  return encoder.exec(responses);
};
