import { expect, test } from "bun:test";
import { decoder } from "../core/decoder";
import { incr } from "../commands/incr";
import { memory } from "../memory";
import { populateOldDataInAOF, writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

test("test incr", () => {
  populateOldDataInAOF();
  console.log(memory);

  const buffer = Buffer.from("*2\r\n$4\r\nINCR\r\n$5\r\nviews\r\n");

  const parsed = decoder(buffer);

  if (!parsed) {
    console.log("not parsed");
    return;
  }

  const { charsprocessed, command: fullCommand } = parsed;

  const [command, ...args] = fullCommand.split(" ");

  expect(fullCommand).toBe("INCR views");

  // controller code here

  if (!args || args.length > 1) {
    console.log("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key] = args;

  if (!key || key === undefined) {
    console.log("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!memory.has(key)) {
    memory.set(key, "0");
  }

  const current = parseInt(memory.get(key)!);

  if (Number.isNaN(current)) {
    console.log("-ERR not an integer\r\n");
    return;
  }

  memory.set(key, String(current + 1));
  writeCommandInAOF(`incr ${key}`);

  console.log(encoder.incr(current + 1));
});
