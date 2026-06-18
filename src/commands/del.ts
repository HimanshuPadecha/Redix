import type { Socket } from "node:net";
import { memory } from "../memory";
import { writeToTerminal } from "../utils";

export const del = (socket: Socket, args: string[]) => {
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
    writeToTerminal(socket, "Does not exist !");
    return;
  }

  memory.delete(key);
  writeToTerminal(socket,"Deleted !!")
};
