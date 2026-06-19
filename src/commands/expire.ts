import type { Socket } from "node:net";
import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const expire = (socket: Socket, args: string[]) => {
  if (!args) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (args.length !== 2) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, ttl] = args;

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!ttl) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (Number.isNaN(parseInt(ttl))) {
    socket.write("-ERR Invalid time to live\r\n");
    return;
  }

  const current = memory.get(key);

  if (!current) {
    socket.write(":0\r\n");
    return;
  }

  memory.set(key, {
    value: current.value,
    expiresAt: Date.now() + parseInt(ttl),
  });

  socket.write(encoder.expires());
};
