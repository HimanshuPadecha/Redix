import { memory } from "../memory";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const smembers = (socket: RedisSocket, args: string[]) => {
  const [key] = args;

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const current = memory.get(key);

  if (!current) {
    socket.write("*0\r\n");
    return;
  }

  if (current.value.type !== "set") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  socket.write(encoder.smembers(Array.from(current.value.value)));
};
