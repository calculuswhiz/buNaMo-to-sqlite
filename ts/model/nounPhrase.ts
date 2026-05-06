import type { Gender, Mutation } from "../features";
import { mutate } from "../mutators";
import type { Adjective } from "./adjective";
import type { ILexeme } from "./ILexeme";
import type { Noun } from "./noun";
import * as mutators from "../mutators";

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

  // Ported from Noun+Adjective constructor
  static fromNounWithAdjective(head: Noun, modifier: Adjective): NounPhrase {
    if (modifier.isPre) {
      const prefixedHead = head.clone();
      const prefix = modifier.getLemma();

      for (const f of prefixedHead.forms.sgNom)
        f.value = mutators.prefix(prefix, f.value);
      for (const f of prefixedHead.forms.sgGen)
        f.value = mutators.prefix(prefix, f.value);
      for (const f of prefixedHead.forms.sgDat)
        f.value = mutators.prefix(prefix, f.value);
      for (const f of prefixedHead.forms.sgVoc)
        f.value = mutators.prefix(prefix, f.value);
      for (const f of prefixedHead.forms.plNom)
        f.value = mutators.prefix(prefix, f.value);
      for (const f of prefixedHead.forms.plGen)
        f.value = mutators.prefix(prefix, f.value);
      for (const f of prefixedHead.forms.plVoc)
        f.value = mutators.prefix(prefix, f.value);
      for (const f of prefixedHead.forms.count)
        f.value = mutators.prefix(prefix, f.value);

      return NounPhrase.fromNoun(prefixedHead);
    } else {
      const nounPhrase = new NounPhrase({
        isDefinite: head.isDefinite,
        isImmutable: head.isImmutable,
        forceNominative: true,
        isPossessed: false,
        disambig: "",
        nounPhraseId: -1,
      });

      for (const headForm of head.forms.sgNom) {
        for (const modForm of modifier.forms.sgNom) {
          const mutA: Mutation = headForm.gender == "masc" ? "none" : "len1";
          const value = `${headForm.value} ${mutators.mutate(mutA, modForm.value)}`;
          nounPhrase.forms.sgNom.push(
            new NounPhraseForm(-1, -1, "sgNom", value, headForm.gender)
          );
        }

        if (!head.isDefinite) {
          for (const modForm of modifier.forms.sgNom) {
            let mutN: Mutation = headForm.gender == "masc" ? "prefT" : "len3";
            if (head.isImmutable)
              mutN = "none";
            const mutA: Mutation = headForm.gender == "masc" ? "none" : "len1";
            const value = `an ${mutators.mutate(mutN, headForm.value)} ${mutators.mutate(mutA, modForm.value)}`;
            nounPhrase.forms.sgNomArt.push(
              new NounPhraseForm(-1, -1, "sgNomArt", value, headForm.gender)
            );
          }
        }
      }

      for (const headForm of head.forms.sgGen) {
        const modForms = headForm.gender == "masc" ? modifier.forms.sgGenMasc : modifier.forms.sgGenFem;
        for (const modForm of modForms) {
          let mutN: Mutation = head.isProper ? "len1" : "none"; //proper nouns are always lenited in the genitive
          if (head.isImmutable)
            mutN = "none";
          const mutA: Mutation = headForm.gender == "masc" ? "len1" : "none";
          const value = `${mutators.mutate(mutN, headForm.value)} ${mutators.mutate(mutA, modForm.value)}`;
          nounPhrase.forms.sgGen.push(
            new NounPhraseForm(-1, -1, "sgGen", value, headForm.gender)
          );
        }

      }
      for (const headForm of head.forms.sgGen) {
        if (!head.isDefinite || head.allowArticledGenitive) {
          const modForms = headForm.gender == "masc" ? modifier.forms.sgGenMasc : modifier.forms.sgGenFem;
          for (const modForm of modForms) {
            let mutN: Mutation = headForm.gender == "masc" ? "len3" : "prefH";
            if (head.isImmutable)
              mutN = "none";
            const mutA: Mutation = headForm.gender == "masc" ? "len1" : "none";
            const article = headForm.gender == "masc" ? "an" : "na";
            const value = `${article} ${mutators.mutate(mutN, headForm.value)} ${mutators.mutate(mutA, modForm.value)}`;
            nounPhrase.forms.sgGenArt.push(
              new NounPhraseForm(-1, -1, "sgGenArt", value, headForm.gender)
            );
          }
        }
      }

      for (const headForm of head.forms.plNom) {
        for (const modForm of modifier.forms.plNom) {
          const mutA: Mutation = mutators.isSlender(headForm.value)
            ? "len1" : "none";
          const value = `${headForm.value} ${mutators.mutate(mutA, modForm.value)}`;
          nounPhrase.forms.plNom.push(
            new NounPhraseForm(-1, -1, "plNom", value, headForm.gender)
          );
        }

        if (!head.isDefinite) {
          for (const modForm of modifier.forms.plNom) {
            let mutN: Mutation = "prefH";
            if (head.isImmutable)
              mutN = "none";
            const mutA: Mutation = mutators.isSlender(headForm.value) ? "len1" : "none";
            const value = `na ${mutators.mutate(mutN, headForm.value)} ${mutators.mutate(mutA, modForm.value)}`;
            nounPhrase.forms.plNomArt.push(
              new NounPhraseForm(-1, -1, "plNomArt", value, headForm.gender)
            );
          }
        }
      }

      for (const headForm of head.forms.plGen) {
        const modForms = headForm.strength == "strong" ? modifier.forms.plNom : modifier.forms.sgNom;
        for (const modForm of modForms) {
          let mutA: Mutation = mutators.isSlender(headForm.value) ? "len1" : "none";
          if (headForm.strength == "weak")
            //"Gael", "captaen" are not slender
            mutA = mutators.isSlenderI(headForm.value) ? "len1" : "none";
          const value = `${headForm.value} ${mutators.mutate(mutA, modForm.value)}`;
          nounPhrase.forms.plGen.push(
            new NounPhraseForm(-1, -1, "plGen", value, headForm.gender)
          );
        }
      }
      for (const headForm of head.forms.plGen) {
        if (!head.isDefinite || head.allowArticledGenitive) {
          const modForms = headForm.strength == "strong" ? modifier.forms.plNom : modifier.forms.sgNom;
          for (const modForm of modForms) {
            let mutN: Mutation = "len1";
            if (head.isImmutable)
              mutN = "none";
            let mutA: Mutation = mutators.isSlender(headForm.value) ? "len1" : "none";
            if (headForm.strength == "weak")
              //"Gael", "captaen" are not slender
              mutA = mutators.isSlenderI(headForm.value) ? "len1" : "none";
            const value = `na ${mutators.mutate(mutN, headForm.value)} ${mutators.mutate(mutA, modForm.value)}`;
            nounPhrase.forms.plGenArt.push(
              new NounPhraseForm(-1, -1, "plGenArt", value, headForm.gender)
            );
          }
        }
      }

      for (const headForm of head.forms.sgDat) {
        for (const modForm of modifier.forms.sgNom) {
          const mutA: Mutation = headForm.gender == "masc" ? "none" : "len1";
          const value = `${headForm.value} ${mutators.mutate(mutA, modForm.value)}`;
          nounPhrase.forms.sgDat.push(
            new NounPhraseForm(-1, -1, "sgDat", value, headForm.gender)
          );
        }

        if (!head.isDefinite) {
          for (const modForm of modifier.forms.sgNom) {
            const mutA: Mutation = headForm.gender == "masc" ? "none" : "len1";
            const value = `${headForm.value} ${mutators.mutate(mutA, modForm.value)}`;
            nounPhrase.forms.sgDatArtS.push(
              new NounPhraseForm(-1, -1, "sgDatArtS", value, headForm.gender)
            );
          }
          for (const modForm of modifier.forms.sgNom) {
            const value = `${headForm.value} ${mutators.mutate("len1", modForm.value)}`;
            nounPhrase.forms.sgDatArtN.push(
              new NounPhraseForm(-1, -1, "sgDatArtN", value, headForm.gender)
            );
          }
        }
      }

      for (const headForm of head.forms.plNom) {
        for (const modForm of modifier.forms.plNom) {
          const mutA: Mutation = mutators.isSlender(headForm.value) ? "len1" : "none";
          const value = `${headForm.value} ${mutators.mutate(mutA, modForm.value)}`;
          nounPhrase.forms.plDat.push(
            new NounPhraseForm(-1, -1, "plDat", value, headForm.gender)
          );
        }

        if (!head.isDefinite) {
          for (const modForm of modifier.forms.plNom) {
            const mutA: Mutation = mutators.isSlender(headForm.value) ? "len1" : "none";
            const value = `${headForm.value} ${mutators.mutate(mutA, modForm.value)}`;
            nounPhrase.forms.plDatArt.push(
              new NounPhraseForm(-1, -1, "plDatArt", value, headForm.gender)
            );
          }
        }
      }

      return nounPhrase;
    }
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