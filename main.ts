import xml2js from 'xml2js';
import fs from 'fs/promises';
import { initializeDefaultDb, Repository } from './repository';

async function parseXmlFile(filePath: string): Promise<any> {
  const xmlData = await fs.readFile(filePath, 'utf-8');
  return xml2js.parseStringPromise(xmlData);
}

const batchSize = 500;

async function processAdjectives(repository: Repository) {
  const adjectiveFiles = (await fs.readdir('./BuNaMo-master/adjective'))
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

    try {
      const { adjective } = await parseXmlFile(`./BuNaMo-master/adjective/${file}`);

      const lexemeId = repository.insertLexeme(
        'adjective',
        adjective.sgNom[0].$.default,
        adjective.$.disambig
      );

      const adjectiveId = repository.insertAdjective(
        lexemeId,
        adjective.$.declension,
        adjective.$.pre ?? false
      );

      for (const [formKey, formValue] of Object.entries(adjective)) {
        // Skip attributes
        if (formKey === '$')
          continue;

        const forms = formValue as { $: { default: string } }[];

        for (const form of forms) {
          repository.insertAdjectiveForm(
            adjectiveId, formKey, form.$.default
          );
        }
      }
    } catch (error) {
      repository.rollbackTransaction();
      console.error(`Error processing file ${file}:`, error);
      // Re-throw to stop processing further files
      throw error;
    }
  }

  if (repository.inTransaction) {
    console.log('Committing remaining transaction...');
    repository.commitTransaction();
  }
}

async function processNouns(repository: Repository) {
  const nounFiles = (await fs.readdir('./BuNaMo-master/noun'))
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

    try {
      const { noun } = await parseXmlFile(`./BuNaMo-master/noun/${file}`);

      const lexemeId = repository.insertLexeme(
        'noun',
        noun.sgNom[0].$.default,
        noun.$.disambig
      );

      const nounId = repository.insertNoun(
        lexemeId,
        noun.$.declension,
        noun.$.proper ?? false,
        noun.$.immutable ?? false,
        noun.$.definite ?? false,
        noun.$.allowArticledGenitive ?? false
      );

      for (const [formKey, formValue] of Object.entries(noun)) {
        // Skip attributes
        if (formKey === '$')
          continue;

        const forms = formValue as { $: { default: string, gender?: string, strength?: string } }[];

        for (const form of forms) {
          repository.insertNounForm(
            nounId,
            formKey,
            form.$.default,
            form.$.gender ?? null,
            form.$.strength ?? null
          );
        }
      }
    } catch (error) {
      repository.rollbackTransaction();
      console.error(`Error processing file ${file}:`, error);
      // Re-throw to stop processing further files
      throw error;
    }
  }

  if (repository.inTransaction) {
    console.log('Committing remaining transaction...');
    repository.commitTransaction();
  }
}

async function processNounPhrases(repository: Repository) {
  const nounPhraseFiles = (await fs.readdir('./BuNaMo-master/nounPhrase'))
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

    try {
      const { nounPhrase } = await parseXmlFile(`./BuNaMo-master/nounPhrase/${file}`);

      const lexemeId = repository.insertLexeme(
        'nounPhrase',
        (
          nounPhrase.sgNom
          ?? nounPhrase.sgNomArt
          ?? nounPhrase.plNom
          ?? nounPhrase.plNomArt
        )[0].$.default,
        nounPhrase.$.disambig
      );

      const nounPhraseId = repository.insertNounPhrase(
        lexemeId,
        nounPhrase.$.definite ?? false,
        nounPhrase.$.possessed ?? false,
        nounPhrase.$.immutable ?? false,
        nounPhrase.$.forceNominative ?? false
      );

      for (const [formKey, formValue] of Object.entries(nounPhrase)) {
        // Skip attributes
        if (formKey === '$')
          continue;

        const forms = formValue as { $: { default: string, gender?: string } }[];

        for (const form of forms) {
          repository.insertNounPhraseForm(
            nounPhraseId,
            formKey,
            form.$.default,
            form.$.gender ?? null
          );
        }
      }
    } catch (error) {
      repository.rollbackTransaction();
      console.error(`Error processing file ${file}:`, error);
      // Re-throw to stop processing further files
      throw error;
    }
  }

  if (repository.inTransaction) {
    console.log('Committing remaining transaction...');
    repository.commitTransaction();
  }
}

