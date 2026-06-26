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
  discard,
} from "./commands";

export const commandDispatcher = (
  socket: RedisSocket,
  command: Command,
  args: string[],
): string => {
  if (socket.inTransaction && command !== "exec" && command !== "discard") {
    socket.commandQueue.push(`${command} ${args.join(" ")}`);
    return "+QUEUED\r\n";
  }

  switch (command) {
    case "ping": {
      return encoder.ping();
    }

    case "echo": {
      if (args.length !== 1) {
        return "-ERR wrong number of arguments\r\n";
      }

      return encoder.echo(args.shift()!);
    }

    case "set": {
      return set(args);
    }

    case "get": {
      return get(args);
    }

    case "del": {
      return del(args);
    }

    case "exists": {
      return exists(args);
    }

    case "incr": {
      return incr(args);
    }

    case "keys": {
      return keys(args);
    }

    case "expire": {
      return expire(args);
    }

    case "ttl": {
      return ttl(args);
    }

    case "lpush": {
      return push(args, "left");
    }

    case "rpush": {
      return push(args, "right");
    }

    case "llen": {
      return llen(args);
    }

    case "lpop": {
      return pop(args, "left");
    }

    case "rpop": {
      return pop(args, "right");
    }

    case "lrange": {
      return lrange(args);
    }

    case "hset": {
      return hset(args);
    }

    case "hget": {
      return hget(args);
    }

    case "hexists": {
      return hexists(args);
    }

    case "hdel": {
      return hdel(args);
    }

    case "hgetall": {
      return hgetall(args);
    }

    case "sadd": {
      return sadd(args);
    }

    case "srem": {
      return srem(args);
    }

    case "sismember": {
      return sismember(args);
    }

    case "smembers": {
      return smembers(args);
    }

    case "scard": {
      return scard(args);
    }

    case "subscribe": {
      return subscribe(socket, args);
    }

    case "publish": {
      return publish(args);
    }

    case "unsubscribe": {
      return unsubscribe(socket, args);
    }

    case "zadd": {
      return zadd(args);
    }

    case "zscore": {
      return zscore(args);
    }

    case "zcard": {
      return zcard(args);
    }

    case "zrem": {
      return zrem(args);
    }

    case "zrange": {
      return zrange(args);
    }

    case "multi": {
      return multi(socket);
    }

    case "exec": {
      return exec(socket);
    }

    case "discard": {
      return discard(socket);
    }

    default: {
      return encoder.error();
    }
  }
};
