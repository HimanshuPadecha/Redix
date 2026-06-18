import net from "node:net";
import type { Command } from "./types";
import { commandDispatcher } from "./commands/dispatcher";
import { populateOldDataInAOF } from "./persistence/utils";

populateOldDataInAOF();

const server = net.createServer((socket) => {
  console.log("client connected");

  socket.write("CONNECTED TO SERVER.\n");
  socket.write("Server > ");

  let pendingBuffer = Buffer.alloc(0);

  socket.on("data", (data: Buffer | string) => {

    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    pendingBuffer = Buffer.concat([pendingBuffer, dataBuffer]);

    console.log(pendingBuffer.toString());
    console.log(pendingBuffer.toString().length);

    

    // const input = dataBuffer.toString().trim();
    // const [command, ...args] = input.split(" ");

    // commandDispatcher(socket, command as Command, args);
  });

  socket.on("end", () => {
    console.log("client disconnected");
  });
});

server.listen(6379, () => {
  console.log("server is running on port 6379");
});
