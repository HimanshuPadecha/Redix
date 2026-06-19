import { expect, test } from "bun:test";
import { decoder } from "../core/decoder";

test("test decoder", () => {
  let buffer = Buffer.from(
    "*1\r\n$4\r\nPING\r\n*2\r\n$3\r\nGET\r\n$4\r\nname\r\n",
  );

  const parsed = decoder(buffer);

  if (parsed === null) {
    console.log("Cannot parse the command yet");
    return;
  }

  const { charsprocessed, command: fullCommand } = parsed;

  console.log(fullCommand);

  buffer = buffer.subarray(charsprocessed);

  console.log(buffer.toString());

  const another = decoder(buffer);

  if (another === null) {
    console.log("not finished");
    return;
  }

  const { charsprocessed: chars, command } = another;

  expect(command).toBe("GET name");
});
