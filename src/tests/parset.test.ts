import { test } from "bun:test";
import { parser } from "../parser";

test("test parser", () => {
  let buffer = Buffer.from(
    "*1\r\n$4\r\nPING\r\n*1\r\n$4\r\nPING\r\n",
  );

  const parsed = parser(buffer);

  if (parsed === null) {
    console.log("Cannot parse the command yet");
    return;
  }

  const { charsprocessed, command: fullCommand } = parsed;

  console.log(fullCommand);
  

  buffer = buffer.subarray(charsprocessed, -1);

  console.log("this is buffer " + buffer.toString());
});
