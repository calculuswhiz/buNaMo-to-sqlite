import type { Gender } from "./nounForm";

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