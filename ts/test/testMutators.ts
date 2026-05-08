import test from "node:test";
import assert from "node:assert";
import { slenderize } from "../mutators";

test("Test mutators", async () => {
  await test("slenderize regular", () => {
    const cases: [string, string][] = [
      ["fear", "fir"],
      ["béal", "béil"],
      ["iasc", "éisc"],
      ["síol", "síl"],
      ["fionn", "finn"],
      ["aer", "aeir"]
    ];
    for (const [base, expected] of cases) {
      const actual = slenderize(base);
      assert.strictEqual(actual, expected);
    }
  });

  await test("slenderize irregular", () => {
    // Obviously ridiculous case
    const actual = slenderize("bád", "eiéí");
    const expected = "báeiéíd";
    assert.strictEqual(actual, expected);
  });
});
