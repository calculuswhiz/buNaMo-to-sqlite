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

  forms: { [key in NounFormName]: NounForm[] };

  constructor(props: {
    nounId: number,
    declension: number,
    isProper: boolean,
    isImmutable: boolean,
    isDefinite: boolean,
    allowArticledGenitive: boolean,
    disambig: string,
    forms?: { [key in NounFormName]?: NounForm[] }
  }) {
    this.nounId = props.nounId;
    this.declension = props.declension;
    this.isProper = props.isProper;
    this.isImmutable = props.isImmutable;
    this.isDefinite = props.isDefinite;
    this.allowArticledGenitive = props.allowArticledGenitive;
    this.disambig = props.disambig;
    this.forms = {
      sgNom: props.forms?.sgNom ?? [],
      sgGen: props.forms?.sgGen ?? [],
      sgVoc: props.forms?.sgVoc ?? [],
      sgDat: props.forms?.sgDat ?? [],
      plNom: props.forms?.plNom ?? [],
      plGen: props.forms?.plGen ?? [],
      plVoc: props.forms?.plVoc ?? [],
      count: props.forms?.count ?? []
    };
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