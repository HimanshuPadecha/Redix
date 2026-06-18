import { Socket } from "node:net";

export const writeNewline = (socket: Socket) => {
  socket.write("Server > ");
};

export const writeToTerminal = (socket: Socket, message: string) => {
  socket.write(message + "\n");
  writeNewline(socket);
};
