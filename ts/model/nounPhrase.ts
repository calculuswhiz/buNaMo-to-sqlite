import type { Gender } from "../features";
import type { ILexeme } from "./ILexeme";

export class NounPhrase implements ILexeme {
  nounPhraseId: number;
  isDefinite: boolean;
  isPossessed: boolean;
  isImmutable: boolean;
  forceNominative: boolean;
  disambig: string;

  forms: { [key in NounPhraseFormName]: NounPhraseForm[] };

  constructor(props: {
    nounPhraseId: number,
    isDefinite: boolean,
    isPossessed: boolean,
    isImmutable: boolean,
    forceNominative: boolean,
    disambig: string,
    forms?: { [key in NounPhraseFormName]?: NounPhraseForm[] }
  }) {
    this.nounPhraseId = props.nounPhraseId;
    this.isDefinite = props.isDefinite;
    this.isPossessed = props.isPossessed;
    this.isImmutable = props.isImmutable;
    this.forceNominative = props.forceNominative;
    this.disambig = props.disambig;
    this.forms = {
      sgNom: props.forms?.sgNom ?? [],
      sgGen: props.forms?.sgGen ?? [],
      sgNomArt: props.forms?.sgNomArt ?? [],
      sgGenArt: props.forms?.sgGenArt ?? [],
      sgDat: props.forms?.sgDat ?? [],
      sgDatArtN: props.forms?.sgDatArtN ?? [],
      sgDatArtS: props.forms?.sgDatArtS ?? [],
      plNom: props.forms?.plNom ?? [],
      plGen: props.forms?.plGen ?? [],
      plNomArt: props.forms?.plNomArt ?? [],
      plGenArt: props.forms?.plGenArt ?? [],
      plDat: props.forms?.plDat ?? [],
      plDatArt: props.forms?.plDatArt ?? []
    };
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