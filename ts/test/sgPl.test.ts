// Tests for singularInfo/pluralInfo functions
import { test, describe, expect } from "bun:test";
import { getSingularInfoA, getSingularInfoC, getSingularInfoD, getSingularInfoE } from "../model/singularInfo";
import { pluralizeLgC } from "../model/pluralInfo";

// Tests at least as asserted by comments in singularInfo.ts

describe("SingularInfo", async () => {
  test("getSingularInfoC", () => {
    expect(getSingularInfoC("cailleach", "fem", "Genitive")).toEqual(["caillí"]);
    expect(getSingularInfoC("bacach", "masc", "Vocative")).toEqual(["bacaigh"]);
    expect(getSingularInfoC("bacach", "masc", "Dative")).toEqual(["bacach"]);
    expect(getSingularInfoC("bacach", "fem", "Vocative")).toEqual(["bacach"]);
  });

  test("getSingularInfoE", () => {
    expect(getSingularInfoE("tarraingt", "Genitive", false, false)).toEqual(["tarraingthe"]);
    expect(getSingularInfoE("scrúdú", "Genitive", false, false)).toEqual(["scrúdaithe"]);
  });

  test("getSingularInfoA", () => {
    expect(getSingularInfoA("bagairt", "Genitive", false)).toEqual(["bagartha"]);
    // Seems to fail in original C# code too? Probably typo in DB.
    expect(getSingularInfoA("cionroinnt", "Genitive", false)).toEqual(["cionranna"]);
    expect(getSingularInfoA("canúint", "Genitive", false)).toEqual(["canúna"]);
  });

  test("getSingularInfoD", () => {
    expect(getSingularInfoD("cara", "Genitive")).toEqual(["carad"]);
    expect(getSingularInfoD("fiche", "Genitive")).toEqual(["fichead"]);
  });
});

describe("PluralInfo", async () => {
  test("pluralizeLgC", () => {
    expect(pluralizeLgC("bacach", "Nominative")).toEqual(["bacaigh"]);
  });
});
