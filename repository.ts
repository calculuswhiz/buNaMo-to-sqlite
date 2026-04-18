import { DatabaseSync } from 'node:sqlite';
import fs from 'fs/promises';
import { _nn } from './util';

const uninitializedErrorMessage = 'Repository must be initialized before use';

export async function initializeDefaultDb(clean: boolean) {
  if (clean)
    await fs.rm('./output/gramadan.sqlite', { force: true });

  const db = new DatabaseSync('./output/gramadan.sqlite');
  db.exec(await fs.readFile('./sql/Schema.sql', 'utf-8'));
  return db;
}

export class Repository {
  db: DatabaseSync;
  private inserters: {
    insertLexeme: ReturnType<DatabaseSync['prepare']>,
    insertNoun: ReturnType<DatabaseSync['prepare']>,
    insertNounForm: ReturnType<DatabaseSync['prepare']>,
    insertNounPhrase: ReturnType<DatabaseSync['prepare']>,
    insertNounPhraseForm: ReturnType<DatabaseSync['prepare']>,
    insertAdjective: ReturnType<DatabaseSync['prepare']>,
    insertAdjectiveForm: ReturnType<DatabaseSync['prepare']>,
    insertVerb: ReturnType<DatabaseSync['prepare']>,
    insertVerbForm: ReturnType<DatabaseSync['prepare']>,
    insertPreposition: ReturnType<DatabaseSync['prepare']>,
    insertPrepositionForm: ReturnType<DatabaseSync['prepare']>,
    insertPossessive: ReturnType<DatabaseSync['prepare']>,
    insertPossessiveForm: ReturnType<DatabaseSync['prepare']>
  } | undefined;

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
    const directoryName = './sql/PreparedStatements';

    this.inserters = {
      insertLexeme: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertLexeme.sql`, 'utf-8')
      ),
      insertNoun: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertNoun.sql`, 'utf-8')
      ),
      insertNounForm: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertNounForm.sql`, 'utf-8')
      ),
      insertNounPhrase: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertNounPhrase.sql`, 'utf-8')
      ),
      insertNounPhraseForm: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertNounPhraseForm.sql`, 'utf-8')
      ),
      insertAdjective: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertAdjective.sql`, 'utf-8')
      ),
      insertAdjectiveForm: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertAdjectiveForm.sql`, 'utf-8')
      ),
      insertVerb: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertVerb.sql`, 'utf-8')
      ),
      insertVerbForm: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertVerbForm.sql`, 'utf-8')
      ),
      insertPreposition: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertPreposition.sql`, 'utf-8')
      ),
      insertPrepositionForm: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertPrepositionForm.sql`, 'utf-8')
      ),
      insertPossessive: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertPossessive.sql`, 'utf-8')
      ),
      insertPossessiveForm: this.db.prepare(
        await fs.readFile(`${directoryName}/InsertPossessiveForm.sql`, 'utf-8')
      )
    };
  }

  // Insertion API. Always returns ID of the inserted row

  insertLexeme(kind: string, lemma: string, disambig: string | null) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertLexeme
      .run(null, kind, lemma, disambig)
      .lastInsertRowid as number;
  }

  insertNoun(
    lexemeId: number,
    declension: number,
    isProper: boolean,
    isImmutable: boolean,
    isDefinite: boolean,
    allowArticledGenitive: boolean) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertNoun
      .run(
        lexemeId,
        declension,
        +isProper,
        +isImmutable,
        +isDefinite,
        +allowArticledGenitive
      ).lastInsertRowid as number;
  }

  insertNounForm(
    nounId: number,
    slot: string,
    value: string,
    gender: string | null,
    strength: string | null
  ) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertNounForm
      .run(null, nounId, slot, value, gender, strength)
      .lastInsertRowid as number;
  }

  insertNounPhrase(
    lexemeId: number,
    isDefinite: boolean,
    isPossessed: boolean,
    isImmutable: boolean,
    forceNominative: boolean) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertNounPhrase
      .run(lexemeId, +isDefinite, +isPossessed, +isImmutable, +forceNominative)
      .lastInsertRowid as number;
  }

  insertNounPhraseForm(
    nounPhraseId: number,
    slot: string,
    value: string,
    gender: string | null
  ) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertNounPhraseForm
      .run(null, nounPhraseId, slot, value, gender)
      .lastInsertRowid as number;
  }

  insertAdjective(lexemeId: number, declension: number, isPre: boolean) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertAdjective
      .run(lexemeId, declension, +isPre)
      .lastInsertRowid as number;
  }

  insertAdjectiveForm(
    adjectiveId: number,
    slot: string,
    value: string,
  ) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertAdjectiveForm
      .run(null, adjectiveId, slot, value)
      .lastInsertRowid as number;
  }

  insertVerb(lexemeId: number) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertVerb
      .run(lexemeId)
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
      this.inserters, uninitializedErrorMessage
    ).insertVerbForm
      .run(null, verbId, formType, value, tense, dependency, mood, person)
      .lastInsertRowid as number;
  }

  insertPreposition(lexemeId: number) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertPreposition
      .run(lexemeId)
      .lastInsertRowid as number;
  }

  insertPrepositionForm(
    prepositionId: number,
    slot: string,
    value: string
  ) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertPrepositionForm
      .run(null, prepositionId, slot, value)
      .lastInsertRowid as number;
  }

  insertPossessive(
    lexemeId: number,
    mutation: string,
    emphasizer: string
  ) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertPossessive
      .run(lexemeId, mutation, emphasizer)
      .lastInsertRowid as number;
  }

  insertPossessiveForm(
    possessiveId: number,
    slot: string,
    value: string
  ) {
    return _nn(
      this.inserters, uninitializedErrorMessage
    ).insertPossessiveForm
      .run(null, possessiveId, slot, value)
      .lastInsertRowid as number;
  }
}