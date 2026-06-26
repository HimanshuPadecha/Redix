# Transactions

Transactions allow the execution of a group of commands in a single step. All commands in a transaction are executed serially and atomically. It is guaranteed that no request issued by another client will be served in the middle of the execution of a transaction.

This server implements the standard Redis transaction commands: `MULTI`, `EXEC`, and `DISCARD`.

---

## Socket State Management

To support transactions without polluting global state, we extend the standard Node.js TCP `Socket` into a custom interface called `RedisSocket` (`src/types.ts`).

```typescript
export interface RedisSocket extends Socket {
  inTransaction: boolean;
  commandQueue: string[];
}
```

Every connection receives its own unique `inTransaction` boolean flag and an isolated `commandQueue` array.

---

## Transaction Lifecycle

### 1. The `MULTI` Command (`src/commands/multi.ts`)

When a client sends the `MULTI` command, the transaction boundary begins.
- If the socket is already in a transaction (`socket.inTransaction === true`), the server throws an error (transactions cannot be nested).
- Otherwise, the server sets `socket.inTransaction = true` and returns `+OK\r\n`.

### 2. Command Queuing (`src/dispatcher.ts`)

Once `inTransaction` is active, the **Command Dispatcher** behaves differently.

Instead of routing the command to the executor functions (`src/commands/`), it intercepts the command at the very top of the dispatcher:

```typescript
export const commandDispatcher = (socket: RedisSocket, command: Command, args: string[]): string => {
  if (socket.inTransaction && command !== "exec" && command !== "discard") {
    socket.commandQueue.push(`${command} ${args.join(" ")}`);
    return "+QUEUED\r\n";
  }
  // ... proceed to normal switch statement
}
```

The client receives `+QUEUED\r\n` for every command entered, confirming that the server has staged the command.

### 3. The `EXEC` Command (`src/commands/exec.ts`)

`EXEC` finalizes the transaction block and executes all queued commands synchronously.

1. The server verifies `socket.inTransaction` is true.
2. It initializes an empty `responses` array.
3. It iterates over the `socket.commandQueue`.
4. It manually invokes the `commandDispatcher` recursively for every command in the queue, pushing the string response into the `responses` array.
5. It sets `socket.inTransaction = false` and flushes the queue.
6. It returns an encoded RESP Array containing the results of all executed commands.

```typescript
for (const fullCommand of socket.commandQueue) {
  const [command, ...args] = fullCommand.split(" ");
  responses.push(commandDispatcher(socket, command as Command, args));
}
return encoder.lrange(responses); // Returns array of results
```

**Why is it Atomic?**
Because Node.js runs its JavaScript engine on a single-threaded Event Loop, the `for` loop executing the command queue operates synchronously. The V8 engine will not suspend execution to handle network packets from other TCP sockets until the entire loop finishes. This implicitly provides 100% ACID atomicity and isolation for the transaction block.

### 4. The `DISCARD` Command (`src/commands/discard.ts`)

If the client wishes to abort the transaction, they issue `DISCARD`.
- The server sets `socket.inTransaction = false`.
- The server clears the queue: `socket.commandQueue = []`.
- Returns `+OK\r\n`.

---

## Edge Cases

- **Errors during Queuing**: Currently, syntax errors are blindly queued and evaluated at `EXEC` runtime. If a queued command throws an error during `EXEC`, subsequent commands *will still execute*. This matches the standard Redis behavior for runtime errors.
