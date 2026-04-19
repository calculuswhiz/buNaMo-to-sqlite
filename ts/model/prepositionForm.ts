export type PrepositionFormName = 'sg1' | 'sg2' | 'sg3Masc' | 'sg3Fem' |
  'pl1' | 'pl2' | 'pl3';

export class PrepositionForm {
  prepositionFormId: number;
  prepositionId: number;
  formName: PrepositionFormName;
  value: string;

  constructor(
    prepositionFormId: number,
    prepositionId: number,
    formName: PrepositionFormName,
    value: string
  ) {
    this.prepositionFormId = prepositionFormId;
    this.prepositionId = prepositionId;
    this.formName = formName;
    this.value = value;
  }
}