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
    const getNoun = (lemma: string, backup: Noun | null = null) => _nn(
      repository.getNounsByLemma(lemma)
        .mapIfOk(x => x[0])
        .unwrapOr(backup), `Noun not found: ${lemma}`
    );

    await test("1.2 The Nominative Case and the Singular Accusative Case", async () => {
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

    const getPreposition = (lemma: string) => _nn(
      repository.getPrepositionsByLemma(lemma)
        .mapIfOk(x => x[0])
        .unwrapOr(null), `Preposition not found: ${lemma}`
    );

    const getAdjective = (lemma: string) => _nn(
      repository.getAdjectivesByLemma(lemma)
        .mapIfOk(x => x[0])
        .unwrapOr(null), `Adjective not found: ${lemma}`
    );

    const getPrepositionalPhraseForm = (prepLemma: string, nounLemma: string, adjLemma: string) => {
      const prep = getPreposition(prepLemma);
      const noun = getNoun(nounLemma);
      const adj = getAdjective(adjLemma);
      const nounPhrase = NounPhrase.fromModifiedNoun(noun, adj);
      const prepositionalPhrase = new PrepositionalPhrase(prep, nounPhrase);
      const formResult = prepositionalPhrase.getForm("sgArtS");
      if (!formResult.isOk) {
        throw new Error(`Form not found for: ${prepLemma} ${nounLemma} ${adjLemma}`);
      }
      return formResult.value[0];
    };

    // Standard appears to use the Southern form for the Core System
    await test("1.4 The Dative Singular Case — The Core System", async () => {
      await test("1.4.1: ...nouns starting with a consonant (other than d, t and s), lenition is applied to them following den, don, sa/san and eclipsis in every other context", () => {
        assert.equal(getPrepositionalPhraseForm("ag", "fear", "maith"), "ag an bhfear maith");
        assert.equal(getPrepositionalPhraseForm("ag", "cuideachta", "beag"), "ag an gcuideachta bheag");
        assert.equal(getPrepositionalPhraseForm("ar", "bosca", "dearg"), "ar an mbosca dearg");
        assert.equal(getPrepositionalPhraseForm("ar", "bean", "saibhir"), "ar an mbean shaibhir");
        assert.equal(getPrepositionalPhraseForm("as", "gleann", "mór"), "as an ngleann mór");
        assert.equal(getPrepositionalPhraseForm("as", "páirc", "céanna"), "as an bpáirc chéanna");
        // Lower cased the title. Not testing casing here.
        assert.equal(getPrepositionalPhraseForm("chuig", "coimisinéir", "coinsiasach"), "chuig an gcoimisinéir coinsiasach");
        assert.equal(getPrepositionalPhraseForm("chuig", "bean", "gairmiúil"), "chuig an mbean ghairmiúil");
        assert.equal(getPrepositionalPhraseForm("de", "crann", "caol"), "den chrann caol");
        assert.equal(getPrepositionalPhraseForm("de", "bean", "flaithiúil"), "den bhean fhlaithiúil");
        assert.equal(getPrepositionalPhraseForm("do", "fear", "trom"), "don fhear trom");
        assert.equal(getPrepositionalPhraseForm("do", "cuideachta", "gnóthach"), "don chuideachta ghnóthach");
        // TODO Fara not found in database
        // assert.equal(getPrepositionalPhraseForm("fairis", "garda", "béasach"), "fairis an ngarda béasach");
        // assert.equal(getPrepositionalPhraseForm("fairis", "bean", "chairdiúil"), "fairis an mbean chairdiúil");
        assert.equal(getPrepositionalPhraseForm("faoi", "fógra", "práinneach"), "faoin bhfógra práinneach");
        assert.equal(getPrepositionalPhraseForm("faoi", "grian", "breá"), "faoin ngrian bhreá");
        assert.equal(getPrepositionalPhraseForm("i", "bosca", "buí"), "sa bhosca buí");
        assert.equal(getPrepositionalPhraseForm("i", "fraoch", "bán"), "sa fhraoch bán");
        assert.equal(getPrepositionalPhraseForm("i", "féar", "fliuch"), "san fhéar fliuch");
        assert.equal(getPrepositionalPhraseForm("i", "comhairle", "sóisialta"), "sa chomhairle shóisialta");
        assert.equal(getPrepositionalPhraseForm("i", "frithréabhlóid", "fíochmhar"), "sa fhrithréabhlóid fhíochmhar");
        assert.equal(getPrepositionalPhraseForm("i", "farraige", "glan"), "san fharraige ghlan");
        assert.equal(getPrepositionalPhraseForm("le", "fasach", "cruinn"), "leis an bhfasach cruinn");
        assert.equal(getPrepositionalPhraseForm("le", "báisteach", "trom"), "leis an mbáisteach throm");
        assert.equal(getPrepositionalPhraseForm("ó", "caisleán", "fuar"), "ón gcaisleán fuar");
        assert.equal(getPrepositionalPhraseForm("ó", "cathair", "mór"), "ón gcathair mhór");
        assert.equal(getPrepositionalPhraseForm("roimh", "cruinniú", "tábhachtach"), "roimh an gcruinniú tábhachtach");
        assert.equal(getPrepositionalPhraseForm("roimh", "bainis", "beag"), "roimh an mbainis bheag");
        assert.equal(getPrepositionalPhraseForm("thar", "cnoc", "bán"), "thar an gcnoc bán");
        assert.equal(getPrepositionalPhraseForm("thar", "farraige", "ciúin"), "thar an bhfarraige chiúin");
        assert.equal(getPrepositionalPhraseForm("trí", "gairdín", "breá"), "tríd an ngairdín breá");
        assert.equal(getPrepositionalPhraseForm("trí", "fuinneog", "gorm"), "tríd an bhfuinneog ghorm");
        // Lowercased
        assert.equal(getPrepositionalPhraseForm("um", "bille", "fada"), "um an mbille fada");
        assert.equal(getPrepositionalPhraseForm("um", "gníomhaireacht", "reachtúil"), "um an ngníomhaireacht reachtúil");
      });

      await test("1.4.2: No change is done to masculine nouns starting with s in the dative case. A t precedes an s in feminine nouns (other than when the noun starts with sc-, sf-, sm-, sp-, st- or sv- which are left bare)", () => {
        // Cliste not in db, changed to cliseach
        assert.equal(getPrepositionalPhraseForm("ag", "Seapánach", "cliseach"), "ag an Seapánach cliseach");
        assert.equal(getPrepositionalPhraseForm("ag", "seanmháthair", "bocht"), "ag an tseanmháthair bhocht");
        assert.equal(getPrepositionalPhraseForm("ar", "suíochán", "fliuch"), "ar an suíochán fliuch");
        assert.equal(getPrepositionalPhraseForm("ar", "sráid", "glan"), "ar an tsráid ghlan");
        assert.equal(getPrepositionalPhraseForm("as", "sailéad", "blasta"), "as an sailéad blasta");
        assert.equal(getPrepositionalPhraseForm("as", "saoire", "bliantúil"), "as an tsaoire bhliantúil");

        assert.equal(getPrepositionalPhraseForm("chuig", "seanadóir", "cliseach"), "chuig an seanadóir cliseach");
        assert.equal(getPrepositionalPhraseForm("chuig", "satailít", "mór"), "chuig an tsatailít mhór");
        assert.equal(getPrepositionalPhraseForm("de", "saighdiúir", "sásúil"), "den saighdiúir sásúil");
        assert.equal(getPrepositionalPhraseForm("de", "slándáil", "sóisialach"), "den tslándáil shóisialach");
        assert.equal(getPrepositionalPhraseForm("do", "seanad", "nua"), "don seanad nua");
        assert.equal(getPrepositionalPhraseForm("do", "saoirse", "ceart"), "don tsaoirse cheart");
        // assert.equal(getPrepositionalPhraseForm("fairis", "saineolaí", "lách"), "fairis an saineolaí lách");
        // assert.equal(getPrepositionalPhraseForm("fairis", "seanbhean", "saibhir"), "fairis an tseanbhean shaibhir");
        assert.equal(getPrepositionalPhraseForm("faoi", "sonrasc", "déanach"), "faoin sonrasc déanach");
        assert.equal(getPrepositionalPhraseForm("faoi", "slí", "díreach"), "faoin tslí dhíreach");
        assert.equal(getPrepositionalPhraseForm("i", "soitheach", "gorm"), "sa soitheach gorm");
        assert.equal(getPrepositionalPhraseForm("i", "seacláid", "milis"), "sa tseacláid mhilis");
        assert.equal(getPrepositionalPhraseForm("le", "salann", "bán"), "leis an salann bán");
        assert.equal(getPrepositionalPhraseForm("le", "slat", "fada"), "leis an tslat fhada");
        assert.equal(getPrepositionalPhraseForm("ó", "suirbhé", "pearsanta"), "ón suirbhé pearsanta");
        assert.equal(getPrepositionalPhraseForm("ó", "scoil", "beag"), "ón scoil bheag");
        assert.equal(getPrepositionalPhraseForm("roimh", "samhradh", "fada"), "roimh an samhradh fada");
        assert.equal(getPrepositionalPhraseForm("roimh", "seachtain", "mór"), "roimh an tseachtain mhór");
        assert.equal(getPrepositionalPhraseForm("thar", "seol", "mór"), "thar an seol mór");
        // assert.equal(getPrepositionalPhraseForm("thar", "Sionainn", "fada"), "thar an tSionainn fhada", "fem");
        assert.equal(getPrepositionalPhraseForm("trí", "sorcas", "mór"), "tríd an sorcas mór");
        assert.equal(getPrepositionalPhraseForm("trí", "seift", "cliseach"), "tríd an tseift chliseach");
        assert.equal(getPrepositionalPhraseForm("um", "sainchomhairleoir", "cruinn"), "um an sainchomhairleoir cruinn");
        assert.equal(getPrepositionalPhraseForm("um", "seirbhís", "maith"), "um an tseirbhís mhaith");
      });
    });
  });
});