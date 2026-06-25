import type { Socket } from "node:net";
import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const lrange = (socket: Socket, args: string[]) => {
  if (!args || args.length !== 3) {
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

  if (current.value.type === "string" || current.value.type === "hash") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  const [start, end] = args;

  if (
    !start ||
    !end ||
    Number.isNaN(parseInt(start)) ||
    Number.isNaN(parseInt(end))
  ) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const sliced = current.value.value.slice(parseInt(start), parseInt(end));

  console.log(sliced);

  socket.write(encoder.lrange(sliced));
};
