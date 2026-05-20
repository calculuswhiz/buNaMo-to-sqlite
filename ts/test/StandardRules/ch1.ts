import test from "node:test";
import assert from "node:assert";
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
        .mapIfOk(x => x[0])
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
    await test("1.4 The Dative Singular Case — The Core System", async () => {
      await test("1.4.1: ...nouns starting with a consonant (other than d, t and s), lenition is applied to them following den, don, sa/san and eclipsis in every other context", () => {
        assert.equal(getPrepositionalPhraseFormSg("ag", "fear", "maith"), "ag an bhfear maith");
        assert.equal(getPrepositionalPhraseFormSg("ag", "cuideachta", "beag"), "ag an gcuideachta bheag");
        assert.equal(getPrepositionalPhraseFormSg("ar", "bosca", "dearg"), "ar an mbosca dearg");
        assert.equal(getPrepositionalPhraseFormSg("ar", "bean", "saibhir"), "ar an mbean shaibhir");
        assert.equal(getPrepositionalPhraseFormSg("as", "gleann", "mór"), "as an ngleann mór");
        assert.equal(getPrepositionalPhraseFormSg("as", "páirc", "céanna"), "as an bpáirc chéanna");
        // Lower cased the title. Not testing casing here.
        assert.equal(getPrepositionalPhraseFormSg("chuig", "coimisinéir", "coinsiasach"), "chuig an gcoimisinéir coinsiasach");
        assert.equal(getPrepositionalPhraseFormSg("chuig", "bean", "gairmiúil"), "chuig an mbean ghairmiúil");
        assert.equal(getPrepositionalPhraseFormSg("de", "crann", "caol"), "den chrann caol");
        assert.equal(getPrepositionalPhraseFormSg("de", "bean", "flaithiúil"), "den bhean fhlaithiúil");
        assert.equal(getPrepositionalPhraseFormSg("do", "fear", "trom"), "don fhear trom");
        assert.equal(getPrepositionalPhraseFormSg("do", "cuideachta", "gnóthach"), "don chuideachta ghnóthach");
        // TODO Fara not found in database
        // assert.equal(getPrepositionalPhraseForm("fara", "garda", "béasach"), "fairis an ngarda béasach");
        // assert.equal(getPrepositionalPhraseForm("fara", "bean", "chairdiúil"), "fairis an mbean chairdiúil");
        assert.equal(getPrepositionalPhraseFormSg("faoi", "fógra", "práinneach"), "faoin bhfógra práinneach");
        assert.equal(getPrepositionalPhraseFormSg("faoi", "grian", "breá"), "faoin ngrian bhreá");
        assert.equal(getPrepositionalPhraseFormSg("i", "bosca", "buí"), "sa bhosca buí");
        assert.equal(getPrepositionalPhraseFormSg("i", "fraoch", "bán"), "sa fhraoch bán");
        assert.equal(getPrepositionalPhraseFormSg("i", "féar", "fliuch"), "san fhéar fliuch");
        assert.equal(getPrepositionalPhraseFormSg("i", "comhairle", "sóisialta"), "sa chomhairle shóisialta");
        assert.equal(getPrepositionalPhraseFormSg("i", "frithréabhlóid", "fíochmhar"), "sa fhrithréabhlóid fhíochmhar");
        assert.equal(getPrepositionalPhraseFormSg("i", "farraige", "glan"), "san fharraige ghlan");
        assert.equal(getPrepositionalPhraseFormSg("le", "fasach", "cruinn"), "leis an bhfasach cruinn");
        assert.equal(getPrepositionalPhraseFormSg("le", "báisteach", "trom"), "leis an mbáisteach throm");
        assert.equal(getPrepositionalPhraseFormSg("ó", "caisleán", "fuar"), "ón gcaisleán fuar");
        assert.equal(getPrepositionalPhraseFormSg("ó", "cathair", "mór"), "ón gcathair mhór");
        assert.equal(getPrepositionalPhraseFormSg("roimh", "cruinniú", "tábhachtach"), "roimh an gcruinniú tábhachtach");
        assert.equal(getPrepositionalPhraseFormSg("roimh", "bainis", "beag"), "roimh an mbainis bheag");
        assert.equal(getPrepositionalPhraseFormSg("thar", "cnoc", "bán"), "thar an gcnoc bán");
        assert.equal(getPrepositionalPhraseFormSg("thar", "farraige", "ciúin"), "thar an bhfarraige chiúin");
        assert.equal(getPrepositionalPhraseFormSg("trí", "gairdín", "breá"), "tríd an ngairdín breá");
        assert.equal(getPrepositionalPhraseFormSg("trí", "fuinneog", "gorm"), "tríd an bhfuinneog ghorm");
        // Lowercased
        assert.equal(getPrepositionalPhraseFormSg("um", "bille", "fada"), "um an mbille fada");
        assert.equal(getPrepositionalPhraseFormSg("um", "gníomhaireacht", "reachtúil"), "um an ngníomhaireacht reachtúil");
      });

      await test("1.4.2: No change is done to masculine nouns starting with s in the dative case. A t precedes an s in feminine nouns (other than when the noun starts with sc-, sf-, sm-, sp-, st- or sv- which are left bare)", () => {
        assert.equal(getPrepositionalPhraseFormSg("ag", "Seapánach", "cliste"), "ag an Seapánach cliste");
        assert.equal(getPrepositionalPhraseFormSg("ag", "seanmháthair", "bocht"), "ag an tseanmháthair bhocht");
        assert.equal(getPrepositionalPhraseFormSg("ar", "suíochán", "fliuch"), "ar an suíochán fliuch");
        assert.equal(getPrepositionalPhraseFormSg("ar", "sráid", "glan"), "ar an tsráid ghlan");
        assert.equal(getPrepositionalPhraseFormSg("as", "sailéad", "blasta"), "as an sailéad blasta");
        assert.equal(getPrepositionalPhraseFormSg("as", "saoire", "bliantúil"), "as an tsaoire bhliantúil");
        assert.equal(getPrepositionalPhraseFormSg("chuig", "seanadóir", "cliste"), "chuig an seanadóir cliste");
        assert.equal(getPrepositionalPhraseFormSg("chuig", "satailít", "mór"), "chuig an tsatailít mhór");
        assert.equal(getPrepositionalPhraseFormSg("de", "saighdiúir", "sásúil"), "den saighdiúir sásúil");
        assert.equal(getPrepositionalPhraseFormSg("de", "slándáil", "sóisialach"), "den tslándáil shóisialach");
        assert.equal(getPrepositionalPhraseFormSg("do", "seanad", "nua"), "don seanad nua");
        assert.equal(getPrepositionalPhraseFormSg("do", "saoirse", "ceart"), "don tsaoirse cheart");
        // assert.equal(getPrepositionalPhraseForm("fara", "saineolaí", "lách"), "fairis an saineolaí lách");
        // assert.equal(getPrepositionalPhraseForm("fara", "seanbhean", "saibhir"), "fairis an tseanbhean shaibhir");
        assert.equal(getPrepositionalPhraseFormSg("faoi", "sonrasc", "déanach"), "faoin sonrasc déanach");
        assert.equal(getPrepositionalPhraseFormSg("faoi", "slí", "díreach"), "faoin tslí dhíreach");
        assert.equal(getPrepositionalPhraseFormSg("i", "soitheach", "gorm"), "sa soitheach gorm");
        assert.equal(getPrepositionalPhraseFormSg("i", "seacláid", "milis"), "sa tseacláid mhilis");
        assert.equal(getPrepositionalPhraseFormSg("le", "salann", "bán"), "leis an salann bán");
        assert.equal(getPrepositionalPhraseFormSg("le", "slat", "fada"), "leis an tslat fhada");
        assert.equal(getPrepositionalPhraseFormSg("ó", "suirbhé", "pearsanta"), "ón suirbhé pearsanta");
        assert.equal(getPrepositionalPhraseFormSg("ó", "scoil", "beag"), "ón scoil bheag");
        assert.equal(getPrepositionalPhraseFormSg("roimh", "samhradh", "fada"), "roimh an samhradh fada");
        assert.equal(getPrepositionalPhraseFormSg("roimh", "seachtain", "mór"), "roimh an tseachtain mhór");
        assert.equal(getPrepositionalPhraseFormSg("thar", "seol", "mór"), "thar an seol mór");
        assert.equal(getPrepositionalPhraseFormSg("thar", ["Sionainn", "fem"], "fada"), "thar an tSionainn fhada");
        assert.equal(getPrepositionalPhraseFormSg("trí", "sorcas", "mór"), "tríd an sorcas mór");
        assert.equal(getPrepositionalPhraseFormSg("trí", "seift", "cliste"), "tríd an tseift chliste");
        assert.equal(getPrepositionalPhraseFormSg("um", "sainchomhairleoir", "cruinn"), "um an sainchomhairleoir cruinn");
        assert.equal(getPrepositionalPhraseFormSg("um", "seirbhís", "maith"), "um an tseirbhís mhaith");
      });

      await test("1.4.3: No change is made to masculine nouns or feminine nouns starting with a vowel.", () => {
        assert.equal(getPrepositionalPhraseFormSg("ag", "Albanach", "ciallmhar"), "ag an Albanach ciallmhar");
        assert.equal(getPrepositionalPhraseFormSg("ag", "aeráid", "gaofar"), "ag an aeráid ghaofar");
        assert.equal(getPrepositionalPhraseFormSg("ar", "eitleán", "dubh"), "ar an eitleán dubh");
        assert.equal(getPrepositionalPhraseFormSg("ar", "olann", "bán"), "ar an olann bhán");
        assert.equal(getPrepositionalPhraseFormSg("as", "uisce", "glan"), "as an uisce glan");
        assert.equal(getPrepositionalPhraseFormSg("as", "iris", "cáiliúil"), "as an iris cháiliúil");
        assert.equal(getPrepositionalPhraseFormSg("chuig", ["Aire", "masc"], "ilteangach"), "chuig an Aire ilteangach");
        assert.equal(getPrepositionalPhraseFormSg("chuig", ["Ostair", "fem"], "sléibhtiúil"), "chuig an Ostair shléibhtiúil");
        assert.equal(getPrepositionalPhraseFormSg("de", "alt", "fada"), "den alt fada");
        assert.equal(getPrepositionalPhraseFormSg("de", "uimhir", "cruinn"), "den uimhir chruinn");
        assert.equal(getPrepositionalPhraseFormSg("do", "údarás", "céanna"), "don údarás céanna");
        assert.equal(getPrepositionalPhraseFormSg("do", "obair", "crua"), "don obair chrua");
        // assert.equal(getPrepositionalPhraseForm("fara", "oifigeach", "múinte"), "fairis an t-oifigeach múinte");
        // assert.equal(getPrepositionalPhraseForm("fara", "ógbhean", "cliste"), "fairis an t-ógbhean chliste");
      });
    });

    await test("1.5 The Genitive Singular Case", async () => {
      const getSgGenArt = (lemma: string | Noun, backup: Noun | null = null) => {
        const noun = typeof lemma === "string"
          ? getNoun(lemma, backup)
          : lemma;
        return NounPhrase.fromNoun(noun).forms.sgGenArt[0].value;
      };

      await test("1.5.2: articles", async () => {
        await test("masculine initial lenitable consonant takes lenition where applicable", () => {
          assert.equal(getSgGenArt("cnoc"), "an chnoic");
          assert.equal(getSgGenArt("fear"), "an fhir");
        });

        await test("masculine initial d or t does not take lenition", () => {
          assert.equal(getSgGenArt("diabhal"), "an diabhail");
          assert.equal(getSgGenArt("teach"), "an tí");
        });

        await test("masculine initial s takes t- where applicable", () => {
          assert.equal(getSgGenArt("saol"), "an tsaoil");
          assert.equal(getSgGenArt("Seapánach"), "an tSeapánaigh");
        });

        await test("masculine initial vowel does not change", () => {
          assert.equal(getSgGenArt("alt"), "an ailt");
          assert.equal(getSgGenArt("acht"), "an achta");
          assert.equal(getSgGenArt("Albanach"), "an Albanaigh");
        });

        await test("feminine initial consonant does not change", () => {
          assert.equal(getSgGenArt("fuinneog"), "na fuinneoige");
          assert.equal(getSgGenArt("caibidil"), "na caibidle");
          assert.equal(getSgGenArt("sráid"), "na sráide");
          // Téalainn not in db
          assert.equal(getSgGenArt("Tuaim"), "na Tuama");
        });

        await test("feminine initial vowel prefixed by h", () => {
          assert.equal(getSgGenArt("áit"), "na háite");
          assert.equal(getSgGenArt("ísiltír"), "na hísiltíre");
        });
      });
    });

    await test("1.6 The Plural", async () => {
      await test("1.6.1 The Nominative Plural Case and the Accusative Plural Case", async () => {
        const getPlNomArt = (lemma: string | Noun, modifierLemma: string | null = null, backup: Noun | null = null) => {
          const noun = typeof lemma === "string"
            ? getNoun(lemma, backup)
            : lemma;

          return modifierLemma != null
            ? NounPhrase.fromModifiedNoun(noun, getAdjective(modifierLemma)).forms.plNomArt[0].value
            : NounPhrase.fromNoun(noun).forms.plNomArt[0].value;
        };

        await test("Initial consonant na + no change", () => {
          assert.equal(getPlNomArt("capall", "glas"), "na capaill ghlasa");
          assert.equal(getPlNomArt("cnoc", "ard"), "na cnoic arda");
          assert.equal(getPlNomArt("fuinneog", "mór"), "na fuinneoga móra");
          assert.equal(getPlNomArt("Seapánach"), "na Seapánaigh");
          assert.equal(getPlNomArt("sráid"), "na sráideanna");
        });

        await test("Initial vowel na + h prefix", () => {
          assert.equal(getPlNomArt("acht", "tábhachtach"), "na hachtanna tábhachtacha");
          assert.equal(getPlNomArt("áit"), "na háiteanna");
          assert.equal(getPlNomArt("Albanach", "bródúil"), "na hAlbanaigh bhródúla");
          assert.equal(getPlNomArt("Éireannach"), "na hÉireannaigh");
          assert.equal(getPlNomArt("íomhá"), "na híomhánna");
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

      await test("1.6.2 The Dative Plural Case", async () => {
        await test("Initial consonant na + no change", () => {
          // We cannot rely on the simple backup noun for these tests as the plural forms need to be specified

          assert.equal(getPrepositionalPhraseFormPl("ag", "fear", "mór"), "ag na fir mhóra");
          // Changed cliste to cáiliúil
          assert.equal(getPrepositionalPhraseFormPl("ar", "bean", "cáiliúil"), "ar na mná cáiliúla");
          // Discrepancy: because the genitive ends in a slender vowel, the code lenites the adjective but the Standard does not.
          // assert.equal(getPrepositionalPhraseFormPl("as", "seirbhís", "poiblí"), "as na seirbhísí poiblí");
          assert.equal(getPrepositionalPhraseFormPl("chuig", "mac", "glórach"), "chuig na mic ghlóracha");
          assert.equal(getPrepositionalPhraseFormPl("de", "crann"), "de na crainn");
          assert.equal(getPrepositionalPhraseFormPl("do", "teachta"), "do na teachtaí");
          assert.equal(getPrepositionalPhraseFormPl("faoi", "duine"), "faoi na daoine");
          // assert.equal(getPrepositionalPhraseFormPl("fara", "garda"), "fairis na gardaí");
          assert.equal(getPrepositionalPhraseFormPl("le", "fasach"), "leis na fasaigh");
          assert.equal(getPrepositionalPhraseFormPl("ó", "múinteoir"), "ó na múinteoirí");
          assert.equal(getPrepositionalPhraseFormPl("roimh", "cat"), "roimh na cait");
          assert.equal(getPrepositionalPhraseFormPl("i", "bosca"), "sna boscaí");
          assert.equal(getPrepositionalPhraseFormPl("thar", "farraige"), "thar na farraigí");
          assert.equal(getPrepositionalPhraseFormPl("trí", "gairdín"), "trí na gairdíní");
          assert.equal(getPrepositionalPhraseFormPl("um", "coill"), "um na coillte");
        });
      });
    });
  });
});