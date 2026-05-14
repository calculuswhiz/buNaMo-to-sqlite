import type { Gender, Mutation } from "../features";
import { emphasize, isSlender, isSlenderI, mutate, prefix, startsFVowel, startsVowel } from "../mutators";
import type { Adjective } from "./adjective";
import type { ILexeme } from "./ILexeme";
import type { Noun } from "./noun";
import type { Possessive } from "./possessive";

export class NounPhrase implements ILexeme {
  nounPhraseId: number;
  isDefinite: boolean;
  isPossessed: boolean;
  isImmutable: boolean;
  forceNominative: boolean;
  disambig: string;

  forms: { [key in NounPhraseFormName]: NounPhraseForm[] };

  constructor(props: {
    nounPhraseId?: number,
    isDefinite: boolean,
    isPossessed: boolean,
    isImmutable: boolean,
    forceNominative: boolean,
    disambig: string,
    forms?: { [key in NounPhraseFormName]?: NounPhraseForm[] }
  }) {
    this.nounPhraseId = props.nounPhraseId ?? -1;
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

  /** Adds a possessive pronoun to sgNom, sgDat, sgGen, plNom, plDat, plGen of itself, empties all other forms
   * Ported from private method of same name in NounPhrase.cs.
   */
  makePossessive(possessive: Possessive) {
    this.isDefinite = true;
    this.isPossessed = true;

    for (const headForm of this.forms.sgNom) {
      if (possessive.forms.apos.length > 0 && (startsVowel(headForm.value) || startsFVowel(headForm.value))) {
        for (const possForm of possessive.forms.apos)
          headForm.value = possForm.value + mutate(possessive.mutation, headForm.value);
      }
      else {
        for (const possForm of possessive.forms.full)
          headForm.value = `${possForm.value} ${mutate(possessive.mutation, headForm.value)}`;
      }
    }

    for (const headForm of this.forms.sgDat) {
      if (possessive.forms.apos.length > 0 && (startsVowel(headForm.value) || startsFVowel(headForm.value))) {
        for (const possForm of possessive.forms.apos)
          headForm.value = possForm.value + mutate(possessive.mutation, headForm.value);
      }
      else {
        for (const possForm of possessive.forms.full)
          headForm.value = `${possForm.value} ${mutate(possessive.mutation, headForm.value)}`;
      }
    }
    for (const headForm of this.forms.sgGen) {
      if (possessive.forms.apos.length > 0 && (startsVowel(headForm.value) || startsFVowel(headForm.value))) {
        for (const possForm of possessive.forms.apos)
          headForm.value = possForm.value + mutate(possessive.mutation, headForm.value);
      }
      else {
        for (const possForm of possessive.forms.full)
          headForm.value = `${possForm.value} ${mutate(possessive.mutation, headForm.value)}`;
      }
    }
    for (const headForm of this.forms.plNom) {
      if (possessive.forms.apos.length > 0 && (startsVowel(headForm.value) || startsFVowel(headForm.value))) {
        for (const possForm of possessive.forms.apos)
          headForm.value = possForm.value + mutate(possessive.mutation, headForm.value);
      }
      else {
        for (const possForm of possessive.forms.full)
          headForm.value = `${possForm.value} ${mutate(possessive.mutation, headForm.value)}`;
      }
    }

    for (const headForm of this.forms.plDat) {
      if (possessive.forms.apos.length > 0 && (startsVowel(headForm.value) || startsFVowel(headForm.value))) {
        for (const possForm of possessive.forms.apos)
          headForm.value = possForm.value + mutate(possessive.mutation, headForm.value);
      }
      else {
        for (const possForm of possessive.forms.full)
          headForm.value = `${possForm.value} ${mutate(possessive.mutation, headForm.value)}`;
      }
    }

    for (const headForm of this.forms.plGen) {
      if (possessive.forms.apos.length > 0 && (startsVowel(headForm.value) || startsFVowel(headForm.value))) {
        for (const possForm of possessive.forms.apos)
          headForm.value = possForm.value + mutate(possessive.mutation, headForm.value);
      }
      else {
        for (const possForm of possessive.forms.full)
          headForm.value = `${possForm.value} ${mutate(possessive.mutation, headForm.value)}`;
      }
    }

    this.forms.sgDatArtN = [];
    this.forms.sgDatArtS = [];
    this.forms.sgGenArt = [];
    this.forms.sgNomArt = [];
    this.forms.plDatArt = [];
    this.forms.plGenArt = [];
    this.forms.plNomArt = [];
  }

  // Ported from Noun-arg constructor
  static fromNoun(head: Noun): NounPhrase {
    const nounPhrase = new NounPhrase({
      isDefinite: head.isDefinite,
      isPossessed: false,
      isImmutable: head.isImmutable,
      forceNominative: false,
      disambig: "",
    });
    nounPhrase.isDefinite = head.isDefinite;
    nounPhrase.isImmutable = head.isImmutable;

    for (const headForm of head.forms.sgNom) {
      nounPhrase.forms.sgNom.push(new NounPhraseForm({
        formName: "sgNom",
        value: headForm.value,
        gender: headForm.gender
      }));

      if (!head.isDefinite) {
        const mut: Mutation = head.isImmutable
          ? "none"
          : headForm.gender === "masc" ? "prefT" : "len3";

        nounPhrase.forms.sgNomArt.push(
          new NounPhraseForm({
            formName: "sgNomArt",
            value: `an ${mutate(mut, headForm.value)}`,
            gender: headForm.gender
          })
        );
      }
    }

    for (const headForm of head.forms.sgGen) {
      const mut: Mutation = head.isImmutable
        ? "none"
        // Proper nouns are always lenited in the genitive
        : head.isProper ? "len1" : "none";
      nounPhrase.forms.sgGen.push(
        new NounPhraseForm({
          formName: "sgGen",
          value: mutate(mut, headForm.value),
          gender: headForm.gender
        })
      );

      if (!head.isDefinite || head.allowArticledGenitive) {
        const mut: Mutation = head.isImmutable
          ? "none"
          : headForm.gender === "masc" ? "len3" : "prefH";
        const article = headForm.gender === "masc" ? "an" : "na";
        nounPhrase.forms.sgGenArt.push(
          new NounPhraseForm({
            formName: "sgGenArt",
            value: `${article} ${mutate(mut, headForm.value)}`,
            gender: headForm.gender
          })
        );
      }
    }

    for (const headForm of head.forms.plNom) {
      nounPhrase.forms.plNom.push(new NounPhraseForm({
        formName: "plNom",
        value: headForm.value,
        gender: headForm.gender
      }));

      if (!head.isDefinite) {
        const mut: Mutation = head.isImmutable ? "none" : "prefH";
        nounPhrase.forms.plNomArt.push(
          new NounPhraseForm({
            formName: "plNomArt",
            value: `na ${mutate(mut, headForm.value)}`,
            gender: headForm.gender
          })
        );
      }
    }

    for (const headForm of head.forms.plGen) {
      // Proper nouns are always lenited in the articleless genitive
      const mut: Mutation = head.isImmutable
        ? "none"
        : head.isProper ? "len1" : "none";
      nounPhrase.forms.plGen.push(
        new NounPhraseForm({
          formName: "plGen",
          value: mutate(mut, headForm.value),
          gender: headForm.gender
        })
      );

      if (!head.isDefinite || head.allowArticledGenitive) {
        const mut: Mutation = head.isImmutable ? "none" : "ecl1";
        nounPhrase.forms.plGenArt.push(
          new NounPhraseForm({
            formName: "plGenArt",
            value: `na ${mutate(mut, headForm.value)}`,
            gender: headForm.gender
          })
        );
      }
    }

    for (const headForm of head.forms.sgDat) {
      nounPhrase.forms.sgDat.push(new NounPhraseForm({
        formName: "sgDat",
        value: headForm.value,
        gender: headForm.gender
      }));

      if (!head.isDefinite) {
        nounPhrase.forms.sgDatArtN.push(new NounPhraseForm({
          formName: "sgDatArtN",
          value: headForm.value,
          gender: headForm.gender
        }));
        nounPhrase.forms.sgDatArtS.push(new NounPhraseForm({
          formName: "sgDatArtS",
          value: headForm.value,
          gender: headForm.gender
        }));
      }
    }

    for (const headForm of head.forms.plNom) {
      nounPhrase.forms.plDat.push(new NounPhraseForm({
        formName: "plDat",
        value: headForm.value,
        gender: headForm.gender
      }));

      if (!head.isDefinite) {
        nounPhrase.forms.plDatArt.push(new NounPhraseForm({
          formName: "plDatArt",
          value: headForm.value,
          gender: headForm.gender
        }));
      }
    }

    return nounPhrase;
  }

  // Ported from Noun+Adjective constructor
  static fromModifiedNoun(head: Noun, modifier: Adjective, possessive?: Possessive): NounPhrase {
    if (modifier.isPre) {
      const prefixedHead = head.clone();
      const prefixLemma = modifier.getLemma();

      for (const f of prefixedHead.forms.sgNom)
        f.value = prefix(prefixLemma, f.value);
      for (const f of prefixedHead.forms.sgGen)
        f.value = prefix(prefixLemma, f.value);
      for (const f of prefixedHead.forms.sgDat)
        f.value = prefix(prefixLemma, f.value);
      for (const f of prefixedHead.forms.sgVoc)
        f.value = prefix(prefixLemma, f.value);
      for (const f of prefixedHead.forms.plNom)
        f.value = prefix(prefixLemma, f.value);
      for (const f of prefixedHead.forms.plGen)
        f.value = prefix(prefixLemma, f.value);
      for (const f of prefixedHead.forms.plVoc)
        f.value = prefix(prefixLemma, f.value);
      for (const f of prefixedHead.forms.count)
        f.value = prefix(prefixLemma, f.value);

      return possessive == null
        ? NounPhrase.fromNoun(prefixedHead)
        : NounPhrase.fromPossessedNoun(prefixedHead, possessive);
    } else {
      const nounPhrase = new NounPhrase({
        isDefinite: head.isDefinite,
        isImmutable: head.isImmutable,
        forceNominative: true,
        isPossessed: false,
        disambig: ""
      });

      for (const headForm of head.forms.sgNom) {
        for (const modForm of modifier.forms.sgNom) {
          const mutA: Mutation = headForm.gender === "masc" ? "none" : "len1";
          const value = `${headForm.value} ${mutate(mutA, modForm.value)}`;
          nounPhrase.forms.sgNom.push(
            new NounPhraseForm({
              formName: "sgNom",
              value: value,
              gender: headForm.gender
            })
          );
        }

        if (!head.isDefinite) {
          for (const modForm of modifier.forms.sgNom) {
            let mutN: Mutation = headForm.gender === "masc" ? "prefT" : "len3";
            if (head.isImmutable)
              mutN = "none";
            const mutA: Mutation = headForm.gender === "masc" ? "none" : "len1";
            const value = `an ${mutate(mutN, headForm.value)} ${mutate(mutA, modForm.value)}`;
            nounPhrase.forms.sgNomArt.push(
              new NounPhraseForm({
                formName: "sgNomArt",
                value: value,
                gender: headForm.gender
              })
            );
          }
        }
      }

      for (const headForm of head.forms.sgGen) {
        const modForms = headForm.gender === "masc" ? modifier.forms.sgGenMasc : modifier.forms.sgGenFem;
        for (const modForm of modForms) {
          let mutN: Mutation = head.isProper ? "len1" : "none"; //proper nouns are always lenited in the genitive
          if (head.isImmutable)
            mutN = "none";
          const mutA: Mutation = headForm.gender === "masc" ? "len1" : "none";
          const value = `${mutate(mutN, headForm.value)} ${mutate(mutA, modForm.value)}`;
          nounPhrase.forms.sgGen.push(
            new NounPhraseForm({
              formName: "sgGen",
              value: value,
              gender: headForm.gender
            })
          );
        }

      }
      for (const headForm of head.forms.sgGen) {
        if (!head.isDefinite || head.allowArticledGenitive) {
          const modForms = headForm.gender === "masc" ? modifier.forms.sgGenMasc : modifier.forms.sgGenFem;
          for (const modForm of modForms) {
            let mutN: Mutation = headForm.gender === "masc" ? "len3" : "prefH";
            if (head.isImmutable)
              mutN = "none";
            const mutA: Mutation = headForm.gender === "masc" ? "len1" : "none";
            const article = headForm.gender === "masc" ? "an" : "na";
            const value = `${article} ${mutate(mutN, headForm.value)} ${mutate(mutA, modForm.value)}`;
            nounPhrase.forms.sgGenArt.push(
              new NounPhraseForm({
                formName: "sgGenArt",
                value: value,
                gender: headForm.gender
              })
            );
          }
        }
      }

      for (const headForm of head.forms.plNom) {
        for (const modForm of modifier.forms.plNom) {
          const mutA: Mutation = isSlender(headForm.value)
            ? "len1" : "none";
          const value = `${headForm.value} ${mutate(mutA, modForm.value)}`;
          nounPhrase.forms.plNom.push(
            new NounPhraseForm({
              formName: "plNom",
              value: value,
              gender: headForm.gender
            })
          );
        }

        if (!head.isDefinite) {
          for (const modForm of modifier.forms.plNom) {
            let mutN: Mutation = "prefH";
            if (head.isImmutable)
              mutN = "none";
            const mutA: Mutation = isSlender(headForm.value) ? "len1" : "none";
            const value = `na ${mutate(mutN, headForm.value)} ${mutate(mutA, modForm.value)}`;
            nounPhrase.forms.plNomArt.push(
              new NounPhraseForm({
                formName: "plNomArt",
                value: value,
                gender: headForm.gender
              })
            );
          }
        }
      }

      for (const headForm of head.forms.plGen) {
        const modForms = headForm.strength === "strong" ? modifier.forms.plNom : modifier.forms.sgNom;
        for (const modForm of modForms) {
          let mutA: Mutation = isSlender(headForm.value) ? "len1" : "none";
          if (headForm.strength === "weak")
            //"Gael", "captaen" are not slender
            mutA = isSlenderI(headForm.value) ? "len1" : "none";
          const value = `${headForm.value} ${mutate(mutA, modForm.value)}`;
          nounPhrase.forms.plGen.push(
            new NounPhraseForm({
              formName: "plGen",
              value: value,
              gender: headForm.gender
            })
          );
        }
      }
      for (const headForm of head.forms.plGen) {
        if (!head.isDefinite || head.allowArticledGenitive) {
          const modForms = headForm.strength === "strong" ? modifier.forms.plNom : modifier.forms.sgNom;
          for (const modForm of modForms) {
            let mutN: Mutation = "len1";
            if (head.isImmutable)
              mutN = "none";
            let mutA: Mutation = isSlender(headForm.value) ? "len1" : "none";
            if (headForm.strength === "weak")
              //"Gael", "captaen" are not slender
              mutA = isSlenderI(headForm.value) ? "len1" : "none";
            const value = `na ${mutate(mutN, headForm.value)} ${mutate(mutA, modForm.value)}`;
            nounPhrase.forms.plGenArt.push(
              new NounPhraseForm({
                formName: "plGenArt",
                value: value,
                gender: headForm.gender
              })
            );
          }
        }
      }

      for (const headForm of head.forms.sgDat) {
        for (const modForm of modifier.forms.sgNom) {
          const mutA: Mutation = headForm.gender === "masc" ? "none" : "len1";
          const value = `${headForm.value} ${mutate(mutA, modForm.value)}`;
          nounPhrase.forms.sgDat.push(
            new NounPhraseForm({
              formName: "sgDat",
              value: value,
              gender: headForm.gender
            })
          );
        }

        if (!head.isDefinite) {
          for (const modForm of modifier.forms.sgNom) {
            const mutA: Mutation = headForm.gender === "masc" ? "none" : "len1";
            const value = `${headForm.value} ${mutate(mutA, modForm.value)}`;
            nounPhrase.forms.sgDatArtS.push(
              new NounPhraseForm({
                formName: "sgDatArtS",
                value: value,
                gender: headForm.gender
              })
            );
          }
          for (const modForm of modifier.forms.sgNom) {
            const value = `${headForm.value} ${mutate("len1", modForm.value)}`;
            nounPhrase.forms.sgDatArtN.push(
              new NounPhraseForm({
                formName: "sgDatArtN",
                value: value,
                gender: headForm.gender
              })
            );
          }
        }
      }

      for (const headForm of head.forms.plNom) {
        for (const modForm of modifier.forms.plNom) {
          const mutA: Mutation = isSlender(headForm.value) ? "len1" : "none";
          const value = `${headForm.value} ${mutate(mutA, modForm.value)}`;
          nounPhrase.forms.plDat.push(
            new NounPhraseForm({
              formName: "plDat",
              value: value,
              gender: headForm.gender
            })
          );
        }

        if (!head.isDefinite) {
          for (const modForm of modifier.forms.plNom) {
            const mutA: Mutation = isSlender(headForm.value) ? "len1" : "none";
            const value = `${headForm.value} ${mutate(mutA, modForm.value)}`;
            nounPhrase.forms.plDatArt.push(
              new NounPhraseForm({
                formName: "plDatArt",
                value: value,
                gender: headForm.gender
              })
            );
          }
        }
      }

      if (possessive != null)
        nounPhrase.makePossessive(possessive);

      return nounPhrase;
    }
  }

  // Ported from Adjective and Possessive-arg constructors
  static fromPossessedNoun(head: Noun, possessive: Possessive, shouldEmphasize = false): NounPhrase {
    const nounPhrase = NounPhrase.fromNoun(head);
    nounPhrase.makePossessive(possessive);
    if (shouldEmphasize) {
      for (const form of nounPhrase.forms.sgNom)
        form.value = emphasize(form.value, possessive.emphasizer);
      for (const form of nounPhrase.forms.sgDat)
        form.value = emphasize(form.value, possessive.emphasizer);
      for (const form of nounPhrase.forms.sgGen)
        form.value = emphasize(form.value, possessive.emphasizer);
      for (const form of nounPhrase.forms.plNom)
        form.value = emphasize(form.value, possessive.emphasizer);
      for (const form of nounPhrase.forms.plDat)
        form.value = emphasize(form.value, possessive.emphasizer);
      for (const form of nounPhrase.forms.plGen)
        form.value = emphasize(form.value, possessive.emphasizer);
    }

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
    const disambigPart = this.disambig !== "" ? `_${this.disambig}` : "";
    return `${lemma}_NP${disambigPart}`;
  }

  getGender(): Gender | null {
    return this.forms.sgNom[0]?.gender
      ?? this.forms.sgNomArt[0]?.gender;
  }

  hasGender(): boolean {
    return this.getGender() != null;
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

  constructor(props: {
    nounPhraseFormId?: number,
    nounPhraseId?: number,
    formName: NounPhraseFormName,
    value: string,
    gender: Gender | null
  }) {
    this.nounPhraseFormId = props.nounPhraseFormId ?? -1;
    this.nounPhraseId = props.nounPhraseId ?? -1;
    this.formName = props.formName;
    this.value = props.value;
    this.gender = props.gender;
  }
}