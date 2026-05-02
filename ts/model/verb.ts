import { err, ok, type Err, type Ok } from "../neverEverThrow";
import type { Mutation } from "../features";
import { mutate } from "../mutators";
import type { ILexeme } from "./ILexeme";
import {
  imperativeParticles, indicativeParticles, pronouns, subjunctiveParticles,
  VPMoods,
  VPPersons,
  VPPolarities,
  VPShapes,
  VPTenses,
  VerbPhrase, type VPMood, type VPPerson, type VPPolarity, type VPShape, type VPTense
} from "./verbPhrase";

function tenseFactory(): {
  [D in Dependency]: {
    [P in Person]: VerbForm[]
  }
} {
  return {
    Indep: {
      Base: [] as VerbForm[],
      Sg1: [] as VerbForm[],
      Sg2: [] as VerbForm[],
      Sg3: [] as VerbForm[],
      Pl1: [] as VerbForm[],
      Pl2: [] as VerbForm[],
      Pl3: [] as VerbForm[],
      Auto: [] as VerbForm[]
    },
    Dep: {
      Base: [] as VerbForm[],
      Sg1: [] as VerbForm[],
      Sg2: [] as VerbForm[],
      Sg3: [] as VerbForm[],
      Pl1: [] as VerbForm[],
      Pl2: [] as VerbForm[],
      Pl3: [] as VerbForm[],
      Auto: [] as VerbForm[]
    }
  };
}

function moodFactory(): {
  [P in Person]: VerbForm[]
} {
  return {
    Base: [] as VerbForm[],
    Sg1: [] as VerbForm[],
    Sg2: [] as VerbForm[],
    Sg3: [] as VerbForm[],
    Pl1: [] as VerbForm[],
    Pl2: [] as VerbForm[],
    Pl3: [] as VerbForm[],
    Auto: [] as VerbForm[]
  };
}

export class Verb implements ILexeme {
  verbId: number;
  disambig: string;

  /** Basic verb forms.
   * Does not represent a complete set of conjugations.
   * E.g. The base form is referenced presCont, 2nd, 3rd, and 1st analytic forms,
   * but not present in the actual database as a separate for"
   *" For this, use the function conjugateRule.
   */
  forms = {
    verbalNoun: [] as VerbForm[],
    verbalAdjective: [] as VerbForm[],
    tenses: {
      Past: tenseFactory(),
      Pres: tenseFactory(),
      Fut: tenseFactory(),
      Cond: tenseFactory(),
      PastCont: tenseFactory(),
      PresCont: tenseFactory()
    } as { [T in Tense]: ReturnType<typeof tenseFactory> },
    moods: {
      Imper: moodFactory(),
      Subj: moodFactory()
    } as { [M in Mood]: ReturnType<typeof moodFactory> }
  };

  constructor(props: {
    verbId: number,
    disambig: string
  }) {
    this.verbId = props.verbId;
    this.disambig = props.disambig;
  }

  /** The imperative second-person singular is the lemma.
   * if not available, then the past tense base is the lemma
  */
  getLemma(): string {
    return this.forms.tenses.Pres.Dep.Sg2[0]?.value
      ?? this.forms.tenses.Past.Indep.Base[0]?.value;
  }

  getNickname(): string {
    const lemma = this.getLemma();
    const disambigPart = this.disambig != "" ? `_${this.disambig}` : "";
    return `${lemma}_${disambigPart}`;
  }

