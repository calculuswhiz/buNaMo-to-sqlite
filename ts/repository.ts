import { DatabaseSync } from 'node:sqlite';
import fs from 'fs/promises';
import { _nn, lowerFirstLetter } from './util';
import path from 'path';
import { Adjective, AdjectiveForm, type AdjectiveFormName } from './model/adjective';
import { Noun, NounForm, type NounFormName } from './model/noun';
import type { Emphasizer, Gender, Mutation, Strength } from './features';
import { NounPhrase, NounPhraseForm, type NounPhraseFormName } from './model/nounPhrase';
import { Possessive, PossessiveForm, type PossessiveFormName } from './model/possessive';
import { Preposition, PrepositionForm, type PrepositionFormName } from './model/preposition';
import { Verb, VerbForm, type Dependency, type Mood, type Person, type Tense } from './model/verb';

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

  getNounByLemma(lemma: string) {
    const foundId = this.db.prepare(
      `SELECT f.noun_id
      FROM noun_form AS f 
      WHERE f.form_name = 'sgNom' AND f.value = :lemma`
    ).all({ lemma }).at(0)?.noun_id;
    if (foundId == null)
      return null;

    const nounRaw = this.db.prepare(
      `SELECT
        n.noun_id AS nounId,
        n.declension AS declension,
        n.is_proper AS isProper,
        n.is_immutable AS isImmutable,
        n.is_definite AS isDefinite,
        n.allow_articled_genitive AS allowArticledGenitive,
        n.disambig AS disambig
      FROM noun AS n
      WHERE n.noun_id = :foundId`
    ).get({ foundId });

    if (nounRaw == null)
      return null;

    const noun = new Noun({
      nounId: nounRaw.nounId as number,
      declension: nounRaw.declension as number,
      isProper: !!nounRaw.isProper,
      isImmutable: !!nounRaw.isImmutable,
      isDefinite: !!nounRaw.isDefinite,
      allowArticledGenitive: !!nounRaw.allowArticledGenitive,
      disambig: nounRaw.disambig as string,
    });

    const formsRaw = this.db.prepare(
      `SELECT
        form.noun_form_id AS nounFormId,
        form.form_name AS formName,
        form.value AS value,
        form.gender AS gender,
        form.strength AS strength
      FROM
        noun_form form
      WHERE form.noun_id = :foundId`
    ).all({ foundId });

    for (const formRaw of formsRaw) {
      const form = {
        nounFormId: formRaw.nounFormId as number,
        formName: formRaw.formName as string,
        value: formRaw.value as string,
        gender: formRaw.gender as string | null,
        strength: formRaw.strength as string | null
      };
      noun.forms[form.formName as NounFormName].push(
        new NounForm(
          form.nounFormId,
          noun.nounId,
          form.formName as NounFormName,
          form.value,
          form.gender as Gender | null,
          form.strength as Strength | null
        )
      );
    }

    return noun;
  }

  getNounPhraseByLemma(lemma: string) {
    const foundId = this.db.prepare(
      `SELECT f.noun_phrase_id
      FROM noun_phrase_form AS f 
      WHERE f.form_name = 'sgNom' AND f.value = :lemma`
    ).all({ lemma }).at(0)?.noun_phrase_id;
    if (foundId == null)
      return null;

    const nounPhraseRaw = this.db.prepare(
      `SELECT
        np.noun_phrase_id AS nounPhraseId,
        np.is_definite AS isDefinite,
        np.is_possessed AS isPossessed,
        np.is_immutable AS isImmutable,
        np.force_nominative AS forceNominative,
        np.disambig AS disambig
      FROM noun_phrase AS np
      WHERE np.noun_phrase_id = :foundId`
    ).get({ foundId });

    if (nounPhraseRaw == null)
      return null;

    const nounPhrase = new NounPhrase({
      nounPhraseId: nounPhraseRaw.nounPhraseId as number,
      isDefinite: !!nounPhraseRaw.isDefinite,
      isPossessed: !!nounPhraseRaw.isPossessed,
      isImmutable: !!nounPhraseRaw.isImmutable,
      forceNominative: !!nounPhraseRaw.forceNominative,
      disambig: nounPhraseRaw.disambig as string
    });

    const formsRaw = this.db.prepare(
      `SELECT
        form.noun_phrase_form_id AS nounPhraseFormId,
        form.form_name AS formName,
        form.value AS value,
        form.gender AS gender
      FROM
        noun_phrase_form form
      WHERE form.noun_phrase_id = :foundId`
    ).all({ foundId });

    for (const formRaw of formsRaw) {
      const form = {
        nounPhraseFormId: formRaw.nounPhraseFormId as number,
        formName: formRaw.formName as string,
        value: formRaw.value as string,
        gender: formRaw.gender as string | null
      };
      nounPhrase.forms[form.formName as NounPhraseFormName].push(
        new NounPhraseForm(
          form.nounPhraseFormId,
          nounPhrase.nounPhraseId,
          form.formName as NounPhraseFormName,
          form.value,
          form.gender as Gender | null
        )
      );
    }

    return nounPhrase;
  }

  getPossessiveByLemma(lemma: string) {
    // TODO these should return more than one since lemma is not unique

    const possessiveRaw = this.db.prepare(
      `SELECT
        p.possessive_id AS possessiveId,
        p.mutation AS mutation,
        p.emphasizer AS emphasizer,
        p.disambig AS disambig,
        p.lemma AS lemma
      FROM possessive AS p
      WHERE p.lemma = :lemma`
    ).get({ lemma });

    if (possessiveRaw == null)
      return null;

    const possessive = new Possessive({
      possessiveId: possessiveRaw.possessiveId as number,
      mutation: possessiveRaw.mutation as Mutation,
      emphasizer: possessiveRaw.emphasizer as Emphasizer,
      disambig: possessiveRaw.disambig as string
    });

    const formsRaw = this.db.prepare(
      `SELECT
        form.possessive_form_id AS possessiveFormId,
        form.form_name AS formName,
        form.value AS value
      FROM
        possessive_form form
      WHERE form.possessive_id = :possessiveId`
    ).all({ possessiveId: possessive.possessiveId });

    for (const formRaw of formsRaw) {
      const form = {
        possessiveFormId: formRaw.possessiveFormId as number,
        formName: formRaw.formName as string,
        value: formRaw.value as string
      };
      possessive.forms[form.formName as PossessiveFormName].push(
        new PossessiveForm(
          form.possessiveFormId,
          possessive.possessiveId,
          form.formName as PossessiveFormName,
          form.value
        )
      );
    }

    return possessive;
  }

  getPrepositionByLemma(lemma: string) {
    const prepositionRaw = this.db.prepare(
      `SELECT
        p.preposition_id AS prepositionId,
        p.disambig AS disambig,
        p.lemma AS lemma
      FROM preposition AS p
      WHERE p.lemma = :lemma`
    ).get({ lemma });

    if (prepositionRaw == null)
      return null;

    const preposition = new Preposition({
      prepositionId: prepositionRaw.prepositionId as number,
      disambig: prepositionRaw.disambig as string,
      lemma: prepositionRaw.lemma as string
    });

    const formsRaw = this.db.prepare(
      `SELECT
        form.preposition_form_id AS prepositionFormId,
        form.form_name AS formName,
        form.value AS value
      FROM
        preposition_form form
      WHERE form.preposition_id = :prepositionId`
    ).all({ prepositionId: preposition.prepositionId });

    for (const formRaw of formsRaw) {
      const form = {
        prepositionFormId: formRaw.prepositionFormId as number,
        formName: formRaw.formName as string,
        value: formRaw.value as string
      };
      preposition.forms[form.formName as PrepositionFormName].push(
        new PrepositionForm(
          form.prepositionFormId,
          preposition.prepositionId,
          form.formName as PrepositionFormName,
          form.value
        )
      );
    }

    return preposition;
  }

  getVerbByLemma(lemma: string) {
    const foundId = this.db.prepare(
      `SELECT f.verb_id
      FROM verb_form AS f 
      WHERE 
        (f.tense = 'Pres' AND f.dependency = 'Dep' AND f.person = 'Sg2' AND f.value = :lemma)
        OR (f.tense = 'Past' AND f.dependency = 'Indep' AND f.person = 'Base' AND f.value = :lemma)`
    ).all({ lemma }).at(0)?.verb_id;
    if (foundId == null)
      return null;

    const verbRaw = this.db.prepare(
      `SELECT
        v.verb_id AS verbId,
        v.disambig AS disambig
      FROM verb AS v
      WHERE v.verb_id = :foundId`
    ).get({ foundId });

    if (verbRaw == null)
      return null;

    const verb = new Verb({
      verbId: verbRaw.verbId as number,
      disambig: verbRaw.disambig as string
    });

    const formsRaw = this.db.prepare(
      `SELECT
        form.verb_form_id AS verbFormId,
        form.form_type AS formType,
        form.value AS value,
        form.tense AS tense,
        form.dependency AS dependency,
        form.mood AS mood,
        form.person AS person
      FROM
        verb_form form
      WHERE form.verb_id = :verbId`
    ).all({ verbId: foundId });

    for (const formRaw of formsRaw) {
      const form = {
        verbFormId: formRaw.verbFormId as number,
        formType: formRaw.formType as string,
        value: formRaw.value as string,
        tense: formRaw.tense as Tense | null,
        dependency: formRaw.dependency as Dependency | null,
        mood: formRaw.mood as Mood | null,
        person: formRaw.person as Person | null
      };

      const newForm = new VerbForm(
        form.verbFormId,
        verb.verbId,
        form.formType,
        form.value,
        form.tense,
        form.dependency,
        form.mood,
        form.person
      );

      if (form.tense != null && form.dependency != null && form.person != null) {
        verb.forms.tenses[form.tense][form.dependency][form.person]
          .push(newForm);
      } else if (form.mood != null && form.person != null) {
        verb.forms.moods[form.mood][form.person]
          .push(newForm);
      } else {
        verb.forms[form.formType as 'verbalNoun' | 'verbalAdjective']
          .push(newForm);
      }
    }

    return verb;
  }
}