import { mutate } from "../mutators";
import type { IFriendlyNickNamed, ILexeme } from "./ILexeme";

export class Adjective implements ILexeme, IFriendlyNickNamed {
  adjectiveId: number;
  // The adjective's traditional declension class; default is 0 meaning none or unknown:
  declension: number = 0;
  isPre: boolean;
  disambig: string;

  forms: { [key in AdjectiveFormName]: AdjectiveForm[] } = {
    sgNom: [],
    sgGenMasc: [],
    sgGenFem: [],
    sgVocMasc: [],
    sgVocFem: [],
    plNom: [],
    graded: [],
    abstractNoun: []
  };

  constructor(props: {
    adjectiveId: number,
    declension: number,
    isPre: boolean,
    disambig: string
  }) {
    this.adjectiveId = props.adjectiveId;
    this.declension = props.declension;
    this.isPre = props.isPre;
    this.disambig = props.disambig;
  }

  getLemma(): string {
    return this.forms.sgNom[0]?.value ?? "";
  }

  getNickname(): string {
    const lemma = this.getLemma();
    const declensionPart = this.declension > 0 ? this.declension.toString() : "";
    const disambigPart = this.disambig != "" ? ` ${this.disambig}` : "";
    return `${lemma} adj${declensionPart}${disambigPart}`.replace(" ", "_");
  }

  getFriendlyNickname(): string {
    const lemma = this.getLemma();
    const declensionPart = this.declension > 0 ? this.declension.toString() : "";
    const disambigPart = this.disambig != "" ? ` ${this.disambig}` : "";
    return `${lemma} (adj${declensionPart}${disambigPart})`;
  }

  //These return graded forms of the adjective:

  /** eg. "níos mó" */
  getComparativePresent(): string[] {
    return this.forms.graded
      .filter(form => form.formName === "graded")
      .map(form => `níos ${form.value}`);
  }

  /** eg. "is mó" */
  getSuperlativePresent(): string[] {
    return this.forms.graded
      .filter(form => form.formName === "graded")
      .map(form => `is ${form.value}`);
  }

  /** Or comparative conditional  eg. "ní ba mhó" */
  getComparativePast(): string[] {
    const forms = new Array<string>();
    for (const gradedForm of this.forms.graded) {
      if (/^[aeiouáéíóú]/i.test(gradedForm.value))
        forms.push("ní b'" + gradedForm.value);
      else if (/^f[aeiouáéíóú]/i.test(gradedForm.value))
        forms.push("ní b'" + mutate('len1', gradedForm.value));
      else
        forms.push("ní ba " + mutate('len1', gradedForm.value));
    }
    return forms;
  }

  /** Or superlative conditional eg. "ba mhó" */
  getSuperlativePast(): string[] {
    const forms = new Array<string>();
    for (const gradedForm of this.forms.graded) {
      if (/^[aeiouáéíóú]/i.test(gradedForm.value))
        forms.push("ab " + gradedForm.value);
      // Possible bug? Original not case sensitive
      else if (/^f/.test(gradedForm.value))
        forms.push("ab " + mutate('len1', gradedForm.value));
      else
        forms.push("ba " + mutate('len1', gradedForm.value));
    }
    return forms;
  }
}

export type AdjectiveFormName =
  'sgNom' |
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