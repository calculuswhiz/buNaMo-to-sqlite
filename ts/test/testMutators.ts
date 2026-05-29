import test from "node:test";
import assert from "node:assert";
import { broaden, devoice, emphasize, mutate, prefix, palatalize, syncope, unduplicate, countSyllables } from "../mutators";

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
        assert.strictEqual(mutate("len1", "póg"), "phóg");
        assert.strictEqual(mutate("len1", "bád"), "bhád");
        assert.strictEqual(mutate("len1", "máthair"), "mháthair");
        assert.strictEqual(mutate("len1", "teaghlach"), "theaghlach");
        assert.strictEqual(mutate("len1", "sráid"), "shráid");
        assert.strictEqual(mutate("len1", "stáid"), "stáid");
      });

      await test("Lenition 1D", () => {
        assert.strictEqual(mutate("len1D", "freagair"), "d'fhreagair");
        assert.strictEqual(mutate("len1D", "ól"), "d'ól");
      });
    });

    await test("Lenition 2", async () => {
      assert.strictEqual(mutate("len2", "póg"), "phóg");
      assert.strictEqual(mutate("len2", "bád"), "bhád");
      assert.strictEqual(mutate("len2", "máthair"), "mháthair");
      // No mutation
      assert.strictEqual(mutate("len2", "teaghlach"), "teaghlach");
      assert.strictEqual(mutate("len2", "deoir"), "deoir");
      assert.strictEqual(mutate("len2", "sráid"), "sráid");
      assert.strictEqual(mutate("len2", "stáid"), "stáid");
    });

    await test("Lenition 3", async () => {
      assert.strictEqual(mutate("len3", "póg"), "phóg");
      assert.strictEqual(mutate("len3", "bád"), "bhád");
      assert.strictEqual(mutate("len3", "máthair"), "mháthair");
      assert.strictEqual(mutate("len3", "teaghlach"), "teaghlach");
      assert.strictEqual(mutate("len3", "sráid"), "tsráid");
      // No mutation
      assert.strictEqual(mutate("len3", "deoir"), "deoir");
      assert.strictEqual(mutate("len3", "stáid"), "stáid");
    });

    await test("Eclipsis 1", async () => {
      assert.strictEqual(mutate("ecl1", "póg"), "bpóg");
      assert.strictEqual(mutate("ecl1", "bád"), "mbád");
      assert.strictEqual(mutate("ecl1", "freagair"), "bhfreagair");
      assert.strictEqual(mutate("ecl1", "ceol"), "gceol");
      assert.strictEqual(mutate("ecl1", "gairdín"), "ngairdín");
      // Special for ecl1
      assert.strictEqual(mutate("ecl1", "teaghlach"), "dteaghlach");
      assert.strictEqual(mutate("ecl1", "deoir"), "ndeoir");
      assert.strictEqual(mutate("ecl1", "úll"), "n-úll");
      assert.strictEqual(mutate("ecl1", "Úll"), "nÚll");

      await test("Eclipsis 1x does not eclipse vowels", () => {
        assert.strictEqual(mutate("ecl1x", "úll"), "úll");
      });
    });

    await test("Eclipsis 2", async () => {
      assert.strictEqual(mutate("ecl2", "póg"), "bpóg");
      assert.strictEqual(mutate("ecl2", "bád"), "mbád");
      assert.strictEqual(mutate("ecl2", "freagair"), "bhfreagair");
      assert.strictEqual(mutate("ecl2", "ceol"), "gceol");
      assert.strictEqual(mutate("ecl2", "gairdín"), "ngairdín");
      // Ecl2 does not mutate "t" and "d"
      assert.strictEqual(mutate("ecl2", "teaghlach"), "teaghlach");
      assert.strictEqual(mutate("ecl2", "deoir"), "deoir");
    });

    await test("Eclipsis 3", async () => {
      assert.strictEqual(mutate("ecl3", "póg"), "bpóg");
      assert.strictEqual(mutate("ecl3", "bád"), "mbád");
      assert.strictEqual(mutate("ecl3", "freagair"), "bhfreagair");
      assert.strictEqual(mutate("ecl3", "ceol"), "gceol");
      assert.strictEqual(mutate("ecl3", "gairdín"), "ngairdín");
      // Special for ecl3
      assert.strictEqual(mutate("ecl3", "sráid"), "tsráid");
      assert.strictEqual(mutate("ecl3", "teaghlach"), "teaghlach");
      assert.strictEqual(mutate("ecl3", "deoir"), "deoir");
    });

    await test("Prefix T", async () => {
      assert.strictEqual(mutate("prefT", "eolas"), "t-eolas");
      assert.strictEqual(mutate("prefT", "uisce"), "t-uisce");
      assert.strictEqual(mutate("prefT", "úll"), "t-úll");
      assert.strictEqual(mutate("prefT", "Úll"), "tÚll");
    });

    await test("Prefix h", async () => {
      assert.strictEqual(mutate("prefH", "eolas"), "heolas");
      assert.strictEqual(mutate("prefH", "uisce"), "huisce");
      assert.strictEqual(mutate("prefH", "úll"), "húll");
      assert.strictEqual(mutate("prefH", "Úll"), "hÚll");
    });
  });

  await test("Slenderize regular", () => {
    assert.strictEqual(palatalize("fear"), "fir");
    assert.strictEqual(palatalize("béal"), "béil");
    assert.strictEqual(palatalize("iasc"), "éisc");
    assert.strictEqual(palatalize("síol"), "síl");
    assert.strictEqual(palatalize("fionn"), "finn");
    assert.strictEqual(palatalize("aer"), "aeir");
    assert.strictEqual(palatalize("claíomh"), "claímh");
    assert.strictEqual(palatalize("cearnóg"), "cearnóig");
  });

  await test("Slenderize irregular", () => {
    assert.strictEqual(palatalize("bád", "eiéí"), "báeiéíd");
  });

  await test("Broaden regular", () => {
    assert.strictEqual(broaden("fir", "fear"), "fear");
    assert.strictEqual(broaden("béil", "béal"), "béal");
    assert.strictEqual(broaden("síl", "síol"), "síol");
  });

  await test("Broaden irregular", () => {
    // TODO Come up with better example.
    assert.strictEqual(broaden("gniiic", "aá"), "gniiaác");
  });

  await test("Devoice", () => {
    assert.strictEqual(devoice("aaasd"), "aaast");
  });

  await test("Unduplicate", () => {
    assert.strictEqual(unduplicate("ball"), "bal");
    assert.strictEqual(unduplicate("barr"), "bar");
    assert.strictEqual(unduplicate("barróg"), "barróg");
    assert.strictEqual(unduplicate("barrógach"), "barrógach");
  });

  await test("Syncope", () => {
    assert.strictEqual(syncope("cathair"), "cathr");
    assert.strictEqual(syncope("obair"), "obr");
  });

  await test("prefix", () => {
    assert.strictEqual(prefix("sean", "nós"), "sean-nós");
    assert.strictEqual(prefix("ró", "éasca"), "ró-éasca");
    assert.strictEqual(prefix("sean", "Éireannach"), "Sean-Éireannach");
    // Absurd example, don't forget the lenition.
    assert.strictEqual(prefix("blah", "blah"), "blahbhlah");
  });

  await test("Emphasize", () => {
    assert.strictEqual(emphasize("mil", "sanSean"), "milsean");
    assert.strictEqual(emphasize("mí", "saSe"), "míse");
    // TODO example with naNe
  });

  await test("Count syllables", () => {
    assert.strictEqual(countSyllables("cathair"), 2);
    assert.strictEqual(countSyllables("obair"), 2);
    assert.strictEqual(countSyllables("aer"), 1);
    assert.strictEqual(countSyllables("bád"), 1);
    assert.strictEqual(countSyllables("i"), 1);
  });
});
