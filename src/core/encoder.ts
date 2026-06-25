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
}

export const encoder = new Encoder();
