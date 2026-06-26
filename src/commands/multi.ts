import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const multi = (socket: RedisSocket) => {
  if (socket.inTransaction) {
    socket.write("-ERR MULTI calls can not be nested\r\n");
    return;
  }

  socket.inTransaction = true;

  socket.write(encoder.set());
};
