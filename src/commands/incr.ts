import type { Socket } from "node:net";
import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const incr = (socket: Socket, args: string[]) => {
  if (!args || args.length > 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key] = args;

  if (!key || key === undefined) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!memory.has(key)) {
    memory.set(key, { value: "0" });
  }

  const current = parseInt(memory.get(key)!.value!);

  if (Number.isNaN(current)) {
    socket.write("-ERR not an integer\r\n");
    return;
  }

  memory.set(key, {value : String(current + 1)});
  writeCommandInAOF(`incr ${key}`);

  socket.write(encoder.incr(current + 1));
};
