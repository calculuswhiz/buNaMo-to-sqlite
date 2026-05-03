import xml2js from "xml2js";
import fs from "fs/promises";
import { initializeDefaultDb, Repository } from "./repository";
import { ok, err, type Result } from "./neverEverThrow";

// Transforms BuNaMo XML data into a SQLite database

async function parseXmlFile(filePath: string) {
  const xmlData = await fs.readFile(filePath, "utf-8");
  return xml2js.parseStringPromise(xmlData);
}

/** Controls transaction batch size */
const batchSize = 500;

async function processAdjectives(repository: Repository): Promise<Result<null, Error>> {
  const adjectiveFiles = (await fs.readdir("./BuNaMo-master/adjective"))
    .toSorted();

  console.log(`Processing ${adjectiveFiles.length} adjective files...`);
  for (const [i, file] of adjectiveFiles.entries()) {
    if (i % batchSize === 0) {
      if (i > 0) {
        repository.commitTransaction();
      }
      repository.beginTransaction();
      console.log(`Processed ${i} / ${adjectiveFiles.length} files...`);
    }

    const { adjective } = await parseXmlFile(`./BuNaMo-master/adjective/${file}`);

    const adjectiveInsertResult = repository.insertAdjective(
      adjective.$.declension,
      adjective.$.pre ?? false,
      adjective.$.disambig ?? ""
    );

    if (!adjectiveInsertResult.isOk) {
      repository.rollbackTransaction();
      return err(new Error(`Failed to insert adjective from file ${file}: ${adjectiveInsertResult.error.message}`));
    }

    for (const [formKey, formValue] of Object.entries(adjective)) {
      // Skip attributes
      if (formKey === "$")
        continue;

      const forms = formValue as { $: { default: string } }[];

      for (const form of forms) {
        const insertFormResult = repository.insertAdjectiveForm(
          adjectiveInsertResult.value, formKey, form.$.default
        );

        if (!insertFormResult.isOk) {
          repository.rollbackTransaction();
          return err(new Error(`Failed to insert adjective form for adjective ID ${adjectiveInsertResult.value} from file ${file}: ${insertFormResult.error.message}`));
        }
      }
    }
  }

  if (repository.inTransaction) {
    console.log("Committing remaining transaction...");
    repository.commitTransaction();
  }

  return ok(null);
}

async function processNouns(repository: Repository):
  Promise<Result<null, Error>> {
  const nounFiles = (await fs.readdir("./BuNaMo-master/noun"))
    .toSorted();

  console.log(`Processing ${nounFiles.length} noun files...`);

  for (const [i, file] of nounFiles.entries()) {
    if (i % batchSize === 0) {
      if (i > 0) {
        repository.commitTransaction();
      }
      repository.beginTransaction();
      console.log(`Processed ${i} / ${nounFiles.length} files...`);
    }

    const { noun } = await parseXmlFile(`./BuNaMo-master/noun/${file}`);

    const insertResult = repository.insertNoun(
      noun.$.declension,
      noun.$.proper ?? false,
      noun.$.immutable ?? false,
      noun.$.definite ?? false,
      noun.$.allowArticledGenitive ?? false,
      noun.$.disambig ?? ""
    );

    if (!insertResult.isOk) {
      repository.rollbackTransaction();
      return err(new Error(`Failed to insert noun from file ${file}: ${insertResult.error.message}`));
    }


    for (const [formKey, formValue] of Object.entries(noun)) {
      // Skip attributes
      if (formKey === "$")
        continue;

      const forms = formValue as { $: { default: string, gender?: string, strength?: string } }[];

      for (const form of forms) {
        const insertFormResult = repository.insertNounForm(
          insertResult.value,
          formKey,
          form.$.default,
          form.$.gender ?? null,
          form.$.strength ?? null
        );

        if (!insertFormResult.isOk) {
          repository.rollbackTransaction();
          return err(new Error(`Failed to insert noun form for noun ID ${insertResult.value} from file ${file}: ${insertFormResult.error.message}`));
        }
      }
    }
  }

  if (repository.inTransaction) {
    console.log("Committing remaining transaction...");
    repository.commitTransaction();
  }

  return ok(null);
}