async function processPossessives(repository: Repository) {
  const possessiveFiles = (await fs.readdir('./BuNaMo-master/possessive'))
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

    try {
      const { possessive } = await parseXmlFile(`./BuNaMo-master/possessive/${file}`);

      const lexemeId = repository.insertLexeme(
        'possessive',
        possessive.full[0].$.default,
        possessive.$.disambig
      );

      const possessiveId = repository.insertPossessive(
        lexemeId,
        possessive.$.mutation ?? '',
        possessive.$.emphasizer ?? ''
      );

      for (const [formKey, formValue] of Object.entries(possessive)) {
        // Skip attributes
        if (formKey === '$')
          continue;

        const forms = formValue as { $: { default: string, gender?: string } }[];

        for (const form of forms) {
          repository.insertPossessiveForm(
            possessiveId,
            formKey,
            form.$.default
          );
        }
      }
    } catch (error) {
      repository.rollbackTransaction();
      console.error(`Error processing file ${file}:`, error);
      // Re-throw to stop processing further files
      throw error;
    }
  }

  if (repository.inTransaction) {
    console.log('Committing remaining transaction...');
    repository.commitTransaction();
  }
}

async function processPrepositions(repository: Repository) {
  const prepositionFiles = (await fs.readdir('./BuNaMo-master/preposition'))
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

    try {
      const { preposition } = await parseXmlFile(`./BuNaMo-master/preposition/${file}`);

      const lexemeId = repository.insertLexeme(
        'preposition',
        preposition.$.default,
        preposition.$.disambig
      );

      const prepositionId = repository.insertPreposition(lexemeId);

      for (const [formKey, formValue] of Object.entries(preposition)) {
        // Skip attributes
        if (formKey === '$')
          continue;

        const forms = formValue as { $: { default: string, gender?: string } }[];

        for (const form of forms) {
          repository.insertPrepositionForm(
            prepositionId,
            formKey,
            form.$.default
          );
        }
      }
    } catch (error) {
      repository.rollbackTransaction();
      console.error(`Error processing file ${file}:`, error);
      // Re-throw to stop processing further files
      throw error;
    }
  }

  if (repository.inTransaction) {
    console.log('Committing remaining transaction...');
    repository.commitTransaction();
  }
}

async function processVerbs(repository: Repository) {
  const verbFiles = (await fs.readdir('./BuNaMo-master/verb'))
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

    try {
      const { verb } = await parseXmlFile(`./BuNaMo-master/verb/${file}`);

      const lexemeId = repository.insertLexeme(
        'verb',
        // TODO Come back to this.
        verb.$.default,
        verb.$.disambig
      );

      const verbId = repository.insertVerb(lexemeId);

      for (const [formKey, formValue] of Object.entries(verb)) {
        // Skip attributes
        if (formKey === '$')
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
          repository.insertVerbForm(
            verbId,
            formKey,
            form.$.default,
            form.$.tense ?? null,
            form.$.dependency ?? null,
            form.$.mood ?? null,
            form.$.person ?? null
          );
        }
      }
    } catch (error) {
      repository.rollbackTransaction();
      console.error(`Error processing file ${file}:`, error);
      // Re-throw to stop processing further files
      throw error;
    }
  }

  if (repository.inTransaction) {
    console.log('Committing remaining transaction...');
    repository.commitTransaction();
  }
}

async function main() {
  const db = await initializeDefaultDb(true);
  const repository = new Repository(db);
  await repository.initialize();

  const now = performance.now();

  await processAdjectives(repository);
  await processNouns(repository);
  await processNounPhrases(repository);
  await processPossessives(repository);
  await processPrepositions(repository);
  await processVerbs(repository);

  const end = performance.now();
  console.log(`Processing completed in ${(end - now) / 1000} seconds.`);
}

main().catch(console.error);
