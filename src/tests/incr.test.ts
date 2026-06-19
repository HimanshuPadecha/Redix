import { expect, test } from "bun:test";
import { decoder } from "../core/decoder";
import { incr } from "../commands/incr";
import { memory } from "../memory";
import { populateOldDataInAOF, writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

test("test incr", () => {
    
});
