/* Chapter 2 is largely about how nouns are inflected, so these are not necessarily
 tests of the Gramadan library, but rather statistical tests of the standard
 itself and the data in the database. */
import fs from "node:fs";
import path from "node:path";
import { getExistingDb, Repository } from "../../repository";
import test from "node:test";
import { Consonants, countSyllables, palatalizationReplaceTable, palatalize, syncope, VowelsBroad, VowelsSlender } from "../../mutators";

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

      const tripleVowelPattern = new RegExp(`^(.*[${VowelsBroad}]í)[${VowelsBroad}]([${Consonants}]+)$`);

      function checkGenitiveSingular1stDeclension(
        nominative: string, genitive: string
      ): [boolean, string] {
        const modifiedReplaceTable: [RegExp, string][] = [
          // Rules account for -ach -> -aigh, -each -> -igh, -íoch -> -ígh in polysyllabic nouns (2.1.4.d)
          [/each$/, "igh"],
          [/íoch$/, "ígh"],
          [/ach$/, "aigh"],
          // Standard does not mention -éigh, but it seems to follow based on data.
          [/éaigh$/, "éigh"],
          // This rule covers cases claíomh -> claímh, comhshuíomh -> comhshúimh
          [tripleVowelPattern, "$1$2"],
          // Standard does not mention -éigh, but it seems to follow based on data.
          // Using -éi- since the changes have already been applied.
          [/éich$/, "éigh"],
          ...palatalizationReplaceTable
        ];

        if (nominative === "mac")
          return [genitive === "mic", "mic"];
        else if (irregularPalatalizationNouns.has(nominative)) {
          // Irregular palatalization: -i- is inserted before the last consonant, but the last consonant itself is not changed.
          const expectedGenitiveSingularForm = nominative
            .replace(new RegExp(`^(.*[${VowelsBroad}])([${Consonants}])$`), "$1i$2");

          return [genitive === expectedGenitiveSingularForm, expectedGenitiveSingularForm];
        } else {
          const expectedGenitiveSingularForm = palatalize(nominative, undefined, modifiedReplaceTable)
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
        const mismatchFilePath = "./mismatches/genitive_singular_1st_declension_mismatches.txt";
        fs.writeFileSync(
          path.join(__dirname, mismatchFilePath),
          mismatches.map(m => `${m.id}, nom: "${m.nom}", expected gen: "${m.genExpected}", actual genitive: "${m.genActual}"`).join("\n")
        );
        console.error(`Found ${mismatches.length} mismatches. Details written to ${mismatchFilePath}`);
      }
    });
  });

  await test("2.3 The Second Declension", async () => {
    // Nouns in this declension end with a consonant, broad or slender, in the nominative singular. 
    // They are all feminine other than im and sliabh. 
    await test("2.3.2 The Genitive Singular", async () => {
      // a. An -e is put with the nominative singular and if it ends with a 
      //  broad consonant, it is palatalized, e.g., bróg, bróige; coill, coille; earr, eirre; 
      //  except with polysyllabic nouns ending with -(e)ach. 
      // b. When polysyllabic nouns end with -(e)ach, -(a)í is made 
      //  from -(e)ach, e.g., scornach, scornaí; cailleach, caillí. 
      // c. The palatalization changes mentioned in 2.1.4 apply to the nouns as follows:
      //   i. -ea- to -ei-, e.g., beach, beiche (-ea- is changed to -i- in a 
      //    monosyllabic noun, e.g., beann, binne; cearc, circe; and in the 
      //    unaccented syllable of the polysyllabic noun, 
      //    e.g., bruinneall, bruinnille; ficheall, fichille); and 
      //   ii. -ia- to -i- in the word scian, scine.

      // Rules not mentioned by the Standard:
      // 1. If the noun ends in a slender consonant (single consonant only),
      //   the slender vowels are syncopated.

      function checkGenitiveSingular2ndDeclension(
        nominative: string, genitive: string
      ): [boolean, string] {
        // c.ii.
        if (nominative === "scian")
          return [genitive === "scine", "scine"];

        const isPolysyllabic = countSyllables(nominative) > 1;
        const syncopeRule = isPolysyllabic
          && (/[dhcm]il$/.test(nominative)
            || /[thd]ir$/.test(nominative)
            || /ghid$/.test(nominative));
        if (!syncopeRule) {
          const modifiedReplaceTable = [...palatalizationReplaceTable];
          // c.i.
          if (isPolysyllabic)
            // TODO c.i is unclear. The example it gives is clearly 1 syllable, but
            // then says that ea is changed to i in monosyllabic nouns.
            modifiedReplaceTable[0] = [
              new RegExp(`^(.*[${Consonants}])?ea([${Consonants}]+)$`),
              "$1ei$2"
            ];

          const expectedGenitiveSingularForm = isPolysyllabic
            && /(?:e?ach)$/.test(nominative)
            // b.
            ? nominative.replace(/each$/, "í")
              .replace(/ach$/, "aí")
            // a.
            : palatalize(nominative, undefined, modifiedReplaceTable) + "e";

          const isExpected = genitive === expectedGenitiveSingularForm;
          // TODO expand on this
          return [isExpected, expectedGenitiveSingularForm];
        } else {
          const expectedGenitiveSingularForm = syncope(nominative) + "e";
          return [genitive === expectedGenitiveSingularForm, expectedGenitiveSingularForm];
        }
      }

      const all2ndDeclensionNounsIter = repository.db.prepare(
        `SELECT
          n.noun_id AS nounId,
          n.declension AS declension,
          form.value AS value,
          form.gender AS gender,
          form.form_name AS formName
        FROM noun AS n
        JOIN noun_form AS form ON form.noun_id = n.noun_id
        WHERE n.declension = 2 AND form.form_name IN ('sgNom', 'sgGen')`
      ).iterate();

      const groupedNouns = Map.groupBy(
        all2ndDeclensionNounsIter,
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
          const [isValid, expected] = checkGenitiveSingular2ndDeclension(
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
        const mismatchFilePath = "./mismatches/genitive_singular_2nd_declension_mismatches.txt";
        fs.writeFileSync(
          path.join(__dirname, mismatchFilePath),
          mismatches.map(m => `${m.id}, nom: "${m.nom}", expected gen: "${m.genExpected}", actual gen: "${m.genActual}"`).join("\n")
        );
        console.error(`Found ${mismatches.length} mismatches. Details written to ${mismatchFilePath}`);
      }
    });
  });
});
