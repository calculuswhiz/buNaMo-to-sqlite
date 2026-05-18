import { DatabaseSync } from "node:sqlite";
import fs from "fs/promises";
import { _nnResult, lowerFirstLetter } from "./util";
import path from "path";
import { Adjective, AdjectiveForm, type AdjectiveFormName } from "./model/adjective";
import { Noun, NounForm, type NounFormName } from "./model/noun";
import type { Emphasizer, Gender, Mutation, Strength } from "./features";
import { NounPhrase, NounPhraseForm, type NounPhraseFormName } from "./model/nounPhrase";
import { Possessive, PossessiveForm, type PossessiveFormName } from "./model/possessive";
import { Preposition, PrepositionForm, type PrepositionFormName } from "./model/preposition";
import { Verb, VerbForm, type Dependency, type Mood, type Person, type Tense } from "./model/verb";
import { err, ok, type Result } from "./neverEverThrow";

const uninitializedErrorMessage = "Repository must be initialized before use (.initialize() must be called)";

/** Initialize a new database with the default schema.
 * @param clean Optionally specify to delete existing database file before creating a new one
 * @param outFile The path to the database file
 */
export async function initializeDefaultDb(clean: boolean, outFile: string) {
  if (clean)
    await fs.rm(outFile, { force: true });

  const db = new DatabaseSync(outFile);
  db.exec(await fs.readFile("./sql/Schema.sql", "utf-8"));
  return db;
}

/** Initialize db from existing file */
export function getExistingDb(outFile: string) {
  const db = new DatabaseSync(outFile);
  return db;
}

/** Abstractions around BuNaMo database operations. */
export class Repository {
  db: DatabaseSync;

  /** SQL insert statements */
  private inserters: {
    [key: string]: ReturnType<DatabaseSync["prepare"]>;
  } = {};

  /** SQL read statements */
  private readers: {
    [key: string]: ReturnType<DatabaseSync["prepare"]>;
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
    this.db.exec("BEGIN");
    this.inTransaction = true;
  }

  commitTransaction() {
    this.db.exec("COMMIT");
    this.inTransaction = false;
  }

  rollbackTransaction() {
    this.db.exec("ROLLBACK");
    this.inTransaction = false;
  }

  async generatePreparedStatements() {
    const insertDirectory = path.join(__dirname, "../sql/Inserts");
    for (const file of await fs.readdir(insertDirectory, { withFileTypes: true })) {
      if (!file.name.endsWith(".sql"))
        continue;

      this.inserters[lowerFirstLetter(file.name.slice(0, -4))] = this.db.prepare(
        await fs.readFile(path.join(insertDirectory, file.name), "utf-8")
      );
    }

    const readDirectory = path.join(__dirname, "../sql/Reads");
    for (const file of await fs.readdir(readDirectory, { withFileTypes: true })) {
      if (!file.name.endsWith(".sql"))
        continue;
      this.readers[lowerFirstLetter(file.name.slice(0, -4))] = this.db.prepare(
        await fs.readFile(path.join(readDirectory, file.name), "utf-8")
      );
    }
  }

  // #region Insertion API. Always returns ID of the inserted row

  // TODO Use Result type instead of _nn.

  insertNoun(
    declension: number,
    isProper: boolean,
    isImmutable: boolean,
    isDefinite: boolean,
    allowArticledGenitive: boolean,
    disambig: string) {
    return _nnResult(
      this.inserters.insertNoun,
      uninitializedErrorMessage
    ).mapIfOk(x => x
      .run(
        declension,
        +isProper,
        +isImmutable,
        +isDefinite,
        +allowArticledGenitive,
        disambig
      ).lastInsertRowid as number
    );
  }

  insertNounUsingProps(props: Noun) {
    return this.insertNoun(
      props.declension,
      props.isProper,
      props.isImmutable,
      props.isDefinite,
      props.allowArticledGenitive,
      props.disambig
    );
  }

  insertNounForm(
    nounId: number,
    formName: string,
    value: string,
    gender: string | null,
    strength: string | null
  ) {
    return _nnResult(
      this.inserters.insertNounForm,
      uninitializedErrorMessage
    ).mapIfOk(x => x.run(nounId, formName, value, gender, strength)
      .lastInsertRowid as number);
  }

