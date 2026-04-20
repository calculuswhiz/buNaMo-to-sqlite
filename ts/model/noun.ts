import type { Gender, Strength } from "../features";
import type { IFriendlyNickNamed, ILexeme } from "./ILexeme";

export class Noun implements ILexeme, IFriendlyNickNamed {
  nounId: number;
  declension: number;
  isProper: boolean;
  isImmutable: boolean;
  isDefinite: boolean;
  allowArticledGenitive: boolean;
  disambig: string;

  forms: { [key in NounFormName]: NounForm[] } = {
    sgNom: [],
    sgGen: [],
    sgVoc: [],
    sgDat: [],
    plNom: [],
    plGen: [],
    plVoc: [],
    count: []
  };

  constructor(
    nounId: number,
    declension: number,
    isProper: boolean,
    isImmutable: boolean,
    isDefinite: boolean,
    allowArticledGenitive: boolean,
    disambig: string
  ) {
    this.nounId = nounId;
    this.declension = declension;
    this.isProper = isProper;
    this.isImmutable = isImmutable;
    this.isDefinite = isDefinite;
    this.allowArticledGenitive = allowArticledGenitive;
    this.disambig = disambig;
  }

  getLemma(): string {
    return this.forms.sgNom[0]?.value ?? "";
  }

  getGender(): Gender | null {
    return this.forms.sgNom[0]?.gender;
  }

  getNickname(): string {
    const lemma = this.getLemma();
    const declensionPart = this.declension > 0
      ? this.declension.toString() : "";
    const disambigPart = this.disambig != "" ? `_${this.disambig}` : "";
    return `${lemma}_${this.getGender()}${declensionPart}${disambigPart}`;
  }

  getFriendlyNickname(): string {
    const lemma = this.getLemma();
    const declensionPart = this.declension > 0
      ? this.declension.toString() : "";
    const disambigPart = this.disambig != "" ? `_${this.disambig}` : "";
    return `${lemma} (${this.getGender()}${declensionPart}${disambigPart})`;
  }

  // TODO Implement AddDative
}

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