async function processNounPhrases(repository: Repository): Promise<Result<null, Error>> {
  const nounPhraseFiles = (await fs.readdir("./BuNaMo-master/nounPhrase"))
    .toSorted();
  console.log(`Processing ${nounPhraseFiles.length} noun phrase files...`);

  for (const [i, file] of nounPhraseFiles.entries()) {
    if (i % batchSize === 0) {
      if (i > 0) {
        repository.commitTransaction();
      }
      repository.beginTransaction();
      console.log(`Processed ${i} / ${nounPhraseFiles.length} files...`);
    }

    const { nounPhrase } = await parseXmlFile(`./BuNaMo-master/nounPhrase/${file}`);

    const nounPhraseInsertResult = repository.insertNounPhrase(
      nounPhrase.$.definite ?? false,
      nounPhrase.$.possessed ?? false,
      nounPhrase.$.immutable ?? false,
      nounPhrase.$.forceNominative ?? false,
      nounPhrase.$.disambig ?? ""
    );

    if (!nounPhraseInsertResult.isOk) {
      repository.rollbackTransaction();
      return err(new Error(`Failed to insert noun phrase from file ${file}: ${nounPhraseInsertResult.error.message}`));
    }

    for (const [formKey, formValue] of Object.entries(nounPhrase)) {
      // Skip attributes
      if (formKey === "$")
        continue;

      const forms = formValue as { $: { default: string, gender?: string } }[];

      for (const form of forms) {
        const insertFormResult = repository.insertNounPhraseForm(
          nounPhraseInsertResult.value,
          formKey,
          form.$.default,
          form.$.gender ?? null
        );

        if (!insertFormResult.isOk) {
          repository.rollbackTransaction();
          return err(new Error(`Failed to insert noun phrase form for noun phrase ID ${nounPhraseInsertResult.value} from file ${file}: ${insertFormResult.error.message}`));
        }
      }
    }
  }

  if (repository.inTransaction) {
    console.log("Committing remaining transaction...");
    repository.commitTransaction();
  }

  return ok(null);
}

async function processPossessives(repository: Repository): Promise<Result<null, Error>> {
  const possessiveFiles = (await fs.readdir("./BuNaMo-master/possessive"))
    .toSorted();
  console.log(`Processing ${possessiveFiles.length} possessive files...`);

  for (const [i, file] of possessiveFiles.entries()) {
    if (i % batchSize === 0) {
      if (i > 0) {
        repository.commitTransaction();
      }
      repository.beginTransaction();
      console.log(`Processed ${i} / ${possessiveFiles.length} files...`);
    }

    const { possessive } = await parseXmlFile(`./BuNaMo-master/possessive/${file}`);

    const possessiveInsertResult = repository.insertPossessive(
      possessive.$.mutation ?? "",
      possessive.$.emphasizer ?? "",
      possessive.$.disambig ?? "",
      possessive.$.default ?? ""
    );

    if (!possessiveInsertResult.isOk) {
      repository.rollbackTransaction();
      return err(new Error(`Failed to insert possessive from file ${file}: ${possessiveInsertResult.error.message}`));
    }

    for (const [formKey, formValue] of Object.entries(possessive)) {
      // Skip attributes
      if (formKey === "$")
        continue;

      const forms = formValue as { $: { default: string, gender?: string } }[];

      for (const form of forms) {
        const insertFormResult = repository.insertPossessiveForm(
          possessiveInsertResult.value,
          formKey,
          form.$.default
        );

        if (!insertFormResult.isOk) {
          repository.rollbackTransaction();
          return err(new Error(`Failed to insert possessive form for possessive ID ${possessiveInsertResult.value} from file ${file}: ${insertFormResult.error.message}`));
        }
      }
    }
  }

  if (repository.inTransaction) {
    console.log("Committing remaining transaction...");
    repository.commitTransaction();
  }

  return ok(null);
}

async function processPrepositions(repository: Repository): Promise<Result<null, Error>> {
  const prepositionFiles = (await fs.readdir("./BuNaMo-master/preposition"))
    .toSorted();
  console.log(`Processing ${prepositionFiles.length} preposition files...`);

  for (const [i, file] of prepositionFiles.entries()) {
    if (i % batchSize === 0) {
      if (i > 0) {
        repository.commitTransaction();
      }
      repository.beginTransaction();
      console.log(`Processed ${i} / ${prepositionFiles.length} files...`);
    }

    const { preposition } = await parseXmlFile(`./BuNaMo-master/preposition/${file}`);

    const prepositionInsertResult = repository.insertPreposition(
      preposition.$.disambig ?? "",
      preposition.$.default ?? ""
    );

    if (!prepositionInsertResult.isOk) {
      repository.rollbackTransaction();
      return err(new Error(`Failed to insert preposition from file ${file}: ${prepositionInsertResult.error.message}`));
    }

    for (const [formKey, formValue] of Object.entries(preposition)) {
      // Skip attributes
      if (formKey === "$")
        continue;

      const forms = formValue as { $: { default: string, gender?: string } }[];

      for (const form of forms) {
        const insertFormResult = repository.insertPrepositionForm(
          prepositionInsertResult.value,
          formKey,
          form.$.default
        );

        if (!insertFormResult.isOk) {
          repository.rollbackTransaction();
          return err(new Error(`Failed to insert preposition form for preposition ID ${prepositionInsertResult.value} from file ${file}: ${insertFormResult.error.message}`));
        }
      }
    }
  }

  if (repository.inTransaction) {
    console.log("Committing remaining transaction...");
    repository.commitTransaction();
  }
  return ok(null);
}

