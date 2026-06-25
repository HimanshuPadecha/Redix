import { test } from "bun:test";
import { populateOldDataInAOF } from "../persistence/utils";
import { memory } from "../memory";

test("check the output", () => {
  try {
    populateOldDataInAOF();
    console.log(memory);
  } catch (error) {}
});

test("slice test", () => {
  const arr = [1, 2, 3, 4, 5, 6];
  console.log(arr.slice(-100, 100));
});