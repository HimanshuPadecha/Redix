import type { Socket } from "node:net";
import { writeToTerminal } from "../utils";
import { memory } from "../memory";

export const exists = (socket: Socket, args: string[]) => {
  if (!args || args.length > 1) {
    writeToTerminal(socket, "Provide proper key !");
    return;
  }

  const [key] = args;

  if (!key || key === undefined) {
    writeToTerminal(socket, "Cannot get key !");
    return;
  }

  if (!memory.has(key)) {
    writeToTerminal(socket, "Does not exists !");
    return;
  }

  writeToTerminal(socket, "Exists !");
};