  insertNounFormUsingProps(props: NounForm) {
    return this.insertNounForm(
      props.nounId,
      props.formName,
      props.value,
      props.gender,
      props.strength
    );
  }

  insertNounPhrase(
    isDefinite: boolean,
    isPossessed: boolean,
    isImmutable: boolean,
    forceNominative: boolean,
    disambig: string) {
    return _nnResult(
      this.inserters.insertNounPhrase,
      uninitializedErrorMessage
    ).mapIfOk(x =>
      x.run(+isDefinite, +isPossessed, +isImmutable, +forceNominative, disambig)
        .lastInsertRowid as number
    );
  }

  insertNounPhraseUsingProps(props: NounPhrase) {
    return this.insertNounPhrase(
      props.isDefinite,
      props.isPossessed,
      props.isImmutable,
      props.forceNominative,
      props.disambig
    );
  }

  insertNounPhraseFormUsingProps(props: NounPhraseForm) {
    return this.insertNounPhraseForm(
      props.nounPhraseId,
      props.formName,
      props.value,
      props.gender
    );
  }

  insertNounPhraseForm(
    nounPhraseId: number,
    formName: string,
    value: string,
    gender: string | null
  ) {
    return _nnResult(
      this.inserters.insertNounPhraseForm,
      uninitializedErrorMessage
    ).mapIfOk(x => x.run(nounPhraseId, formName, value, gender)
      .lastInsertRowid as number);
  }

  insertAdjective(declension: number, isPre: boolean, disambig: string) {
    return _nnResult(
      this.inserters.insertAdjective,
      uninitializedErrorMessage
    ).mapIfOk(x => x.run(declension, +isPre, disambig)
      .lastInsertRowid as number);
  }

  insertAdjectiveUsingProps(props: Adjective) {
    return this.insertAdjective(
      props.declension,
      props.isPre,
      props.disambig
    );
  }

  insertAdjectiveForm(
    adjectiveId: number,
    formName: string,
    value: string,
  ) {
    return _nnResult(
      this.inserters.insertAdjectiveForm, uninitializedErrorMessage
    ).mapIfOk(x => x.run(adjectiveId, formName, value)
      .lastInsertRowid as number);
  }

  insertAdjectiveFormUsingProps(props: AdjectiveForm) {
    return this.insertAdjectiveForm(
      props.adjectiveId,
      props.formName,
      props.value
    );
  }

  insertVerb(disambig: string) {
    return _nnResult(
      this.inserters.insertVerb, uninitializedErrorMessage
    ).mapIfOk(x => x.run(disambig)
      .lastInsertRowid as number);
  }

  insertVerbUsingProps(props: Verb) {
    return this.insertVerb(props.disambig);
  }

  insertVerbForm(
    verbId: number,
    formType: string,
    value: string,
    tense: string | null,
    dependency: string | null,
    mood: string,
    person: string | null
  ) {
    return _nnResult(
      this.inserters.insertVerbForm, uninitializedErrorMessage
    ).mapIfOk(x => x.run(verbId, formType, value, tense, dependency, mood, person)
      .lastInsertRowid as number);
  }

  insertVerbFormUsingProps(props: VerbForm) {
    return this.insertVerbForm(
      props.verbId,
      props.formType,
      props.value,
      props.tense,
      props.dependency,
      props.mood,
      props.person
    );
  }

  insertPreposition(disambig: string, lemma: string) {
    return _nnResult(
      this.inserters.insertPreposition, uninitializedErrorMessage
    ).mapIfOk(x => x.run(disambig, lemma)
      .lastInsertRowid as number);
  }

  insertPrepositionUsingProps(props: Preposition) {
    return this.insertPreposition(props.disambig, props.lemma);
  }

  insertPrepositionForm(
    prepositionId: number,
    formName: string,
    value: string
  ) {
    return _nnResult(
      this.inserters.insertPrepositionForm, uninitializedErrorMessage
    ).mapIfOk(x => x.run(prepositionId, formName, value)
      .lastInsertRowid as number);
  }

