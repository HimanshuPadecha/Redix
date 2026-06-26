import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const ttl = (socket: RedisSocket, args: string[]) => {
  if (!args || args.length > 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key] = args;

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const current = memory.get(key);

  if (!current) {
    socket.write(":-2\r\n");
    return;
  }

  const { expiresAt } = current;

  if (!expiresAt) {
    socket.write(":-1\r\n");
    return;
  }

  // check if the key is expired or not ?
  if (Date.now() > expiresAt) {
    writeCommandInAOF(`del ${key}`);
    memory.delete(key);
    socket.write(":-2\r\n");
    return;
  }

  socket.write(encoder.ttl(Math.round((expiresAt - Date.now()) / 1000)));
};
