export type Gender = "masc" | "fem";
export type Strength = "strong" | "weak";

export type NounFormName = 'sgNom' | 'sgGen' | 'sgVoc' | 'sgDat'
  | 'plNom' | 'plGen' | 'plVoc'
  | 'count';

export class NounForm {
  nounFormId: number;
  nounId: number;
  formName: NounFormName;
  value: string;
  gender: Gender | null;
  strength: Strength | null;

  constructor(
    nounFormId: number,
    nounId: number,
    formName: NounFormName,
    value: string,
    gender: Gender | null,
    strength: Strength | null
  ) {
    this.nounFormId = nounFormId;
    this.nounId = nounId;
    this.formName = formName;
    this.value = value;
    this.gender = gender;
    this.strength = strength;
  }
}