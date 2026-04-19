export type PossessiveFormName = 'full' | 'apos';

export class PossessiveForm {
  possessiveFormId: number;
  possessiveId: number;
  formName: PossessiveFormName;
  value: string;

  constructor(
    possessiveFormId: number,
    possessiveId: number,
    formName: PossessiveFormName,
    value: string
  ) {
    this.possessiveFormId = possessiveFormId;
    this.possessiveId = possessiveId;
    this.formName = formName;
    this.value = value;
  }
}