import { subsCount, subscriptions } from "../pub-sub-memory";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const subscribe = (socket: RedisSocket, args: string[]) => {
  if (!args || args.length !== 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [channel] = args;

  if (!channel) {
    return "-ERR wrong number of arguments\r\n";
  }

  if (!subscriptions.has(channel)) {
    subscriptions.set(channel, new Set<RedisSocket>());
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

  return encoder.subscribe(channel, subsCount.get(socket)!);
};
