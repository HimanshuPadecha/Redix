import { subscriptions } from "../pub-sub-memory";

export const publish = (args: string[]) => {
  if (!args || args.length !== 2) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [channel, message] = args;

  if (!channel || !message) {
    return "-ERR wrong number of arguments\r\n";
  }

  const sockets = subscriptions.get(channel);

  if (!sockets) {
    return ":0\r\n";
  }

  for (const socket of sockets) {
    socket.write(
      `*3\r\n$7\r\nmessage\r\n$${channel.length}\r\n${channel}\r\n$${message.length}\r\n${message}\r\n`,
    );
  }

  return `:${sockets.size}\r\n`;
};
