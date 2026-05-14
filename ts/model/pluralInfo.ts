import type { GrammaticalCase } from "../features";
import { broaden, slenderize } from "../mutators";

/** Operations not defined for the Dative case */
type ValidGramCases = Exclude<GrammaticalCase, "Dative">;

/** Plural class LgC: weak, plural formed by slenderization. */
export function pluralizeLgC(base: string, gramCase: ValidGramCases, slenderizationTarget?: string): string[] {
  if (gramCase === "Genitive" || gramCase === "Vocative") {
    const broadened = broaden(base);
    return gramCase === "Genitive"
      ? [broadened]
      : [`${broadened}a`];
  }
  else {
    return [
      slenderize(
        base
          //eg. bacach > bacaigh
          .replace(/ch$/, "gh"),
        slenderizationTarget
      )
    ];
  }
}

/** Plural class LgE: weak, plural formed by suffix "-e". */
export function pluralizeLgE(base: string, gramCase: ValidGramCases, slenderizationTarget?: string): string[] {
  if (gramCase === "Genitive")
    return [broaden(base)];
  else
    return [`${slenderize(base, slenderizationTarget)}e`];
}

/** Plural class LgA: weak, plural formed by suffix "-a". */
export function pluralizeLgA(base: string, gramCase: ValidGramCases, broadeningTarget?: string): string[] {
  if (gramCase === "Genitive")
    return [broaden(base)];
  else
    return [`${broaden(base, broadeningTarget)}a`];
}

/** Plural class Tr: strong. */
export function pluralizeTr(base: string): string[] {
  return [base];
}
