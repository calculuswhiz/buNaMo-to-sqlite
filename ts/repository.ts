import { DatabaseSync } from 'node:sqlite';
import fs from 'fs/promises';
import { _nn, lowerFirstLetter } from './util';
import path from 'path';
import { Adjective, AdjectiveForm, type AdjectiveFormName } from './model/adjective';

const uninitializedErrorMessage = 'Repository must be initialized before use (.initialize() must be called)';

export async function initializeDefaultDb(clean: boolean, outFile: string) {
  if (clean)
    await fs.rm(outFile, { force: true });

  const db = new DatabaseSync(outFile);
  db.exec(await fs.readFile('./sql/Schema.sql', 'utf-8'));
  return db;
}

export function getExistingDb(outFile: string) {
  const db = new DatabaseSync(outFile);
  return db;
}

export class Repository {
  db: DatabaseSync;

  /** SQL insert statements */
  private inserters: {
    [key: string]: ReturnType<DatabaseSync['prepare']>;
  } = {};

  /** SQL read statements */
  private readers: {
    [key: string]: ReturnType<DatabaseSync['prepare']>;
  } = {};

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  /** Create initial database, optionally cleaning existing one
   * @param clean Whether to delete existing database file before creating a new one
   */
  async initialize() {
    await this.generatePreparedStatements();
  }

  inTransaction = false;

  beginTransaction() {
    this.db.exec('BEGIN');
    this.inTransaction = true;
  }

  commitTransaction() {
    this.db.exec('COMMIT');
    this.inTransaction = false;
  }

  rollbackTransaction() {
    this.db.exec('ROLLBACK');
    this.inTransaction = false;
  }

  async generatePreparedStatements() {
    const insertDirectory = path.join(__dirname, '../sql/Inserts');
    for (const file of await fs.readdir(insertDirectory, { withFileTypes: true })) {
      if (!file.name.endsWith('.sql'))
        continue;

      this.inserters[lowerFirstLetter(file.name.slice(0, -4))] = this.db.prepare(
        await fs.readFile(path.join(insertDirectory, file.name), 'utf-8')
      );
    }

    const readDirectory = path.join(__dirname, '../sql/Reads');
    for (const file of await fs.readdir(readDirectory, { withFileTypes: true })) {
      if (!file.name.endsWith('.sql'))
        continue;
      this.readers[lowerFirstLetter(file.name.slice(0, -4))] = this.db.prepare(
        await fs.readFile(path.join(readDirectory, file.name), 'utf-8')
      );
    }
  }

  // Insertion API. Always returns ID of the inserted row

  insertNoun(
    declension: number,
    isProper: boolean,
    isImmutable: boolean,
    isDefinite: boolean,
    allowArticledGenitive: boolean,
    disambig: string) {
    return _nn(
      this.inserters.insertNoun
      , uninitializedErrorMessage
    ).run(
      declension,
      +isProper,
      +isImmutable,
      +isDefinite,
      +allowArticledGenitive,
      disambig
    ).lastInsertRowid as number;
  }

  insertNounForm(
    nounId: number,
    formName: string,
    value: string,
    gender: string | null,
    strength: string | null
  ) {
    return _nn(
      this.inserters.insertNounForm,
      uninitializedErrorMessage
    ).run(nounId, formName, value, gender, strength)
      .lastInsertRowid as number;
  }

  insertNounPhrase(
    isDefinite: boolean,
    isPossessed: boolean,
    isImmutable: boolean,
    forceNominative: boolean,
    disambig: string) {
    return _nn(
      this.inserters.insertNounPhrase,
      uninitializedErrorMessage
    ).run(+isDefinite, +isPossessed, +isImmutable, +forceNominative, disambig)
      .lastInsertRowid as number;
  }

  insertNounPhraseForm(
    nounPhraseId: number,
    formName: string,
    value: string,
    gender: string | null
  ) {
    return _nn(
      this.inserters.insertNounPhraseForm,
      uninitializedErrorMessage
    ).run(nounPhraseId, formName, value, gender)
      .lastInsertRowid as number;
  }