  insertPrepositionFormUsingProps(props: PrepositionForm) {
    return this.insertPrepositionForm(
      props.prepositionId,
      props.formName,
      props.value
    );
  }

  insertPossessive(
    mutation: string,
    emphasizer: string,
    disambig: string,
    lemma: string
  ) {
    return _nnResult(
      this.inserters.insertPossessive, uninitializedErrorMessage
    ).mapIfOk(x => x.run(mutation, emphasizer, disambig, lemma)
      .lastInsertRowid as number);
  }

  insertPossessiveUsingProps(props: Possessive) {
    return this.insertPossessive(
      props.mutation,
      props.emphasizer,
      props.disambig,
      props.lemma
    );
  }

  insertPossessiveForm(
    possessiveId: number,
    formName: string,
    value: string
  ) {
    return _nnResult(
      this.inserters.insertPossessiveForm, uninitializedErrorMessage
    ).mapIfOk(x => x.run(possessiveId, formName, value)
      .lastInsertRowid as number);
  }

  insertPossessiveFormUsingProps(props: PossessiveForm) {
    return this.insertPossessiveForm(
      props.possessiveId,
      props.formName,
      props.value
    );
  }

  // #endregion

  // #region Retrieval API. Don't try to support everything. 
  // You can always write custom SQL if you need it.

