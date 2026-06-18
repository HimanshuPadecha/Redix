import type { Socket } from "node:net";
import type { Command } from "../types";
import { writeNewline, writeToTerminal } from "../utils";
import { set } from "./set";
import { get } from "./get";
import { del } from "./del";
import { exists } from "./exists";

export const commandDispatcher = (
  socket: Socket,
  command: Command,
  args: string[],
) => {


  switch (command) {
    case "ping": {
      writeToTerminal(socket, "pong");
      break;
    }

    case "echo": {
      socket.write(args.join(" ") + "\n");
      writeNewline(socket);
      break;
    }

    case "set": {
      set(socket, args);
      break;
    }

    case "get": {
      get(socket, args);
      break;
    }

    case "del": {
      del(socket, args);
      break;
    }

    case "exists": {
      exists(socket, args);
      break;
    }

    case "exit": {
      socket.destroy();
      break;
    }

    default: {
      writeToTerminal(socket, "Unknown command.");
    }
  }
};