  insertAdjective(declension: number, isPre: boolean, disambig: string) {
    return _nn(
      this.inserters.insertAdjective,
      uninitializedErrorMessage
    ).run(declension, +isPre, disambig)
      .lastInsertRowid as number;
  }

  insertAdjectiveForm(
    adjectiveId: number,
    formName: string,
    value: string,
  ) {
    return _nn(
      this.inserters.insertAdjectiveForm, uninitializedErrorMessage
    ).run(adjectiveId, formName, value)
      .lastInsertRowid as number;
  }

  insertVerb(disambig: string) {
    return _nn(
      this.inserters.insertVerb, uninitializedErrorMessage
    ).run(disambig)
      .lastInsertRowid as number;
  }

  insertVerbForm(
    verbId: number,
    formType: string,
    value: string,
    tense: string | null,
    dependency: string | null,
    mood: string | null,
    person: string | null
  ) {
    return _nn(
      this.inserters.insertVerbForm, uninitializedErrorMessage
    ).run(verbId, formType, value, tense, dependency, mood, person)
      .lastInsertRowid as number;
  }

  insertPreposition(disambig: string, lemma: string) {
    return _nn(
      this.inserters.insertPreposition, uninitializedErrorMessage
    ).run(disambig, lemma)
      .lastInsertRowid as number;
  }

  insertPrepositionForm(
    prepositionId: number,
    formName: string,
    value: string
  ) {
    return _nn(
      this.inserters.insertPrepositionForm, uninitializedErrorMessage
    ).run(prepositionId, formName, value)
      .lastInsertRowid as number;
  }

  insertPossessive(
    mutation: string,
    emphasizer: string,
    disambig: string,
    lemma: string
  ) {
    return _nn(
      this.inserters.insertPossessive, uninitializedErrorMessage
    ).run(mutation, emphasizer, disambig, lemma)
      .lastInsertRowid as number;
  }

  insertPossessiveForm(
    possessiveId: number,
    formName: string,
    value: string
  ) {
    return _nn(
      this.inserters.insertPossessiveForm, uninitializedErrorMessage
    ).run(possessiveId, formName, value)
      .lastInsertRowid as number;
  }

  // Retrieval API. Don't try to support everything. 
  // You can always write custom SQL if you need it.

  getAdjectiveByLemma(lemma: string) {
    const foundId = this.db.prepare(
      `SELECT f.adjective_id
      FROM adjective_form AS f 
      WHERE f.form_name = 'sgNom' AND f.value = :lemma`
    ).all({ lemma }).at(0)?.adjective_id;
    if (foundId == null)
      return null;

    const adjectiveRaw = this.db.prepare(
      `SELECT
        adj.adjective_id AS adjectiveId,
        adj.declension AS declension,
        adj.is_pre AS isPre,
        adj.disambig AS disambig
      FROM adjective AS adj
      WHERE adj.adjective_id = :foundId`
    ).get({ foundId });

    if (adjectiveRaw == null)
      return null;

    const adjective = new Adjective({
      adjectiveId: adjectiveRaw.adjectiveId as number,
      declension: adjectiveRaw.declension as number,
      isPre: !!adjectiveRaw.isPre,
      disambig: adjectiveRaw.disambig as string,
    });

    const formsRaw = this.db.prepare(
      `SELECT
        form.adjective_form_id AS adjectiveFormId,
        form.form_name AS formName,
        form.value AS value
      FROM
        adjective_form form
      WHERE form.adjective_id = :foundId`
    ).all({ foundId });

    for (const formRaw of formsRaw) {
      const form = {
        adjectiveFormId: formRaw.adjectiveFormId as number,
        formName: formRaw.formName as string,
        value: formRaw.value as string
      };
      adjective.forms[form.formName as AdjectiveFormName].push(
        new AdjectiveForm(
          form.adjectiveFormId,
          adjective.adjectiveId,
          form.formName as AdjectiveFormName,
          form.value
        )
      );
    }

    return adjective;
  }
}