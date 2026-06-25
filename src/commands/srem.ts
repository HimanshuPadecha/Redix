import type { Socket } from "node:net";
import { memory } from "../memory";
import { encoder } from "../core/encoder";
import { writeCommandInAOF } from "../persistence/utils";

export const srem = (socket: Socket, args: string[]) => {
  if (!args || args.length !== 2) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, value] = args;

  if (!key || !value) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const currnet = memory.get(key);

  if (!currnet) {
    socket.write(":0\r\n");
    return;
  }

  if (currnet.value.type !== "set") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  const isRemoved = currnet.value.value.delete(value);

  if (!isRemoved) {
    socket.write(":0\r\n");
    return;
  }

  if (currnet.value.value.size === 0) {
    memory.delete(key);
  }

  writeCommandInAOF(`srem ${key} ${value}`);
  socket.write(encoder.srem());
};
