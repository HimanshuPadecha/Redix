import type { Socket } from "node:net";
import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const zscore = (socket: Socket, args: string[]) => {
  if (!args || args.length !== 2) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, name] = args;

  if (!key || !name) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const current = memory.get(key);

  if (!current) {
    socket.write("$-1\r\n");
    return;
  }

  if (current.value.type !== "zset") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  const currentPlayer = current.value.value.find(
    (player) => player.name === name,
  );

  if (!currentPlayer) {
    socket.write("$-1\r\n");
    return;
  }

  socket.write(encoder.zscore(currentPlayer.score));
};
