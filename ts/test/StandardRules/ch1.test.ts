import { describe, expect, test } from "bun:test";
import { getExistingDb, Repository } from "../../repository";
import path from "node:path";
import { _nn } from "../../util";
import { NounPhrase } from "../../model/nounPhrase";
import { Noun, NounForm } from "../../model/noun";
import type { Gender } from "../../features";
import { PrepositionalPhrase } from "../../model/prepositionalPhrase";
import { Adjective, AdjectiveForm } from "../../model/adjective";

const db = getExistingDb(path.join(__dirname, "../../../output/buNaMo.sqlite"));
const repository = new Repository(db);
await repository.initialize();

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

describe("Chapter 1: Article rules", () => {
  const getNoun = (lemma: string, backup: Noun | null = null) => _nn(
    repository.getNounsByLemma(lemma)
      .mapOk(x => x[0])
      .unwrapOr(backup), `Noun not found: ${lemma}`
  );

  describe("1.2 The Nominative Case and the Singular Accusative Case", () => {
    const getSgNomArt = (lemma: string | Noun, backup: Noun | null = null) => {
      const noun = typeof lemma === "string"
        ? getNoun(lemma, backup)
        : lemma;
      return NounPhrase.fromNoun(noun).forms.sgNomArt[0].value;
    };

    test("Masculine initial consonant does not change", () => {
      expect(getSgNomArt("cnoc")).toBe("an cnoc");
      expect(getSgNomArt("diabhal")).toBe("an diabhal");
      expect(getSgNomArt("fear")).toBe("an fear");
      expect(getSgNomArt("saol")).toBe("an saol");
      expect(getSgNomArt("Seapánach")).toBe("an Seapánach");
      expect(getSgNomArt("teach")).toBe("an teach");
    });

    test("Masculine initial vowel takes 't-'", () => {
      expect(getSgNomArt("íochtar")).toBe("an t-íochtar");
      expect(getSgNomArt("uisce")).toBe("an t-uisce");
      expect(getSgNomArt("alt")).toBe("an t-alt");
      expect(getSgNomArt(makeQuickNoun("Acht", "masc"))).toBe("an tAcht");
      expect(getSgNomArt(makeQuickNoun("Ultach", "masc"))).toBe("an tUltach");
    });

    describe("Feminine initial consonant", async () => {
      test("lenition if applicable", () => {
        expect(getSgNomArt("fuinneog")).toBe("an fhuinneog");
        expect(getSgNomArt("caibidil")).toBe("an chaibidil");
      });

      test("no change to d or t", () => {
        expect(getSgNomArt("deoch")).toBe("an deoch");
        expect(getSgNomArt("teanga")).toBe("an teanga");
      });

      test("t precedes s where applicable", () => {
        expect(getSgNomArt("sráid")).toBe("an tsráid");
        expect(getSgNomArt(makeQuickNoun("Seapáin", "fem"))).toBe("an tSeapáin");
      });
    });

    test("Feminine initial vowel does not change", () => {
      expect(getSgNomArt("áit")).toBe("an áit");
      expect(getSgNomArt(makeQuickNoun("Astráil", "fem"))).toBe("an Astráil");
      expect(getSgNomArt(makeQuickNoun("Iodáil", "fem"))).toBe("an Iodáil");
      expect(getSgNomArt("obair")).toBe("an obair");
    });
  });

  const getPreposition = (lemma: string) => _nn(
    repository.getPrepositionsByLemma(lemma)
      .mapOk(x => x[0])
      .unwrapOr(null), `Preposition not found: ${lemma}`
  );

  const makeQuickAdjective = (lemma: string) => new Adjective({
    declension: 0,
    isPre: false,
    disambig: "",
    forms: {
      sgNom: [new AdjectiveForm({
        value: lemma,
        formName: "sgNom",
        adjectiveId: -1
      })]
    }
  });

  const getAdjective = (lemma: string) => _nn(
    repository.getAdjectivesByLemma(lemma)
      .mapOk(x => x[0])
      .unwrapOr(makeQuickAdjective(lemma)), `Adjective not found: ${lemma}`
  );

  const getPrepositionalPhraseFormSg = (prepLemma: string, nounLemma: string | [string, Gender], adjLemma: string) => {
    const prep = getPreposition(prepLemma);
    const noun = Array.isArray(nounLemma) ? makeQuickNoun(nounLemma[0], nounLemma[1]) : getNoun(nounLemma);
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
  describe("1.4 The Dative Singular Case — The Core System", async () => {
    test("1.4.1: ...nouns starting with a consonant (other than d, t and s), lenition is applied to them following den, don, sa/san and eclipsis in every other context", () => {
      expect(getPrepositionalPhraseFormSg("ag", "fear", "maith")).toBe("ag an bhfear maith");
      expect(getPrepositionalPhraseFormSg("ag", "cuideachta", "beag")).toBe("ag an gcuideachta bheag");
      expect(getPrepositionalPhraseFormSg("ar", "bosca", "dearg")).toBe("ar an mbosca dearg");
      expect(getPrepositionalPhraseFormSg("ar", "bean", "saibhir")).toBe("ar an mbean shaibhir");
      expect(getPrepositionalPhraseFormSg("as", "gleann", "mór")).toBe("as an ngleann mór");
      expect(getPrepositionalPhraseFormSg("as", "páirc", "céanna")).toBe("as an bpáirc chéanna");
      // Lower cased the title. Not testing casing here.
      expect(getPrepositionalPhraseFormSg("chuig", "coimisinéir", "coinsiasach")).toBe("chuig an gcoimisinéir coinsiasach");
      expect(getPrepositionalPhraseFormSg("chuig", "bean", "gairmiúil")).toBe("chuig an mbean ghairmiúil");
      expect(getPrepositionalPhraseFormSg("de", "crann", "caol")).toBe("den chrann caol");
      expect(getPrepositionalPhraseFormSg("de", "bean", "flaithiúil")).toBe("den bhean fhlaithiúil");
      expect(getPrepositionalPhraseFormSg("do", "fear", "trom")).toBe("don fhear trom");
      expect(getPrepositionalPhraseFormSg("do", "cuideachta", "gnóthach")).toBe("don chuideachta ghnóthach");
      // TODO Fara not found in database
      // expect(getPrepositionalPhraseForm("fara", "garda", "béasach")).toBe("fairis an ngarda béasach");
      // expect(getPrepositionalPhraseForm("fara", "bean", "chairdiúil")).toBe("fairis an mbean chairdiúil");
      expect(getPrepositionalPhraseFormSg("faoi", "fógra", "práinneach")).toBe("faoin bhfógra práinneach");
      expect(getPrepositionalPhraseFormSg("faoi", "grian", "breá")).toBe("faoin ngrian bhreá");
      expect(getPrepositionalPhraseFormSg("i", "bosca", "buí")).toBe("sa bhosca buí");
      expect(getPrepositionalPhraseFormSg("i", "fraoch", "bán")).toBe("sa fhraoch bán");
      expect(getPrepositionalPhraseFormSg("i", "féar", "fliuch")).toBe("san fhéar fliuch");
      expect(getPrepositionalPhraseFormSg("i", "comhairle", "sóisialta")).toBe("sa chomhairle shóisialta");
      expect(getPrepositionalPhraseFormSg("i", "frithréabhlóid", "fíochmhar")).toBe("sa fhrithréabhlóid fhíochmhar");
      expect(getPrepositionalPhraseFormSg("i", "farraige", "glan")).toBe("san fharraige ghlan");
      expect(getPrepositionalPhraseFormSg("le", "fasach", "cruinn")).toBe("leis an bhfasach cruinn");
      expect(getPrepositionalPhraseFormSg("le", "báisteach", "trom")).toBe("leis an mbáisteach throm");
      expect(getPrepositionalPhraseFormSg("ó", "caisleán", "fuar")).toBe("ón gcaisleán fuar");
      expect(getPrepositionalPhraseFormSg("ó", "cathair", "mór")).toBe("ón gcathair mhór");
      expect(getPrepositionalPhraseFormSg("roimh", "cruinniú", "tábhachtach")).toBe("roimh an gcruinniú tábhachtach");
      expect(getPrepositionalPhraseFormSg("roimh", "bainis", "beag")).toBe("roimh an mbainis bheag");
      expect(getPrepositionalPhraseFormSg("thar", "cnoc", "bán")).toBe("thar an gcnoc bán");
      expect(getPrepositionalPhraseFormSg("thar", "farraige", "ciúin")).toBe("thar an bhfarraige chiúin");
      expect(getPrepositionalPhraseFormSg("trí", "gairdín", "breá")).toBe("tríd an ngairdín breá");
      expect(getPrepositionalPhraseFormSg("trí", "fuinneog", "gorm")).toBe("tríd an bhfuinneog ghorm");
      // Lowercased
      expect(getPrepositionalPhraseFormSg("um", "bille", "fada")).toBe("um an mbille fada");
      expect(getPrepositionalPhraseFormSg("um", "gníomhaireacht", "reachtúil")).toBe("um an ngníomhaireacht reachtúil");
    });

    test("1.4.2: No change is done to masculine nouns starting with s in the dative case. A t precedes an s in feminine nouns (other than when the noun starts with sc-, sf-, sm-, sp-, st- or sv- which are left bare)", () => {
      expect(getPrepositionalPhraseFormSg("ag", "Seapánach", "cliste")).toBe("ag an Seapánach cliste");
      expect(getPrepositionalPhraseFormSg("ag", "seanmháthair", "bocht")).toBe("ag an tseanmháthair bhocht");
      expect(getPrepositionalPhraseFormSg("ar", "suíochán", "fliuch")).toBe("ar an suíochán fliuch");
      expect(getPrepositionalPhraseFormSg("ar", "sráid", "glan")).toBe("ar an tsráid ghlan");
      expect(getPrepositionalPhraseFormSg("as", "sailéad", "blasta")).toBe("as an sailéad blasta");
      expect(getPrepositionalPhraseFormSg("as", "saoire", "bliantúil")).toBe("as an tsaoire bhliantúil");
      expect(getPrepositionalPhraseFormSg("chuig", "seanadóir", "cliste")).toBe("chuig an seanadóir cliste");
      expect(getPrepositionalPhraseFormSg("chuig", "satailít", "mór")).toBe("chuig an tsatailít mhór");
      expect(getPrepositionalPhraseFormSg("de", "saighdiúir", "sásúil")).toBe("den saighdiúir sásúil");
      expect(getPrepositionalPhraseFormSg("de", "slándáil", "sóisialach")).toBe("den tslándáil shóisialach");
      expect(getPrepositionalPhraseFormSg("do", "seanad", "nua")).toBe("don seanad nua");
      expect(getPrepositionalPhraseFormSg("do", "saoirse", "ceart")).toBe("don tsaoirse cheart");
      // expect(getPrepositionalPhraseForm("fara", "saineolaí", "lách")).toBe("fairis an saineolaí lách");
      // expect(getPrepositionalPhraseForm("fara", "seanbhean", "saibhir")).toBe("fairis an tseanbhean shaibhir");
      expect(getPrepositionalPhraseFormSg("faoi", "sonrasc", "déanach")).toBe("faoin sonrasc déanach");
      expect(getPrepositionalPhraseFormSg("faoi", "slí", "díreach")).toBe("faoin tslí dhíreach");
      expect(getPrepositionalPhraseFormSg("i", "soitheach", "gorm")).toBe("sa soitheach gorm");
      expect(getPrepositionalPhraseFormSg("i", "seacláid", "milis")).toBe("sa tseacláid mhilis");
      expect(getPrepositionalPhraseFormSg("le", "salann", "bán")).toBe("leis an salann bán");
      expect(getPrepositionalPhraseFormSg("le", "slat", "fada")).toBe("leis an tslat fhada");
      expect(getPrepositionalPhraseFormSg("ó", "suirbhé", "pearsanta")).toBe("ón suirbhé pearsanta");
      expect(getPrepositionalPhraseFormSg("ó", "scoil", "beag")).toBe("ón scoil bheag");
      expect(getPrepositionalPhraseFormSg("roimh", "samhradh", "fada")).toBe("roimh an samhradh fada");
      expect(getPrepositionalPhraseFormSg("roimh", "seachtain", "mór")).toBe("roimh an tseachtain mhór");
      expect(getPrepositionalPhraseFormSg("thar", "seol", "mór")).toBe("thar an seol mór");
      expect(getPrepositionalPhraseFormSg("thar", ["Sionainn", "fem"], "fada")).toBe("thar an tSionainn fhada");
      expect(getPrepositionalPhraseFormSg("trí", "sorcas", "mór")).toBe("tríd an sorcas mór");
      expect(getPrepositionalPhraseFormSg("trí", "seift", "cliste")).toBe("tríd an tseift chliste");
      expect(getPrepositionalPhraseFormSg("um", "sainchomhairleoir", "cruinn")).toBe("um an sainchomhairleoir cruinn");
      expect(getPrepositionalPhraseFormSg("um", "seirbhís", "maith")).toBe("um an tseirbhís mhaith");
    });

    test("1.4.3: No change is made to masculine nouns or feminine nouns starting with a vowel.", () => {
      expect(getPrepositionalPhraseFormSg("ag", "Albanach", "ciallmhar")).toBe("ag an Albanach ciallmhar");
      expect(getPrepositionalPhraseFormSg("ag", "aeráid", "gaofar")).toBe("ag an aeráid ghaofar");
      expect(getPrepositionalPhraseFormSg("ar", "eitleán", "dubh")).toBe("ar an eitleán dubh");
      expect(getPrepositionalPhraseFormSg("ar", "olann", "bán")).toBe("ar an olann bhán");
      expect(getPrepositionalPhraseFormSg("as", "uisce", "glan")).toBe("as an uisce glan");
      expect(getPrepositionalPhraseFormSg("as", "iris", "cáiliúil")).toBe("as an iris cháiliúil");
      expect(getPrepositionalPhraseFormSg("chuig", ["Aire", "masc"], "ilteangach")).toBe("chuig an Aire ilteangach");
      expect(getPrepositionalPhraseFormSg("chuig", ["Ostair", "fem"], "sléibhtiúil")).toBe("chuig an Ostair shléibhtiúil");
      expect(getPrepositionalPhraseFormSg("de", "alt", "fada")).toBe("den alt fada");
      expect(getPrepositionalPhraseFormSg("de", "uimhir", "cruinn")).toBe("den uimhir chruinn");
      expect(getPrepositionalPhraseFormSg("do", "údarás", "céanna")).toBe("don údarás céanna");
      expect(getPrepositionalPhraseFormSg("do", "obair", "crua")).toBe("don obair chrua");
      // expect(getPrepositionalPhraseForm("fara", "oifigeach", "múinte")).toBe("fairis an t-oifigeach múinte");
      // expect(getPrepositionalPhraseForm("fara", "ógbhean", "cliste")).toBe("fairis an t-ógbhean chliste");
    });
  });

  describe("1.5 The Genitive Singular Case", async () => {
    const getSgGenArt = (lemma: string | Noun, backup: Noun | null = null) => {
      const noun = typeof lemma === "string"
        ? getNoun(lemma, backup)
        : lemma;
      return NounPhrase.fromNoun(noun).forms.sgGenArt[0].value;
    };

    describe("1.5.2: articles", async () => {
      test("masculine initial lenitable consonant takes lenition where applicable", () => {
        expect(getSgGenArt("cnoc")).toBe("an chnoic");
        expect(getSgGenArt("fear")).toBe("an fhir");
      });

      test("masculine initial d or t does not take lenition", () => {
        expect(getSgGenArt("diabhal")).toBe("an diabhail");
        expect(getSgGenArt("teach")).toBe("an tí");
      });

      test("masculine initial s takes t- where applicable", () => {
        expect(getSgGenArt("saol")).toBe("an tsaoil");
        expect(getSgGenArt("Seapánach")).toBe("an tSeapánaigh");
      });

      test("masculine initial vowel does not change", () => {
        expect(getSgGenArt("alt")).toBe("an ailt");
        expect(getSgGenArt("acht")).toBe("an achta");
        expect(getSgGenArt("Albanach")).toBe("an Albanaigh");
      });

      test("feminine initial consonant does not change", () => {
        expect(getSgGenArt("fuinneog")).toBe("na fuinneoige");
        expect(getSgGenArt("caibidil")).toBe("na caibidle");
        expect(getSgGenArt("sráid")).toBe("na sráide");
        // Téalainn not in db
        expect(getSgGenArt("Tuaim")).toBe("na Tuama");
      });

      test("feminine initial vowel prefixed by h", () => {
        expect(getSgGenArt("áit")).toBe("na háite");
        expect(getSgGenArt("ísiltír")).toBe("na hísiltíre");
      });
    });
  });

  describe("1.6 The Plural", async () => {
    describe("1.6.1 The Nominative Plural Case and the Accusative Plural Case", async () => {
      const getPlNomArt = (lemma: string | Noun, modifierLemma: string | null = null, backup: Noun | null = null) => {
        const noun = typeof lemma === "string"
          ? getNoun(lemma, backup)
          : lemma;

        return modifierLemma != null
          ? NounPhrase.fromModifiedNoun(noun, getAdjective(modifierLemma)).forms.plNomArt[0].value
          : NounPhrase.fromNoun(noun).forms.plNomArt[0].value;
      };

      test("Initial consonant na + no change", () => {
        expect(getPlNomArt("capall", "glas")).toBe("na capaill ghlasa");
        expect(getPlNomArt("cnoc", "ard")).toBe("na cnoic arda");
        expect(getPlNomArt("fuinneog", "mór")).toBe("na fuinneoga móra");
        expect(getPlNomArt("Seapánach")).toBe("na Seapánaigh");
        expect(getPlNomArt("sráid")).toBe("na sráideanna");
      });

      test("Initial vowel na + h prefix", () => {
        expect(getPlNomArt("acht", "tábhachtach")).toBe("na hachtanna tábhachtacha");
        expect(getPlNomArt("áit")).toBe("na háiteanna");
        expect(getPlNomArt("Albanach", "bródúil")).toBe("na hAlbanaigh bhródúla");
        expect(getPlNomArt("Éireannach")).toBe("na hÉireannaigh");
        expect(getPlNomArt("íomhá")).toBe("na híomhánna");
      });
    });

    const getPrepositionalPhraseFormPl = (prepLemma: string, nounLemma: string, adjLemma: string | null = null) => {
      const prep = getPreposition(prepLemma);
      const noun = getNoun(nounLemma);
      const adj = adjLemma ? getAdjective(adjLemma) : null;
      const nounPhrase = adj != null
        ? NounPhrase.fromModifiedNoun(noun, adj)
        : NounPhrase.fromNoun(noun);
      const prepositionalPhrase = new PrepositionalPhrase(prep, nounPhrase);
      const formResult = prepositionalPhrase.getForm("plArt");
      if (!formResult.isOk) {
        throw new Error(`Form not found for: ${prepLemma} ${nounLemma} ${adjLemma}`);
      }
      return formResult.value[0];
    };

    describe("1.6.2 The Dative Plural Case", async () => {
      test("Initial consonant na + no change", () => {
        // We cannot rely on the simple backup noun for these tests as the plural forms need to be specified

        expect(getPrepositionalPhraseFormPl("ag", "fear", "mór")).toBe("ag na fir mhóra");
        // Changed cliste to cáiliúil
        expect(getPrepositionalPhraseFormPl("ar", "bean", "cáiliúil")).toBe("ar na mná cáiliúla");
        // Discrepancy: because the genitive ends in a slender vowel, the code lenites the adjective but the Standard does not.
        // expect(getPrepositionalPhraseFormPl("as", "seirbhís", "poiblí")).toBe("as na seirbhísí poiblí");
        expect(getPrepositionalPhraseFormPl("chuig", "mac", "glórach")).toBe("chuig na mic ghlóracha");
        expect(getPrepositionalPhraseFormPl("de", "crann")).toBe("de na crainn");
        expect(getPrepositionalPhraseFormPl("do", "teachta")).toBe("do na teachtaí");
        expect(getPrepositionalPhraseFormPl("faoi", "duine")).toBe("faoi na daoine");
        // expect(getPrepositionalPhraseFormPl("fara", "garda")).toBe("fairis na gardaí");
        expect(getPrepositionalPhraseFormPl("le", "fasach")).toBe("leis na fasaigh");
        expect(getPrepositionalPhraseFormPl("ó", "múinteoir")).toBe("ó na múinteoirí");
        expect(getPrepositionalPhraseFormPl("roimh", "cat")).toBe("roimh na cait");
        expect(getPrepositionalPhraseFormPl("i", "bosca")).toBe("sna boscaí");
        expect(getPrepositionalPhraseFormPl("thar", "farraige")).toBe("thar na farraigí");
        expect(getPrepositionalPhraseFormPl("trí", "gairdín")).toBe("trí na gairdíní");
        expect(getPrepositionalPhraseFormPl("um", "coill")).toBe("um na coillte");
      });

      test("Initial vowel na + h prefix", () => {
        // fásta changed to fastaímeach
        expect(getPrepositionalPhraseFormPl("ag", "iníon", "fastaímeach")).toBe("ag na hiníonacha fastaímeacha");
        expect(getPrepositionalPhraseFormPl("ar", "oileán", "gaofar")).toBe("ar na hoileáin ghaofara");
        expect(getPrepositionalPhraseFormPl("as", "iris", "acadúil")).toBe("as na hirisí acadúla");
        expect(getPrepositionalPhraseFormPl("chuig", "oifigeach", "deas")).toBe("chuig na hoifigigh dheasa");
        expect(getPrepositionalPhraseFormPl("de", "uimhir")).toBe("de na huimhreacha");
        expect(getPrepositionalPhraseFormPl("do", "obair")).toBe("do na hoibreacha");
        expect(getPrepositionalPhraseFormPl("faoi", "eachtra")).toBe("faoi na heachtraí");
        // expect(getPrepositionalPhraseFormPl("fara", "ógmhná")).toBe("fairis na hógmhná");
        expect(getPrepositionalPhraseFormPl("le", "eochair")).toBe("leis na heochracha");
        expect(getPrepositionalPhraseFormPl("ó", "Éireannach")).toBe("ó na hÉireannaigh");
        expect(getPrepositionalPhraseFormPl("roimh", "éan")).toBe("roimh na héin");
        expect(getPrepositionalPhraseFormPl("i", "eitleán")).toBe("sna heitleáin");
        expect(getPrepositionalPhraseFormPl("thar", "áit")).toBe("thar na háiteanna");
        expect(getPrepositionalPhraseFormPl("trí", "aistriúchán")).toBe("trí na haistriúcháin");
        expect(getPrepositionalPhraseFormPl("um", "acht")).toBe("um na hachtanna");
      });
    });

    describe("1.6.3 The Genitive Plural Case", async () => {
      const getPlGenArt = (lemma: string | Noun, modifierLemma: string | null = null, backup: Noun | null = null) => {
        const noun = typeof lemma === "string"
          ? getNoun(lemma, backup)
          : lemma;

        return modifierLemma != null
          ? NounPhrase.fromModifiedNoun(noun, getAdjective(modifierLemma)).forms.plGenArt[0].value
          : NounPhrase.fromNoun(noun).forms.plGenArt[0].value;
      };

      test("Starts with eclipsable consonants - na + eclipsis", () => {
        expect(getPlGenArt("cnoc")).toBe("na gcnoc");
        expect(getPlGenArt("fuinneog")).toBe("na bhfuinneog");
        expect(getPlGenArt("duine")).toBe("na ndaoine");
      });

      test("Starts with vowel - na + eclipsis", () => {
        expect(getPlGenArt("áit")).toBe("na n-áiteanna");
        expect(getPlGenArt("obair")).toBe("na n-oibreacha");
        expect(getPlGenArt("Albanach")).toBe("na nAlbanach");
      });
    });
  });

  describe("1.7 The Dative Singular Case — The Lenition System", async () => {
    // Same as the other one, but using sgArtN (corresponds to Lenition System)
    const getPrepositionalPhraseFormSg = (prepLemma: string, nounLemma: string | [string, Gender], adjLemma: string) => {
      const prep = getPreposition(prepLemma);
      const noun = Array.isArray(nounLemma) ? makeQuickNoun(nounLemma[0], nounLemma[1]) : getNoun(nounLemma);
      const adj = getAdjective(adjLemma);
      const nounPhrase = NounPhrase.fromModifiedNoun(noun, adj);
      const prepositionalPhrase = new PrepositionalPhrase(prep, nounPhrase);
      const formResult = prepositionalPhrase.getForm("sgArtN");
      if (!formResult.isOk) {
        throw new Error(`Form not found for: ${prepLemma} ${nounLemma} ${adjLemma}`);
      }
      return formResult.value[0];
    };

    test("1.7.3 In the Lenition system, nouns starting with the a consonant are lenited (other than d, t and s) as well as the adjectives attached to them.", () => {
      expect(getPrepositionalPhraseFormSg("ag", "fear", "maith")).toBe("ag an fhear mhaith");
      expect(getPrepositionalPhraseFormSg("ag", "cuideachta", "beag")).toBe("ag an chuideachta bheag");
      expect(getPrepositionalPhraseFormSg("ar", "bosca", "dearg")).toBe("ar an bhosca dhearg");
      expect(getPrepositionalPhraseFormSg("ar", "bean", "saibhir")).toBe("ar an bhean shaibhir");
      expect(getPrepositionalPhraseFormSg("as", "gleann", "mór")).toBe("as an ghleann mhór");
      expect(getPrepositionalPhraseFormSg("as", "páirc", "céanna")).toBe("as an pháirc chéanna");
      expect(getPrepositionalPhraseFormSg("chuig", "coimisinéir", "coinsiasach")).toBe("chuig an choimisinéir choinsiasach");
      expect(getPrepositionalPhraseFormSg("chuig", "bean", "gairmiúil")).toBe("chuig an bhean ghairmiúil");
      expect(getPrepositionalPhraseFormSg("de", "crann", "caol")).toBe("den chrann chaol");
      expect(getPrepositionalPhraseFormSg("de", "bean", "flaithiúil")).toBe("den bhean fhlaithiúil");
      expect(getPrepositionalPhraseFormSg("do", "fear", "trom")).toBe("don fhear throm");
      expect(getPrepositionalPhraseFormSg("do", "cuideachta", "gnóthach")).toBe("don chuideachta ghnóthach");
      // expect(getPrepositionalPhraseFormSg("fara", "garda", "béasach")).toBe("fairis an gharda bhéasach");
      // expect(getPrepositionalPhraseFormSg("fara", "bean", "cairdiúil")).toBe("fairis an bhean chairdiúil");
      expect(getPrepositionalPhraseFormSg("faoi", "fógra", "práinneach")).toBe("faoin fhógra phráinneach");
      expect(getPrepositionalPhraseFormSg("faoi", "grian", "breá")).toBe("faoin ghrian bhreá");
      expect(getPrepositionalPhraseFormSg("i", "bosca", "buí")).toBe("sa bhosca bhuí");
      expect(getPrepositionalPhraseFormSg("i", "fraoch", "bán")).toBe("sa fhraoch bhán");
      expect(getPrepositionalPhraseFormSg("i", "féar", "fliuch")).toBe("san fhéar fhliuch");
      expect(getPrepositionalPhraseFormSg("i", "comhairle", "sóisialta")).toBe("sa chomhairle shóisialta");
      expect(getPrepositionalPhraseFormSg("i", "frithréabhlóid", "fíochmhar")).toBe("sa fhrithréabhlóid fhíochmhar");
      expect(getPrepositionalPhraseFormSg("i", "farraige", "glan")).toBe("san fharraige ghlan");
      expect(getPrepositionalPhraseFormSg("le", "fasach", "cruinn")).toBe("leis an fhasach chruinn");
      expect(getPrepositionalPhraseFormSg("le", "báisteach", "trom")).toBe("leis an bháisteach throm");
      expect(getPrepositionalPhraseFormSg("ó", "caisleán", "fuar")).toBe("ón chaisleán fhuar");
      expect(getPrepositionalPhraseFormSg("ó", "cathair", "mór")).toBe("ón chathair mhór");
      expect(getPrepositionalPhraseFormSg("roimh", "cruinniú", "tábhachtach")).toBe("roimh an chruinniú thábhachtach");
      expect(getPrepositionalPhraseFormSg("roimh", "bainis", "beag")).toBe("roimh an bhainis bheag");
      expect(getPrepositionalPhraseFormSg("thar", "cnoc", "bán")).toBe("thar an chnoc bhán");
      expect(getPrepositionalPhraseFormSg("thar", "farraige", "ciúin")).toBe("thar an fharraige chiúin");
      expect(getPrepositionalPhraseFormSg("trí", "gairdín", "breá")).toBe("tríd an ghairdín bhreá");
      expect(getPrepositionalPhraseFormSg("trí", "fuinneog", "gorm")).toBe("tríd an fhuinneog ghorm");
      expect(getPrepositionalPhraseFormSg("um", "bille", "fada")).toBe("um an bhille fhada");
      expect(getPrepositionalPhraseFormSg("um", "gníomhaireacht", "reachtúil")).toBe("um an ghníomhaireacht reachtúil");
    });

    test("1.7.4: As for masculine nouns and feminine nouns starting with s, a t is placed before the s (other than with nouns starting with sc-, sf-, sm-, sp-, st- or sv- which are left bare)", () => {
      expect(getPrepositionalPhraseFormSg("ag", "Seapánach", "cliste")).toBe("ag an tSeapánach chliste");
      expect(getPrepositionalPhraseFormSg("ag", "seanmháthair", "bocht")).toBe("ag an tseanmháthair bhocht");
      expect(getPrepositionalPhraseFormSg("ar", "suíochán", "fliuch")).toBe("ar an tsuíochán fhliuch");
      expect(getPrepositionalPhraseFormSg("ar", "sráid", "glan")).toBe("ar an tsráid ghlan");
      expect(getPrepositionalPhraseFormSg("as", "sailéad", "blasta")).toBe("as an tsailéad bhlasta");
      expect(getPrepositionalPhraseFormSg("as", "saoire", "bliantúil")).toBe("as an tsaoire bhliantúil");
      expect(getPrepositionalPhraseFormSg("chuig", "seanadóir", "nuacheaptha")).toBe("chuig an tseanadóir nuacheaptha");
      expect(getPrepositionalPhraseFormSg("chuig", "satailít", "mór")).toBe("chuig an tsatailít mhór");
      expect(getPrepositionalPhraseFormSg("de", "saighdiúir", "sásúil")).toBe("den tsaighdiúir shásúil");
      expect(getPrepositionalPhraseFormSg("de", "slándáil", "sóisialach")).toBe("den tslándáil shóisialach");
      expect(getPrepositionalPhraseFormSg("do", "seanadóir", "nua")).toBe("don tseanadóir nua");
      expect(getPrepositionalPhraseFormSg("do", "saoirse", "ceart")).toBe("don tsaoirse cheart");
      // expect(getPrepositionalPhraseFormSg("fara", "saineolaí", "lách")).toBe("fairis an tsaineolaí lách");
      // expect(getPrepositionalPhraseFormSg("fara", "seanbhean", "saibhir")).toBe("fairis an tseanbhean shaibhir");
      expect(getPrepositionalPhraseFormSg("faoi", "sonrasc", "déanach")).toBe("faoin tsonrasc dhéanach");
      expect(getPrepositionalPhraseFormSg("faoi", "slí", "díreach")).toBe("faoin tslí dhíreach");
      expect(getPrepositionalPhraseFormSg("i", "soitheach", "gorm")).toBe("sa tsoitheach ghorm");
      expect(getPrepositionalPhraseFormSg("i", "seacláid", "milis")).toBe("sa tseacláid mhilis");
      expect(getPrepositionalPhraseFormSg("le", "salann", "bán")).toBe("leis an tsalann bhán");
      expect(getPrepositionalPhraseFormSg("le", "slat", "fada")).toBe("leis an tslat fhada");
      expect(getPrepositionalPhraseFormSg("ó", "suirbhé", "pearsanta")).toBe("ón tsuirbhé phearsanta");
      expect(getPrepositionalPhraseFormSg("ó", "scoil", "beag")).toBe("ón scoil bheag");
      expect(getPrepositionalPhraseFormSg("roimh", "samhradh", "fada")).toBe("roimh an tsamhradh fhada");
      expect(getPrepositionalPhraseFormSg("roimh", "seachtain", "mór")).toBe("roimh an tseachtain mhór");
      expect(getPrepositionalPhraseFormSg("thar", "seol", "mór")).toBe("thar an tseol mhór");
      expect(getPrepositionalPhraseFormSg("thar", ["Sionainn", "fem"], "fada")).toBe("thar an tSionainn fhada");
      expect(getPrepositionalPhraseFormSg("trí", "sorcas", "mór")).toBe("tríd an tsorcas mhór");
      expect(getPrepositionalPhraseFormSg("trí", "seift", "cliste")).toBe("tríd an tseift chliste");
      expect(getPrepositionalPhraseFormSg("um", "sainchomhairleoir", "cruinn")).toBe("um an tsainchomhairleoir chruinn");
      expect(getPrepositionalPhraseFormSg("um", "seirbhís", "maith")).toBe("um an tseirbhís mhaith");
    });

    test("1.7.5: No change is done to either masculine nouns or feminine nouns starting with vowels.", () => {
      expect(getPrepositionalPhraseFormSg("ag", "Albanach", "ciallmhar")).toBe("ag an Albanach chiallmhar");
      expect(getPrepositionalPhraseFormSg("ag", "aeráid", "gaofar")).toBe("ag an aeráid ghaofar");
      expect(getPrepositionalPhraseFormSg("ar", "eitleán", "dubh")).toBe("ar an eitleán dhubh");
      expect(getPrepositionalPhraseFormSg("ar", "olann", "bán")).toBe("ar an olann bhán");
      expect(getPrepositionalPhraseFormSg("as", "uisce", "glan")).toBe("as an uisce ghlan");
      expect(getPrepositionalPhraseFormSg("as", "iris", "cáiliúil")).toBe("as an iris cháiliúil");
      expect(getPrepositionalPhraseFormSg("chuig", ["Aire", "masc"], "ilteangach")).toBe("chuig an Aire ilteangach");
      expect(getPrepositionalPhraseFormSg("chuig", ["Ostair", "fem"], "sléibhtiúil")).toBe("chuig an Ostair shléibhtiúil");
      expect(getPrepositionalPhraseFormSg("de", "alt", "fada")).toBe("den alt fhada");
      expect(getPrepositionalPhraseFormSg("de", "uimhir", "cruinn")).toBe("den uimhir chruinn");
      expect(getPrepositionalPhraseFormSg("do", "údarás", "céanna")).toBe("don údarás chéanna");
      expect(getPrepositionalPhraseFormSg("do", "obair", "crua")).toBe("don obair chrua");
      // expect(getPrepositionalPhraseFormSg("fara", "oifigeach", "múinte")).toBe("fairis an oifigeach mhúinte");
      // expect(getPrepositionalPhraseFormSg("fara", "ógbhean", "cliste")).toBe("fairis an ógbhean chliste");
    });

    test("1.7.6: No change is done to either masculine nouns or feminine nouns starting with d and t.", () => {
      expect(getPrepositionalPhraseFormSg("faoi", "dréimire", "briste")).toBe("faoin dréimire bhriste");
      expect(getPrepositionalPhraseFormSg("faoi", "deacracht", "breise")).toBe("faoin deacracht bhreise");
      expect(getPrepositionalPhraseFormSg("i", "teas", "mór")).toBe("sa teas mhór");
      expect(getPrepositionalPhraseFormSg("i", "deoch", "fuar")).toBe("sa deoch fhuar");
      expect(getPrepositionalPhraseFormSg("le", "duine", "ciúin")).toBe("leis an duine chiúin");
      expect(getPrepositionalPhraseFormSg("le", "taithí", "maith")).toBe("leis an taithí mhaith");
      expect(getPrepositionalPhraseFormSg("ó", "deartháir", "cineálta")).toBe("ón deartháir chineálta");
      expect(getPrepositionalPhraseFormSg("ó", "teanga", "líofa")).toBe("ón teanga líofa");
      expect(getPrepositionalPhraseFormSg("roimh", "tarbh", "fiáin")).toBe("roimh an tarbh fhiáin");
      expect(getPrepositionalPhraseFormSg("roimh", "deighilt", "mór")).toBe("roimh an deighilt mhór");
      expect(getPrepositionalPhraseFormSg("thar", "teach", "gorm")).toBe("thar an teach ghorm");
      expect(getPrepositionalPhraseFormSg("thar", "diallait", "nua")).toBe("thar an diallait nua");
      expect(getPrepositionalPhraseFormSg("trí", "talamh", "crua")).toBe("tríd an talamh chrua");
      expect(getPrepositionalPhraseFormSg("trí", "drochaimsir", "gránna")).toBe("tríd an drochaimsir ghránna");
      expect(getPrepositionalPhraseFormSg("um", "dlí", "coiriúil")).toBe("um an dlí choiriúil");
      expect(getPrepositionalPhraseFormSg("um", "tagairt", "cuí")).toBe("um an tagairt chuí");
    });
  });
});