/* Chapter 2 is largely about how nouns are inflected, so these are not necessarily
 tests of the Gramadan library, but rather statistical tests of the standard
 itself and the data in the database. */
import fs from "node:fs";
import path from "node:path";
import { getExistingDb, Repository } from "../../repository";
import test from "node:test";
import { Consonants, countSyllables, palatalizationReplaceTable, palatalize, VowelsBroad } from "../../mutators";

const db = getExistingDb(path.join(__dirname, "../../../output/buNaMo.sqlite"));
const repository = new Repository(db);
repository.initialize().then(async () => {
  await test("2.2 The First Declension", async () => {
    await test("2.2.2 The Genitive Singular", async () => {
      // - "In the genitive singular, the last consonant is palatalized"
      // - Standard palatalization rules apply, except on certain nouns:
      //   Brian, Briain; cliant, cliaint; fiar, fiair; giar, giair; rian, riain; srian, sriain; and trian, triain. 
      // - mac is changed to mic in the genitive singular[...]
      // - In the genitive singular, -ea- is changed to -i-, 
      //   e.g., breac, bric; cuireadh, cuiridh; leiceann, leicinn; 
      //   other than with certain monosyllabic nouns, e.g., each, eich.
      const irregularPalatalizationNouns = new Set([
        "brian", "cliant", "fiar", "giar", "rian", "srian", "trian",
        // Compounds
        "beibhealghiar", "péistghiar",
        "comhrian", "fuaimrian", "mionrian", "ráillrian", "uiscerian"
      ]);

      function checkGenitiveSingular1stDeclension(nominative: string, genitive: string): [boolean, string] {
        const lemma = nominative.toLowerCase();

        if (lemma === "mac")
          return [genitive === "mic", "mic"];
        else if (irregularPalatalizationNouns.has(lemma)) {
          // Irregular palatalization: -i- is inserted before the last consonant, but the last consonant itself is not changed.
          const expectedGenitiveSingularForm = nominative
            .replace(new RegExp(`^(.*[${VowelsBroad}])([${Consonants}])$`), "$1i$2");

          return [genitive === expectedGenitiveSingularForm, expectedGenitiveSingularForm];
        } else {
          const expectedGenitiveSingularForm = palatalize(nominative)
            // ea to i
            .replace(palatalizationReplaceTable[0][0], palatalizationReplaceTable[0][1]);

          const isExpected = genitive === expectedGenitiveSingularForm
            // The -gh changes apply to certain monosyllabic nouns as well, but the Standard does not 
            // enumerate all of them, so we can't test those definitely for now.
            || (countSyllables(nominative) === 1
              && (nominative
                .replace(/each$/, "igh")
                .replace(/íoch$/, "ígh")
                .replace(/ach$/, "aigh") === genitive
              // Certain monosyllabic nouns with change -ea- to -ei-, e.g., each, eich.
              || nominative.replace(/ea/, "ei") === genitive)
            )
            // g(h)laoch, fraoch, naoch
            || nominative.replace(/aoch/, "aoigh") === genitive
            // Some words just do ia -> iai for probably historical reasons, I'd guess.
            // Consider these as plausible
            || nominative.replace(/ia/, "iai") === genitive;
          return [isExpected, expectedGenitiveSingularForm];
        }
      }

      const all1stDeclensionNounsIter = repository.db.prepare(
        `SELECT
          n.noun_id AS nounId,
          n.declension AS declension,
          form.value AS value,
          form.gender AS gender,
          form.form_name AS formName
        FROM noun AS n
        JOIN noun_form AS form ON form.noun_id = n.noun_id
        WHERE n.declension = 1 AND form.form_name IN ('sgNom', 'sgGen')`
      ).iterate();

      const groupedNouns = Map.groupBy(
        all1stDeclensionNounsIter,
        row => +(row.nounId?.toString() ?? 0)
      );

      const mismatches: {
        id: number; nom: string, genExpected: string, genActual: string
      }[] = [];
      for (const [nounId, rows] of groupedNouns) {
        if (rows == null) {
          mismatches.push({ id: nounId, nom: "", genExpected: "", genActual: "" });
          continue;
        }
        const sgNomRow = rows.find(row => row.formName === "sgNom");
        const sgGenRow = rows.find(row => row.formName === "sgGen");
        if (sgNomRow == null || sgGenRow == null) {
          mismatches.push({
            id: nounId,
            nom: sgNomRow?.value?.toString() ?? "",
            genExpected: sgGenRow?.value?.toString() ?? "",
            genActual: sgGenRow?.value?.toString() ?? ""
          });
        }
        else {
          const [isValid, expected] = checkGenitiveSingular1stDeclension(
            sgNomRow.value?.toString() ?? "",
            sgGenRow.value?.toString() ?? ""
          );
          if (!isValid) {
            mismatches.push({
              id: nounId,
              nom: sgNomRow.value?.toString() ?? "",
              genExpected: expected,
              genActual: sgGenRow.value?.toString() ?? ""
            });
          }
        }
      }

      if (mismatches.length > 0) {
        const mismatchFile = fs.writeFileSync(
          path.join(__dirname, "./mismatches/genitive_singular_mismatches.txt"),
          mismatches.map(m => `id: ${m.id}, nominative: "${m.nom}", expected genitive: "${m.genExpected}", actual genitive: "${m.genActual}"`).join("\n")
        );
        console.error(`Found ${mismatches.length} mismatches. Details written to ${mismatchFile}`);
      }
    });
  });
});
