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

  getAdjectivesByLemma(lemma: string) {
    const rawAdjectives = this.db.prepare(
      `SELECT
        adj.adjective_id AS adjectiveId,
        adj.declension AS declension,
        adj.is_pre AS isPre,
        adj.disambig AS disambig
      FROM adjective AS adj
      JOIN adjective_form AS form ON form.adjective_id = adj.adjective_id
      WHERE form.form_name = 'sgNom' AND form.value = :lemma`
    ).all({ lemma });

    const formsQuery = this.db.prepare(
      `SELECT
        form.adjective_form_id AS adjectiveFormId,
        form.form_name AS formName,
        form.value AS value
      FROM
        adjective_form form
      WHERE form.adjective_id = :foundId`
    );

    const adjectives: Adjective[] = [];
    for (const rawAdjective of rawAdjectives) {
      const adjective = new Adjective({
        adjectiveId: rawAdjective.adjectiveId as number,
        declension: rawAdjective.declension as number,
        isPre: !!rawAdjective.isPre,
        disambig: rawAdjective.disambig as string,
      });

      adjectives.push(adjective);

      const formsRaw = formsQuery.all({ foundId: adjective.adjectiveId });

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
    }

    return adjectives;
  }

  getNounsByLemma(lemma: string) {
    const rawNouns = this.db.prepare(
      `SELECT
        n.noun_id AS nounId,
        n.declension AS declension,
        n.is_proper AS isProper,
        n.is_immutable AS isImmutable,
        n.is_definite AS isDefinite,
        n.allow_articled_genitive AS allowArticledGenitive,
        n.disambig AS disambig
      FROM noun AS n
      JOIN noun_form AS form ON form.noun_id = n.noun_id
      WHERE form.form_name = 'sgNom' AND form.value = :lemma`
    ).all({ lemma });

    const formsQuery = this.db.prepare(
      `SELECT
        form.noun_form_id AS nounFormId,
        form.form_name AS formName,
        form.value AS value,
        form.gender AS gender,
        form.strength AS strength
      FROM
        noun_form form
      WHERE form.noun_id = :foundId`
    );

    const nouns: Noun[] = [];
    for (const rawNoun of rawNouns) {
      const noun = new Noun({
        nounId: rawNoun.nounId as number,
        declension: rawNoun.declension as number,
        isProper: !!rawNoun.isProper,
        isImmutable: !!rawNoun.isImmutable,
        isDefinite: !!rawNoun.isDefinite,
        allowArticledGenitive: !!rawNoun.allowArticledGenitive,
        disambig: rawNoun.disambig as string,
      });

      nouns.push(noun);

      const formsRaw = formsQuery.all({ foundId: noun.nounId });

      for (const formRaw of formsRaw) {
        const form = {
          nounFormId: formRaw.nounFormId as number,
          formName: formRaw.formName as NounFormName,
          value: formRaw.value as string,
          gender: formRaw.gender as Gender | null,
          strength: formRaw.strength as Strength | null
        };
        noun.forms[form.formName].push(
          new NounForm(
            form.nounFormId,
            noun.nounId,
            form.formName,
            form.value,
            form.gender,
            form.strength
          )
        );
      }
    }

    return nouns;
  }

  getNounPhrasesByLemma(lemma: string) {
    const rawNounPhrases = this.db.prepare(
      `SELECT
        np.noun_phrase_id AS nounPhraseId,
        np.is_definite AS isDefinite,
        np.is_possessed AS isPossessed,
        np.is_immutable AS isImmutable,
        np.force_nominative AS forceNominative,
        np.disambig AS disambig
      FROM noun_phrase AS np
      JOIN noun_phrase_form AS form ON form.noun_phrase_id = np.noun_phrase_id
      WHERE form.form_name = 'sgNom' AND form.value = :lemma`
    ).all({ lemma });

    const formsQuery = this.db.prepare(
      `SELECT
          form.noun_phrase_form_id AS nounPhraseFormId,
          form.form_name AS formName,
          form.value AS value,
          form.gender AS gender
        FROM
          noun_phrase_form form
        WHERE form.noun_phrase_id = :foundId`
    );

    const nounPhrases: NounPhrase[] = [];
    for (const rawNounPhrase of rawNounPhrases) {
      const nounPhrase = new NounPhrase({
        nounPhraseId: rawNounPhrase.nounPhraseId as number,
        isDefinite: !!rawNounPhrase.isDefinite,
        isPossessed: !!rawNounPhrase.isPossessed,
        isImmutable: !!rawNounPhrase.isImmutable,
        forceNominative: !!rawNounPhrase.forceNominative,
        disambig: rawNounPhrase.disambig as string
      });

      nounPhrases.push(nounPhrase);

      const formsRaw = formsQuery.all({ foundId: nounPhrase.nounPhraseId });

      for (const formRaw of formsRaw) {
        const form = {
          nounPhraseFormId: formRaw.nounPhraseFormId as number,
          formName: formRaw.formName as NounPhraseFormName,
          value: formRaw.value as string,
          gender: formRaw.gender as Gender | null
        };
        nounPhrase.forms[form.formName].push(
          new NounPhraseForm(
            form.nounPhraseFormId,
            nounPhrase.nounPhraseId,
            form.formName,
            form.value,
            form.gender
          )
        );
      }
    }

    return nounPhrases;
  }

  getPossessivesByLemma(lemma: string) {
    const rawPossessives = this.db.prepare(
      `SELECT
        p.possessive_id AS possessiveId,
        p.mutation AS mutation,
        p.emphasizer AS emphasizer,
        p.disambig AS disambig,
        p.lemma AS lemma
      FROM possessive AS p
      JOIN possessive_form AS form ON form.possessive_id = p.possessive_id
      WHERE p.lemma = :lemma`
    ).all({ lemma });

    const formsQuery = this.db.prepare(
      `SELECT
          form.possessive_form_id AS possessiveFormId,
          form.form_name AS formName,
          form.value AS value
        FROM
          possessive_form form
        WHERE form.possessive_id = :foundId`
    );

    const possessives: Possessive[] = [];
    for (const rawPossessive of rawPossessives) {
      const possessive = new Possessive({
        possessiveId: rawPossessive.possessiveId as number,
        mutation: rawPossessive.mutation as Mutation,
        emphasizer: rawPossessive.emphasizer as Emphasizer,
        disambig: rawPossessive.disambig as string
      });

      possessives.push(possessive);

      const formsRaw = formsQuery.all({ foundId: possessive.possessiveId });

      for (const formRaw of formsRaw) {
        const form = {
          possessiveFormId: formRaw.possessiveFormId as number,
          formName: formRaw.formName as PossessiveFormName,
          value: formRaw.value as string
        };
        possessive.forms[form.formName].push(
          new PossessiveForm(
            form.possessiveFormId,
            possessive.possessiveId,
            form.formName,
            form.value
          )
        );
      }
    }

    return possessives;
  }

  getPrepositionsByLemma(lemma: string) {
    const rawPrepositions = this.db.prepare(
      `SELECT
        p.preposition_id AS prepositionId,
        p.disambig AS disambig,
        p.lemma AS lemma
      FROM preposition AS p
      JOIN preposition_form AS form ON form.preposition_id = p.preposition_id
      WHERE p.lemma = :lemma`
    ).all({ lemma });

    const formsQuery = this.db.prepare(
      `SELECT
          form.preposition_form_id AS prepositionFormId,
          form.form_name AS formName,
          form.value AS value
        FROM
          preposition_form form
        WHERE form.preposition_id = :foundId`
    );

    const prepositions: Preposition[] = [];
    for (const rawPreposition of rawPrepositions) {
      const preposition = new Preposition({
        prepositionId: rawPreposition.prepositionId as number,
        disambig: rawPreposition.disambig as string,
        lemma: rawPreposition.lemma as string
      });

      prepositions.push(preposition);

      const formsRaw = formsQuery.all({ foundId: preposition.prepositionId });

      for (const formRaw of formsRaw) {
        const form = {
          prepositionFormId: formRaw.prepositionFormId as number,
          formName: formRaw.formName as PrepositionFormName,
          value: formRaw.value as string
        };
        preposition.forms[form.formName].push(
          new PrepositionForm(
            form.prepositionFormId,
            preposition.prepositionId,
            form.formName,
            form.value
          )
        );
      }
    }

    return prepositions;
  }

  getVerbsByLemma(lemma: string) {
    const foundVerbs = this.db.prepare(
      `SELECT
        v.verb_id AS verbId,
        v.disambig AS disambig
      FROM verb AS v
      JOIN verb_form AS f ON f.verb_id = v.verb_id
      WHERE
        (f.tense = 'Pres' AND f.dependency = 'Dep' AND f.person = 'Sg2' AND f.value = :lemma)
          OR (f.tense = 'Past' AND f.dependency = 'Indep' AND f.person = 'Base' AND f.value = :lemma)`
    ).all({ lemma });

    const formsQuery = this.db.prepare(
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
    );

    const verbs: Verb[] = [];

    for (const foundVerb of foundVerbs) {
      const verb = new Verb({
        verbId: foundVerb.verbId as number,
        disambig: foundVerb.disambig as string
      });

      verbs.push(verb);

      const formsRaw = formsQuery.all({ verbId: verb.verbId });

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
    }

    return verbs;
  }
}