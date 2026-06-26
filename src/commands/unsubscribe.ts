import { subsCount, subscriptions } from "../pub-sub-memory";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const unsubscribe = (socket: RedisSocket, args: string[]) => {
  if (!args || args.length !== 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [channel] = args;

  if (!channel) {
    return "-ERR wrong number of arguments\r\n";
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

  return encoder.unsubscribe(
    channel,
    !!subsCount.get(socket) ? subsCount.get(socket)! : 0,
  );
};