  getAdjectivesByLemma(lemma: string): Result<Adjective[], Error> {
    const rawAdjectivesResult = _nnResult(
      this.readers.getAdjectives, uninitializedErrorMessage
    ).mapIfOk(x => x.all({ lemma }));

    if (!rawAdjectivesResult.isOk)
      return err(rawAdjectivesResult.error);

    const formsQueryResult = _nnResult(
      this.readers.getAdjectiveForms, uninitializedErrorMessage
    );

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const adjectives: Adjective[] = [];
    for (const rawAdjective of rawAdjectivesResult.value) {
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
          new AdjectiveForm({
            adjectiveFormId: form.adjectiveFormId,
            adjectiveId: adjective.adjectiveId,
            formName: form.formName as AdjectiveFormName,
            value: form.value
          })
        );
      }
    }

    return ok(adjectives);
  }

  getNounsByLemma(lemma: string): Result<Noun[], Error> {
    const rawNounsResult = _nnResult(
      this.readers.getNouns, uninitializedErrorMessage
    ).mapIfOk(x => x.all({ lemma }));

    if (!rawNounsResult.isOk)
      return err(rawNounsResult.error);
    else if (rawNounsResult.value.length === 0)
      return err(new Error(`No noun found with lemma "${lemma}"`));

    const formsQueryResult = _nnResult(this.readers.getNounForms, uninitializedErrorMessage);

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const nouns: Noun[] = [];
    for (const rawNoun of rawNounsResult.value) {
      const nounId = rawNoun.nounId as number;
      const formsRaw = formsQuery.all({ foundId: nounId });
      const forms: Noun["forms"] = {
        sgNom: [], sgGen: [], sgVoc: [], sgDat: [],
        plNom: [], plGen: [], plVoc: [],
        count: []
      };

      for (const formRaw of formsRaw) {
        const form = {
          nounFormId: formRaw.nounFormId as number,
          formName: formRaw.formName as NounFormName,
          value: formRaw.value as string,
          gender: formRaw.gender as Gender | null,
          strength: formRaw.strength as Strength | null
        };
        forms[form.formName].push(
          new NounForm({
            nounFormId: form.nounFormId,
            nounId: nounId,
            formName: form.formName,
            value: form.value,
            gender: form.gender,
            strength: form.strength
          })
        );
      }

      const noun = new Noun({
        nounId: rawNoun.nounId as number,
        declension: rawNoun.declension as number,
        isProper: !!rawNoun.isProper,
        isImmutable: !!rawNoun.isImmutable,
        isDefinite: !!rawNoun.isDefinite,
        allowArticledGenitive: !!rawNoun.allowArticledGenitive,
        disambig: rawNoun.disambig as string,
        forms: forms
      });

      nouns.push(noun);
    }

    return ok(nouns);
  }

  getNounPhrasesByLemma(lemma: string): Result<NounPhrase[], Error> {
    const rawNounPhrasesResult = _nnResult(
      this.readers.getNounPhrases, uninitializedErrorMessage
    ).mapIfOk(x => x.all({ lemma }));

    if (!rawNounPhrasesResult.isOk)
      return err(rawNounPhrasesResult.error);

    const formsQueryResult = _nnResult(
      this.readers.getNounPhraseForms, uninitializedErrorMessage
    );

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const nounPhrases: NounPhrase[] = [];
    for (const rawNounPhrase of rawNounPhrasesResult.value) {
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
          new NounPhraseForm({
            nounPhraseFormId: form.nounPhraseFormId,
            nounPhraseId: nounPhrase.nounPhraseId,
            formName: form.formName,
            value: form.value,
            gender: form.gender
          })
        );
      }
    }

    return ok(nounPhrases);
  }

  getPossessivesByLemma(lemma: string): Result<Possessive[], Error> {
    const rawPossessivesResult = _nnResult(
      this.readers.getPossessives, uninitializedErrorMessage
    ).mapIfOk(x => x.all({ lemma }));

    if (!rawPossessivesResult.isOk)
      return err(rawPossessivesResult.error);

    const formsQueryResult = _nnResult(
      this.readers.getPossessiveForms, uninitializedErrorMessage
    );

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const possessives: Possessive[] = [];
    for (const rawPossessive of rawPossessivesResult.value) {
      const possessive = new Possessive({
        possessiveId: rawPossessive.possessiveId as number,
        mutation: rawPossessive.mutation as Mutation,
        emphasizer: rawPossessive.emphasizer as Emphasizer,
        disambig: rawPossessive.disambig as string,
        lemma: rawPossessive.lemma as string
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
          new PossessiveForm({
            possessiveFormId: form.possessiveFormId,
            possessiveId: possessive.possessiveId,
            formName: form.formName,
            value: form.value
          })
        );
      }
    }

    return ok(possessives);
  }

  getPrepositionsByLemma(lemma: string): Result<Preposition[], Error> {
    const rawPrepositionsResult = _nnResult(
      this.readers.getPrepositions, uninitializedErrorMessage
    ).mapIfOk(x => x.all({ lemma }));

    if (!rawPrepositionsResult.isOk)
      return err(rawPrepositionsResult.error);

    const formsQueryResult = _nnResult(
      this.readers.getPrepositionForms, uninitializedErrorMessage
    );

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const prepositions: Preposition[] = [];
    for (const rawPreposition of rawPrepositionsResult.value) {
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
          new PrepositionForm({
            prepositionFormId: form.prepositionFormId,
            prepositionId: preposition.prepositionId,
            formName: form.formName,
            value: form.value
          })
        );
      }
    }

    return ok(prepositions);
  }

  getVerbsByLemma(lemma: string): Result<Verb[], Error> {
    const foundVerbsResult = _nnResult(
      this.readers.getVerbs, uninitializedErrorMessage
    ).mapIfOk(x => x.all({ lemma }));

    if (!foundVerbsResult.isOk)
      return err(foundVerbsResult.error);

    const formsQueryResult = _nnResult(
      this.readers.getVerbForms, uninitializedErrorMessage
    );

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const verbs: Verb[] = [];

    for (const foundVerb of foundVerbsResult.value) {
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
          mood: formRaw.mood as Mood,
          person: formRaw.person as Person | null
        };

        const newForm = new VerbForm({
          verbFormId: form.verbFormId,
          verbId: verb.verbId,
          formType: form.formType,
          value: form.value,
          tense: form.tense,
          dependency: form.dependency,
          mood: form.mood,
          person: form.person
        });

        if (form.tense != null && form.dependency != null && form.person != null) {
          verb.forms.tenses[form.tense][form.dependency][form.person]
            .push(newForm);
        } else if (form.mood != null && form.person != null) {
          verb.forms.moods[form.mood][form.person]
            .push(newForm);
        } else {
          verb.forms[form.formType as "verbalNoun" | "verbalAdjective"]
            .push(newForm);
        }
      }
    }

    return ok(verbs);
  }

  // #endregion
}