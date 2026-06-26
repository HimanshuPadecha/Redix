import type { Socket } from "node:net";
import type { Command } from "../types";
import { set } from "./set";
import { get } from "./get";
import { del } from "./del";
import { exists } from "./exists";
import { encoder } from "../core/encoder";
import { incr } from "./incr";
import { keys } from "./keys";
import { expire } from "./expire";
import { ttl } from "./ttl";
import { push } from "./lpush";
import { llen } from "./llen";
import { pop } from "./pop";
import { lrange } from "./lrange";
import { hset } from "./hset";
import { hget } from "./hget";
import { hexists } from "./hexists";
import { hdel } from "./hdel";
import { hgetall } from "./hgetall";
import { sadd } from "./sadd";
import { srem } from "./srem";
import { sismember } from "./sismember";
import { smembers } from "./smembers";
import { scard } from "./scard";
import { subscribe } from "./subscribe";
import { publish } from "./publish";
import { unsubscribe } from "./unsubscribe";
import { zadd } from "./zadd";

export const commandDispatcher = (
  socket: Socket,
  command: Command,
  args: string[],
) => {
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

    default: {
      socket.write(encoder.error());
    }
  }
};
