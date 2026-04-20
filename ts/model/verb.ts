import type { ILexeme } from "./ILexeme";

function tenseFactory() {
  return {
    Indep: {
      Base: [] as VerbForm[],
      Sg1: [] as VerbForm[],
      Sg2: [] as VerbForm[],
      Sg3: [] as VerbForm[],
      Pl1: [] as VerbForm[],
      Pl2: [] as VerbForm[],
      Pl3: [] as VerbForm[],
      Auto: [] as VerbForm[]
    },
    Dep: {
      Base: [] as VerbForm[],
      Sg1: [] as VerbForm[],
      Sg2: [] as VerbForm[],
      Sg3: [] as VerbForm[],
      Pl1: [] as VerbForm[],
      Pl2: [] as VerbForm[],
      Pl3: [] as VerbForm[],
      Auto: [] as VerbForm[]
    }
  };
}

function moodFactory() {
  return {
    Base: [] as VerbForm[],
    Sg1: [] as VerbForm[],
    Sg2: [] as VerbForm[],
    Sg3: [] as VerbForm[],
    Pl1: [] as VerbForm[],
    Pl2: [] as VerbForm[],
    Pl3: [] as VerbForm[],
    Auto: [] as VerbForm[]
  };
}

export class Verb implements ILexeme {
  verbId: number;
  disambig: string;

  forms = {
    verbalNoun: [] as VerbForm[],
    verbalAdjective: [] as VerbForm[],
    tenses: {
      Past: tenseFactory(),
      Pres: tenseFactory(),
      Fut: tenseFactory(),
      Cond: tenseFactory()
    } as {
        [T in Tense]: {
          [D in Dependency]: {
            [P in Person]: VerbForm[]
          }
        }
      },
    moods: {
      Imper: moodFactory(),
      Subj: moodFactory()
    } as {
        [M in Mood]: {
          [P in Person]: VerbForm[]
        }
      }
  };

  constructor(
    verbId: number,
    disambig: string
  ) {
    this.verbId = verbId;
    this.disambig = disambig;
  }

  /** The imperative second-person singular is the lemma.
   * if not available, then the past tense base is the lemma
  */
  getLemma(): string {
    return this.forms.tenses.Pres.Dep.Sg2[0]?.value
      ?? this.forms.tenses.Past.Indep.Base[0]?.value;
  }

  getNickname(): string {
    const lemma = this.getLemma();
    const disambigPart = this.disambig != "" ? `_${this.disambig}` : "";
    return `${lemma}_${disambigPart}`;
  }

  // TODO The verb class is quite a bit more complex.
}

export type Tense = 'Past' | 'PastCont'
  | 'Pres' | 'PresCont'
  | 'Fut' | 'Cond';

export type Dependency = 'Indep' | 'Dep';

export type Mood = 'Imper' | 'Subj';

export type Person = 'Base'
  | 'Sg1' | 'Sg2' | 'Sg3'
  | 'Pl1' | 'Pl2' | 'Pl3'
  | 'Auto';

export class VerbForm {
  verbFormId: number;
  verbId: number;
  formType: string;
  value: string;
  tense: Tense | null;
  dependency: Dependency | null;
  mood: Mood | null;
  person: Person | null;

  constructor(
    verbFormId: number,
    verbId: number,
    formType: string,
    value: string,
    tense: Tense | null,
    dependency: Dependency | null,
    mood: Mood | null,
    person: Person | null
  ) {
    this.verbFormId = verbFormId;
    this.verbId = verbId;
    this.formType = formType;
    this.value = value;
    this.tense = tense;
    this.dependency = dependency;
    this.mood = mood;
    this.person = person;
  }
}