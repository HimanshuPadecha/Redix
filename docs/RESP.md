# RESP Protocol Implementation

This document details how the Redis Serialization Protocol (RESP) is parsed and encoded within this project.

The server implements a completely custom, byte-level RESP parser without relying on external libraries. The logic is split between `src/core/decoder.ts` and `src/core/encoder.ts`.

---

## What is RESP?

RESP is the binary-safe protocol that Redis uses to communicate with clients. It is fundamentally a text-based protocol that is simple to parse and human-readable, yet highly performant.

All commands sent from the client to the server are formatted as **RESP Arrays** containing **Bulk Strings**.
The server replies using various RESP types (Simple Strings, Errors, Integers, Bulk Strings, Arrays) depending on the command executed.

Every complete RESP component is terminated by a CRLF (`\r\n`).

---

## Supported RESP Types

| Data Type | Prefix | Description | Example |
| :--- | :--- | :--- | :--- |
| **Simple Strings** | `+` | Non-binary safe strings, fast to parse. Used for simple OK/PONG responses. | `+OK\r\n` |
| **Errors** | `-` | Represents an error condition. | `-ERR unknown command\r\n` |
| **Integers** | `:` | A 64-bit signed integer. | `:1000\r\n` |
| **Bulk Strings** | `$` | Binary safe string up to 512 MB. Prefix defines byte length. | `$6\r\nfoobar\r\n` |
| **Arrays** | `*` | Collection of other RESP types. Prefix defines element count. | `*2\r\n$3\r\nfoo\r\n$3\r\nbar\r\n` |

---

## Decoding Flow (`src/core/decoder.ts`)

The Decoder's primary job is to take a raw `Buffer` from the TCP socket and convert a RESP Array into a space-separated string representing the command and its arguments.

### Parsing Logic
1. **Validation**: The decoder asserts that the stream begins with an Array prefix (`*`). If not, it rejects parsing.
2. **Array Length Extraction**: It advances a `cursor` until it hits `\r`, extracting the integer indicating the number of arguments in the command.
3. **Element Traversal**: A `while` loop iterates for `length` iterations.
4. **Bulk String Parsing**:
   - For every element, it advances the cursor past the `$` prefix to read the word length.
   - It skips the trailing `\r\n` of the length descriptor.
   - It reads exactly `wordLen` bytes/characters to extract the string token.
   - It pushes the token into a `parsed` array.
5. **Cursor Tracking**: The decoder meticulously tracks `charsprocessed`. If the stream is abruptly cut (e.g., partial TCP packet), the loop bounds checks (`cursor >= token.length`) will trigger a `null` return. The server will leave the buffer intact and wait for the next `data` event to append the rest of the bytes.

### Example Transformation

**Incoming TCP Stream:**
```text
*3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$7\r\nmyvalue\r\n
```

**Decoder Output:**
```javascript
{ 
  command: "SET mykey myvalue", 
  charsprocessed: 41 
}
```

---

## Encoding Flow (`src/core/encoder.ts`)

The Encoder translates primitive JavaScript values returned from the Command Dispatcher back into strict RESP byte strings to be written over the TCP socket.

The encoder uses an Object-Oriented design, where the `Encoder` class overrides methods defined in `BaseEncoder`.

### Primitive Implementations

#### Simple Strings (`+`)
Used by `PING` and `SET`:
```typescript
ping(): string {
  return "+PONG\r\n";
}
set(): string {
  return "+OK\r\n";
}
```

#### Integers (`:`)
Used by `INCR`, `EXISTS`, `DEL`:
```typescript
incr(updated: number): string {
  return `:` + String(updated) + "\r\n";
}
```

#### Bulk Strings (`$`)
Used by `GET`:
```typescript
get(value: string): string {
  return `$${value.length}\r\n${value}\r\n`;
}
```

#### Arrays (`*`)
Used by `KEYS`, `LRANGE`, `SMEMBERS`:
The encoder maps over the JavaScript array, turning each item into a Bulk String, unshifts the Array length, and joins them with `\r\n`.
```typescript
lrange(sliced: string[]): string {
  const modified = sliced.map((item) => `$${item.length}\r\n${item}`);
  modified.unshift(`*${sliced.length}`);
  modified.push(""); // for trailing \r\n
  return modified.join("\r\n");
}
```

#### Errors (`-`)
Used as fallbacks or invalid command validation:
```typescript
error(): string {
  return "-ERR unknown command\r\n";
}
```
