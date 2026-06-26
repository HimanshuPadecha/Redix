# Pub/Sub Engine

The Publish/Subscribe (Pub/Sub) paradigm allows clients to communicate with each other through "channels." Publishers emit messages to channels without knowing who the subscribers are, and subscribers receive messages on channels they are interested in without knowing who published them.

This server implements Pub/Sub natively entirely in-memory.

---

## State Management (`src/pub-sub-memory.ts`)

Because Pub/Sub operates outside the standard key-value storage mechanisms, its state is decoupled from `src/memory.ts`. It resides in two specific structures within `src/pub-sub-memory.ts`:

```typescript
export const subscriptions = new Map<string, Set<RedisSocket>>();
export const subsCount = new Map<RedisSocket, number>();
```

- **`subscriptions`**: Maps a channel name (string) to a JavaScript `Set` containing the `RedisSocket` instances of all clients listening to that channel.
- **`subsCount`**: Maps a specific `RedisSocket` to an integer representing the number of active channels that socket is subscribed to.

---

## Subscription Lifecycle

### `SUBSCRIBE` (`src/commands/subscribe.ts`)

When a client issues a `SUBSCRIBE channel_name` command:
1. The server checks if the channel exists in the `subscriptions` Map. If not, it initializes a new `Set`.
2. The client's `RedisSocket` object reference is added to the Set.
3. The `subsCount` for the socket is incremented.
4. The Encoder generates the appropriate acknowledgement, explicitly telling the client they have successfully joined the channel and returning their new active channel count.

### `PUBLISH` (`src/commands/publish.ts`)

When a client issues a `PUBLISH channel_name message` command:
1. The server looks up the channel in `subscriptions`.
2. If the channel does not exist or the Set is empty, it returns `0` (meaning no subscribers received the message).
3. If subscribers exist, it iterates over the `Set<RedisSocket>`.
4. It manually invokes `socket.write(encoder.publish(message))` on every socket in the Set.
5. It returns the number of clients that successfully received the message.

```typescript
// Inside publish.ts
let num = 0;
for (const val of current) {
    val.write(encoder.publish(message));
    num++;
}
return String(num); // Returned to the publisher
```

### `UNSUBSCRIBE` (`src/commands/unsubscribe.ts`)

When a client issues an `UNSUBSCRIBE channel_name` command:
1. The server locates the channel's socket Set.
2. It removes the specific `RedisSocket` from the Set.
3. It decrements the `subsCount` for that socket.
4. It returns an acknowledgement to the socket.

---

## Memory & Performance Considerations

- **Direct Socket References**: The `Set` stores direct references to the `node:net` `Socket` object. Node.js handles memory garbage collection for sockets cleanly, provided we purge them from our Sets on disconnection.
- **Synchronous Iteration**: The `PUBLISH` command loops through subscribers synchronously. If a channel has 100,000 subscribers, `PUBLISH` will block the Node.js event loop until every socket has its `write` buffer updated. 
  - *Mitigation*: The underlying TCP socket `write` is non-blocking at the OS level, meaning Node immediately returns from the `socket.write` call after dumping the message to the kernel buffers. Therefore, iteration remains extremely fast.
