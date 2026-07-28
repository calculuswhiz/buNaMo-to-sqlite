import { describe, expect, test } from "bun:test";
import { broaden, devoice, emphasize, mutate, prefix, palatalize, syncope, unduplicate, countSyllables } from "../mutators";

describe("Test mutators", () => {
  describe("Mutate", () => {
    describe("Lenition", () => {
      test("No lenition mutates exotic words with J in second position", () => {
        expect(mutate("len1", "Djibouti")).toBe("Djibouti");
        expect(mutate("len1D", "Djibouti")).toBe("Djibouti");
        expect(mutate("len2", "Djibouti")).toBe("Djibouti");
        expect(mutate("len2D", "Djibouti")).toBe("Djibouti");
        expect(mutate("len3", "Djibouti")).toBe("Djibouti");
        expect(mutate("len3D", "Djibouti")).toBe("Djibouti");
      });

      test("Lenition 1", () => {
        expect(mutate("len1", "póg")).toBe("phóg");
        expect(mutate("len1", "bád")).toBe("bhád");
        expect(mutate("len1", "máthair")).toBe("mháthair");
        expect(mutate("len1", "teaghlach")).toBe("theaghlach");
        expect(mutate("len1", "sráid")).toBe("shráid");
        expect(mutate("len1", "stáid")).toBe("stáid");
      });

      test("Lenition 1D", () => {
        expect(mutate("len1D", "freagair")).toBe("d'fhreagair");
        expect(mutate("len1D", "ól")).toBe("d'ól");
      });
    });

    test("Lenition 2", () => {
      expect(mutate("len2", "póg")).toBe("phóg");
      expect(mutate("len2", "bád")).toBe("bhád");
      expect(mutate("len2", "máthair")).toBe("mháthair");
      // No mutation
      expect(mutate("len2", "teaghlach")).toBe("teaghlach");
      expect(mutate("len2", "deoir")).toBe("deoir");
      expect(mutate("len2", "sráid")).toBe("sráid");
      expect(mutate("len2", "stáid")).toBe("stáid");
    });

    test("Lenition 3", () => {
      expect(mutate("len3", "póg")).toBe("phóg");
      expect(mutate("len3", "bád")).toBe("bhád");
      expect(mutate("len3", "máthair")).toBe("mháthair");
      expect(mutate("len3", "teaghlach")).toBe("teaghlach");
      expect(mutate("len3", "sráid")).toBe("tsráid");
      // No mutation
      expect(mutate("len3", "deoir")).toBe("deoir");
      expect(mutate("len3", "stáid")).toBe("stáid");
    });

    describe("Eclipsis 1", () => {
      expect(mutate("ecl1", "póg")).toBe("bpóg");
      expect(mutate("ecl1", "bád")).toBe("mbád");
      expect(mutate("ecl1", "freagair")).toBe("bhfreagair");
      expect(mutate("ecl1", "ceol")).toBe("gceol");
      expect(mutate("ecl1", "gairdín")).toBe("ngairdín");
      // Special for ecl1
      expect(mutate("ecl1", "teaghlach")).toBe("dteaghlach");
      expect(mutate("ecl1", "deoir")).toBe("ndeoir");
      expect(mutate("ecl1", "úll")).toBe("n-úll");
      expect(mutate("ecl1", "Úll")).toBe("nÚll");

      test("Eclipsis 1x does not eclipse vowels", () => {
        expect(mutate("ecl1x", "úll")).toBe("úll");
      });
    });

    test("Eclipsis 2", () => {
      expect(mutate("ecl2", "póg")).toBe("bpóg");
      expect(mutate("ecl2", "bád")).toBe("mbád");
      expect(mutate("ecl2", "freagair")).toBe("bhfreagair");
      expect(mutate("ecl2", "ceol")).toBe("gceol");
      expect(mutate("ecl2", "gairdín")).toBe("ngairdín");
      // Ecl2 does not mutate "t" and "d"
      expect(mutate("ecl2", "teaghlach")).toBe("teaghlach");
      expect(mutate("ecl2", "deoir")).toBe("deoir");
    });

    test("Eclipsis 3", () => {
      expect(mutate("ecl3", "póg")).toBe("bpóg");
      expect(mutate("ecl3", "bád")).toBe("mbád");
      expect(mutate("ecl3", "freagair")).toBe("bhfreagair");
      expect(mutate("ecl3", "ceol")).toBe("gceol");
      expect(mutate("ecl3", "gairdín")).toBe("ngairdín");
      // Special for ecl3
      expect(mutate("ecl3", "sráid")).toBe("tsráid");
      expect(mutate("ecl3", "teaghlach")).toBe("teaghlach");
      expect(mutate("ecl3", "deoir")).toBe("deoir");
    });

    test("Prefix T", () => {
      expect(mutate("prefT", "eolas")).toBe("t-eolas");
      expect(mutate("prefT", "uisce")).toBe("t-uisce");
      expect(mutate("prefT", "úll")).toBe("t-úll");
      expect(mutate("prefT", "Úll")).toBe("tÚll");
    });

    test("Prefix h", () => {
      expect(mutate("prefH", "eolas")).toBe("heolas");
      expect(mutate("prefH", "uisce")).toBe("huisce");
      expect(mutate("prefH", "úll")).toBe("húll");
      expect(mutate("prefH", "Úll")).toBe("hÚll");
    });
  });

  test("Slenderize regular", () => {
    expect(palatalize("fear")).toBe("fir");
    expect(palatalize("béal")).toBe("béil");
    expect(palatalize("iasc")).toBe("éisc");
    expect(palatalize("síol")).toBe("síl");
    expect(palatalize("fionn")).toBe("finn");
    expect(palatalize("aer")).toBe("aeir");
    expect(palatalize("cearnóg")).toBe("cearnóig");
  });

  test("Slenderize irregular", () => {
    expect(palatalize("bád", "eiéí")).toBe("báeiéíd");
  });

  test("Broaden regular", () => {
    expect(broaden("fir", "fear")).toBe("fear");
    expect(broaden("béil", "béal")).toBe("béal");
    expect(broaden("síl", "síol")).toBe("síol");
  });

  test("Broaden irregular", () => {
    // TODO Come up with better example.
    expect(broaden("gniiic", "aá")).toBe("gniiaác");
  });

  test("Devoice", () => {
    expect(devoice("aaasd")).toBe("aaast");
  });

  test("Unduplicate", () => {
    expect(unduplicate("ball")).toBe("bal");
    expect(unduplicate("barr")).toBe("bar");
    expect(unduplicate("barróg")).toBe("barróg");
    expect(unduplicate("barrógach")).toBe("barrógach");
  });

  test("Syncope", () => {
    expect(syncope("cathair")).toBe("cathr");
    expect(syncope("obair")).toBe("obr");
  });

  test("prefix", () => {
    expect(prefix("sean", "nós")).toBe("sean-nós");
    expect(prefix("ró", "éasca")).toBe("ró-éasca");
    expect(prefix("sean", "Éireannach")).toBe("Sean-Éireannach");
    // Absurd example, don't forget the lenition.
    expect(prefix("blah", "blah")).toBe("blahbhlah");
  });

  test("Emphasize", () => {
    expect(emphasize("mil", "sanSean")).toBe("milsean");
    expect(emphasize("mí", "saSe")).toBe("míse");
    // TODO example with naNe
  });

  test("Count syllables", () => {
    expect(countSyllables("cathair")).toBe(2);
    expect(countSyllables("obair")).toBe(2);
    expect(countSyllables("aer")).toBe(1);
    expect(countSyllables("bád")).toBe(1);
    expect(countSyllables("i")).toBe(1);
  });
});
