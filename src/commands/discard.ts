import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const discard = (socket: RedisSocket) => {
  if (!socket.inTransaction) {
    return "-ERR DISCARD without MULTI\r\n";
  }

  socket.inTransaction = false;
  socket.commandQueue = [];

  return encoder.set();
};
