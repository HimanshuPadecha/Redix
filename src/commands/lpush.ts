import type { Socket } from "node:net";
import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const push = (socket: Socket, args: string[], at: "left" | "right") => {
  if (!args || args.length !== 2) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const key = args.shift();

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!memory.has(key)) {
    memory.set(key, { value: { value: [], type: "list" } });
  }

  const current = memory.get(key);

  const value = args.shift();

  if (!value) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (current!.value.type === "string" || current!.value.type === "hash") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  if (at === "left") {

    current!.value.value.unshift(value);
    writeCommandInAOF(`lpush ${key} ${value}`);

  } else if (at === "right") {
    
    current!.value.value.push(value);
    writeCommandInAOF(`rpush ${key} ${value}`);

  }

  socket.write(encoder.lpush(current!.value.value.length));
};
