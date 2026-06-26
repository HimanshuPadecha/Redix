import { subscriptions } from "../pub-sub-memory";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const publish = (socket: RedisSocket, args: string[]) => {
  if (!args || args.length !== 2) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [channel, message] = args;

  if (!channel || !message) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const sockets = subscriptions.get(channel);

  if (!sockets) {
    socket.write(":0\r\n");
    return;
  }

  for (const socket of sockets) {
    socket.write(
      `*3\r\n$7\r\nmessage\r\n$${channel.length}\r\n${channel}\r\n$${message.length}\r\n${message}\r\n`,
    );
  }

  socket.write(`:${sockets.size}\r\n`);
};
