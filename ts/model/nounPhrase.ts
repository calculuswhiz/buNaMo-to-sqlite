import type { Gender, Mutation } from "../features";
import { mutate } from "../mutators";
import type { ILexeme } from "./ILexeme";
import type { Noun } from "./noun";

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

  // Ported from Noun-arg constructor
  static fromNoun(head: Noun): NounPhrase {
    const nounPhrase = new NounPhrase({
      nounPhraseId: -1,
      isDefinite: head.isDefinite,
      isPossessed: false,
      isImmutable: head.isImmutable,
      forceNominative: false,
      disambig: "",
      forms: {
        sgNom: head.forms.sgNom
          .map(headForm =>
            new NounPhraseForm(
              -1, -1,
              "sgNom",
              headForm.value,
              headForm.gender ?? null
            )
          ),
        sgNomArt: !head.isDefinite
          ? head.forms.sgNom
            .map(headForm => {
              const mutation: Mutation = head.isImmutable
                ? "none"
                : headForm.gender === "masc" ? "prefT" : "len3";
              return new NounPhraseForm(
                -1, -1,
                "sgNomArt",
                `an ${mutate(mutation, headForm.value)}`,
                headForm.gender ?? null
              );
            })
          : [],
        sgGen: head.forms.sgGen
          .map(headForm => {
            const mutation: Mutation = head.isImmutable
              ? "none"
              : head.isProper
                ? "len1" : "none";
            return new NounPhraseForm(
              -1, -1,
              "sgGen",
              mutate(mutation, headForm.value),
              headForm.gender ?? null
            );
          }),
        sgGenArt: !head.isDefinite || head.allowArticledGenitive
          ? head.forms.sgGen
            .map(headForm => {
              const mutation: Mutation = head.isImmutable
                ? "none"
                : head.isProper
                  ? "len3" : "prefH";
              return new NounPhraseForm(
                -1, -1,
                "sgGenArt",
                `${headForm.gender === "masc" ? "an" : "na"} ${mutate(mutation, headForm.value)}`,
                headForm.gender ?? null
              );
            })
          : [],
        plNom: head.forms.plNom
          .map(headForm => {
            return new NounPhraseForm(
              -1, -1,
              "plNom",
              headForm.value,
              headForm.gender ?? null
            );
          }),
        plNomArt: !head.isDefinite
          ? head.forms.plNom
            .map(headForm => {
              const mutation: Mutation = head.isImmutable
                ? "none"
                : "prefH";
              return new NounPhraseForm(
                -1, -1,
                "plNomArt",
                `na ${mutate(mutation, headForm.value)}`,
                headForm.gender ?? null
              );
            })
          : [],
        plGen: head.forms.plGen
          .map(headForm => {
            const mutation: Mutation = head.isImmutable
              ? "none"
              : head.isProper
                ? "len1" : "none";
            return new NounPhraseForm(
              -1, -1,
              "plGen",
              mutate(mutation, headForm.value),
              headForm.gender ?? null
            );
          }),
        plGenArt: !head.isDefinite || head.allowArticledGenitive
          ? head.forms.plGen
            .map(headForm => {
              const mutation: Mutation = head.isImmutable
                ? "none"
                : "ecl1";
              return new NounPhraseForm(
                -1, -1,
                "plGenArt",
                `na ${mutate(mutation, headForm.value)}`,
                headForm.gender ?? null
              );
            })
          : [],
        sgDat: head.forms.sgDat
          .map(headForm => {
            return new NounPhraseForm(
              -1, -1,
              "sgDat",
              headForm.value,
              headForm.gender ?? null
            );
          }),
        sgDatArtN: !head.isDefinite
          ? head.forms.sgDat
            .map(headForm => {
              return new NounPhraseForm(
                -1, -1,
                "sgDatArtN",
                headForm.value,
                headForm.gender ?? null
              );
            })
          : [],
        sgDatArtS: !head.isDefinite
          ? head.forms.sgDat
            .map(headForm => {
              return new NounPhraseForm(
                -1, -1,
                "sgDatArtS",
                headForm.value,
                headForm.gender ?? null
              );
            })
          : [],
        plDat: head.forms.plNom
          .map(headForm => {
            return new NounPhraseForm(
              -1, -1,
              "plDat",
              headForm.value,
              headForm.gender ?? null
            );
          }),
        plDatArt: !head.isDefinite
          ? head.forms.plNom
            .map(headForm => {
              return new NounPhraseForm(
                -1, -1,
                "plDatArt",
                headForm.value,
                headForm.gender ?? null
              );
            })
          : []
      }
    });

    return nounPhrase;
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

export type NounPhraseFormName = "sgNom" | "sgGen" |
  "sgNomArt" | "sgGenArt" |
  "sgDat" | "sgDatArtN" | "sgDatArtS" |
  "plNom" | "plGen" |
  "plNomArt" | "plGenArt" |
  "plDat" | "plDatArt";

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