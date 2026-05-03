import { err, ok, type Result } from "../neverEverThrow";
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
  VerbPhrase, type VPMood, type VPPerson, type VPPolarity, type VPShape, type VPTense,
  conditionalParticles
} from "./verbPhrase";
import type { MultiRecord } from "../util";

function tenseFactory(): MultiRecord<[Dependency, Person], VerbForm[]> {
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

function moodFactory(): MultiRecord<[Person], VerbForm[]> {
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
   * but not present in the actual database as a separate form.
   * For this, use the function conjugateRule.
   */
  forms = {
    verbalNoun: [] as VerbForm[],
    verbalAdjective: [] as VerbForm[],
    tenses: {
      Past: tenseFactory(),
      Pres: tenseFactory(),
      Fut: tenseFactory(),
      Cond: tenseFactory(),
      PastHab: tenseFactory(),
      PresHab: tenseFactory()
    } as { [T in Tense]: ReturnType<typeof tenseFactory> },
    moods: {
      Ind: moodFactory(),
      Cond: moodFactory(),
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
    return this.forms.moods.Imper.Sg2[0]?.value
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
   * If an analytic form exists with a synthetic form, it will always come first.
   * TODO Standard doesn't mention "siad" form. Look into it.
   * 
  */
  conjugateRule(
    moodTense: MoodTense,
    shape: VPShape,
    polarity: VPPolarity,
    dependency: Dependency | null,
    person: VPPerson
  ): Result<VerbPhrase[], Error> {
    const adaptedPerson: Person = person === "Sg3Masc" || person === "Sg3Fem"
      ? "Sg3"
      : person === "NoSubject"
        ? "Base"
        : person;

    // Disable where the pronoun does not align with the person. E.g., might not exist
    const defaultPronoun = pronouns[person];

    const { mood, tense } = moodTense;

    if (mood === "Ind" && tense != null) {
      const [particle, mutation] = indicativeParticles[tense][shape][polarity];
      const rules: ConjugationRule[] = [];

      // Defaults for regular verbs
      switch (tense) {
        case "Past":
          rules.push(new ConjugationRule({
            mood, tense, dependency, particle,
            // The Autonomus form does NOT lenite
            mutation: adaptedPerson === "Auto" ? "none" : "len1D",
            person: adaptedPerson === "Auto" ? "Auto" : "Base",
            pronoun: defaultPronoun
          }));
          if (person === "Pl1" || person === "Pl3") {
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person: adaptedPerson, pronoun: ""
            }));
          }
          break;
        case "Pres":
          if (person === "Sg1") {
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person,
              // 1st person singular does not normally have an analytic form, e.g. "molaim"
              pronoun: ""
            }));

            if (this.getLemma() === "bí") {
              // "tá mé" is also acceptable
              rules.unshift(new ConjugationRule({
                mood, tense, dependency, particle, mutation,
                person: "Base", pronoun: defaultPronoun
              }));
            }
          } else {
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person: person === "Auto" ? "Auto" : "Base",
              pronoun: defaultPronoun
            }));
          }
          if (person === "Pl1") {
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person: adaptedPerson, pronoun: ""
            }));
          }
          break;
        case "PresHab":
          // Only bí has a present habitual form
          if (person === "Sg1") {
            // 1st person singular does not have an analytic form, i.e., "bím"
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person, pronoun: ""
            }));
          } else {
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person: person === "Auto" ? "Auto" : "Base",
              pronoun: defaultPronoun
            }));
          }

          if (person === "Pl1") {
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person: adaptedPerson, pronoun: ""
            }));
          }
          break;
        case "Fut":
          rules.push(new ConjugationRule({
            mood, tense, dependency, particle, mutation,
            person: person === "Auto" ? "Auto" : "Base",
            pronoun: defaultPronoun
          }));
          if (person === "Pl1") {
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person: adaptedPerson, pronoun: ""
            }));
          }
          break;
        case "PastHab":
          if (person === "Sg1" || person === "Sg2") {
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person: adaptedPerson,
              // 1st and 2nd person singular do not have an analytic form
              pronoun: ""
            }));
          }
          else {
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person: person === "Auto" ? "Auto" : "Base",
              // 1st and 2nd person singular do not have an analytic form
              pronoun: defaultPronoun
            }));
          }
          if (person === "Pl1" || person === "Pl3") {
            rules.push(new ConjugationRule({
              mood, tense, dependency, particle, mutation,
              person: adaptedPerson, pronoun: ""
            }));
          }
          break;
      }

      // Irregular verbs
      switch (this.getLemma()) {
        case "bí":
          if (tense === "Pres") {
            if (dependency === "Indep") {
              if (shape === "Declar" && polarity === "Neg") {
                // Forms not present in db.
                const base = "níl";
                if (person === "Sg1") {
                  return ok([
                    new VerbPhrase({ particle: "", verbForm: base, pronoun: defaultPronoun }),
                    new VerbPhrase({ particle: "", verbForm: "nílim", pronoun: "" })
                  ]);
                } else if (person === "Pl1") {
                  return ok([
                    new VerbPhrase({ particle: "", verbForm: base, pronoun: defaultPronoun }),
                    new VerbPhrase({ particle: "", verbForm: "nílimid", pronoun: "" })
                  ]);
                } else if (person === "Auto") {
                  return ok([
                    new VerbPhrase({ particle: "", verbForm: "níltear", pronoun: defaultPronoun })
                  ]);
                } else {
                  return ok([
                    new VerbPhrase({ particle: "", verbForm: base, pronoun: defaultPronoun })
                  ]);
                }
              }
            } else if (dependency === "Dep") {
              for (const r of rules) {
                r.particle = "go";
                r.mutation = "ecl1";
              }
            }
          } else if (tense === "Past") {
            if (shape === "Declar" && polarity === "Pos") {
              for (const r of rules)
                r.mutation = "len1D";
            } else if (shape === "Declar" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "none";
                r.particle = "ní";
              }
            } else if (shape === "Interrog" && polarity === "Pos") {
              for (const r of rules) {
                r.mutation = "none";
                r.particle = "an";
              }
            } else if (shape === "Interrog" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "none";
                r.particle = "nach";
              }
            }
          }
          break;
        case "abair":
          if (shape === "Declar" && polarity === "Pos") {
            for (const r of rules)
              r.mutation = "none";
          } else if (shape === "Declar" && polarity === "Neg") {
            for (const r of rules) {
              r.mutation = "len1";
              r.particle = "ní";
            }
          } else if (shape === "Interrog" && polarity === "Pos") {
            for (const r of rules) {
              r.mutation = "ecl1x";
              r.particle = "an";
            }
          } else if (shape === "Interrog" && polarity === "Neg") {
            for (const r of rules) {
              r.mutation = "ecl1";
              r.particle = "nach";
            }
          }
          break;
        case "déan":
          if (tense === "Past") {
            if (shape === "Declar" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "len1";
                r.particle = "ní";
              }
            } else if (shape === "Interrog" && polarity === "Pos") {
              for (const r of rules) {
                r.mutation = "ecl1x";
                r.particle = "an";
              }
            } else if (shape === "Interrog" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "ecl1";
                r.particle = "nach";
              }
            }
          }
          break;
        case "faigh":
          if (tense === "Past") {
            if (shape === "Declar" && polarity === "Pos") {
              for (const r of rules)
                r.mutation = "none";
            } else if (shape === "Declar" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "ecl1";
                r.particle = "ní";
              }
            } else if (shape === "Interrog" && polarity === "Pos") {
              for (const r of rules) {
                r.mutation = "ecl1x";
                r.particle = "an";
              }
            } else if (shape === "Interrog" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "ecl1";
                r.particle = "nach";
              }
            }
          } else if (tense === "Fut") {
            if (shape === "Declar" && polarity === "Pos") {
              for (const r of rules)
                r.mutation = "len1";
            } else if (shape === "Declar" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "ecl1";
                r.particle = "ní";
              }
            } else if (shape === "Interrog" && polarity === "Pos") {
              for (const r of rules) {
                r.mutation = "ecl1x";
                r.particle = "an";
              }
            } else if (shape === "Interrog" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "ecl1";
                r.particle = "nach";
              }
            }
          }
          break;
        case "feic":
          if (tense === "Past") {
            if (shape === "Declar" && polarity === "Pos") {
              for (const r of rules) {
                r.mutation = "len1";
              }
            } else if (shape === "Declar" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "len1";
                r.particle = "ní";
              }
            } else if (shape === "Interrog" && polarity === "Pos") {
              for (const r of rules) {
                r.mutation = "ecl1x";
                r.particle = "an";
              }
            } else if (shape === "Interrog" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "ecl1";
                r.particle = "nach";
              }
            }
          }
          break;
        case "téigh":
          if (tense === "Past") {
            if (shape === "Declar" && polarity === "Pos") {
              for (const r of rules) {
                r.mutation = "len1";
              }
            } else if (shape === "Declar" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "len1";
                r.particle = "ní";
              }
            } else if (shape === "Interrog" && polarity === "Pos") {
              for (const r of rules) {
                r.mutation = "ecl1x";
                r.particle = "an";
              }
            } else if (shape === "Interrog" && polarity === "Neg") {
              for (const r of rules) {
                r.mutation = "ecl1";
                r.particle = "nach";
              }
            }
          }
          break;
        case "tar":
          if (tense === "Past" && shape === "Declar" && polarity === "Pos") {
            for (const r of rules)
              r.mutation = "len1";
          }
          break;
        case "clois":
          if (tense === "Past" && shape === "Declar" && polarity === "Pos") {
            for (const r of rules)
              r.mutation = "len1";
          }
          break;
        case "cluin":
          if (tense === "Past" && shape === "Declar" && polarity === "Pos") {
            for (const r of rules)
              r.mutation = "len1";
          }
          break;
        default:
          break;
      }

      return ok(rules.map(r => r.apply(this).unwrapOr(null)).filter(r => r !== null));
    } else if (mood === "Cond") {
      const [particle, mutation] = conditionalParticles[shape][polarity];
      const rules: ConjugationRule[] = [];
      if (person === "Sg1" || person === "Sg2") {
        rules.push(new ConjugationRule({
          mood, tense: null, dependency, particle, mutation,
          person, pronoun: ""
        }));
      } else {
        rules.push(new ConjugationRule({
          mood, tense: null, dependency, particle, mutation,
          person: person === "Auto" ? "Auto" : "Base",
          pronoun: defaultPronoun
        }));
      }

      if (person === "Pl1" || person === "Pl3") {
        rules.push(new ConjugationRule({
          mood, tense: null, dependency, particle, mutation,
          person: adaptedPerson, pronoun: ""
        }));
      }

      if (this.getLemma() === "faigh" && shape === "Declar" && polarity === "Neg") {
        for (const r of rules) {
          r.mutation = "ecl1";
          r.particle = "ní";
        }
      }

      return ok(rules.map(r => r.apply(this).unwrapOr(null)).filter(r => r !== null));
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
        rules.unshift(new ConjugationRule({
          mood: "Imper",
          tense: null,
          dependency: null,
          person: "Base",
          particle,
          mutation,
          pronoun: defaultPronoun
        }));
      }

      return ok(rules.map(r => r.apply(this).unwrapOr(null)).filter(r => r !== null));
    } else if (mood === "Subj") {
      const [particle, mutation] = subjunctiveParticles[polarity];

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
        rules.unshift(new ConjugationRule({
          mood: "Subj",
          tense: null,
          dependency: null,
          person: "Base",
          particle,
          mutation,
          pronoun: defaultPronoun
        }));
      }

      switch (this.getLemma()) {
        case "abair":
          if (polarity === "Neg") {
            for (const r of rules)
              r.mutation = "none";
          }
          break;
        case "bí":
          if (polarity === "Neg") {
            for (const r of rules) {
              r.particle = "ná";
            }
          }
          break;
      }

      return ok(rules.map(r => r.apply(this).unwrapOr(null)).filter(r => r !== null));
    } else {
      throw new Error(`Invalid mood/tense supplied: ${mood}/${tense}`);
    }
  }

  /** Get an enumerator of all possible conjugations.
   * If you want an array, you can do Array.from/spread the result.
   * @returns An enumerator of all possible conjugations, 
   * along with the rules that generate them.
   */
  *conjugateAll(): Generator<{
    moodTense: MoodTense;
    dependency: Dependency | null;
    shape: VPShape;
    polarity: VPPolarity;
    person: VPPerson;
    conjugatedForms: VerbPhrase[];
  }> {
    // Indicative first
    for (const tense of VPTenses) {
      for (const shape of VPShapes) {
        for (const dependency of Dependencies) {
          for (const polarity of VPPolarities) {
            for (const person of VPPersons) {
              yield ({
                moodTense: { mood: "Ind", tense },
                dependency,
                shape,
                polarity,
                person,
                conjugatedForms: this.conjugateRule(
                  { mood: "Ind", tense }, shape, polarity, dependency, person
                ).unwrapOr([])
              });
            }
          }
        }
      }
    }

    // Then other moods
    for (const mood of VPMoods) {
      if (mood === "Ind")
        continue;

      for (const polarity of VPPolarities) {
        for (const person of VPPersons) {
          yield {
            moodTense: { mood, tense: null },
            dependency: null,
            shape: "Declar",
            polarity,
            person,
            conjugatedForms: this.conjugateRule(
              { mood, tense: null }, "Declar", polarity, null, person
            ).unwrapOr([])
          };
        }
      }
    }
  }
}

