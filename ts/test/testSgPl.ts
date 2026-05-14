// Tests for singularInfo/pluralInfo functions
import test from "node:test";
import assert from "node:assert/strict";
import { getSingularInfoA, getSingularInfoC, getSingularInfoD, getSingularInfoE } from "../model/singularInfo";
import { pluralizeLgC } from "../model/pluralInfo";

// Tests at least as asserted by comments in singularInfo.ts

test("SingularInfo", async () => {
  await test("getSingularInfoC", () => {
    assert.deepEqual(getSingularInfoC("cailleach", "fem", "Genitive"), ["caillí"]);
    assert.deepEqual(getSingularInfoC("bacach", "masc", "Vocative"), ["bacaigh"]);
    assert.deepEqual(getSingularInfoC("bacach", "masc", "Dative"), ["bacach"]);
    assert.deepEqual(getSingularInfoC("bacach", "fem", "Vocative"), ["bacach"]);
  });

  await test("getSingularInfoE", () => {
    assert.deepEqual(getSingularInfoE("tarraingt", "Genitive", false, false), ["tarraingthe"]);
    assert.deepEqual(getSingularInfoE("scrúdú", "Genitive", false, false), ["scrúdaithe"]);
  });

  await test("getSingularInfoA", () => {
    assert.deepEqual(getSingularInfoA("bagairt", "Genitive", false), ["bagartha"]);
    // Seems to fail in original code too?
    assert.deepEqual(getSingularInfoA("cionroinnt", "Genitive", false), ["cionranna"]);
    assert.deepEqual(getSingularInfoA("canúint", "Genitive", false), ["canúna"]);
  });

  await test("getSingularInfoD", () => {
    assert.deepEqual(getSingularInfoD("cara", "Genitive"), ["carad"]);
    assert.deepEqual(getSingularInfoD("fiche", "Genitive"), ["fichead"]);
  });
});

test("PluralInfo", async () => {
  await test("pluralizeLgC", () => {
    assert.deepEqual(pluralizeLgC("bacach", "Nominative"), ["bacaigh"]);
  });
});
