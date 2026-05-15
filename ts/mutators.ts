import type { Emphasizer, Mutation } from "./features";

/*
  Dev note: do not hard-code captured single letters in replacements.
  The regexes are case-insensitive, so captured letters must always be in the same case.
*/

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
    [/^d'fh(.*)$/i, "f$1"],
    [/^d'([aeiouáéíóú].*)$/i, "$1"],
    [/^h([aeiouáéíóú].*)$/i, "$1"],
    [/^n-([aeiouáéíóú].*)$/i, "$1"],
  ], text);
}

/** Performs a mutation on the string: */
export function mutate(mutation: Mutation, text: string): string {
  if (mutation.startsWith("len")) {
    const lenitionVariant = mutation.at(3) as "1" | "2" | "3";

    const commonLenition = text.replace(
      // ^j is for exotic loanwords like "Djibouti" where j is in second position
      /^([pbmfcg])([^j]*)$/i,
      "$1h$2"
    );

    // Cannot early exit here due to "D" subvariants

    const lenited = lenitionVariant === "1"
      ? performReplacements([
        [/^([td])([^j]*)$/i, "$1h$2"],
        // s lenition
        [/^(s)([rnlaeiouáéíóú].*)$/i, "$1h$2"]
      ], commonLenition)
      : lenitionVariant === "2"
        // Same as lenition 1 but leaves "s", "t", "d" unchanged. Handled by common
        ? commonLenition
        // Same as lenition 2 but also changes "s" to "ts" before r, n, l and vowels
        : commonLenition.replace(/^(s)([rnlaeiouáéíóú].*)$/i, "t$1$2");

    return mutation === "len1D" || mutation === "len2D" || mutation === "len3D"
      ? lenited.replace(/^([aeiouáéíóúf])(.*)$/i, "d'$1$2")
      : lenited;
  }
  else if (mutation.startsWith("ecl")) {
    const eclipsisVariant = mutation.at(3);

    const commonEclipsis = performReplacements([
      [/^(p)(.*)$/i, "b$1$2"],
      [/^(b)(.*)$/i, "m$1$2"],
      [/^(f)(.*)$/i, "bh$1$2"],
      [/^(c)(.*)$/i, "gc$1$2"],
      [/^(g)(.*)$/i, "ng$1$2"]
    ], text);

    if (commonEclipsis !== text)
      return commonEclipsis;

    if (eclipsisVariant === "1") {
      return performReplacements([
        [/^(t)(.*)$/i, "dt$1$2"],
        [/^(d)(.*)$/i, "nd$1$2"],
        ...(
          mutation.endsWith("x")
            // x subvariant is consonants only
            ? []
            // vowels get n prefix
            : [
              [/^([aeiouáéíóú])(.*)$/, "n-$1$2"],
              [/^([AEIOUÁÉÍÓÚ])(.*)$/, "n$1$2"],
            ] as [RegExp, string][]
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
      return commonEclipsis.replace(/^(s)([rnlaeiouáéíóú].*)$/i, "t$1$2");
    }
  }
  else if (mutation === "prefT") {
    return performReplacements([
      [/^([aeiouáéíúó])(.*)$/, "t-$1$2"],
      [/^([AEIOUÁÉÍÚÓ])(.*)$/, "t$1$2"],
    ], text);
  }
  else if (mutation === "prefH")
    return text.replace(/^([aeiouáéíóú])(.*)$/i, "h$1$2");
  else
    return text;
}

const dentalPattern = /[dnts]$/i;
/** Tells you whether the string ends in a "dentals" consonant: */
export function endsDental(txt: string): boolean {
  return dentalPattern.test(txt);
}

const slenderPattern = /[eiéí][^aeiouáéíóú]*$/i;
/** Tells you whether the string ends in a slender consonant cluster: */
export function isSlender(txt: string): boolean {
  return slenderPattern.test(txt);
}

const slenderIPattern = /[ií][^aeiouáéíóú]*$/i;
/** Tells you whether the string ends in a slender consonant cluster where the slenderness is caused by an "i" (and not by an "e"): */
export function isSlenderI(txt: string): boolean {
  return slenderIPattern.test(txt);
}

const startsVowelFhxPattern = /^[aeiouáéíóú]|^fh[^lr]/i;
/** Tells you whether the string has a vowel or 'fh' (but not 'fhl' or 'fhr') at its start: */
export function startsVowelFhx(txt: string): boolean {
  return startsVowelFhxPattern.test(txt);
}

const endsVowelPattern = /[aeiouáéíóú]$/i;
/** Tells you whether the string ends in a vowel: */
export function endsVowel(txt: string): boolean {
  return endsVowelPattern.test(txt);
}

const startsVowelPattern = /^[aeiouáéíóú]/i;
/** Tells you whether the string starts in a vowel: */
export function startsVowel(txt: string): boolean {
  return startsVowelPattern.test(txt);
}

const startsFVowelPattern = /^f[aeiouáéíóú]/i;
/** Tells you whether the string starts in F followed by a vowel: */
export function startsFVowel(txt: string): boolean {
  return startsFVowelPattern.test(txt);
}

const startsBilabialPattern = /^[bmp]/i;
/** Tells you whether the string starts in b, m, p: */
export function startsBilabial(txt: string): boolean {
  return startsBilabialPattern.test(txt);
}

// Character types, for convenience when writing regular expressions:
export const Consonants = "bcdfghjklmnpqrstvwxz";
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
  new RegExp(`^(.*[${Consonants}])?${source}([${Consonants}]+)$`),
  `$1${target}$2`
] as [RegExp, string]));

