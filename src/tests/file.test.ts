import { test } from "bun:test";
import { populateOldDataInAOF, writeCommandInAOF } from "../persistence/utils";
import { memory } from "../memory";

test("check the output", () => {
  try {
    populateOldDataInAOF()
    console.log(memory);
  } catch (error) {}
});
