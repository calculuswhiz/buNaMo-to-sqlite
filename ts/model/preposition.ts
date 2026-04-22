import type { ILexeme } from "./ILexeme";

export class Preposition implements ILexeme {
  prepositionId: number;
  disambig: string;
  forms: { [key in PrepositionFormName]: PrepositionForm[] };
  lemma: string;

  constructor(props: {
    prepositionId: number,
    disambig: string,
    lemma: string,
    forms?: { [key in PrepositionFormName]?: PrepositionForm[] }
  }) {
    this.prepositionId = props.prepositionId;
    this.disambig = props.disambig;
    this.lemma = props.lemma;
    this.forms = {
      sg1: props.forms?.sg1 ?? [],
      sg2: props.forms?.sg2 ?? [],
      sg3Masc: props.forms?.sg3Masc ?? [],
      sg3Fem: props.forms?.sg3Fem ?? [],
      pl1: props.forms?.pl1 ?? [],
      pl2: props.forms?.pl2 ?? [],
      pl3: props.forms?.pl3 ?? []
    };
  }

  getLemma(): string {
    return this.lemma;
  }

  getNickname(): string {
    const disambigPart = this.disambig != "" ? `_${this.disambig}` : "";
    return `${this.lemma}_prep${disambigPart}`;
  }

  isEmpty(): boolean {
    return Object.values(this.forms)
      .every(formArray => formArray.length === 0);
  }
}

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