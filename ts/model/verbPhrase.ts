// Verb phrases

import type { Mutation } from "../features";
import type { MultiRecord } from "../util";

// NOTE: Gramadan includes the "Any" type, but it was only useful for the enumeration model there.

export const VPTenses = ["Past", "PastHab", "Pres", "PresHab", "Fut"] as const;
export type VPTense = typeof VPTenses[number];

/** Indicative, imperative, subjunctive, and conditional moods. 
 * While there is an indicative mood, it is not represented explicitly in the data.
 * If it has a tense, it is considered indicative.
 */
export const VPMoods = ["Ind", "Imper", "Subj", "Cond"] as const;
export type VPMood = typeof VPMoods[number];

export const VPShapes = ["Declar", "Interrog"] as const;
export type VPShape = typeof VPShapes[number];

export const VPPersons = [
  "Sg1", "Sg2", "Sg3Masc", "Sg3Fem", "Pl1", "Pl2", "Pl3",
  "NoSubject", "Auto"
] as const;
export type VPPerson = typeof VPPersons[number];

export const VPPolarities = ["Pos", "Neg"] as const;
export type VPPolarity = typeof VPPolarities[number];

/** Subject pronouns for analytic forms */
export const pronouns = {
  Sg1: "mé",
  Sg2: "tú",
  Sg3Masc: "sé",
  Sg3Fem: "sí",
  Pl1: "muid",
  Pl2: "sibh",
  Pl3: "siad",
  NoSubject: "",
  Auto: ""
} as const satisfies Record<VPPerson, string>;

/**
 * Only apply to regular verbs. Non-regular verbs are handled in the Verb conjugateRule method.
 *  */
export const indicativeParticles =
  {
    Past: {
      Declar: {
        Pos: ["", "len1D"],
        Neg: ["nior", "len1"],
      },
      Interrog: {
        Pos: ["ar", "len1"],
        Neg: ["nár", "len1"],
      }
    },
    Pres: {
      Declar: {
        Pos: ["", "none"],
        Neg: ["ní", "len1"],
      },
      Interrog: {
        Pos: ["an", "ecl1x"],
        Neg: ["nach", "ecl1"],
      }
    },
    PresHab: {
      Declar: {
        Pos: ["", "none"],
        Neg: ["ní", "len1"],
      },
      Interrog: {
        Pos: ["an", "ecl1x"],
        Neg: ["nach", "ecl1"],
      }
    },
    Fut: {
      Declar: {
        Pos: ["", "none"],
        Neg: ["ní", "len1"],
      },
      Interrog: {
        Pos: ["an", "ecl1x"],
        Neg: ["nach", "ecl1"],
      }
    },
    PastHab: {
      Declar: {
        Pos: ["", "len1D"],
        Neg: ["ní", "len1"],
      },
      Interrog: {
        Pos: ["an", "ecl1x"],
        Neg: ["nach", "ecl1"],
      }
    }
  } as const satisfies MultiRecord<[VPTense, VPShape, VPPolarity], [string, Mutation]>;

export const conditionalParticles = {
  Declar: {
    Pos: ["", "len1D"],
    Neg: ["ní", "len1"],
  },
  Interrog: {
    Pos: ["an", "ecl1x"],
    Neg: ["nach", "ecl1"],
  }
} as const satisfies MultiRecord<[VPShape, VPPolarity], [string, Mutation]>;

// Analytic and synthetic have the same particles/mutations
export const imperativeParticles = {
  Pos: ["", "none"],
  Neg: ["ná", "prefH"]
} as const satisfies Record<VPPolarity, [string, Mutation]>;

export const subjunctiveParticles = {
  Pos: ["go", "ecl1"],
  Neg: ["nár", "len1"]
} as const satisfies Record<VPPolarity, [string, Mutation]>;

export class VerbPhrase {
  particle: string;
  verbForm: string;
  pronoun: string;

  constructor(props: {
    particle: string,
    verbForm: string,
    pronoun: string
  }) {
    this.particle = props.particle;
    this.verbForm = props.verbForm;
    this.pronoun = props.pronoun;
  }

  toString() {
    return [this.particle, this.verbForm, this.pronoun].filter(s => s !== "").join(" ");
  }
}
