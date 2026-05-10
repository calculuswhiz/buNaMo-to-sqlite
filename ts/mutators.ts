import type { Emphasizer, Mutation } from "./features";

function performReplacements(
  replacements: [RegExp, string][],
  text: string,
  breakOnFirstMatch: boolean = true
): string {
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(text)) {
      text = text.replace(pattern, replacement);
      if (breakOnFirstMatch)
        return text;
    }
  }
  return text;
}

/** Remove lenition/eclipsis/prefixes added to mutated words */
export function demutate(text: string): string {
  return performReplacements([
    [/^bh(f.*)$/i, "$1"],
    [/^([bcdfgmpst])h(.*)$/i, "$1$2"],
    [/^m(b.*)$/i, "$1"],
    [/^g(c.*)$/i, "$1"],
    [/^n(d.*)$/i, "$1"],
    [/^n(g.*)$/i, "$1"],
    [/^b(p.*)$/i, "$1"],
    [/^t(s.*)$/i, "$1"],
    [/^d(t.*)$/i, "$1"],
    [/^d'(f)h(.*)$/i, "$1$2"],
    [/^d'([aeiouáéíóú].*)$/i, "$1"],
    [/^h([aeiouáéíóú].*)$/i, "$1"],
    [/^n-([aeiouáéíóú].*)$/i, "$1"],
  ], text);
}

/** Performs a mutation on the string: */
export function mutate(mutation: Mutation, text: string): string {
  if (mutation.startsWith("len")) {
    const lenitionVariant = mutation.at(3);

    const lenited = lenitionVariant === "1"
      ? performReplacements([
        // Normal lenitable consonants, except when followed by "j" like in "Djibouti"
        [/^([pbmftdcg])([^j]*)$/i, "$1h$2"],
        // s lenition
        [/^s([rnlaeiouáéíóú].*)$/i, "sh$1"]
      ], text)
      : lenitionVariant === "2"
        // Same as lenition 1 but leaves "s", "t", "d" unchanged
        ? text.replace(/^([pbmfcg])([^j]*)$/i, "$1h$2")
        : lenitionVariant === "3"
          // Same as lenition 2 but also changes "s" to "ts" before r, n, l and vowels
          ? performReplacements([
            [/^([pbmfcg])([^j]*)$/i, "$1h$2"],
            [/^s([rnlaeiouáéíóú].*)$/i, "ts$1"]
          ], text)
          : text;

    return mutation.endsWith("D")
      ? lenited.replace(/^([aeiouáéíóúf])(.*)$/i, "d'$1$2")
      : lenited;
  }
  else if (mutation.startsWith("ecl")) {
    const eclipsisVariant = mutation.at(3);

    const commonEclipsis = performReplacements([
      [/^p(.*)$/i, "bp$1"],
      [/^b(.*)$/i, "mb$1"],
      [/^f(.*)$/i, "bhf$1"],
      [/^c(.*)$/i, "gc$1"],
      [/^g(.*)$/i, "ng$1"]
    ], text);

    if (commonEclipsis !== text)
      return commonEclipsis;

    if (eclipsisVariant === "1") {
      return performReplacements([
        [/^t(.*)$/i, "dt$1"],
        [/^d(.*)$/i, "nd$1"],
        ...(
          // x subvariant is consonants only
          !mutation.endsWith("x") ? [
            [/^([aeiuoáéíúó])(.*)$/, "n-$1$2"],
            [/^([AEIUOÁÉÍÚÓ])(.*)$/, "n$1$2"],
          ] as [RegExp, string][] : []
        )
      ], commonEclipsis);
    }
    else if (eclipsisVariant === "2") {
      // Same as eclipsis 1 but leaves "t", "d" and vowels unchanged
      // Covered by commonEclipsis
      return commonEclipsis;
    }
    else {
      // Same as eclipsis 2 but also changes "s" to "ts"
      return commonEclipsis.replace(/^s([rnlaeiouáéíóú].*)$/i, "ts$1");
    }
  }
  else if (mutation === "prefT") {
    return performReplacements([
      [/^([aeiouáéíúó])(.*)$/, "t-$1$2"],
      [/^([AEIOUÁÉÍÚÓ])(.*)$/, "t$1$2"],
    ], text);
  }
  else if (mutation === "prefH")
    return text.replace(/^([aeiuoáéíúó])(.*)$/i, "h$1$2");
  else
    return text;
}

/** Tells you whether the string ends in a "dentals" cosonant: */
export function endsDental(txt: string): boolean {
  return /[dnts]$/i.test(txt);
}

/** Tells you whether the string ends in a slender consonant cluster: */
export function isSlender(txt: string): boolean {
  return /[eiéí][^aeiouáéíóú]+$/.test(txt);
}

/** Tells you whether the string ends in a slender consonant cluster where the slenderness is caused by an "i" (and not by an "e"): */
export function isSlenderI(txt: string): boolean {
  return /[ií][^aeiouáéíóú]+$/.test(txt);
}

/** Tells you whether the string has a vowel or 'fh' (but not 'fhl' or 'fhr') at its start: */
export function startsVowelFhx(txt: string): boolean {
  return /^[aeiouáéíóú]|^fh[^lr]/i.test(txt);
}

/** Tells you whether the string ends in a vowel: */
export function endsVowel(txt: string): boolean {
  return /[aeiouáéíóú]$/i.test(txt);
}

/** Tells you whether the string starts in a vowel: */
export function startsVowel(txt: string): boolean {
  return /^[aeiouáéíóú]/i.test(txt);
}

/** Tells you whether the string starts in F followed by a vowel: */
export function startsFVowel(txt: string): boolean {
  return /^f[aeiouáéíóú]/i.test(txt);
}

/** Tells you whether the string starts in b, m, p: */
export function startsBilabial(txt: string): boolean {
  return /^[bmp]/i.test(txt);
}

// Character types, for convenience when writing regular expressions:
export const Cosonants = "bcdfghjklmnpqrstvwxz";
export const Vowels = "aeiouáéíóú";
export const VowelsBroad = "aouáóú";
export const VowelsSlender = "eiéí";

const palatalizationReplaceTable = [
  ["ea", "i"],
  ["éa", "éi"],
  ["ia", "éi"],
  ["ío", "í"],
  ["io", "i"],
  ["iu", "i"],
  ["ae", "aei"]
].map(([source, target]) => ([
  new RegExp(`^(.*[${Cosonants}])?${source}([${Cosonants}]+)$`),
  `$1${target}$2`
] as [RegExp, string]));

/**
 * If target is not provided:
 *   Performs regular slenderization (attenuation, palatalization): 
 *    if the base ends in a consonant, and if the vowel cluster immediately before this consonant
 *    ends in a broad vowel, then it changes this vowel cluster such that it ends in a slender vowel now.
 *   @note A base that's already slender passes through unchanged.
 * 
 * Otherwise:
 *   Performs irregular slenderization (attenuation, palatalization): 
 *    if the base ends in a consonant, and if the vowel cluster immediately before this consonant
 *    ends in a broad vowel, then it changes this vowel cluster into the target (the second argument).
 *   @note If the target does not end in a slender vowel, then regular slenderization is attempted instead.
 *   @note A base that's already attenuated passes through unchanged.
 */
export function slenderize(base: string, target?: string): string {
  if (target === undefined) {
    const slenderized = performReplacements(palatalizationReplaceTable, base);
    if (slenderized !== base)
      return slenderized;
    else {
      // The generic case: insert "i" at the end of the vowel cluster:
      return base.replace(
        new RegExp(`^(.*[${VowelsBroad}])([${Cosonants}]+)$`),
        "$1i$2"
      );
    }
  } else if (!new RegExp(`[${VowelsSlender}]$`).test(target)) {
    // Attempt regular slenderization instead
    return slenderize(base);
  } else {
    return base.replace(
      // Broad vowel maintained.
      new RegExp(`^(.*[${Vowels}]*[${VowelsBroad}])([${Cosonants}]+)$`),
      `$1${target}$2`
    );
  }
}

const broadenReplaceTable = [
  ["ói", "ó"],
  ["ei", "ea"],
  ["éi", "éa"],
  ["i", "ea"],
  ["aí", "aío"],
  ["í", "ío"],
  ["ui", "o"],
  ["io", "ea"],
].map(([source, target]) => ([
  new RegExp(`^(.*[${Cosonants}])?${source}([${Cosonants}]+)$`),
  `$1${target}$2`
] as [RegExp, string]));
/**
 * If target is not provided:
 *   Performs regular broadening: 
 *    if the base ends in a consonant, and if the vowel cluster immediately before this consonant
 *    ends in a slender vowel, then it changes this vowel cluster such that it ends in a broad vowel now.
 *   @note A base that's already broad passes through unchanged.
 * 
 * Otherwise:
 *   Performs irregular broadening: 
 *    if the base ends in a consonant, and if the vowel cluster immediately before this consonant
 *    ends in a slender vowel, then it changes this vowel cluster into the target (the second argument).
 *   @note If the target does not end in a broad vowel, then regular broadening is attempted instead.
 *   @note A base that's already broad passes through unchanged.
 */
export function broaden(base: string, target?: string): string {
  if (target === undefined) {
    const broadened = performReplacements(broadenReplaceTable, base);
    if (broadened !== base)
      return broadened;
    else {
      // The generic case: remove "i" from the end of the vowel cluster:
      return base.replace(
        new RegExp(`^(.*)i([${Cosonants}]+)$`),
        "$1$2"
      );
    }
  } else if (!new RegExp(`[${VowelsBroad}]$`).test(target)) {
    // Attempt regular broadening instead
    return broaden(base);
  } else {
    return base.replace(
      new RegExp(`^(.*[${Vowels}]*[${VowelsSlender}])([${Cosonants}]+)$`),
      `$1${target}$2`
    );
  }
}

/**
 * If the final consonant cluster consists of two consonants that differ in voicing,
 * and if neither one of them is "l", "n" or "r", then devoices the second one.
 */
export function devoice(base: string): string {
  // May need elaboration.
  // ^ From original code base.
  return base.replace(/^(.*)sd$/, "$1st");
}

/**
 * Reduces any duplicated consonants at the end into a single consonant.
 */
export function unduplicate(base: string): string {
  return base.match(new RegExp(`^.*[${Cosonants}][${Cosonants}]$`)) != null
    && base.at(-1) === base.at(-2)
    ? base.slice(0, -1)
    : base;
}

/**
 * Performs syncope by removing the final vowel cluster,
 * then unduplicates and devoices the consonant cluster at the end.
 */
export function syncope(base: string): string {
  const match = base.match(new RegExp(`^(.*[${Cosonants}])?[${Vowels}]+([${Cosonants}]+)$`));
  return match != null
    ? devoice(unduplicate((match[1] ?? "") + (match[2] ?? "")))
    : base;
}

// HighlightMutations ignored. It is not the goal of this project to produce html at the moment.

export function prefix(prefix: string, body: string): string {
  // Default mutation
  const m: Mutation = endsDental(prefix) ? "len1" : "len2";
  const mutatedBody = mutate(m, body);

  //eg. "sean-nós"
  if (prefix.at(-1) === body.at(0))
    prefix += "-";
  else if (endsVowel(prefix) && startsVowel(body))
    //eg. "ró-éasca"
    prefix += "-";
  else if (body.at(0) === body.at(0)?.toUpperCase()) {
    //eg. "seanÉireannach" > "Sean-Éireannach"
    prefix = prefix.slice(0, 1).toUpperCase() + prefix.slice(1);
    if (!prefix.endsWith("-"))
      prefix += "-";
  }
  return prefix + mutatedBody;
}

//Attaches an emphasizer to the end of the text (which should be the form of a noun, or a string which ends in one):
export function emphasize(text: string, emphasizer: Emphasizer): string {
  const lastLetter = text.at(-1)?.toLowerCase() ?? "";

  const infixHyphen = emphasizer === "saSe" && lastLetter === "s"
    || emphasizer === "sanSean" && lastLetter === "s"
    || emphasizer === "naNe" && lastLetter === "n"
    ? "-" : "";

  const [broadEnding, slenderEnding] = emphasizer === "saSe"
    ? ["sa", "se"]
    : emphasizer === "sanSean"
      ? ["san", "sean"]
      : ["na", "ne"];

  if (/(a|ae|o|u|á|ó|ú)[bcdfghjklmnpqrstvwxz]*$/i.test(text))
    return text + infixHyphen + broadEnding;
  else if (/(e|é|i|í)[bcdfghjklmnpqrstvwxz]*$/i.test(text))
    return text + infixHyphen + slenderEnding;
  else
    return text;
}