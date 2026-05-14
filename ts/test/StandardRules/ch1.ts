import test from "node:test";
import assert from "node:assert";
import { getExistingDb, Repository } from "../../repository";
import path from "node:path";
import { _nn } from "../../util";
import { NounPhrase } from "../../model/nounPhrase";

const db = getExistingDb(path.join(__dirname, "../../../output/buNaMo.sqlite"));
const repository = new Repository(db);
repository.initialize().then(async () => {
  await test("Chapter 1: Article rules", async () => {
    await test("1.2 The Nominative Case and the Singular Accusative Case", async () => {
      const noun = _nn(
        repository.getNounsByLemma("cnoc")
          .mapIfOk(x => x[0])
          .unwrapOr(null), "Noun not found"
      );

      const phrase = NounPhrase.fromNoun(noun);

      assert.equal(phrase.forms.sgNomArt[0].value, "an cnoc");
    });
  });
});