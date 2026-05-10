import test from "node:test";
import assert from "node:assert";
import { broaden, devoice, emphasize, mutate, prefix, slenderize, syncope, unduplicate } from "../mutators";
import type { Emphasizer } from "../features";

test("Test mutators", async () => {
  await test("Mutate", async () => {
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
          ["teaghlach", "theaghlach"],
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

    await test("Lenition 2", async () => {
      const cases: [string, string][] = [
        ["póg", "phóg"],
        ["bád", "bhád"],
        ["máthair", "mháthair"],
        // No mutation
        ["teaghlach", "teaghlach"],
        ["deoir", "deoir"],
        ["sráid", "sráid"],
        ["stáid", "stáid"],
      ];
      for (const [base, expected] of cases) {
        const actual = mutate("len2", base);
        assert.strictEqual(actual, expected);
      }

      await test("Lenition 2D", () => {
        const cases: [string, string][] = [
          ["freagair", "d'fhreagair"],
          ["ól", "d'ól"],
        ];
        for (const [base, expected] of cases) {
          const actual = mutate("len2D", base);
          assert.strictEqual(actual, expected);
        }
      });
    });

    await test("Lenition 3", async () => {
      const cases: [string, string][] = [
        ["póg", "phóg"],
        ["bád", "bhád"],
        ["máthair", "mháthair"],
        ["teaghlach", "teaghlach"],
        ["sráid", "tsráid"],
        // No mutation
        ["deoir", "deoir"],
        ["stáid", "stáid"],
      ];
      for (const [base, expected] of cases) {
        const actual = mutate("len3", base);
        assert.strictEqual(actual, expected);
      }

      await test("Lenition 3D", () => {
        const cases: [string, string][] = [
          ["freagair", "d'fhreagair"],
          ["ól", "d'ól"],
        ];
        for (const [base, expected] of cases) {
          const actual = mutate("len3D", base);
          assert.strictEqual(actual, expected);
        }
      });
    });

    await test("Eclipsis 1", async () => {
      const cases: [string, string][] = [
        ["póg", "bpóg"],
        ["bád", "mbád"],
        ["freagair", "bhfreagair"],
        ["ceol", "gceol"],
        ["gairdín", "ngairdín"],
        // Special for ecl1
        ["teaghlach", "dteaghlach"],
        ["deoir", "ndeoir"],
        ["úll", "n-úll"],
        ["Úll", "nÚll"],
      ];
      for (const [base, expected] of cases) {
        const actual = mutate("ecl1", base);
        assert.strictEqual(actual, expected);
      }

      await test("Eclipsis 1x does not eclipse vowels", () => {
        const cases: [string, string][] = [
          ["úll", "úll"]
        ];
        for (const [base, expected] of cases) {
          const actual = mutate("ecl1x", base);
          assert.strictEqual(actual, expected);
        }
      });
    });

    await test("Eclipsis 2", async () => {
      const cases: [string, string][] = [
        ["póg", "bpóg"],
        ["bád", "mbád"],
        ["freagair", "bhfreagair"],
        ["ceol", "gceol"],
        ["gairdín", "ngairdín"],
        // Ecl2 does not mutate "t" and "d"
        ["teaghlach", "teaghlach"],
        ["deoir", "deoir"]
      ];
      for (const [base, expected] of cases) {
        const actual = mutate("ecl2", base);
        assert.strictEqual(actual, expected);
      }
    });

    await test("Eclipsis 3", async () => {
      const cases: [string, string][] = [
        ["póg", "bpóg"],
        ["bád", "mbád"],
        ["freagair", "bhfreagair"],
        ["ceol", "gceol"],
        ["gairdín", "ngairdín"],
        // Special for ecl3
        ["sráid", "tsráid"],
        ["teaghlach", "teaghlach"],
        ["deoir", "deoir"]
      ];
      for (const [base, expected] of cases) {
        const actual = mutate("ecl3", base);
        assert.strictEqual(actual, expected);
      }
    });

    await test("Prefix T", async () => {
      const cases: [string, string][] = [
        ["eolas", "t-eolas"],
        ["uisce", "t-uisce"],
        ["úll", "t-úll"],
        ["Úll", "tÚll"],
      ];
      for (const [base, expected] of cases) {
        const actual = mutate("prefT", base);
        assert.strictEqual(actual, expected);
      }
    });

    await test("Prefix h", async () => {
      const cases: [string, string][] = [
        ["eolas", "heolas"],
        ["uisce", "huisce"],
        ["úll", "húll"],
        ["Úll", "hÚll"],
      ];
      for (const [base, expected] of cases) {
        const actual = mutate("prefH", base);
        assert.strictEqual(actual, expected);
      }
    });
  });

  await test("Slenderize regular", () => {
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

  await test("Slenderize irregular", () => {
    const actual = slenderize("bád", "eiéí");
    const expected = "báeiéíd";
    assert.strictEqual(actual, expected);
  });

  await test("Broaden regular", () => {
    const cases: [string, string][] = [
      ["fir", "fear"],
      ["béil", "béal"],
      ["síl", "síol"],
    ];
    for (const [base, expected] of cases) {
      const actual = broaden(base);
      assert.strictEqual(actual, expected);
    }
  });

  await test("Broaden irregular", () => {
    // TODO Come up with better example.
    const actual = broaden("gniiic", "aá");
    const expected = "gniiaác";
    assert.strictEqual(actual, expected);
  });

  await test("Devoice", () => {
    const cases: [string, string][] = [
      ["aaasd", "aaast"],
    ];
    for (const [base, expected] of cases) {
      const actual = devoice(base);
      assert.strictEqual(actual, expected);
    }
  });

  await test("Unduplicate", () => {
    const cases: [string, string][] = [
      ["ball", "bal"],
      ["barr", "bar"],
      ["barróg", "barróg"],
      ["barrógach", "barrógach"]
    ];
    for (const [base, expected] of cases) {
      const actual = unduplicate(base);
      assert.strictEqual(actual, expected);
    }
  });

  await test("Syncope", () => {
    const cases: [string, string][] = [
      ["cathair", "cathr"],
      ["obair", "obr"],
    ];
    for (const [base, expected] of cases) {
      const actual = syncope(base);
      assert.strictEqual(actual, expected);
    }
  });

  await test("prefix", () => {
    const cases: [string, string, string][] = [
      ["sean", "nós", "sean-nós"],
      ["ró", "éasca", "ró-éasca"],
      ["sean", "Éireannach", "Sean-Éireannach"],
      // Absurd example, don't forget the lenition.
      ["blah", "blah", "blahbhlah"],
    ];
    for (const [prefixStr, body, expected] of cases) {
      const actual = prefix(prefixStr, body);
      assert.strictEqual(actual, expected);
    }
  });

  await test("Emphasize", () => {
    const cases: [string, Emphasizer, string][] = [
      ["mil", "sanSean", "milsean"],
      ["mí", "saSe", "míse"],
      // TODO example with naNe
    ];
    for (const [text, emphasizer, expected] of cases) {
      const actual = emphasize(text, emphasizer);
      assert.strictEqual(actual, expected);
    }
  });
});
