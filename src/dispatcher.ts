import type { Command, RedisSocket } from "./types";
import {
  del,
  encoder,
  exists,
  expire,
  get,
  hdel,
  hexists,
  hget,
  hgetall,
  hset,
  incr,
  keys,
  llen,
  lrange,
  pop,
  publish,
  push,
  sadd,
  scard,
  set,
  sismember,
  smembers,
  srem,
  subscribe,
  ttl,
  unsubscribe,
  zadd,
  zcard,
  zrange,
  zrem,
  zscore,
  multi,
  exec,
} from "./commands";

export const commandDispatcher = (
  socket: RedisSocket,
  command: Command,
  args: string[],
) => {
  if (socket.inTransaction && command !== "exec") {
    socket.commandQueue.push(`${command} ${args.join(" ")}`);
    socket.write("+QUEUED\r\n");
    return;
  }

  switch (command) {
    case "ping": {
      socket.write(encoder.ping());
      break;
    }

    case "echo": {
      if (args.length !== 1) {
        socket.write("-ERR wrong number of arguments\r\n");
        return;
      }

      socket.write(encoder.echo(args.shift()!));
      break;
    }

    case "set": {
      set(socket, args);
      break;
    }

    case "get": {
      get(socket, args);
      break;
    }

    case "del": {
      del(socket, args);
      break;
    }

    case "exists": {
      exists(socket, args);
      break;
    }

    case "incr": {
      incr(socket, args);
      break;
    }

    case "keys": {
      keys(socket, args);
      break;
    }

    case "expire": {
      expire(socket, args);
      break;
    }

    case "ttl": {
      ttl(socket, args);
      break;
    }

    case "lpush": {
      push(socket, args, "left");
      break;
    }

    case "rpush": {
      push(socket, args, "right");
      break;
    }

    case "llen": {
      llen(socket, args);
      break;
    }

    case "lpop": {
      pop(socket, args, "left");
      break;
    }

    case "rpop": {
      pop(socket, args, "right");
      break;
    }

    case "lrange": {
      lrange(socket, args);
      break;
    }

    case "hset": {
      hset(socket, args);
      break;
    }

    case "hget": {
      hget(socket, args);
      break;
    }

    case "hexists": {
      hexists(socket, args);
      break;
    }

    case "hdel": {
      hdel(socket, args);
      break;
    }

    case "hgetall": {
      hgetall(socket, args);
      break;
    }

    case "sadd": {
      sadd(socket, args);
      break;
    }

    case "srem": {
      srem(socket, args);
      break;
    }

    case "sismember": {
      sismember(socket, args);
      break;
    }

    case "smembers": {
      smembers(socket, args);
      break;
    }

    case "scard": {
      scard(socket, args);
      break;
    }

    case "subscribe": {
      subscribe(socket, args);
      break;
    }

    case "publish": {
      publish(socket, args);
      break;
    }

    case "unsubscribe": {
      unsubscribe(socket, args);
      break;
    }

    case "zadd": {
      zadd(socket, args);
      break;
    }

    case "zscore": {
      zscore(socket, args);
      break;
    }

    case "zcard": {
      zcard(socket, args);
      break;
    }

    case "zrem": {
      zrem(socket, args);
      break;
    }

    case "zrange": {
      zrange(socket, args);
      break;
    }

    case "multi": {
      multi(socket);
      break;
    }

    case "exec": {
      exec(socket);
      break;
    }

    default: {
      socket.write(encoder.error());
    }
  }
};
