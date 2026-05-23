import type { Gender, GrammaticalCase } from "../features";
import { broaden, palatalize, syncope, VowelsBroad, VowelsSlender } from "../mutators";

/** O: all cases are identical. */
export function getSingularInfoO(lemma: string): string[] {
  return [lemma];
}

/** C: genitive and vocative formed by slenderization. */
export function getSingularInfoC(lemma: string, gender: Gender, gramCase: GrammaticalCase, slenderizationTarget?: string): string[] {
  if (gramCase === "Nominative" || gramCase === "Dative")
    return [lemma];
  else {
    // e.g. bacach > bacaigh
    const slenderizedGh = palatalize(lemma.replace(/ch$/, "gh"), slenderizationTarget);
    if (gramCase === "Vocative") {
      if (gender === "fem")
        return [lemma];
      else
        return [slenderizedGh];
    } else {
      // e.g. cailleach > caillaigh > caillí
      return [
        gender === "fem"
          ? slenderizedGh.replace(/igh$/, "í")
          : slenderizedGh
      ];
    }
  }
}

/** L: genitive formed by broadening. */
export function getSingularInfoL(lemma: string, gramCase: GrammaticalCase, broadeningTarget?: string): string[] {
  if (gramCase === "Nominative" || gramCase === "Vocative" || gramCase === "Dative")
    return [lemma];
  else
    return [broaden(lemma, broadeningTarget)];
}

const slenderNgtPattern = new RegExp(`([${VowelsSlender}])ngt$`);
/** E: genitive formed by suffix "-e". */
export function getSingularInfoE(
  lemma: string, gramCase: GrammaticalCase, shouldSyncopate: boolean,
  doubleDative: boolean, slenderizationTarget?: string
): string[] {
  if (gramCase === "Nominative" || gramCase === "Vocative")
    return [lemma];
  else if (gramCase === "Dative" && !doubleDative)
    return [lemma];
  else {
    const syncopateChecked = shouldSyncopate ? syncope(lemma) : lemma;
    const slenderized = palatalize(syncopateChecked, slenderizationTarget);

    if (gramCase === "Dative") {
      return [lemma, slenderized];
    } else {
      return [
        slenderized
          //eg. tarraingt > tarraingthe
          .replace(slenderNgtPattern, "$1ngth")
          //eg. scrúdú > scrúdaithe
          .replace(/ú$/, "aith")
        + "e"
      ];
    }
  }
}

const slenderRtPattern = new RegExp(`([${VowelsSlender}])rt$`);
const slenderNntPattern = new RegExp(`([${VowelsSlender}])nnt$`);
const slenderNtPattern = new RegExp(`([${VowelsSlender}])nt$`);
/** A: genitive formed by suffix "-a". */
export function getSingularInfoA(lemma: string, gramCase: GrammaticalCase, shouldSyncopate: boolean, broadeningTarget?: string): string[] {
  if (gramCase === "Nominative" || gramCase === "Vocative" || gramCase === "Dative")
    return [lemma];
  else {
    const replacements = lemma
      //eg. bagairt > bagartha
      .replace(slenderRtPattern, "$1rth")
      //eg. cionroinnt > cionnranna
      .replace(slenderNntPattern, "$1nn")
      //eg. canúint > canúna
      .replace(slenderNtPattern, "$1n");

    const syncopateChecked = shouldSyncopate ? syncope(replacements) : replacements;
    const broadened = broaden(syncopateChecked, broadeningTarget);

    return [`${broadened}a`];
  }
}

const broadVowelEndPattern = new RegExp(`([${VowelsBroad}])$`);
const slenderVowelEndPattern = new RegExp(`([${VowelsSlender}])$`);
/** D: genitive ends in "-d". */
export function getSingularInfoD(lemma: string, gramCase: GrammaticalCase): string[] {
  if (gramCase === "Nominative" || gramCase === "Vocative" || gramCase === "Dative")
    return [lemma];
  else {
    return [
      lemma
        //eg. cara > carad
        .replace(broadVowelEndPattern, "$1d")
        //eg. fiche > fichead
        .replace(slenderVowelEndPattern, "$1ad")
    ];
  }
}

/** N: genitive ends in "-n". */
export function getSingularInfoN(lemma: string, gramCase: GrammaticalCase): string[] {
  if (gramCase === "Nominative" || gramCase === "Vocative" || gramCase === "Dative")
    return [lemma];
  else {
    return [
      lemma
        .replace(broadVowelEndPattern, "$1n")
        .replace(slenderVowelEndPattern, "$1an")
    ];
  }
}

/** EAX: genitive formed by suffix "-each". */
export function getSingularInfoEAX(lemma: string, gramCase: GrammaticalCase, shouldSyncopate: boolean, slenderizationTarget?: string): string[] {
  if (gramCase === "Nominative" || gramCase === "Vocative" || gramCase === "Dative")
    return [lemma];
  else {
    const syncopateChecked = shouldSyncopate ? syncope(lemma) : lemma;
    const slenderized = palatalize(syncopateChecked, slenderizationTarget);

    return [`${slenderized}each`];
  }
}

/** AX: genitive formed by suffix "-ach". */
export function getSingularInfoAX(lemma: string, gramCase: GrammaticalCase, shouldSyncopate: boolean, broadeningTarget?: string): string[] {
  if (gramCase === "Nominative" || gramCase === "Vocative" || gramCase === "Dative")
    return [lemma];
  else {
    const syncopateChecked = shouldSyncopate ? syncope(lemma) : lemma;
    const broadened = broaden(syncopateChecked, broadeningTarget);

    return [`${broadened}ach`];
  }
}