class BaseEncoder {
  ping(): string {
    throw new Error("PING encoder is not implemented");
  }

  get(key: string): string {
    throw new Error("GET encoder is not implemented");
  }

  set(): string {
    throw new Error("SET encoder is not implemented");
  }

  del(): string {
    throw new Error("DEL encoder is not implemented");
  }

  exists(): string {
    throw new Error("EXISTS encoder is not implemented");
  }

  echo(values: string): string {
    throw new Error("ECHO encoder is not implemented");
  }

  error(): string {
    throw new Error("ERROR encoder is not implemented");
  }

  incr(updated: number): string {
    throw new Error("INCR encoder is not implemented");
  }

  keys(keys: string[]): string {
    throw new Error("KEYS encoder is not implemented");
  }

  expires(): string {
    throw new Error("EXPIRES encoder is not implemented");
  }

  ttl(value: number): string {
    throw new Error("TTL encoder is not implemented ");
  }

  lpush(len: number): string {
    throw new Error("LPUSH encoder is not implemented");
  }

  llen(len: number): string {
    throw new Error("LLEN encoder is not implemented");
  }

  pop(value: string): string {
    throw new Error("POP encoder is not implemented");
  }

  lrange(sliced: string[]): string {
    throw new Error("LRANGE encoder is not implemented");
  }

  hset(result: number): string {
    throw new Error("HSET encoder is not implemented");
  }

  hget(value: string): string {
    throw new Error("HGET encoder is not implemented");
  }

  hexists(): string {
    throw new Error("HEXISTS encoder is not implemented");
  }

  hdel(): string {
    throw new Error("HDEL encoder is not implemented ");
  }

  hgetall(transformed: string[]): string {
    throw new Error("HGETALL encoder is not implemented");
  }

  sadd(len: number): string {
    throw new Error("SADD encoder is not implemented");
  }

  srem(): string {
    throw new Error("SREM encoder is not implemented");
  }

  sismember(): string {
    throw new Error("SISMEMBER encoder is not implmented");
  }

  smembers(values: string[]): string {
    throw new Error("SMEMBERS encoder is not implemented");
  }

  scard(len: number): string {
    throw new Error("SCARD encoder is not implemetned");
  }

  subscribe(channel: string, subscribedTo: number): string {
    throw new Error("SUBSCRIBE encoder is not implemented");
  }

  publish(published: number): string {
    throw new Error("PUBLISH encoder is not implemented");
  }

  unsubscribe(channel: string, subscribedTo: number): string {
    throw new Error("UNSUBSCRIBE encoder is not implemented");
  }

  zadd(member: number): string {
    throw new Error("ZADD encoder is not implemented");
  }

  zscore(score: number): string {
    throw new Error("ZSCORE is not implemented");
  }

  zcard(players: number): string {
    throw new Error("ZCARD is not implemented");
  }

  zrem(): string {
    throw new Error("ZREM is not implemented");
  }

  zrange(processed: string[]): string {
    throw new Error("ZRANGE is not implemented");
  }
}

class Encoder extends BaseEncoder {
  override ping(): string {
    return "+PONG\r\n";
  }

  override get(value: string): string {
    return `$${value.length}\r\n${value}\r\n`;
  }

  override set(): string {
    return "+OK\r\n";
  }

  override del(): string {
    return ":1\r\n";
  }

  override exists(): string {
    return ":1\r\n";
  }

  override echo(value: string): string {
    return this.get(value);
  }

  override error(): string {
    return "-ERR unknown command\r\n";
  }

  override incr(updated: number): string {
    return `:` + String(updated) + "\r\n";
  }

  override keys(keys: string[]): string {
    const encodedkeys = keys.map((key) => `$${key.length}\r\n${key}`);

    encodedkeys.unshift(String(`*${keys.length}`));
    encodedkeys.push("");

    return encodedkeys.join("\r\n");
  }

  override expires(): string {
    return ":1\r\n";
  }

  override ttl(value: number): string {
    return `:${value}\r\n`;
  }

  override lpush(len: number): string {
    return `:${len}\r\n`;
  }

  override llen(len: number): string {
    return `:${len}\r\n`;
  }

  override pop(value: string): string {
    return `$${value.length}\r\n${value}\r\n`;
  }

  override lrange(sliced: string[]): string {
    const modified = sliced.map((item) => `$${item.length}\r\n${item}`);

    modified.unshift(`*${sliced.length}`);
    modified.push("");

    return modified.join("\r\n");
  }

  override hset(result: number): string {
    return `:${result}\r\n`;
  }

  override hget(value: string): string {
    return `$${value.length}\r\n${value}\r\n`;
  }

  override hexists(): string {
    return `:1\r\n`;
  }

  override hdel(): string {
    return `:1\r\n`;
  }

  override hgetall(transformed: string[]): string {
    return this.lrange(transformed);
  }

  override sadd(len: number): string {
    return `:${len}\r\n`;
  }

  override srem(): string {
    return `:1\r\n`;
  }

  override sismember(): string {
    return `:1\r\n`;
  }

  override smembers(values: string[]): string {
    return this.lrange(values);
  }

  override scard(len: number): string {
    return `:${len}\r\n`;
  }

  override subscribe(channel: string, subscribedTo: number): string {
    return `*${3}\r\n$9\r\nsubscribe\r\n$${channel.length}\r\n${channel}\r\n:${subscribedTo}\r\n`;
  }

  override publish(published: number): string {
    return `:${published}\r\n `;
  }

  override unsubscribe(channel: string, subscribedTo: number): string {
    return `*3\r\n$11\r\nunsubscribe\r\n$${channel.length}\r\n${channel}\r\n:${subscribedTo}\r\n`;
  }

  override zadd(member: number): string {
    return `:${member}\r\n`;
  }

  override zscore(score: number): string {
    return `$${String(score).length}\r\n${score}\r\n`;
  }

  override zcard(players: number): string {
    return `:${players}\r\n`;
  }

  override zrem(): string {
    return `:1\r\n`;
  }

  override zrange(processed: string[]): string {
    return this.lrange(processed);
  }
}

export const encoder = new Encoder();
