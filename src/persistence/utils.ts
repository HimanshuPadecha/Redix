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

      if (val!.value.type === "list") {
        return;
      }

      const current = parseInt(val!.value.value!);

      memory.set(key!, {
        value: { value: String(current + 1), type: "string" },
      });
    } else if (key === "lpush" || key === "rpush") {
      const memoryKey = args.shift();

      if (!memory.has(memoryKey!)) {
        memory.set(key!, { value: { value: [], type: "list" } });
      }

      const current = memory.get(memoryKey!);

      if (current!.value.type === "string") {
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

      if (!current || current.value.type === "string") {
        console.log("does not exits");
        return;
      }

      if (key === "lpop") {
        current.value.value.shift();
      } else if (key === "rpop") {
        current.value.value.pop();
      }
    }
  });

  console.log("Old data is persisted");
};
