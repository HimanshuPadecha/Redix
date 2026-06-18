import net from "node:net";
import type { Command } from "./types";
import { writeNewline, writeToTerminal } from "./utils";
import { set } from "./commands/set";
import { memory } from "./memory";
import { get } from "./commands/get";
import { del } from "./commands/del";
import { exists } from "./commands/exists";
import { commandDispatcher } from "./commands/dispatcher";

const server = net.createServer((socket) => {
  console.log("client connected");

  socket.write("CONNECTED TO SERVER.\n");
  socket.write("Server > ");

  socket.on("data", (data) => {
    const input = data.toString().trim();

    const [command, ...args] = input.split(" ");

    commandDispatcher(socket, command as Command, args);
  });

  socket.on("end", () => {
    console.log("client disconnected");
  });
});

server.listen(6379, () => {
  console.log("server is running on port 6379");
});