async function processVerbs(repository: Repository): Promise<Result<null, Error>> {
  const verbFiles = (await fs.readdir("./BuNaMo-master/verb"))
    .toSorted();
  console.log(`Processing ${verbFiles.length} verb files...`);

  for (const [i, file] of verbFiles.entries()) {
    if (i % batchSize === 0) {
      if (i > 0) {
        repository.commitTransaction();
      }
      repository.beginTransaction();
      console.log(`Processed ${i} / ${verbFiles.length} files...`);
    }

    const { verb } = await parseXmlFile(`./BuNaMo-master/verb/${file}`);

    const verbInsertResult = repository.insertVerb(
      verb.$.disambig ?? ""
    );
    if (!verbInsertResult.isOk) {
      repository.rollbackTransaction();
      return err(new Error(`Failed to insert verb from file ${file}: ${verbInsertResult.error.message}`));
    }
    const verbId = verbInsertResult.value;
    // Note: Do not rely on file name comparisons. Unicode characters cause issues with string comparisons.
    const isBí = verb.$.default === "bí";

    for (const [formKey, formValue] of Object.entries(verb)) {
      // Skip attributes
      if (formKey === "$")
        continue;

      const forms = formValue as {
        $: {
          default: string,
          tense?: string,
          dependency?: string,
          mood?: string,
          person?: string
        }
      }[];

      for (const form of forms) {
        // Corrective action: "Cond" is not a tense, but a mood.
        const isConditional = form.$.tense === "Cond";

        const tense = isConditional
          ? null
          : (isBí
            // Corrective action: "Cont" -> "Hab" for "Habitual"
            ? (form.$.tense?.replace("Cont", "Hab") ?? null)
            // Corrective action: Verbs other than "bí" have "Pres" tenses mislabeled as "PresCont"
            : (form.$.tense
              ?.replace("PresCont", "Pres")
              .replace("PastCont", "PastHab") ?? null));

        const mood = isConditional
          ? "Cond"
          // Corrective action: null mood should be "Ind" (indicative)
          : form.$.mood ?? "Ind";

        const insertFormResult = repository.insertVerbForm(
          verbId,
          formKey,
          form.$.default,
          tense,
          form.$.dependency ?? null,
          mood,
          form.$.person ?? null
        );

        if (!insertFormResult.isOk) {
          repository.rollbackTransaction();
          return err(new Error(`Failed to insert verb form for verb ID ${verbInsertResult.value} from file ${file}: ${insertFormResult.error.message}`));
        }
      }
    }
  }

  if (repository.inTransaction) {
    console.log("Committing remaining transaction...");
    repository.commitTransaction();
  }
  return ok(null);
}

async function main() {
  if (!await fs.stat("./BuNaMo-master").catch(() => false)) {
    console.error("BuNaMo-master directory not found. Please clone the BuNaMo repository into the project directory.");
    console.error("    git clone https://github.com/michmech/BuNaMo.git");
    process.exit(1);
  }

  const shouldRebuild = process.argv.includes("--rebuild");

  const db = await initializeDefaultDb(shouldRebuild, "./output/buNaMo.sqlite");
  const repository = new Repository(db);
  await repository.initialize();

  const now = performance.now();

  const toProcess = [
    processAdjectives,
    processNouns,
    processNounPhrases,
    processPossessives,
    processPrepositions,
    processVerbs
  ];
  for (const processFunc of toProcess) {
    const result = await processFunc(repository);
    if (!result.isOk) {
      console.error(result.error);
      process.exit(1);
    }
  }

  const end = performance.now();
  console.log(`Processing completed in ${(end - now) / 1000} seconds.`);
}

main().catch(console.error);
