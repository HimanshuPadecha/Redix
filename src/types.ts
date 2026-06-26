import type { Socket } from "node:net";

export interface RedisSocket extends Socket {
  inTransaction: boolean;
  commandQueue: string[];
}

export type Command =
  | "ping"
  | "echo"
  | "set"
  | "get"
  | "del"
  | "exists"
  | "incr"
  | "keys"
  | "expire"
  | "ttl"
  | "lpush"
  | "rpush"
  | "llen"
  | "lpop"
  | "rpop"
  | "lrange"
  | "hset"
  | "hget"
  | "hexists"
  | "hdel"
  | "hgetall"
  | "sadd"
  | "srem"
  | "sismember"
  | "smembers"
  | "scard"
  | "subscribe"
  | "publish"
  | "unsubscribe"
  | "zadd"
  | "zscore"
  | "zcard"
  | "zrem"
  | "zrange"
  | "multi"
  | "exec";
