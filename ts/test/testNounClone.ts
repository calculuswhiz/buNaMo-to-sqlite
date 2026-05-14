import test from "node:test";
import assert from "node:assert";
import { Noun, NounForm } from "../model/noun";

test("Test noun clone doesn't affect original", () => {
  const noun = new Noun({
    declension: 1,
    isProper: false,
    isImmutable: false,
    isDefinite: false,
    allowArticledGenitive: true,
    disambig: "",
    forms: {
      sgNom: [new NounForm({ formName: "sgNom", value: "cat", gender: "masc", strength: "strong" })],
      sgGen: [new NounForm({ formName: "sgGen", value: "cait", gender: "masc", strength: "strong" })],
      sgVoc: [],
      sgDat: [],
      plNom: [new NounForm({ formName: "plNom", value: "cait", gender: "masc", strength: "strong" })],
      plGen: [new NounForm({ formName: "plGen", value: "cat", gender: "masc", strength: "strong" })],
      plVoc: [],
      count: []
    }
  });

  const clonedNoun = noun.clone();
  clonedNoun.forms.sgNom[0].value = "dog";

  assert.notEqual(noun.getLemma(), clonedNoun.getLemma());
});