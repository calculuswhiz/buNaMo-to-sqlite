export type AdjectiveFormName = 'sgNom' |
  'sgGenMasc' | 'sgGenFem' |
  'sgVocMasc' | 'sgVocFem' |
  'plNom' |
  'graded' |
  'abstractNoun';

export class AdjectiveForm {
  adjectiveFormId: number;
  adjectiveId: number;
  formName: AdjectiveFormName;
  value: string;

  constructor(
    adjectiveFormId: number,
    adjectiveId: number,
    formName: AdjectiveFormName,
    value: string
  ) {
    this.adjectiveFormId = adjectiveFormId;
    this.adjectiveId = adjectiveId;
    this.formName = formName;
    this.value = value;
  }
}