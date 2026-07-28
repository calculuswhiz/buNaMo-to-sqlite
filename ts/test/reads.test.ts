import path from "node:path";
import { Repository, getExistingDb } from "../repository";
import { expect, test } from "bun:test";
import { _nn } from "../util";

// These just test db reads. Grammar specific functionality will be captured in another file

const db = getExistingDb(path.join(__dirname, "../../output/buNaMo.sqlite"));
const repository = new Repository(db);
await repository.initialize();

test("Test reading adjective data", async () => {
  const adjective = _nn(
    repository.getAdjectivesByLemma("féasógach")
      .mapOk(x => x[0])
      .unwrapOr(null),
    "Adjective not found"
  );

  expect(adjective.getLemma()).toBe("féasógach");

  expect(adjective.getComparativePresent()[0]).toBe("níos féasógaí");
  expect(adjective.getSuperlativePresent()[0]).toBe("is féasógaí");
  expect(adjective.getComparativePast()[0]).toBe("ní b'fhéasógaí");
  expect(adjective.getSuperlativePast()[0]).toBe("ab fhéasógaí");
});

test("Test reading noun data", () => {
  const noun = _nn(
    repository.getNounsByLemma("cat")
      .mapOk(x => x[0])
      .unwrapOr(null), "Noun not found");

  expect(noun.getLemma()).toBe("cat");
  expect(noun.getGender()).toBe("masc");
  expect(noun.forms.sgGen[0].value).toBe("cait");
  expect(noun.forms.plNom[0].value).toBe("cait");
  expect(noun.forms.plGen[0].value).toBe("cat");
});

test("Test reading noun phrase data", () => {
  const nounPhrase = _nn(
    repository.getNounPhrasesByLemma("fadhb mhór")
      .mapOk(x => x[0])
      .unwrapOr(null), "Noun phrase not found"
  );

  expect(nounPhrase.getLemma()).toBe("fadhb mhór");
  expect(nounPhrase.getGender()).toBe("fem");
  expect(nounPhrase.forms.sgGen[0].value).toBe("faidhbe móire");
  expect(nounPhrase.forms.sgNomArt[0].value).toBe("an fhadhb mhór");
  expect(nounPhrase.forms.sgGenArt[0].value).toBe("na faidhbe móire");
  expect(nounPhrase.forms.plNom[0].value).toBe("fadhbanna móra");
  expect(nounPhrase.forms.plGen[0].value).toBe("fadhbanna móra");
  expect(nounPhrase.forms.plNomArt[0].value).toBe("na fadhbanna móra");
  expect(nounPhrase.forms.plGenArt[0].value).toBe("na bhfadhbanna móra");
});

test("Test reading possessive data", () => {
  const possessive = _nn(
    repository.getPossessivesByLemma("mo")
      .mapOk(x => x[0])
      .unwrapOr(null), "Possessive not found"
  );

  expect(possessive.getLemma()).toBe("mo");
  expect(possessive.mutation).toBe("len1");
  expect(possessive.emphasizer).toBe("saSe");
  expect(possessive.forms.full[0].value).toBe("mo");
  expect(possessive.forms.apos[0].value).toBe("m'");
});

test("Test reading preposition data", () => {
  const preposition = _nn(
    repository.getPrepositionsByLemma("ag")
      .mapOk(x => x[0])
      .unwrapOr(null), "Preposition not found"
  );

  expect(preposition.getLemma()).toBe("ag");
  expect(preposition.disambig).toBe("");
  expect(preposition.forms.sg1[0].value).toBe("agam");
  expect(preposition.forms.sg2[0].value).toBe("agat");
  expect(preposition.forms.sg3Masc[0].value).toBe("aige");
  expect(preposition.forms.sg3Fem[0].value).toBe("aici");
  expect(preposition.forms.pl1[0].value).toBe("againn");
  expect(preposition.forms.pl2[0].value).toBe("agaibh");
  expect(preposition.forms.pl3[0].value).toBe("acu");
});

test("Test reading verb data", () => {
  const verb = _nn(
    repository.getVerbsByLemma("ól")
      .mapOk(x => x[0])
      .unwrapOr(null), "Verb not found"
  );

  expect(verb.getLemma()).toBe("ól");
  expect(verb.disambig).toBe("");
  expect(verb.forms.verbalNoun[0].value).toBe("ól");
  expect(verb.forms.verbalAdjective[0].value).toBe("ólta");
  expect(verb.forms.tenses.Pres.Indep.Base[0].value).toBe("ólann");
  expect(verb.forms.tenses.Pres.Indep.Sg1[0].value).toBe("ólaim");
});
