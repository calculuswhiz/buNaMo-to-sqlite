import test from "node:test";
import assert from "node:assert";
import { getExistingDb, Repository } from "../../repository";
import path from "node:path";
import { _nn } from "../../util";
import { NounPhrase } from "../../model/nounPhrase";
import { Noun, NounForm } from "../../model/noun";
import type { Gender } from "../../features";
import { PrepositionalPhrase } from "../../model/prepositionalPhrase";

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

    // Standard appears to use the Southern form for the Core System
    await test("1.4 The Dative Singular Case — The Core System", async () => {
      await test("1.4.1: ...nouns starting with a consonant (other than d, t and s), lenition is applied to them following den, don, sa/san and eclipsis in every other context", () => {
        const cases = [
          // Prep, Noun, Modifier, Expected
          ["ag", "fear", "maith", "ag an bhfear maith"],
          ["ag", "cuideachta", "beag", "ag an gcuideachta bheag"],
          ["ar", "bosca", "dearg", "ar an mbosca dearg"],
          ["ar", "bean", "saibhir", "ar an mbean shaibhir"],
          ["as", "gleann", "mór", "as an ngleann mór"],
          ["as", "páirc", "céanna", "as an bpáirc chéanna"],
          // Lower cased the title. Not testing casing here.
          ["chuig", "coimisinéir", "coinsiasach", "chuig an gcoimisinéir coinsiasach"],
          ["chuig", "bean", "gairmiúil", "chuig an mbean ghairmiúil"],
          ["de", "crann", "caol", "den chrann caol"],
          ["de", "bean", "flaithiúil", "den bhean fhlaithiúil"],
          ["do", "fear", "trom", "don fhear trom"],
          ["do", "cuideachta", "gnóthach", "don chuideachta ghnóthach"],
          // TODO Fara not found in database
          // ["fairis", "garda", "béasach", "fairis an ngarda béasach"],
          // ["fairis", "bean", "chairdiúil", "fairis an mbean chairdiúil"],
          ["faoi", "fógra", "práinneach", "faoin bhfógra práinneach"],
          ["faoi", "grian", "breá", "faoin ngrian bhreá"],
          ["i", "bosca", "buí", "sa bhosca buí"],
          ["i", "fraoch", "bán", "sa fhraoch bán"],
          ["i", "féar", "fliuch", "san fhéar fliuch"],
          ["i", "comhairle", "sóisialta", "sa chomhairle shóisialta"],
          ["i", "frithréabhlóid", "fíochmhar", "sa fhrithréabhlóid fhíochmhar"],
          ["i", "farraige", "glan", "san fharraige ghlan"],
          ["le", "fasach", "cruinn", "leis an bhfasach cruinn"],
          ["le", "báisteach", "trom", "leis an mbáisteach throm"],
          ["ó", "caisleán", "fuar", "ón gcaisleán fuar"],
          ["ó", "cathair", "mór", "ón gcathair mhór"],
          ["roimh", "cruinniú", "tábhachtach", "roimh an gcruinniú tábhachtach"],
          ["roimh", "bainis", "beag", "roimh an mbainis bheag"],
          ["thar", "cnoc", "bán", "thar an gcnoc bán"],
          ["thar", "farraige", "ciúin", "thar an bhfarraige chiúin"],
          ["trí", "gairdín", "breá", "tríd an ngairdín breá"],
          ["trí", "fuinneog", "gorm", "tríd an bhfuinneog ghorm"],
          // Lowercased
          ["um", "bille", "fada", "um an mbille fada"],
          ["um", "gníomhaireacht", "reachtúil", "um an ngníomhaireacht reachtúil"],
        ];

        for (const test of cases) {
          const prep = _nn(
            repository.getPrepositionsByLemma(test[0])
              .mapIfOk(x => x[0])
              .unwrapOr(null), `Preposition not found: ${test[0]}`
          );

          const noun = _nn(
            repository.getNounsByLemma(test[1])
              .mapIfOk(x => x[0])
              .unwrapOr(null), `Noun not found: ${test[1]}`
          );

          assert.ok(noun.forms.sgDat.length > 0, "Noun has no dative singular form. Did you initialize the forms first?");

          const adjective = _nn(
            repository.getAdjectivesByLemma(test[2])
              .mapIfOk(x => x[0])
              .unwrapOr(null), `Adjective not found: ${test[2]}`
          );

          const nounPhrase = NounPhrase.fromModifiedNoun(noun, adjective);

          const prepositionalPhrase = new PrepositionalPhrase(prep, nounPhrase);

          const formResult = prepositionalPhrase.getForm("sgArtS");
          if (!formResult.isOk) {
            throw formResult.error;
          }
          const form = formResult.value[0];
          assert.equal(form, test[3]);
        }
      });
    });
  });
});