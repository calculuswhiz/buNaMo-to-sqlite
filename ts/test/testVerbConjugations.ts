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

    await test("Verb in first conjugation", () => {
      const verb = getVerb("mol");

      console.log(verb.conjugateRule("Ind", "Pres", "Declar", "Pos", "Indep", "Sg1"));
      
    });
  });
});