export type Tense = VPTense;
export const Dependencies = ["Indep", "Dep"] as const;
export type Dependency = typeof Dependencies[number];
export type Mood = VPMood;
export type Person = "Base" | "Sg3"
  | Exclude<VPPerson, "Sg3Masc" | "Sg3Fem" | "NoSubject">;
type MoodTense = {
  mood: Exclude<Mood, "Ind">;
  tense: null;
} | {
  mood: "Ind";
  tense: Tense;
};

export class VerbForm {
  verbFormId: number;
  verbId: number;
  formType: string;
  value: string;
  tense: Tense | null;
  dependency: Dependency | null;
  mood: Mood;
  person: Person | null;

  constructor(
    verbFormId: number,
    verbId: number,
    formType: string,
    value: string,
    tense: Tense | null,
    dependency: Dependency | null,
    mood: Mood,
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

  mood: Mood;
  tense: Tense | null;
  dependency: Dependency | null;
  person: Person;

  /** Which pronoun to put after the verb form (empty string if none) */
  pronoun: typeof pronouns[VPPerson] = "";

  constructor(props: {
    mood: Mood,
    tense: Tense | null,
    dependency: Dependency | null,
    particle: string,
    mutation: Mutation,
    person: Person,
    pronoun: typeof pronouns[VPPerson]
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

  apply(verb: Verb): Result<VerbPhrase | null, Error> {
    if (this.tense != null && this.dependency != null) {
      const verbForm = verb.forms.tenses[this.tense][this.dependency][this.person].at(0);
      if (!verbForm)
        return ok(null);
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
        return ok(null);
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