  /** Conjugate a verb according to the specified rules 
   * @returns an array of conjugation rules, as some verb forms may have multiple valid conjugations.
   * E.g. Synthetic and analytic forms
  */
  conjugateRule(
    /** null implies indicative mood */
    mood: VPMood | null,
    tense: VPTense | null,
    shape: VPShape,
    polarity: VPPolarity,
    dependency: Dependency | null,
    person: VPPerson
  ): VerbPhrase[] {
    const pronoun = pronouns[person];
    const adaptedPerson: Person = person === "Sg3Masc" || person === "Sg3Fem"
      ? "Sg3"
      : person === "NoSubject"
        ? "Base"
        : person;
    if (mood === null && tense != null) {
      const [particle, mutation] = indicativeParticles[tense][shape][polarity];
      const rule = new ConjugationRule({
        mood: null,
        tense,
        dependency,
        person: adaptedPerson,
        particle,
        mutation,
        pronoun
      });

      switch (this.getLemma()) {
        case "bí":
          if (tense === "Past") {
            if (shape === "Declar" && polarity === "Pos")
              rule.mutation = "len1D";
            else if (shape === "Declar" && polarity === "Neg") {
              rule.mutation = "none";
              rule.particle = "ní";
            } else if (shape === "Interrog" && polarity === "Pos") {
              rule.mutation = "none";
              rule.particle = "an";
            } else if (shape === "Interrog" && polarity === "Neg") {
              rule.mutation = "none";
              rule.particle = "nach";
            }
          }
          break;
        case "abair":
          if (shape === "Declar" && polarity === "Pos")
            rule.mutation = "none";
          else if (shape === "Declar" && polarity === "Neg") {
            rule.mutation = "len1";
            rule.particle = "ní";
          } else if (shape === "Interrog" && polarity === "Pos") {
            rule.mutation = "ecl1x";
            rule.particle = "an";
          } else if (shape === "Interrog" && polarity === "Neg") {
            rule.mutation = "ecl1";
            rule.particle = "nach";
          }
          break;
        case "déan":
          if (tense === "Past") {
            if (shape === "Declar" && polarity === "Neg") {
              rule.mutation = "len1";
              rule.particle = "ní";
            } else if (shape === "Interrog" && polarity === "Pos") {
              rule.mutation = "ecl1x";
              rule.particle = "an";
            } else if (shape === "Interrog" && polarity === "Neg") {
              rule.mutation = "ecl1";
              rule.particle = "nach";
            }
          }
          break;
        case "faigh":
          if (tense === "Past") {
            if (shape === "Declar" && polarity === "Pos") {
              rule.mutation = "none";
            } else if (shape === "Declar" && polarity === "Neg") {
              rule.mutation = "ecl1";
              rule.particle = "ní";
            } else if (shape === "Interrog" && polarity === "Pos") {
              rule.mutation = "ecl1x";
              rule.particle = "an";
            } else if (shape === "Interrog" && polarity === "Neg") {
              rule.mutation = "ecl1";
              rule.particle = "nach";
            }
          } else if (tense === "Fut") {
            if (shape === "Declar" && polarity === "Pos") {
              rule.mutation = "len1";
            } else if (shape === "Declar" && polarity === "Neg") {
              rule.mutation = "ecl1";
              rule.particle = "ní";
            } else if (shape === "Interrog" && polarity === "Pos") {
              rule.mutation = "ecl1x";
              rule.particle = "an";
            } else if (shape === "Interrog" && polarity === "Neg") {
              rule.mutation = "ecl1";
              rule.particle = "nach";
            }
          } else if (tense === "Cond" && shape === "Declar" && polarity === "Neg") {
            rule.mutation = "ecl1";
            rule.particle = "ní";
          }
          break;
        case "feic":
          if (tense === "Past") {
            if (shape === "Declar" && polarity === "Pos") {
              rule.mutation = "len1";
            } else if (shape === "Declar" && polarity === "Neg") {
              rule.mutation = "len1";
              rule.particle = "ní";
            } else if (shape === "Interrog" && polarity === "Pos") {
              rule.mutation = "ecl1x";
              rule.particle = "an";
            } else if (shape === "Interrog" && polarity === "Neg") {
              rule.mutation = "ecl1";
              rule.particle = "nach";
            }
          }
          break;
        case "téigh":
          if (tense === "Past") {
            if (shape === "Declar" && polarity === "Pos") {
              rule.mutation = "len1";
            } else if (shape === "Declar" && polarity === "Neg") {
              rule.mutation = "len1";
              rule.particle = "ní";
            } else if (shape === "Interrog" && polarity === "Pos") {
              rule.mutation = "ecl1x";
              rule.particle = "an";
            } else if (shape === "Interrog" && polarity === "Neg") {
              rule.mutation = "ecl1";
              rule.particle = "nach";
            }
          }
          break;
        case "tar":
          if (tense === "Past" && shape === "Declar" && polarity === "Pos")
            rule.mutation = "len1";
          break;
        case "clois":
          if (tense === "Past" && shape === "Declar" && polarity === "Pos")
            rule.mutation = "len1";
          break;
        case "cluin":
          if (tense === "Past" && shape === "Declar" && polarity === "Pos")
            rule.mutation = "len1";
          break;
        default:
          break;
      }

      return [rule].map(r => r.apply(this)).filter(r => r.isOk).map(r => r.value);
    } else if (mood === "Imper") {
      const [particle, mutation] = imperativeParticles[polarity];
      const rules: ConjugationRule[] = [];

      const hasSyntheticForms = (this.forms.moods.Imper[adaptedPerson].length > 0);
      if (hasSyntheticForms) {
        rules.push(new ConjugationRule({
          mood: "Imper",
          tense: null,
          dependency: null,
          person: adaptedPerson,
          particle,
          mutation,
          pronoun: ""
        }));
      }

      if (!hasSyntheticForms || adaptedPerson === "Pl1" || adaptedPerson === "Pl3") {
        // For muid, siad analytic forms.
        // TODO Standard doesn't mention "siad" form. Look into it.
        rules.push(new ConjugationRule({
          mood: "Imper",
          tense: null,
          dependency: null,
          person: "Base",
          particle,
          mutation,
          pronoun
        }));
      }

      return rules.map(r => r.apply(this)).filter(r => r.isOk).map(r => r.value);
    } else if (mood === "Subj") {
      let [particle, mutation] = subjunctiveParticles[polarity];

      switch (this.getLemma()) {
        case "abair":
          if (polarity === "Neg")
            mutation = "none";
          break;
        case "bí":
          if (polarity === "Neg")
            particle = "ná";
          break;
      }

      const rules: ConjugationRule[] = [];
      const hasSyntheticForms = (this.forms.moods.Subj[adaptedPerson].length > 0);
      if (hasSyntheticForms) {
        rules.push(new ConjugationRule({
          mood: "Subj",
          tense: null,
          dependency: null,
          person: adaptedPerson,
          particle,
          mutation,
          pronoun: ""
        }));
      }

      if (!hasSyntheticForms || adaptedPerson === "Pl1" || adaptedPerson === "Pl3") {
        // For muid, siad analytic forms.
        // TODO See above note on siad
        rules.push(new ConjugationRule({
          mood: "Subj",
          tense: null,
          dependency: null,
          person: "Base",
          particle,
          mutation,
          pronoun
        }));
      }

      return rules.map(r => r.apply(this)).filter(r => r.isOk).map(r => r.value);
    } else {
      throw new Error(`Invalid mood/tense supplied: ${mood}/${tense}`);
    }
  }

