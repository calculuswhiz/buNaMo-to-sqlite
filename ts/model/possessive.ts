import type { Emphasizer, Mutation } from "../features";
import type { ILexeme } from "./ILexeme";

export class Possessive implements ILexeme {
  possessiveId: number;
  mutation: Mutation;
  emphasizer: Emphasizer;
  disambig: string;
  lemma: string;

  forms: { [key in PossessiveFormName]: PossessiveForm[] };

  constructor(props: {
    possessiveId: number,
    mutation: Mutation,
    emphasizer: Emphasizer,
    disambig: string,
    lemma: string,
    forms?: { [key in PossessiveFormName]?: PossessiveForm[] }
  }) {
    this.possessiveId = props.possessiveId;
    this.mutation = props.mutation;
    this.emphasizer = props.emphasizer;
    this.disambig = props.disambig;
    this.lemma = props.lemma;
    this.forms = {
      full: props.forms?.full ?? [],
      apos: props.forms?.apos ?? []
    };
  }

  getLemma(): string {
    return this.lemma;
  }

  getNickname(): string {
    const lemma = this.getLemma();
    const disambigPart = this.disambig != "" ? `_${this.disambig}` : "";
    return `${lemma}_poss${disambigPart}`;
  }

  getFriendlyNickname(): string {
    const lemma = this.getLemma();
    const disambigPart = this.disambig != "" ? `_${this.disambig}` : "";
    return `${lemma} (${disambigPart})`;
  }
}

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