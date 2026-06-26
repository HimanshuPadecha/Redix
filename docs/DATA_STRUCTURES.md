# Data Structures

As an in-memory database, the core of the server relies on a central storage mechanism and specifically tailored internal data structures.

The central storage object resides in `src/memory.ts`.

---

## The Global Map

All key-value pairs are stored in a single, globally scoped JavaScript `Map`. Using a native `Map` ensures O(1) average time complexity for lookups, insertions, and deletions, which is critical for a high-performance database.

```typescript
const memory = new Map<
  string,
  {
    value:
      | { type: "string"; value: string }
      | { type: "list"; value: string[] }
      | { type: "hash"; value: Record<string, string> }
      | { type: "set"; value: Set<string> }
      | { type: "zset"; value: zsetObject[] };
    expiresAt?: number;
  }
>();
```

Every key points to a wrapper object. This wrapper contains:
1. `value`: A discriminated union defining the type of the underlying data and the data itself.
2. `expiresAt`: An optional Unix timestamp indicating when the key should be considered dead.

---

## Supported Structures

### 1. Strings
- **Commands**: `SET`, `GET`, `INCR`
- **Internal Representation**: Plain JavaScript `string`.
- **Note**: `INCR` commands pull the string, parse it using `parseInt`, increment the integer, and save it back as a string. If the string cannot be parsed as a number, it will result in `NaN` logic.

### 2. Lists
- **Commands**: `LPUSH`, `RPUSH`, `LPOP`, `RPOP`, `LLEN`, `LRANGE`
- **Internal Representation**: JavaScript `Array<string>`.
- **Operations**:
  - `LPUSH` utilizes `Array.prototype.unshift()` (O(N) operation in V8).
  - `RPUSH` utilizes `Array.prototype.push()` (O(1) operation).
  - `LPOP` utilizes `Array.prototype.shift()` (O(N) operation).
  - `RPOP` utilizes `Array.prototype.pop()` (O(1) operation).
- *Future Optimization Note*: While arrays are easy to implement, a true Doubly Linked List would provide O(1) complexity for both left and right insertions/removals.

### 3. Hashes
- **Commands**: `HSET`, `HGET`, `HDEL`, `HEXISTS`, `HGETALL`
- **Internal Representation**: `Record<string, string>` (Plain JavaScript Object).
- **Operations**: Nested O(1) lookups. To retrieve a hash field, the engine does `memory.get(key).value.value[field]`.

### 4. Sets
- **Commands**: `SADD`, `SREM`, `SISMEMBER`, `SMEMBERS`, `SCARD`
- **Internal Representation**: JavaScript `Set<string>`.
- **Operations**: Utilizes native V8 `Set` methods like `.add()`, `.has()`, and `.delete()` for guaranteed uniqueness and fast O(1) lookups.

### 5. Sorted Sets (ZSets)
- **Commands**: `ZADD`, `ZSCORE`, `ZCARD`, `ZREM`, `ZRANGE`
- **Internal Representation**: `Array<{ name: string; score: number }>`
- **Operations**: Currently implemented as a naive array of objects.
- *Future Optimization Note*: Finding a member to update its score requires an O(N) array scan. A proper Skip List or an underlying Hash-Map combined with an Array would drastically improve ZSet performance at scale.

---

## Expiration (TTL)

Expiration metadata is attached to the parent wrapper rather than the internal data structure. 

### Lazy Invalidation
The server implements **Lazy Invalidation** (passive expiration). When a key is requested (e.g., via `GET`), the command handler explicitly checks the `expiresAt` property.

```typescript
// Inside get.ts
if (current.expiresAt && current.expiresAt < Date.now()) {
    memory.delete(key);
    return encoder.get(""); // Returns nil/empty
}
```

This prevents the need for a background garbage collection thread constantly scanning memory, reducing CPU overhead, though it does mean "dead" keys take up memory until they are requested.
