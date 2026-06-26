import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const hdel = (socket: RedisSocket, args: string[]) => {
  if (!args || args.length !== 2) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, hkey] = args;

  if (!key || !hkey) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const current = memory.get(key);

  if (!current) {
    socket.write(":0\r\n");
    return;
  }

  if (current.value.type !== "hash") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  if (!current.value.value[hkey]) {
    socket.write(":0\r\n");
    return;
  }

  delete current.value.value[hkey];
  writeCommandInAOF(`hdel ${key} ${hkey}`);

  if (Object.entries(current.value.value).length === 0) {
    memory.delete(key);
  }

  socket.write(encoder.hdel());
};
