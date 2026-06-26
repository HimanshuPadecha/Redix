import type { Socket } from "node:net";
import { memory } from "../memory";
import { indiciesValidator } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const zrange = (socket: Socket, args: string[]) => {
  if (!args || args.length !== 3) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, start, end] = args;

  if (!key || !start || !end || Number.isNaN(start) || Number.isNaN(end)) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const current = memory.get(key);

  if (!current) {
    socket.write("*0\r\n");
    return;
  }

  if (current.value.type !== "zset") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  const range = indiciesValidator(
    parseInt(start),
    parseInt(end),
    current.value.value.length,
  );

  if (!range) {
    socket.write(`*0\r\n`);
    return;
  }

  const players = current.value.value
    .slice(range.start, range.end + 1)
    .map((player) => player.name);

  socket.write(encoder.zrange(players));
};
