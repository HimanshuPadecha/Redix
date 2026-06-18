import type { Socket } from "node:net";
import { writeToTerminal } from "../utils";
import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";

export const set = (socket: Socket, args: string[]) => {
  if (!args) {
    writeToTerminal(socket, "Provide key and values..");
    return;
  }

  if (args.length !== 2) {
    writeToTerminal(socket, "Make sure you provide key and value properly.");
    return;
  }

  const [key, value] = args;

  if (!key) {
    writeToTerminal(socket, "Unable to get key.");
    return;
  }

  if (!value) {
    writeToTerminal(socket, "Unable to get value.");
    return;
  }

  memory.set(key, value);
  writeCommandInAOF(`set ${key} ${value}`);
  writeToTerminal(socket, "Key added !");
};
