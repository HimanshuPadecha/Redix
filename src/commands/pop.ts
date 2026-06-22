import type { Socket } from "node:net";
import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const pop = (socket: Socket, args: string[], at: "left" | "right") => {
  if (!args || args.length !== 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key] = args;

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const current = memory.get(key);

  if (!current) {
    socket.write(":-1\r\n");
    return;
  }

  if (current.value.type === "string") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  if (current.value.value.length === 0) {
    socket.write(":-1\r\n");
    return;
  }

  let popped;

  if (at === "left") {
    writeCommandInAOF(`lpop ${key}`);
    popped = current.value.value.shift();
  } else if (at === "right") {
    writeCommandInAOF(`rpop ${key}`);
    popped = current.value.value.pop();
  }

  socket.write(encoder.pop(popped!));
};
