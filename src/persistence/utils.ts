import path from "path";
import fs from "fs";
import { memory } from "../memory";

const getFilePath = (): string => {
  return path.join(process.cwd(), "/src/persistence/data.aof");
};

export const writeCommandInAOF = (command: string) => {
  const filePath = getFilePath();
  fs.appendFileSync(filePath, command + "\n");
};

export const populateOldDataInAOF = () => {
  const filePath = getFilePath();

  const content = fs.readFileSync(filePath, "utf-8");

  const commands = content.split("\n");

  commands.forEach((command) => {
    const [key, ...args] = command.split(" ");

    if (key === "set" && args.length === 2) {
      memory.set(args[0]!, { value: { value: args[1]!, type: "string" } });
    } else if (key === "del") {
      memory.delete(args[0]!);
    } else if (key === "incr") {
      const key = args.shift();

      if (!memory.has(key!)) {
        memory.set(key!, { value: { value: "0", type: "string" } });
      }

      const val = memory.get(key!);

      if (val!.value.type !== "string") {
        return;
      }

      const current = parseInt(val!.value.value!);

      memory.set(key!, {
        value: { value: String(current + 1), type: "string" },
      });
    } else if (key === "lpush" || key === "rpush") {
      const memoryKey = args.shift();

      if (!memory.has(memoryKey!)) {
        memory.set(memoryKey!, { value: { value: [], type: "list" } });
      }

      const current = memory.get(memoryKey!);

      if (current!.value.type !== "list") {
        return;
      }

      const value = args.shift();

      if (key === "lpush") {
        current!.value.value.unshift(value!);
      } else if (key === "rpush") {
        current!.value.value.push(value!);
      }
    } else if (key === "lpop" || key === "rpop") {
      const memoryKey = args.shift();

      const current = memory.get(memoryKey!);

      if (!current || current.value.type !== "list") {
        console.log("does not exits");
        return;
      }

      if (key === "lpop") {
        current.value.value.shift();
      } else if (key === "rpop") {
        current.value.value.pop();
      }
    } else if (key === "hset") {
      const [memoryKey, hkey, hvalue] = args;

      if (!memoryKey || !hkey || !hvalue) {
        console.log("value not found");
        return;
      }

      if (!memory.has(memoryKey)) {
        memory.set(memoryKey, { value: { type: "hash", value: {} } });
      }

      const current = memory.get(memoryKey);

      if (current!.value.type !== "hash") {
        console.log("invalid type found");
        return;
      }

      current!.value.value[hkey] = hvalue!;
    } else if (key === "hdel") {
      const [memoryKey, hkey] = args;

      if (!memoryKey || !hkey) {
        console.log("value not found");
        return;
      }

      const current = memory.get(memoryKey);

      if (!current) {
        return;
      }

      if (current.value.type !== "hash") {
        return;
      }

      delete current.value.value[hkey];

      if (Object.entries(current.value.value).length === 0) {
        memory.delete(key);
      }
    } else if (key === "sadd") {
      const [memoryKey, ...values] = args;

      if (!memoryKey || !values) {
        return;
      }

      if (!memory.has(memoryKey)) {
        memory.set(memoryKey, { value: { value: new Set(), type: "set" } });
      }

      const currnet = memory.get(key);

      if (currnet!.value.type !== "set") {
        return;
      }

      for (const val of values) {
        currnet?.value.value.add(val);
      }
    } else if (key === "srem") {
      const [memoryKey, value] = args;

      if (!memoryKey || !value) {
        return;
      }

      const currnet = memory.get(memoryKey);

      if (!currnet || currnet.value.type !== "set") {
        return;
      }

      currnet.value.value.delete(value);

      if (currnet.value.value.size === 0) {
        memory.delete(memoryKey);
      }
    } else if (key === "zadd") {
      const [memoryKey, score, name] = args;

      if (!memoryKey || !score || !name) {
        console.log("not found in zadd");
        return;
      }

      if (!memory.has(memoryKey)) {
        memory.set(memoryKey, { value: { value: [], type: "zset" } });
      }

      const current = memory.get(memoryKey);

      if (current!.value.type !== "zset") {
        console.log("invalid type");
        return;
      }

      const alreadyPresent = current!.value.value.find(
        (player) => player.name === name,
      );

      if (alreadyPresent) {
        alreadyPresent.score = parseInt(score);
      } else {
        current!.value.value.push({ name, score: parseInt(score) });
      }
    } else if (key === "zrem") {
      const [memoryKey, name] = args;

      if (!memoryKey || !name) {
        console.log("val not found in zrem");
        return;
      }

      const current = memory.get(memoryKey);

      if (!current || current.value.type !== "zset") {
        return;
      }

      memory.set(memoryKey, {
        value: {
          value: current.value.value.filter((player) => player.name !== name),
          type: "zset",
        },
      });
    }
  });

  console.log("Old data is persisted");
};
