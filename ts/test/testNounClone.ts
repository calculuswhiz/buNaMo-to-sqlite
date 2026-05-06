import test from "node:test";
import { Noun, NounForm } from "../model/noun";
import assert from "node:assert";

test("Test noun clone doesn't affect original", () => {
  const noun = new Noun({
    nounId: 1,
    declension: 1,
    isProper: false,
    isImmutable: false,
    isDefinite: false,
    allowArticledGenitive: true,
    disambig: "",
    forms: {
      sgNom: [new NounForm(1, 1, "sgNom", "cat", "masc", "strong")],
      sgGen: [new NounForm(2, 1, "sgGen", "cait", "masc", "strong")],
      sgVoc: [],
      sgDat: [],
      plNom: [new NounForm(3, 1, "plNom", "cait", "masc", "strong")],
      plGen: [new NounForm(4, 1, "plGen", "cat", "masc", "strong")],
      plVoc: [],
      count: []
    }
  });

  const clonedNoun = noun.clone();
  clonedNoun.forms.sgNom[0].value = "dog";

  assert.notEqual(noun.getLemma(), clonedNoun.getLemma());
});