import type { Socket } from "node:net";
import { memory } from "../memory";
import { encoder } from "../core/encoder";
import { writeCommandInAOF } from "../persistence/utils";

export const get = (socket: Socket, args: string[]) => {
  if (!args || args.length > 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key] = args;

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const value = memory.get(key);

  if (!value) {
    socket.write(":-1\r\n");
    return;
  }

  const { value: actualVal, expiresAt } = value;

  if (expiresAt && expiresAt < Date.now()) {
    writeCommandInAOF(`del ${key}`);
    memory.delete(key);
    socket.write(":-2\r\n");
    return;
  }

  if (actualVal.type === "list" || actualVal.type === "hash") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  const encoded = encoder.get(actualVal.value);

  socket.write(encoded);
};
