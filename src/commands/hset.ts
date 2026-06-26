import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const hset = (socket: RedisSocket, args: string[]) => {
  if (!args || args.length !== 3) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, hkey, hvalue] = args;

  if (!key || !hkey || !hvalue) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!memory.has(key)) {
    memory.set(key, { value: { type: "hash", value: {} } });
  }

  const currnet = memory.get(key);

  if (currnet!.value.type !== "hash") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  console.log(currnet);

  if (Object.hasOwn(currnet!.value.value, hkey)) {
    socket.write(encoder.hset(0));
  } else {
    socket.write(encoder.hset(1));
  }

  currnet!.value.value[hkey] = hvalue;

  console.log(currnet);
  
  writeCommandInAOF(`hset ${key} ${hkey} ${hvalue}`);
};
