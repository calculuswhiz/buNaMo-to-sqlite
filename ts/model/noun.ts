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
    nounId?: number,
    declension: number,
    isProper: boolean,
    isImmutable: boolean,
    isDefinite: boolean,
    allowArticledGenitive: boolean,
    disambig: string,
    /** Forms must not be null to ensure that the dative form is correctly initialized.
     * Create forms first.
     */
    forms: { [key in NounFormName]?: NounForm[] }
  }) {
    this.nounId = props.nounId ?? -1;
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

    // Inlined AddDative. Ensures that noun has dative singular form
    if (this.forms.sgDat.length === 0) {
      for (const sgNomForm of this.forms.sgNom) {
        this.forms.sgDat.push(new NounForm({
          nounFormId: sgNomForm.nounFormId,
          nounId: sgNomForm.nounId,
          formName: "sgDat",
          value: sgNomForm.value,
          gender: sgNomForm.gender,
          strength: sgNomForm.strength
        }));
      }
    }
  }

  clone() {
    return new Noun(structuredClone(this));
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
}

export type NounFormName = "sgNom" | "sgGen" | "sgVoc" | "sgDat"
  | "plNom" | "plGen" | "plVoc"
  | "count";

export class NounForm {
  nounFormId: number;
  nounId: number;
  formName: NounFormName;
  value: string;
  gender: Gender | null;
  strength: Strength | null;

  constructor(props: {
    nounFormId?: number,
    nounId?: number,
    formName: NounFormName,
    value: string,
    gender: Gender | null,
    strength: Strength | null
  }) {
    this.nounFormId = props.nounFormId ?? -1;
    this.nounId = props.nounId ?? -1;
    this.formName = props.formName;
    this.value = props.value;
    this.gender = props.gender;
    this.strength = props.strength;
  }
}