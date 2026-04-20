import type { Gender } from "../features";
import type { ILexeme } from "./ILexeme";

export class NounPhrase implements ILexeme {
  nounPhraseId: number;
  isDefinite: boolean;
  isPossessed: boolean;
  isImmutable: boolean;
  forceNominative: boolean;
  disambig: string;

  forms: { [key in NounPhraseFormName]: NounPhraseForm[] } = {
    sgNom: [],
    sgGen: [],
    sgNomArt: [],
    sgGenArt: [],
    sgDat: [],
    sgDatArtN: [],
    sgDatArtS: [],
    plNom: [],
    plGen: [],
    plNomArt: [],
    plGenArt: [],
    plDat: [],
    plDatArt: []
  }

  constructor(
    nounPhraseId: number,
    isDefinite: boolean,
    isPossessed: boolean,
    isImmutable: boolean,
    forceNominative: boolean,
    disambig: string
  ) {
    this.nounPhraseId = nounPhraseId;
    this.isDefinite = isDefinite;
    this.isPossessed = isPossessed;
    this.isImmutable = isImmutable;
    this.forceNominative = forceNominative;
    this.disambig = disambig;
  }

  getLemma(): string {
    return this.forms.sgNom[0]?.value
      ?? this.forms.sgNomArt[0]?.value
      ?? this.forms.plNom[0]?.value
      ?? this.forms.plNomArt[0]?.value
      ?? "";
  }

  getNickname(): string {
    const lemma = this.getLemma();
    const disambigPart = this.disambig != "" ? `_${this.disambig}` : "";
    return `${lemma}_NP${disambigPart}`;
  }

  getGender(): Gender | null {
    return this.forms.sgNom[0]?.gender
      ?? this.forms.sgNomArt[0]?.gender;
  }

  hasGender(): boolean {
    return this.getGender() !== null;
  }
}

export type NounPhraseFormName = 'sgNom' | 'sgGen' |
  'sgNomArt' | 'sgGenArt' |
  'sgDat' | 'sgDatArtN' | 'sgDatArtS' |
  'plNom' | 'plGen' |
  'plNomArt' | 'plGenArt' |
  'plDat' | 'plDatArt';

export class NounPhraseForm {
  nounPhraseFormId: number;
  nounPhraseId: number;
  formName: NounPhraseFormName;
  value: string;
  gender: Gender | null;

  constructor(
    nounPhraseFormId: number,
    nounPhraseId: number,
    formName: NounPhraseFormName,
    value: string,
    gender: Gender | null
  ) {
    this.nounPhraseFormId = nounPhraseFormId;
    this.nounPhraseId = nounPhraseId;
    this.formName = formName;
    this.value = value;
    this.gender = gender;
  }
}