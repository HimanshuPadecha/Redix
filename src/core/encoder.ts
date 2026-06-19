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
}

export const encoder = new Encoder();
