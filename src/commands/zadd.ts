import type { Socket } from "node:net";
import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const zadd = (socket: Socket, args: string[]) => {
  if (!args || args.length !== 3) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, score, name] = args;

  if (!key || !score || !name || Number.isNaN(parseInt(score))) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!memory.has(key)) {
    memory.set(key, { value: { type: "zset", value: [] } });
  }

  const current = memory.get(key);

  if (current!.value.type !== "zset") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  const exsistingPlayer = current!.value.value.find(
    (player) => player.name === name,
  );

  if (exsistingPlayer) {
    exsistingPlayer.score = parseInt(score);
  } else {
    current!.value.value.push({ name, score: parseInt(score) });
  }

  current!.value.value.sort((a, b) => a.score - b.score);
  writeCommandInAOF(`zadd ${key} ${score} ${name}`);

  socket.write(encoder.zadd(exsistingPlayer ? 0 : 1));
};
