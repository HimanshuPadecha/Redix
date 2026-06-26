# Persistence Layer (AOF)

Because an in-memory database will lose all data upon power loss or process termination, persistence mechanisms are required. This server implements a pure **Append-Only File (AOF)** strategy to ensure durability.

The persistence logic lives in `src/persistence/utils.ts`.

---

## What is AOF?

Instead of taking expensive binary snapshots of the entire memory map (like Redis RDB), the AOF strategy logs every write operation received by the server to a sequential file on disk. When the server restarts, it reads this file from top to bottom, re-executing the commands to perfectly rebuild the previous state.

---

## Write Operations (`writeCommandInAOF`)

Every time a command successfully mutates the `memory` Map (e.g., `SET`, `HSET`, `LPUSH`, `ZADD`), the handler invokes the `writeCommandInAOF` utility.

```typescript
export const writeCommandInAOF = (command: string) => {
  const filePath = getFilePath(); // Resolves to /src/persistence/data.aof
  fs.appendFileSync(filePath, command + "\n");
};
```

### Flow Example

1. Client sends: `SET user:name Alice`
2. `set.ts` validates the command and updates `memory.set("user:name", { ... })`
3. `set.ts` calls `writeCommandInAOF("set user:name Alice")`
4. The string is appended synchronously to `data.aof`.

> [!NOTE]
> Currently, the server uses `fs.appendFileSync` for durability. While this guarantees the write is on disk before responding, it does block the event loop temporarily.

---

## Startup Reconstruction (`populateOldDataInAOF`)

When the server boots, before it starts accepting TCP connections on port 6379, it synchronously parses and executes the `data.aof` ledger.

This logic is located in `src/persistence/utils.ts:populateOldDataInAOF`.

### Reconstruction Algorithm

1. Read the entire `data.aof` file synchronously.
2. Split the file contents by `\n` to isolate individual commands.
3. Iterate through every command string.
4. Split the command by spaces: `const [key, ...args] = command.split(" ")`.
5. Execute a massive `if / else if` router to perform the exact same in-memory mutations as the original command handlers.

#### Code Snippet (Reconstructing a ZADD)

```typescript
} else if (key === "zadd") {
  const [memoryKey, score, name] = args;
  
  if (!memory.has(memoryKey)) {
    memory.set(memoryKey, { value: { value: [], type: "zset" } });
  }

  const current = memory.get(memoryKey);
  const alreadyPresent = current!.value.value.find((player) => player.name === name);

  if (alreadyPresent) {
    alreadyPresent.score = parseInt(score);
  } else {
    current!.value.value.push({ name, score: parseInt(score) });
  }
}
```

By manually orchestrating state changes rather than relying on the command dispatcher, `populateOldDataInAOF` avoids triggering infinite recursive AOF writes during boot.

---

## Advantages

- **High Durability**: Every mutating command is flushed to disk. Crash data loss is virtually impossible.
- **Human Readable**: The `data.aof` file contains plaintext command strings, making it easy to parse, debug, and manually edit if corrupted.

---

## Limitations & Future Improvements

- **Unbounded Growth**: The `data.aof` file currently grows forever. If you `INCR` a key one million times, the file will contain one million lines.
  - *Future Fix*: Implement **AOF Rewriting**—a background process that walks the current memory map and generates the shortest possible sequence of commands to represent the state, replacing the old oversized AOF file.
- **Synchronous I/O**: The server blocks the event loop on every write.
  - *Future Fix*: Shift to asynchronous appending with `fs.appendFile` or file streams, batching writes in memory (similar to Redis's `appendfsync everysec` configuration).
