import { Database } from "bun:sqlite";
import fs from "fs/promises";
import { _nnResult, lowerFirstLetter } from "./util";
import path from "path";
import { Adjective, AdjectiveForm } from "./model/adjective";
import { Noun, NounForm } from "./model/noun";
import { NounPhrase, NounPhraseForm } from "./model/nounPhrase";
import { Possessive, PossessiveForm } from "./model/possessive";
import { Preposition, PrepositionForm } from "./model/preposition";
import { Verb, VerbForm } from "./model/verb";
import { err, ok, type Result } from "./neverEverThrow";

const uninitializedErrorMessage = "Repository must be initialized before use (.initialize() must be called)";

/** Initialize a new database with the default schema.
 * @param clean Optionally specify to delete existing database file before creating a new one
 * @param outFile The path to the database file
 */
export async function initializeDefaultDb(clean: boolean, outFile: string) {
  if (clean)
    await fs.rm(outFile, { force: true });

  const db = new Database(outFile);
  db.run(await fs.readFile("./sql/Schema.sql", "utf-8"));
  return db;
}

/** Initialize db from existing file */
export function getExistingDb(outFile: string) {
  const db = new Database(outFile);
  return db;
}

/** Abstractions around BuNaMo database operations. */
export class Repository {
  db: Database;

  /** SQL insert statements */
  private inserters: {
    [key: string]: ReturnType<Database["prepare"]>;
  } = {};

  /** SQL read statements */
  private readers: {
    [key: string]: ReturnType<Database["prepare"]>;
  } = {};

  constructor(db: Database) {
    this.db = db;
  }

