import test from "node:test";
import assert from "node:assert";
import { mutate, slenderize } from "../mutators";

test("Test mutators", async () => {
  await test("Lenition", async () => {
    await test("No lenition mutates exotic words with J in second position", () => {
      assert.strictEqual(mutate("len1", "Djibouti"), "Djibouti");
      assert.strictEqual(mutate("len1D", "Djibouti"), "Djibouti");
      assert.strictEqual(mutate("len2", "Djibouti"), "Djibouti");
      assert.strictEqual(mutate("len2D", "Djibouti"), "Djibouti");
      assert.strictEqual(mutate("len3", "Djibouti"), "Djibouti");
      assert.strictEqual(mutate("len3D", "Djibouti"), "Djibouti");
    });

    await test("Lenition 1", () => {
      const cases: [string, string][] = [
        ["póg", "phóg"],
        ["bád", "bhád"],
        ["máthair", "mháthair"],
        ["sráid", "shráid"],
        // No mutation
        ["stáid", "stáid"],
      ];
      for (const [base, expected] of cases) {
        const actual = mutate("len1", base);
        assert.strictEqual(actual, expected);
      }
    });

    await test("Lenition 1D", () => {
      const cases: [string, string][] = [
        ["freagair", "d'fhreagair"],
        ["ól", "d'ól"],
      ];
      for (const [base, expected] of cases) {
        const actual = mutate("len1D", base);
        assert.strictEqual(actual, expected);
      }
    });
  });

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
    const actual = slenderize("bád", "eiéí");
    const expected = "báeiéíd";
    assert.strictEqual(actual, expected);
  });
});
