import test from "node:test";
import assert from "node:assert";
import { getExistingDb, Repository } from "../../repository";
import path from "node:path";
import { _nn } from "../../util";
import { NounPhrase } from "../../model/nounPhrase";
import { Noun, NounForm } from "../../model/noun";
import type { Gender } from "../../features";

const db = getExistingDb(path.join(__dirname, "../../../output/buNaMo.sqlite"));
const repository = new Repository(db);
repository.initialize().then(async () => {
  const makeQuickNoun = (test: string, gender: Gender) => new Noun({
    declension: 0,
    isProper: false,
    isImmutable: false,
    isDefinite: false,
    allowArticledGenitive: false,
    disambig: "",
    forms: {
      sgNom: [new NounForm({
        value: test,
        formName: "sgNom",
        strength: "strong",
        gender
      })]
    }
  });

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
              .unwrapOr(null), `Noun not found: ${lemma}`
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
            .unwrapOr(makeQuickNoun(test.replace(/^an t-?/, ""), "masc"));

          assert.equal(NounPhrase.fromNoun(noun).forms.sgNomArt[0].value, test);
        }
      });

      await test("Feminine initial consonant", async () => {
        await test("lenition if applicable", () => {
          const cases = [
            ["fuinneog", "an fhuinneog"],
            ["caibidil", "an chaibidil"]
          ];
          for (const test of cases) {
            const noun = _nn(
              repository.getNounsByLemma(test[0])
                .mapIfOk(x => x[0])
                .unwrapOr(null), `Noun not found: ${test[0]}`
            );

            const phrase = NounPhrase.fromNoun(noun);
            assert.equal(phrase.forms.sgNomArt[0].value, test[1]);
          }
        });

        await test("no change to d or t", () => {
          const cases = [
            ["deoch", "an deoch"],
            ["teanga", "an teanga"]
          ];
          for (const test of cases) {
            const noun = _nn(
              repository.getNounsByLemma(test[0])
                .mapIfOk(x => x[0])
                .unwrapOr(null), `Noun not found: ${test[0]}`
            );

            const phrase = NounPhrase.fromNoun(noun);
            assert.equal(phrase.forms.sgNomArt[0].value, test[1]);
          }
        });

        await test("t precedes s where applicable", () => {
          const cases = [
            ["sráid", "an tsráid"],
            ["Seapáin", "an tSeapáin"]
          ];

          for (const test of cases) {
            const noun = _nn(
              repository.getNounsByLemma(test[0])
                .mapIfOk(x => x[0])
                .unwrapOr(makeQuickNoun(test[0], "fem")), `Noun not found: ${test[0]}`
            );

            const phrase = NounPhrase.fromNoun(noun);
            assert.equal(phrase.forms.sgNomArt[0].value, test[1]);
          }
        });
      });

      await test("Feminine initial vowel does not change", () => {
        const cases = [
          ["áit", "an áit"],
          ["Astráil", "an Astráil"],
          ["Iodáil", "an Iodáil"],
          ["obair", "an obair"]
        ];
        for (const test of cases) {
          const noun = _nn(
            repository.getNounsByLemma(test[0])
              .mapIfOk(x => x[0])
              .unwrapOr(makeQuickNoun(test[0], "fem")), `Noun not found: ${test[0]}`
          );

          const phrase = NounPhrase.fromNoun(noun);
          assert.equal(phrase.forms.sgNomArt[0].value, test[1]);
        }
      });
    });
  });
});