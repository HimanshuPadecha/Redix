import { test } from "bun:test";
import { parser } from "../parser";

test("test parser", () => {
  const buffer = Buffer.from(
    "*1\r\n$5\r\nPING\r\n"
  );

  console.log(parser(buffer));
});
