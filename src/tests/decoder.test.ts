import { expect, test } from "bun:test";
import { decoder } from "../core/decoder";
import { encoder } from "../core/encoder";

test("test decoder", () => {
  const buffer = Buffer.from("*2\r\n$4\r\nKEYS\r\n$1\r\n*\r\n");

  const parsed = decoder(buffer);

  if (!parsed) {
    return;
  }

  const { command } = parsed;

  console.log(command);
});

test("test encoder keys", () => {
  const keys = ["name", "hello", "brother"];

  console.log(encoder.keys(keys));
});
