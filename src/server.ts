import net from "node:net";
import type { Command } from "./types";
import { commandDispatcher } from "./commands/dispatcher";
import { populateOldDataInAOF } from "./persistence/utils";
import { parser } from "./parser";

populateOldDataInAOF();

const server = net.createServer((socket) => {
  console.log("client connected");

  socket.write("CONNECTED TO SERVER.\n");
  socket.write("Server > ");

  let pendingBuffer = Buffer.alloc(0);

  socket.on("data", (data: Buffer | string) => {
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    pendingBuffer = Buffer.concat([pendingBuffer, dataBuffer]);

    const parsed = parser(pendingBuffer);

    if (parsed === null) {
      console.log("Cannot parse the command yet");
      return;
    }

    const { charsprocessed, command: fullCommand } = parsed;

    pendingBuffer = pendingBuffer.subarray(charsprocessed, -1);

    const [command, ...args] = fullCommand.split(" ");

    commandDispatcher(socket, command as Command, args);
  });

  socket.on("end", () => {
    console.log("client disconnected");
  });
});

server.listen(6379, () => {
  console.log("server is running on port 6379");
});
