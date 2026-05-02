// Verb phrases

import type { Mutation } from "../features";

// NOTE: Gramadan includes the "Any" type, but it was only useful for the enumeration model there.

/**
 * Past - Normal past tense
 * PastCont - Past habitual
 * Pres - Present tense
 * PresCont - Present habitual
 * Fut - Future
 * Cond - Conditional
 */
export const VPTenses = ['Past', 'PastCont', 'Pres', 'PresCont', 'Fut', 'Cond'] as const;
export type VPTense = typeof VPTenses[number];

/** Imperative and subjunctive moods. 
 * While there is an indicative mood, it is not represented explicitly in the data.
 * If it has a tense, it is considered indicative.
 */
export const VPMoods = ['Imper', 'Subj'] as const;
export type VPMood = typeof VPMoods[number];

export const VPShapes = ['Declar', 'Interrog'] as const;
export type VPShape = typeof VPShapes[number];

export const VPPersons = ['Sg1', 'Sg2', 'Sg3Masc', 'Sg3Fem', 'Pl1', 'Pl2', 'Pl3', 'NoSubject', 'Auto'] as const;
export type VPPerson = typeof VPPersons[number];

export const VPPolarities = ['Pos', 'Neg'] as const;
export type VPPolarity = typeof VPPolarities[number];

/** Subject pronouns for analytic forms */
export const pronouns: Record<VPPerson, string> = {
  Sg1: "mé",
  Sg2: "tú",
  Sg3Masc: "sé",
  Sg3Fem: "sí",
  Pl1: "muid",
  Pl2: "sibh",
  Pl3: "siad",
  NoSubject: "",
  Auto: ""
};

export const indicativeParticles:
  Record<VPTense,
    Record<
      VPShape, Record<
        VPPolarity, [string, Mutation]
      >
    >
  > =
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
  PresCont: {
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
  Cond: {
    Declar: {
      Pos: ["", "len1D"],
      Neg: ["ní", "len1"],
    },
    Interrog: {
      Pos: ["an", "ecl1x"],
      Neg: ["nach", "ecl1"],
    }
  },
  PastCont: {
    Declar: {
      Pos: ["", "len1D"],
      Neg: ["ní", "len1"],
    },
    Interrog: {
      Pos: ["an", "ecl1x"],
      Neg: ["nach", "ecl1"],
    }
  }
};

// Analytic and synthetic have the same particles/mutations
export const imperativeParticles: Record<
  VPPolarity,
  [string, Mutation]
> = {
  Pos: ["", "none"],
  Neg: ["ná", "prefH"]
};

export const subjunctiveParticles: Record<
  VPPolarity,
  [string, Mutation]
> = {
  Pos: ["go", "ecl1"],
  Neg: ["nár", "len1"]
};

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
    return [this.particle, this.verbForm, this.pronoun].filter(s => s !== "").join(' ');
  }
}
