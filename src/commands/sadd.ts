import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const sadd = (socket: RedisSocket, args: string[]) => {
  if (!args || args.length < 2) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, ...values] = args;

  if (!key || !values) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!memory.has(key)) {
    memory.set(key, { value: { value: new Set(), type: "set" } });
  }

  const current = memory.get(key);

  if (current!.value.type !== "set") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  let valuesAdded = 0;

  for (const item of values) {
    if (!current!.value.value.has(item)) valuesAdded++;
    current!.value.value.add(item);
  }

  writeCommandInAOF(`sadd ${key} ${values.join(" ")}`);

  socket.write(encoder.sadd(valuesAdded));
};
