import type { Socket } from "node:net";
import type { Command } from "../types";
import { set } from "./set";
import { get } from "./get";
import { del } from "./del";
import { exists } from "./exists";
import { encoder } from "../core/encoder";

export const commandDispatcher = (
  socket: Socket,
  command: Command,
  args: string[],
) => {
  switch (command) {
    case "ping": {
      socket.write(encoder.ping());
      break;
    }

    case "echo": {
      socket.write(encoder.echo(args));
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

    default: {
      socket.write(encoder.error())
    }
  }
};