const slenderizePattern = new RegExp(`^(.*[${VowelsBroad}])([${Consonants}]+)$`);
const endsWithSlenderVowelPattern = new RegExp(`[${VowelsSlender}]$`);
const irregularSlenderizePattern = new RegExp(`^(.*[${Vowels}]*[${VowelsBroad}])([${Consonants}]+)$`);

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
      return base.replace(slenderizePattern, "$1i$2");
    }
  } else if (!endsWithSlenderVowelPattern.test(target)) {
    // Attempt regular slenderization instead
    return slenderize(base);
  } else {
    // Broad vowel maintained.
    return base.replace(irregularSlenderizePattern, `$1${target}$2`);
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
  new RegExp(`^(.*[${Consonants}])?${source}([${Consonants}]+)$`),
  `$1${target}$2`
] as [RegExp, string]));

const broadeningPattern = new RegExp(`^(.*)i([${Consonants}]+)$`);
const endsWithBroadVowelPattern = new RegExp(`[${VowelsBroad}]$`);
const irregularBroadeningPattern = new RegExp(`^(.*[${Vowels}]*[${VowelsSlender}])i([${Consonants}]+)$`);

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
      return base.replace(broadeningPattern, "$1$2");
    }
  } else if (!endsWithBroadVowelPattern.test(target)) {
    // Attempt regular broadening instead
    return broaden(base);
  } else {
    return base.replace(irregularBroadeningPattern, `$1${target}$2`);
  }
}

/**
 * If the final consonant cluster consists of two consonants that differ in voicing,
 * and if neither one of them is "l", "n" or "r", then devoices the second one.
 */
export function devoice(base: string): string {
  // TODO Needs elaboration. Looks like description is unimplemented
  return base.replace(/^(.*)sd$/, "$1st");
}

const unduplicationPattern = new RegExp(`^(.*([${Consonants}]))\\2$`);
/**
 * Reduces any duplicated consonants at the end into a single consonant.
 */
export function unduplicate(base: string): string {
  return base.replace(unduplicationPattern, "$1");
}

const syncopePattern = new RegExp(`^(.*[${Consonants}])[${Vowels}]+([${Consonants}]+)$`);
/**
 * Performs syncope by removing the final vowel cluster,
 * then unduplicates and devoices the consonant cluster at the end.
 */
export function syncope(base: string): string {
  return base.replace(
    syncopePattern,
    (_match, p1, p2) => devoice(unduplicate(p1 + p2))
  );
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