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