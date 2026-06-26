import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const multi = (socket: RedisSocket) => {
  if (socket.inTransaction) {
    return "-ERR MULTI calls can not be nested\r\n";
  }

  socket.inTransaction = true;

  return encoder.set();
};
