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
      const getNoun = (lemma: string, backup: Noun | null = null) => _nn(
        repository.getNounsByLemma(lemma)
          .mapIfOk(x => x[0])
          .unwrapOr(backup), `Noun not found: ${lemma}`
      );
      const getSgNomArt = (lemma: string | Noun, backup: Noun | null = null) => {
        const noun = typeof lemma === "string"
          ? getNoun(lemma, backup)
          : lemma;
        return NounPhrase.fromNoun(noun).forms.sgNomArt[0].value;
      };

      await test("Masculine initial consonant does not change", () => {
        assert.equal(getSgNomArt("cnoc"), "an cnoc");
        assert.equal(getSgNomArt("diabhal"), "an diabhal");
        assert.equal(getSgNomArt("fear"), "an fear");
        assert.equal(getSgNomArt("saol"), "an saol");
        assert.equal(getSgNomArt("Seapánach"), "an Seapánach");
        assert.equal(getSgNomArt("teach"), "an teach");
      });

      await test("Masculine initial vowel takes 't-'", () => {
        assert.equal(getSgNomArt("íochtar"), "an t-íochtar");
        assert.equal(getSgNomArt("uisce"), "an t-uisce");
        assert.equal(getSgNomArt("alt"), "an t-alt");
        assert.equal(getSgNomArt(makeQuickNoun("Acht", "masc")), "an tAcht");
        assert.equal(getSgNomArt(makeQuickNoun("Ultach", "masc")), "an tUltach");
      });

      await test("Feminine initial consonant", async () => {
        await test("lenition if applicable", () => {
          assert.equal(getSgNomArt("fuinneog"), "an fhuinneog");
          assert.equal(getSgNomArt("caibidil"), "an chaibidil");
        });

        await test("no change to d or t", () => {
          assert.equal(getSgNomArt("deoch"), "an deoch");
          assert.equal(getSgNomArt("teanga"), "an teanga");
        });

        await test("t precedes s where applicable", () => {
          assert.equal(getSgNomArt("sráid"), "an tsráid");
          assert.equal(getSgNomArt(makeQuickNoun("Seapáin", "fem")), "an tSeapáin");
        });
      });

      await test("Feminine initial vowel does not change", () => {
        assert.equal(getSgNomArt("áit"), "an áit");
        assert.equal(getSgNomArt(makeQuickNoun("Astráil", "fem")), "an Astráil");
        assert.equal(getSgNomArt(makeQuickNoun("Iodáil", "fem")), "an Iodáil");
        assert.equal(getSgNomArt("obair"), "an obair");
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

      await test("1.4.2: No change is done to masculine nouns starting with s in the dative case. A t precedes an s in feminine nouns (other than when the noun starts with sc-, sf-, sm-, sp-, st- or sv- which are left bare)", () => {
        const cases = [
          // Cliste not in db, changed to cliseach
          ["ag", "Seapánach", "cliseach", "ag an Seapánach cliseach"],
          ["ag", "seanmháthair", "bocht", "ag an tseanmháthair bhocht"],
          ["ar", "suíochán", "fliuch", "ar an suíochán fliuch"],
          ["ar", "sráid", "glan", "ar an tsráid ghlan"],
          ["as", "sailéad", "blasta", "as an sailéad blasta"],
          ["as", "saoire", "bliantúil", "as an tsaoire bhliantúil"],

          ["chuig", "seanadóir", "cliseach", "chuig an seanadóir cliseach"],
          ["chuig", "satailít", "mór", "chuig an tsatailít mhór"],
          ["de", "saighdiúir", "sásúil", "den saighdiúir sásúil"],
          ["de", "slándáil", "sóisialach", "den tslándáil shóisialach"],
          ["do", "seanad", "nua", "don seanad nua"],
          ["do", "saoirse", "ceart", "don tsaoirse cheart"],
          // ["fairis", "saineolaí", "lách", "fairis an saineolaí lách"],
          // ["fairis", "seanbhean", "saibhir", "fairis an tseanbhean shaibhir"],
          ["faoi", "sonrasc", "déanach", "faoin sonrasc déanach"],
          ["faoi", "slí", "díreach", "faoin tslí dhíreach"],
          ["i", "soitheach", "gorm", "sa soitheach gorm"],
          ["i", "seacláid", "milis", "sa tseacláid mhilis"],
          ["le", "salann", "bán", "leis an salann bán"],
          ["le", "slat", "fada", "leis an tslat fhada"],
          ["ó", "suirbhé", "pearsanta", "ón suirbhé pearsanta"],
          ["ó", "scoil", "beag", "ón scoil bheag"],
          ["roimh", "samhradh", "fada", "roimh an samhradh fada"],
          ["roimh", "seachtain", "mór", "roimh an tseachtain mhór"],
          ["thar", "seol", "mór", "thar an seol mór"],
          // ["thar", "Sionainn", "fada", "thar an tSionainn fhada", "fem"],
          ["trí", "sorcas", "mór", "tríd an sorcas mór"],
          ["trí", "seift", "cliseach", "tríd an tseift chliseach"],
          ["um", "sainchomhairleoir", "cruinn", "um an sainchomhairleoir cruinn"],
          ["um", "seirbhís", "maith", "um an tseirbhís mhaith"],
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