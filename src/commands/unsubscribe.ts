import type { Socket } from "node:net";
import { subsCount, subscriptions } from "../pub-sub-memory";
import { encoder } from "../core/encoder";

export const unsubscribe = (socket: Socket, args: string[]) => {
  if (!args || args.length !== 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [channel] = args;

  if (!channel) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const sockets = subscriptions.get(channel);

  let isDeleted;

  if (sockets) {
    isDeleted = sockets.delete(socket);

    if (sockets.size === 0) {
      subscriptions.delete(channel);
    }
  }

  if (subsCount.get(socket)) {
    subsCount.set(
      socket,
      isDeleted ? subsCount.get(socket)! - 1 : subsCount.get(socket)!,
    );

    if (subsCount.get(socket) === 0) {
      subsCount.delete(socket);
    }
  }

  socket.write(encoder.unsubscribe(channel, subsCount.get(socket)!));
};
