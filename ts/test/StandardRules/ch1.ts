import test from "node:test";
import assert from "node:assert";
import { getExistingDb, Repository } from "../../repository";
import path from "node:path";
import { _nn } from "../../util";
import { NounPhrase } from "../../model/nounPhrase";
import { Noun, NounForm } from "../../model/noun";

const db = getExistingDb(path.join(__dirname, "../../../output/buNaMo.sqlite"));
const repository = new Repository(db);
repository.initialize().then(async () => {
  await test("Chapter 1: Article rules", async () => {
    await test("1.2 The Nominative Case and the Singular Accusative Case", async () => {
      await test("Masculine initial consonant does not change", () => {
        const cases = [
          "cnoc", "diabhal", "fear", "saol", "Seapánach", "teach"
        ];
        for (const lemma of cases) {
          const noun = _nn(
            repository.getNounsByLemma(lemma)
              .mapIfOk(x => x[0])
              .unwrapOr(null), "Noun not found"
          );

          const phrase = NounPhrase.fromNoun(noun);

          assert.equal(phrase.forms.sgNomArt[0].value, `an ${lemma}`);
        }
      });

      await test("Masculine initial vowel takes 't-'", () => {
        const cases = [
          "an t-íochtar",
          "an t-uisce",
          "an t-alt",
          "an tAcht",
          "an tUltach",
        ];
        for (const test of cases) {
          const noun = (repository.getNounsByLemma(test.replace(/^an t-?/, "")))
            .mapIfOk(x => x[0])
            .unwrapOr(new Noun({
              declension: 0,
              isProper: false,
              isImmutable: false,
              isDefinite: false,
              allowArticledGenitive: false,
              disambig: "",
              forms: {
                sgNom: [new NounForm({
                  value: test.replace(/^an t-?/, ""),
                  formName: "sgNom",
                  strength: "strong",
                  gender: "masc"
                })]
              }
            }));

          assert.equal(NounPhrase.fromNoun(noun).forms.sgNomArt[0].value, test);
        }
      });
    });
  });
});