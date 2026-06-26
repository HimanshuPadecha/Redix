import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const del = (socket: RedisSocket, args: string[]) => {
  if (!args || args.length > 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key] = args;

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const isDeleted = memory.delete(key);

  if (!isDeleted) {
    socket.write(":0\r\n");
    return;
  }

  writeCommandInAOF(`del ${key}`);

  socket.write(encoder.del());
};
