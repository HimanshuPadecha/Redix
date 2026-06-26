import type { Socket } from "node:net";
import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const zrem = (socket: Socket, args: string[]) => {
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
    socket.write("0\r\n");
    return;
  }

  if (current.value.type !== "zset") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  const currnetPlayer = current.value.value.find(
    (player) => player.name === name,
  );

  if (!currnetPlayer) {
    socket.write(":0\r\n");
    return;
  }

  if (current.value.value.length === 1) {
    memory.delete(key);
  } else {
    memory.set(key, {
      value: {
        value: current.value.value.filter((player) => player.name !== name),
        type: "zset",
      },
    });
  }

  writeCommandInAOF(`zrem ${key} ${name}`);
  socket.write(encoder.zrem());
};
