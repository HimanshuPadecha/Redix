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

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!memory.has(key)) {
    memory.set(key, { value: { type: "string", value: "0" } });
  }

  const val = memory.get(key);

  if (val!.value.type === "list" || val!.value.type === "hash") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  const current = parseInt(val?.value.value!);

  if (Number.isNaN(current)) {
    socket.write("-ERR not an integer\r\n");
    return;
  }

  memory.set(key, { value: { value: String(current + 1), type: "string" } });
  writeCommandInAOF(`incr ${key}`);

  socket.write(encoder.incr(current + 1));
};
