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
      memory.set(args[0]!, args[1]!);
    } else if (key === "del") {
      memory.delete(args[0]!);
    } else if (key === "incr") {
      const key = args.shift();

      if (!memory.has(key!)) {
        memory.set(key!, "0");
      }

      const current = parseInt(memory.get(key!)!);

      memory.set(key!, String(current + 1));
    }
  });

  console.log("Old data is persisted");
};
