import type { Socket } from "node:net";
import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const hgetall = (socket: Socket, args: string[]) => {
  if (!args || args.length !== 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const key = args.shift();

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const current = memory.get(key);

  if (!current) {
    socket.write("*0\r\n");
    return;
  }

  if (current.value.type === "string" || current.value.type === "list") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  let transformed: string[] = [];

  for (const [key, value] of Object.entries(current.value.value)) {
    transformed = [...transformed, key, value];
  }

  socket.write(encoder.hgetall(transformed));
};
