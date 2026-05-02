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
              verb.conjugateRule("Ind", "Pres", "Declar", "Pos", "Indep", person)
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
              verb.conjugateRule("Ind", "Past", "Declar", "Pos", "Indep", person)
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
              verb.conjugateRule("Ind", "PastHab", "Declar", "Pos", "Indep", person)
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
              verb.conjugateRule("Ind", "Fut", "Declar", "Pos", "Indep", person)
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
            verb.conjugateRule("Cond", "Pres", "Declar", "Pos", "Indep", person)
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
            verb.conjugateRule("Subj", "Pres", "Declar", "Pos", "Indep", person)
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
            verb.conjugateRule("Imper", null, "Declar", "Pos", "Indep", person)
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