import path from "node:path";
import { Repository, getExistingDb } from "../repository";
import test from "node:test";
import assert from "node:assert/strict";
import { _nn } from "../util";

const db = getExistingDb(path.join(__dirname, "../../output/buNaMo.sqlite"));
const repository = new Repository(db);
repository.initialize().then(async () => {
  test("Verb conjugation consistent with Caighdeán", async () => {
    // Note: The database does not contain conjugation classes
    const getVerb = (verbName: string) => _nn(
      repository.getVerbsByLemma(verbName)[0],
      `Verb ${verbName} not found`
    );

    await test("Regular verb", async () => {
      const verb = getVerb("mol");

      assert.deepEqual(verb.forms.verbalAdjective.map(x => x.value), ["molta"]);
      assert.deepEqual(verb.forms.verbalNoun.map(x => x.value), ["moladh"]);

      await test("Indicative", async () => {
        await test("Present", () => {
          const presTestCases = [
            ["Sg1", ["molaim"]],
            ["Sg2", ["molann tú"]],
            ["Sg3Masc", ["molann sé"]],
            ["Sg3Fem", ["molann sí"]],
            ["Pl1", ["molann muid", "molaimid"]],
            ["Pl2", ["molann sibh"]],
            ["Pl3", ["molann siad"]],
            ["NoSubject", ["molann"]],
            ["Auto", ["moltar"]]
          ] as const;

          for (const [person, expected] of presTestCases) {
            assert.deepEqual(
              verb.conjugateRule({ mood: "Ind", tense: "Pres" }, "Declar", "Pos", "Indep", person)
                .mapIfOk(r => r.map(p => p.toString()))
                .unwrapOr([]),
              expected,
              `Failed for person ${person}`
            );
          }
        });

        await test("Past", () => {
          const pastTestCases = [
            ["Sg1", ["mhol mé"]],
            ["Sg2", ["mhol tú"]],
            ["Sg3Masc", ["mhol sé"]],
            ["Sg3Fem", ["mhol sí"]],
            ["Pl1", ["mhol muid", "mholamar"]],
            ["Pl2", ["mhol sibh"]],
            ["Pl3", ["mhol siad", "mholadar"]],
            ["NoSubject", ["mhol"]],
            ["Auto", ["moladh"]]
          ] as const;

          for (const [person, expected] of pastTestCases) {
            assert.deepEqual(
              verb.conjugateRule({ mood: "Ind", tense: "Past" }, "Declar", "Pos", "Indep", person)
                .mapIfOk(r => r.map(p => p.toString()))
                .unwrapOr([]),
              expected,
              `Failed for person ${person}`
            );
          }
        });

        await test("Past habitual", () => {
          const pastHabTestCases = [
            ["Sg1", ["mholainn"]],
            ["Sg2", ["mholtá"]],
            ["Sg3Masc", ["mholadh sé"]],
            ["Sg3Fem", ["mholadh sí"]],
            ["Pl1", ["mholadh muid", "mholaimis"]],
            ["Pl2", ["mholadh sibh"]],
            ["Pl3", ["mholadh siad", "mholaidís"]],
            ["NoSubject", ["mholadh"]],
            ["Auto", ["mholtaí"]]
          ] as const;

          for (const [person, expected] of pastHabTestCases) {
            assert.deepEqual(
              verb.conjugateRule({ mood: "Ind", tense: "PastHab" }, "Declar", "Pos", "Indep", person)
                .mapIfOk(r => r.map(p => p.toString()))
                .unwrapOr([]),
              expected,
              `Failed for person ${person}`
            );
          }
        });

        await test("Future", () => {
          const futTestCases = [
            ["Sg1", ["molfaidh mé"]],
            ["Sg2", ["molfaidh tú"]],
            ["Sg3Masc", ["molfaidh sé"]],
            ["Sg3Fem", ["molfaidh sí"]],
            ["Pl1", ["molfaidh muid", "molfaimid"]],
            ["Pl2", ["molfaidh sibh"]],
            ["Pl3", ["molfaidh siad"]],
            ["NoSubject", ["molfaidh"]],
            ["Auto", ["molfar"]]
          ] as const;

          for (const [person, expected] of futTestCases) {
            assert.deepEqual(
              verb.conjugateRule({ mood: "Ind", tense: "Fut" }, "Declar", "Pos", "Indep", person)
                .mapIfOk(r => r.map(p => p.toString()))
                .unwrapOr([]),
              expected,
              `Failed for person ${person}`
            );
          }
        });
      });

      await test("Conditional", async () => {
        const testCases = [
          ["Sg1", ["mholfainn"]],
          ["Sg2", ["mholfá"]],
          ["Sg3Masc", ["mholfadh sé"]],
          ["Sg3Fem", ["mholfadh sí"]],
          ["Pl1", ["mholfadh muid", "mholfaimis"]],
          ["Pl2", ["mholfadh sibh"]],
          ["Pl3", ["mholfadh siad", "mholfaidís"]],
          ["NoSubject", ["mholfadh"]],
          ["Auto", ["mholfaí"]]
        ] as const;

        for (const [person, expected] of testCases) {
          assert.deepEqual(
            verb.conjugateRule({ mood: "Cond", tense: null }, "Declar", "Pos", "Indep", person)
              .mapIfOk(r => r.map(p => p.toString()))
              .unwrapOr([]),
            expected,
            `Failed for person ${person}`
          );
        }
      });

      await test("Subjunctive", async () => {
        const testCases = [
          ["Sg1", ["go mola mé"]],
          ["Sg2", ["go mola tú"]],
          ["Sg3Masc", ["go mola sé"]],
          ["Sg3Fem", ["go mola sí"]],
          ["Pl1", ["go mola muid", "go molaimid"]],
          ["Pl2", ["go mola sibh"]],
          ["Pl3", ["go mola siad"]],
          ["NoSubject", ["go mola"]],
          ["Auto", ["go moltar"]]
        ] as const;

        for (const [person, expected] of testCases) {
          assert.deepEqual(
            verb.conjugateRule({ mood: "Subj", tense: null }, "Declar", "Pos", "Indep", person)
              .mapIfOk(r => r.map(p => p.toString()))
              .unwrapOr([]),
            expected,
            `Failed for person ${person}`
          );
        }
      });

      await test("Imperative", async () => {
        const testCases = [
          ["Sg1", ["molaim"]],
          ["Sg2", ["mol"]],
          ["Sg3Masc", ["moladh sé"]],
          ["Sg3Fem", ["moladh sí"]],
          ["Pl1", ["moladh muid", "molaimis"]],
          ["Pl2", ["molaigí"]],
          ["Pl3", ["moladh siad", "molaidís"]],
          ["NoSubject", ["moladh"]],
          ["Auto", ["moltar"]]
        ] as const;

        for (const [person, expected] of testCases) {
          assert.deepEqual(
            verb.conjugateRule({ mood: "Imper", tense: null }, "Declar", "Pos", "Indep", person)
              .mapIfOk(r => r.map(p => p.toString()))
              .unwrapOr([]),
            expected,
            `Failed for person ${person}`
          );
        }
      });
    });

    await test("Bí", async () => {
      // Just test the special forms
      const verb = getVerb("bí");

      // No verbal adjective
      assert.ok(verb.forms.verbalAdjective.length === 0);
      assert.deepEqual(verb.forms.verbalNoun.map(x => x.value), ["bheith"]);

      await test("Present affirmative independent", () => {
        const testCases = [
          ["Sg1", ["tá mé", "táim"]],
          ["Sg2", ["tá tú"]],
          ["Sg3Masc", ["tá sé"]],
          ["Sg3Fem", ["tá sí"]],
          ["Pl1", ["tá muid", "táimid"]],
          ["Pl2", ["tá sibh"]],
          ["Pl3", ["tá siad"]],
          ["NoSubject", ["tá"]],
          ["Auto", ["táthar"]]
        ] as const;

        for (const [person, expected] of testCases) {
          assert.deepEqual(
            verb.conjugateRule({ mood: "Ind", tense: "Pres" }, "Declar", "Pos", "Indep", person)
              .mapIfOk(r => r.map(p => p.toString()))
              .unwrapOr([]),
            expected,
            `Failed for person ${person}`
          );
        }
      });

      await test("Present negative independent", () => {
        const testCases = [
          ["Sg1", ["níl mé", "nílim"]],
          ["Sg2", ["níl tú"]],
          ["Sg3Masc", ["níl sé"]],
          ["Sg3Fem", ["níl sí"]],
          ["Pl1", ["níl muid", "nílimid"]],
          ["Pl2", ["níl sibh"]],
          ["Pl3", ["níl siad"]],
          ["NoSubject", ["níl"]],
          ["Auto", ["níltear"]]
        ] as const;

        for (const [person, expected] of testCases) {
          assert.deepEqual(
            verb.conjugateRule({ mood: "Ind", tense: "Pres" }, "Declar", "Neg", "Indep", person)
              .mapIfOk(r => r.map(p => p.toString()))
              .unwrapOr([]),
            expected,
            `Failed for person ${person}`
          );
        }
      });

      await test("Present Dependent", () => {
        const testCases = [
          ["Sg1", ["go bhfuil mé", "go bhfuilim"]],
          ["Sg2", ["go bhfuil tú"]],
          ["Sg3Masc", ["go bhfuil sé"]],
          ["Sg3Fem", ["go bhfuil sí"]],
          ["Pl1", ["go bhfuil muid", "go bhfuilimid"]],
          ["Pl2", ["go bhfuil sibh"]],
          ["Pl3", ["go bhfuil siad"]],
          ["NoSubject", ["go bhfuil"]],
          ["Auto", ["go bhfuiltear"]]
        ] as const;

        for (const [person, expected] of testCases) {
          assert.deepEqual(
            verb.conjugateRule({ mood: "Ind", tense: "Pres" }, "Declar", "Pos", "Dep", person)
              .mapIfOk(r => r.map(p => p.toString()))
              .unwrapOr([]),
            expected,
            `Failed for person ${person}`
          );
        }
      });

      await test("Present Habitual", () => {
        const testCases = [
          ["Sg1", ["bím"]],
          ["Sg2", ["bíonn tú"]],
          ["Sg3Masc", ["bíonn sé"]],
          ["Sg3Fem", ["bíonn sí"]],
          ["Pl1", ["bíonn muid", "bímid"]],
          ["Pl2", ["bíonn sibh"]],
          ["Pl3", ["bíonn siad"]],
          ["NoSubject", ["bíonn"]],
          ["Auto", ["bítear"]]
        ] as const;

        for (const [person, expected] of testCases) {
          assert.deepEqual(
            verb.conjugateRule({ mood: "Ind", tense: "PresHab" }, "Declar", "Pos", "Indep", person)
              .mapIfOk(r => r.map(p => p.toString()))
              .unwrapOr([]),
            expected,
            `Failed for person ${person}`
          );
        }
      });

      await test("Past Independent", () => {
        const testCases = [
          ["Sg1", ["bhí mé"]],
          ["Sg2", ["bhí tú"]],
          ["Sg3Masc", ["bhí sé"]],
          ["Sg3Fem", ["bhí sí"]],
          ["Pl1", ["bhí muid", "bhíomar"]],
          ["Pl2", ["bhí sibh"]],
          ["Pl3", ["bhí siad", "bhíodar"]],
          ["NoSubject", ["bhí"]],
          ["Auto", ["bhíothas"]]
        ] as const;

        for (const [person, expected] of testCases) {
          assert.deepEqual(
            verb.conjugateRule({ mood: "Ind", tense: "Past" }, "Declar", "Pos", "Indep", person)
              .mapIfOk(r => r.map(p => p.toString()))
              .unwrapOr([]),
            expected,
            `Failed for person ${person}`
          );
        }
      });

      await test("Past Dependent Negative", () => {
        const testCases = [
          ["Sg1", ["ní raibh mé"]],
          ["Sg2", ["ní raibh tú"]],
          ["Sg3Masc", ["ní raibh sé"]],
          ["Sg3Fem", ["ní raibh sí"]],
          ["Pl1", ["ní raibh muid", "ní rabhamar"]],
          ["Pl2", ["ní raibh sibh"]],
          ["Pl3", ["ní raibh siad", "ní rabhadar"]],
          ["NoSubject", ["ní raibh"]],
          ["Auto", ["ní rabhthas"]]
        ] as const;

        for (const [person, expected] of testCases) {
          assert.deepEqual(
            verb.conjugateRule({ mood: "Ind", tense: "Past" }, "Declar", "Neg", "Dep", person)
              .mapIfOk(r => r.map(p => p.toString()))
              .unwrapOr([]),
            expected,
            `Failed for person ${person}`
          );
        }
      });
    });
  });
});