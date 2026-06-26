import type { Socket } from "node:net";
import { subsCount, subscriptions } from "../pub-sub-memory";
import { encoder } from "../core/encoder";

export const subscribe = (socket: Socket, args: string[]) => {
  if (!args || args.length !== 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [channel] = args;

  if (!channel) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!subscriptions.has(channel)) {
    subscriptions.set(channel, new Set<Socket>());
  }

  const current = subscriptions.get(channel);

  const alreadySubscribed = current!.has(socket);

  current!.add(socket);

  const currentSubs = subsCount.get(socket);

  if (!currentSubs) {
    subsCount.set(socket, 1);
  } else {
    subsCount.set(socket, alreadySubscribed ? currentSubs : currentSubs + 1);
  }

  socket.write(encoder.subscribe(channel, subsCount.get(socket)!));
};