  initialized = false;
  /** Create initial database, optionally cleaning existing one
   * @param clean Whether to delete existing database file before creating a new one
   */
  async initialize() {
    await this.generatePreparedStatements();
    this.initialized = true;
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
      const functionName = lowerFirstLetter(file.name.slice(0, -4));
      const contents = await fs.readFile(path.join(readDirectory, file.name), "utf-8");
      this.readers[functionName] = this.db.prepare(contents);
    }
  }

  // #region Insertion API. Always returns ID of the inserted row

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
    ).mapOk(x => x
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
    ).mapOk(x => x.run(nounId, formName, value, gender, strength)
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
    ).mapOk(x =>
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
    ).mapOk(x => x.run(nounPhraseId, formName, value, gender)
      .lastInsertRowid as number);
  }

  insertAdjective(declension: number, isPre: boolean, disambig: string) {
    return _nnResult(
      this.inserters.insertAdjective,
      uninitializedErrorMessage
    ).mapOk(x => x.run(declension, +isPre, disambig)
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
    ).mapOk(x => x.run(adjectiveId, formName, value)
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
    ).mapOk(x => x.run(disambig)
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
    ).mapOk(x => x.run(verbId, formType, value, tense, dependency, mood, person)
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
    ).mapOk(x => x.run(disambig, lemma)
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
    ).mapOk(x => x.run(prepositionId, formName, value)
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
    ).mapOk(x => x.run(mutation, emphasizer, disambig, lemma)
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
    ).mapOk(x => x.run(possessiveId, formName, value)
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
    ).mapOk(x => x.all({ $lemma: lemma })) as Result<Adjective[], Error>;

    if (!rawAdjectivesResult.isOk)
      return err(rawAdjectivesResult.error);
    else if (rawAdjectivesResult.value.length === 0)
      return err(new Error(`No adjective found with lemma "${lemma}"`));

    const formsQueryResult = _nnResult(
      this.readers.getAdjectiveForms, uninitializedErrorMessage
    );

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const adjectives: Adjective[] = [];
    for (const rawAdjective of rawAdjectivesResult.value) {
      const adjective = new Adjective({
        adjectiveId: rawAdjective.adjectiveId,
        declension: rawAdjective.declension,
        isPre: rawAdjective.isPre,
        disambig: rawAdjective.disambig,
      });

      adjectives.push(adjective);

      const formsRaw = formsQuery.all({
        $foundId: adjective.adjectiveId
      }) as AdjectiveForm[];

      for (const formRaw of formsRaw) {
        const form = {
          adjectiveFormId: formRaw.adjectiveFormId,
          formName: formRaw.formName,
          value: formRaw.value
        };
        adjective.forms[form.formName].push(
          new AdjectiveForm({
            adjectiveFormId: form.adjectiveFormId,
            adjectiveId: adjective.adjectiveId,
            formName: form.formName,
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
    ).mapOk(x => x.all({ $lemma: lemma })) as Result<Noun[], Error>;

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
      const formsRaw = formsQuery.all({ $foundId: nounId }) as NounForm[];
      const forms: Noun["forms"] = {
        sgNom: [], sgGen: [], sgVoc: [], sgDat: [],
        plNom: [], plGen: [], plVoc: [],
        count: []
      };

      for (const formRaw of formsRaw) {
        const form = {
          nounFormId: formRaw.nounFormId,
          formName: formRaw.formName,
          value: formRaw.value,
          gender: formRaw.gender,
          strength: formRaw.strength
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
        nounId: rawNoun.nounId,
        declension: rawNoun.declension,
        isProper: rawNoun.isProper,
        isImmutable: rawNoun.isImmutable,
        isDefinite: rawNoun.isDefinite,
        allowArticledGenitive: rawNoun.allowArticledGenitive,
        disambig: rawNoun.disambig,
        forms: forms
      });

      nouns.push(noun);
    }

    return ok(nouns);
  }

  getNounPhrasesByLemma(lemma: string): Result<NounPhrase[], Error> {
    const rawNounPhrasesResult = _nnResult(
      this.readers.getNounPhrases, uninitializedErrorMessage
    ).mapOk(x => x.all({ $lemma: lemma })) as Result<NounPhrase[], Error>;

    if (!rawNounPhrasesResult.isOk)
      return err(rawNounPhrasesResult.error);
    else if (rawNounPhrasesResult.value.length === 0)
      return err(new Error(`No noun phrase found with lemma "${lemma}"`));

    const formsQueryResult = _nnResult(
      this.readers.getNounPhraseForms, uninitializedErrorMessage
    );

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const nounPhrases: NounPhrase[] = [];
    for (const rawNounPhrase of rawNounPhrasesResult.value) {
      const nounPhrase = new NounPhrase({
        nounPhraseId: rawNounPhrase.nounPhraseId,
        isDefinite: rawNounPhrase.isDefinite,
        isPossessed: rawNounPhrase.isPossessed,
        isImmutable: rawNounPhrase.isImmutable,
        forceNominative: rawNounPhrase.forceNominative,
        disambig: rawNounPhrase.disambig
      });

      nounPhrases.push(nounPhrase);

      const formsRaw = formsQuery.all({
        $foundId: nounPhrase.nounPhraseId
      }) as NounPhraseForm[];

      for (const formRaw of formsRaw) {
        const form = {
          nounPhraseFormId: formRaw.nounPhraseFormId,
          formName: formRaw.formName,
          value: formRaw.value,
          gender: formRaw.gender
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
    ).mapOk(x => x.all({ $lemma: lemma })) as Result<Possessive[], Error>;

    if (!rawPossessivesResult.isOk)
      return err(rawPossessivesResult.error);
    else if (rawPossessivesResult.value.length === 0)
      return err(new Error(`No possessive found with lemma "${lemma}"`));

    const formsQueryResult = _nnResult(
      this.readers.getPossessiveForms, uninitializedErrorMessage
    );

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const possessives: Possessive[] = [];
    for (const rawPossessive of rawPossessivesResult.value) {
      const possessive = new Possessive({
        possessiveId: rawPossessive.possessiveId,
        mutation: rawPossessive.mutation,
        emphasizer: rawPossessive.emphasizer,
        disambig: rawPossessive.disambig,
        lemma: rawPossessive.lemma
      });

      possessives.push(possessive);

      const formsRaw = formsQuery.all({
        $foundId: possessive.possessiveId
      }) as PossessiveForm[];

      for (const formRaw of formsRaw) {
        const form = {
          possessiveFormId: formRaw.possessiveFormId,
          formName: formRaw.formName,
          value: formRaw.value
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
    ).mapOk(x => x.all({ $lemma: lemma })) as Result<Preposition[], Error>;

    if (!rawPrepositionsResult.isOk)
      return err(rawPrepositionsResult.error);
    else if (rawPrepositionsResult.value.length === 0)
      return err(new Error(`No preposition found with lemma "${lemma}"`));

    const formsQueryResult = _nnResult(
      this.readers.getPrepositionForms, uninitializedErrorMessage
    );

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const prepositions: Preposition[] = [];
    for (const rawPreposition of rawPrepositionsResult.value) {
      const preposition = new Preposition({
        prepositionId: rawPreposition.prepositionId,
        disambig: rawPreposition.disambig,
        lemma: rawPreposition.lemma
      });

      prepositions.push(preposition);

      const formsRaw = formsQuery.all({
        $foundId: preposition.prepositionId
      }) as PrepositionForm[];

      for (const formRaw of formsRaw) {
        const form = {
          prepositionFormId: formRaw.prepositionFormId,
          formName: formRaw.formName,
          value: formRaw.value
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
    ).mapOk(x => x.all({ $lemma: lemma })) as Result<Verb[], Error>;

    if (!foundVerbsResult.isOk)
      return err(foundVerbsResult.error);
    else if (foundVerbsResult.value.length === 0)
      return err(new Error(`No verb found with lemma "${lemma}"`));

    const formsQueryResult = _nnResult(
      this.readers.getVerbForms, uninitializedErrorMessage
    );

    if (!formsQueryResult.isOk)
      return err(formsQueryResult.error);

    const formsQuery = formsQueryResult.value;

    const verbs: Verb[] = [];

    for (const foundVerb of foundVerbsResult.value) {
      const verb = new Verb({
        verbId: foundVerb.verbId,
        disambig: foundVerb.disambig
      });

      verbs.push(verb);

      const formsRaw = formsQuery.all({
        $verbId: verb.verbId
      }) as VerbForm[];

      for (const formRaw of formsRaw) {
        const form = {
          verbFormId: formRaw.verbFormId,
          formType: formRaw.formType,
          value: formRaw.value,
          tense: formRaw.tense,
          dependency: formRaw.dependency,
          mood: formRaw.mood,
          person: formRaw.person
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