  /** Return an enumeration of all possible conjugations */
  conjugateAll() {
    const conjugations: {
      tenses: VerbPhrase[][],
      moods: VerbPhrase[][]
    } = {
      tenses: [],
      moods: []
    };

    // Indicative first
    for (const tense of VPTenses) {
      for (const shape of VPShapes) {
        for (const dependency of ["Indep", "Dep"] as Dependency[]) {
          for (const polarity of VPPolarities) {
            for (const person of VPPersons) {
              conjugations.tenses.push(this.conjugateRule(
                null, tense, shape, polarity, dependency, person
              ));
            }
          }
        }
      }
    }

    // Then other moods
    for (const mood of VPMoods) {
      for (const polarity of VPPolarities) {
        for (const person of VPPersons) {
          conjugations.moods.push(this.conjugateRule(
            mood, "Pres", "Declar", polarity, null, person
          ));
        }
      }
    }

    return conjugations;
  }
}

export type Tense = VPTense;
export type Dependency = 'Indep' | 'Dep';
export type Mood = VPMood;
export type Person = 'Base' | 'Sg3'
  | Exclude<VPPerson, 'Sg3Masc' | 'Sg3Fem' | 'NoSubject'>;

export class VerbForm {
  verbFormId: number;
  verbId: number;
  formType: string;
  value: string;
  tense: Tense | null;
  dependency: Dependency | null;
  mood: Mood | null;
  person: Person | null;

  constructor(
    verbFormId: number,
    verbId: number,
    formType: string,
    value: string,
    tense: Tense | null,
    dependency: Dependency | null,
    mood: Mood | null,
    person: Person | null
  ) {
    this.verbFormId = verbFormId;
    this.verbId = verbId;
    this.formType = formType;
    this.value = value;
    this.tense = tense;
    this.dependency = dependency;
    this.mood = mood;
    this.person = person;
  }
}

/** Gramadan has just tense rules. I think it's better to have locality
 * of behavior to group all conjugation rules together (including moods, e.g.).
 * 
 * The idea is to be able to generate a phrase of the form:
 * [particle] [mutated verb form] [pronoun]
 */
export class ConjugationRule {
  /** Which particle to put in front of the verb form (empty string if none) */
  particle = "";

  /** Which mutation to cause on the verb form */
  mutation: Mutation = "none";

  mood: Mood | null;
  tense: Tense | null;
  dependency: Dependency | null;
  person: Person;

  /** Which pronoun to put after the verb form (empty string if none) */
  pronoun = "";

  constructor(props: {
    mood: Mood | null,
    tense: Tense | null,
    dependency: Dependency | null,
    particle: string,
    mutation: Mutation,
    person: Person,
    pronoun: string
  }
  ) {
    this.particle = props.particle;
    this.mutation = props.mutation;
    this.mood = props.mood;
    this.tense = props.tense;
    this.dependency = props.dependency;
    this.person = props.person;
    this.pronoun = props.pronoun;
  }

  apply(verb: Verb): Ok<VerbPhrase> | Err<Error> {
    if (this.tense != null && this.dependency != null) {
      const verbForm = verb.forms.tenses[this.tense][this.dependency][this.person].at(0);
      if (!verbForm)
        return err(new Error(`Verb form not found for ${this.tense}, ${this.dependency}, ${this.person}`));
      else {
        return ok(new VerbPhrase({
          particle: this.particle,
          verbForm: mutate(
            this.mutation,
            verbForm.value
          ),
          pronoun: this.pronoun
        }));
      }
    } else if (this.mood != null) {
      const verbForm = verb.forms.moods[this.mood][this.person].at(0);
      if (!verbForm)
        return err(new Error(`Verb form not found for ${this.mood}, ${this.person}`));
      else {
        return ok(new VerbPhrase({
          particle: this.particle,
          verbForm: mutate(
            this.mutation,
            verbForm.value
          ),
          pronoun: this.pronoun
        }));
      }
    } else {
      return err(new Error("ConjugationRule must have either tense or mood defined"));
    }
  }
}
