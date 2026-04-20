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
  let ret = "";

  if (mutation === "len1" || mutation === "len1D") {
    // Do not mutate exotic words with J in second position, like Djibouti
    if (/^([pbmftdcg])j/i.test(text))
      ret = text;
    else {
      ret = performReplacements([
        [/^([pbmftdcg])(.*)$/i, "$1h$2"],
        [/^(s)([rnlaeiouáéíóú].*)$/i, "$1h$2"]
      ], text);
    }

    if (mutation === "len1D") {
      const pattern = /^([aeiouáéíóúf])(.*)$/i;
      if (pattern.test(ret))
        ret = ret.replace(pattern, "d'$1$2");
    }

    return ret;
  }
  else if (mutation === "len2" || mutation === "len2D") {
    // Same as lenition 1 but leaves "d", "t" and "s" unmutated
    // Do not mutate exotic words with J in second position, like Djibouti
    const pattern = /^([pbmftdcg])j/i;
    if (pattern.test(text))
      ret = text;
    else {
      const pattern = /^([pbmfcg])(.*)$/i;
      ret = pattern.test(text)
        ? text.replace(pattern, "$1h$2")
        : text;
    }

    if (mutation === "len2D") {
      const pattern = /^([aeiouáéíóúf])(.*)$/i;
      if (pattern.test(ret))
        ret = ret.replace(pattern, "d'$1$2");
    }

    return ret;
  }
  else if (mutation === "len3" || mutation === "len3D") {
    // Same as lenition 2 but also changes "s" into "ts"
    // Do not mutate exotic words with J in second position, like Djibouti
    const pattern = /^([pbmftdcg])j/i;
    if (pattern.test(text))
      ret = text;
    else {
      ret = performReplacements([
        [/^([pbmfcg])(.*)$/i, "$1h$2"],
        [/^(s)([rnlaeiouáéíóú].*)$/i, "t$1$2"]
      ], text);
    }

    if (mutation === "len3D") {
      const pattern = /^([aeiouáéíóúf])(.*)$/i;
      if (pattern.test(ret))
        ret = ret.replace(pattern, "d'$1$2");
    }

    return ret;
  }
  else if (mutation === "ecl1") {
    return performReplacements([
      [/^(p)(.*)$/i, "b$1$2"],
      [/^(b)(.*)$/i, "m$1$2"],
      [/^(f)(.*)$/i, "bh$1$2"],
      [/^(c)(.*)$/i, "g$1$2"],
      [/^(g)(.*)$/i, "n$1$2"],
      [/^(t)(.*)$/i, "d$1$2"],
      [/^(d)(.*)$/i, "n$1$2"],
      [/^([aeiuoáéíúó])(.*)$/, "n-$1$2"],
      [/^([AEIUOÁÉÍÚÓ])(.*)$/, "n$1$2"],
    ], text);
  }
  else if (mutation === "ecl1x") {
    // Same as eclipsis 1 but leaves vowels unchanged
    return performReplacements([
      [/^(p)(.*)$/i, "b$1$2"],
      [/^(b)(.*)$/i, "m$1$2"],
      [/^(f)(.*)$/i, "bh$1$2"],
      [/^(c)(.*)$/i, "g$1$2"],
      [/^(g)(.*)$/i, "n$1$2"],
      [/^(t)(.*)$/i, "d$1$2"],
      [/^(d)(.*)$/i, "n$1$2"],
    ], text);
  }
  else if (mutation === "ecl2") {
    // Same as eclipsis 1 but leaves "t", "d" and vowels unchanged
    return performReplacements([
      [/^(p)(.*)$/i, "b$1$2"],
      [/^(b)(.*)$/i, "m$1$2"],
      [/^(f)(.*)$/i, "bh$1$2"],
      [/^(c)(.*)$/i, "g$1$2"],
      [/^(g)(.*)$/i, "n$1$2"],
    ], text);
  }
  else if (mutation === "ecl3") {
    // Same as eclipsis 2 but also changes "s" to "ts"
    return performReplacements([
      [/^(p)(.*)$/i, "b$1$2"],
      [/^(b)(.*)$/i, "m$1$2"],
      [/^(f)(.*)$/i, "bh$1$2"],
      [/^(c)(.*)$/i, "g$1$2"],
      [/^(g)(.*)$/i, "n$1$2"],
      [/^(s)([rnlaeiouáéíóú].*)$/i, "t$1$2"],
    ], text);
  }
  else if (mutation === "prefT") {
    // t-prefixation
    return performReplacements([
      [/^([aeiouáéíúó])(.*)$/, "t-$1$2"],
      [/^([AEIOUÁÉÍÚÓ])(.*)$/, "t$1$2"],
    ], text);
  }
  else if (mutation === "prefH") {
    // h-prefixation
    const pattern = /^([aeiuoáéíúó])(.*)$/i;
    if (pattern.test(text))
      return text.replace(pattern, "h$1$2");
    else
      return text;
  }
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

/**
 * If target is not provided:
 *   Performs regular slenderization (attenuation): if the base ends in a consonant, and if the vowel cluster immediately before this consonant
 *   ends in a broad vowel, then it changes this vowel cluster such that it ends in a slender vowel now.
 *   @note A base that's already slender passes through unchanged.
 * 
 * Otherwise:
 *   Performs irregular slenderization (attenuation): if the base ends in a consonant, and if the vowel cluster immediately before this consonant
 *   ends in a broad vowel, then it changes this vowel cluster into the target (the second argument).
 *   @note If the target does not end in a slender vowel, then regular slenderization is attempted instead.
 *   @note A base that's already attenuated passes through unchanged.
 */
export function slenderize(base: string, target?: string): string {
  if (target === undefined) {
    let ret = base;

    const sources = ["ea", "éa", "ia", "ío", "io", "iu", "ae"] as const;
    const targets = ["i", "éi", "éi", "í", "i", "i", "aei"] as const;
    let match: RegExpMatchArray | null;
    for (let i = 0; i < sources.length; i++) {
      match = base.match(new RegExp(`^(.*[${Cosonants}])?${sources[i]}([${Cosonants}]+)$`));

      if (match != null && match.length > 0) {
        ret = (match[1] ?? "") + targets[i] + (match[2] ?? "");
        return ret;
      }
    }

    // The generic case: insert "i" at the end of the vowel cluster:
    match = base.match(new RegExp(`^(.*[${VowelsBroad}])([${Cosonants}]+)$`));
    if (match != null && match.length > 0) {
      ret = (match[1] ?? "") + "i" + (match[2] ?? "");
    }

    return ret;
  } else {
    let ret = base;
    if (!new RegExp(`[${VowelsSlender}]\$`).test(target)) {
      ret = slenderize(base); //attempt regular slenderization instead
    }
    else {
      const match = base.match(new RegExp(`^(.*[${Vowels}]*[${VowelsBroad}])([${Cosonants}]+)$`));
      if (match != null && match.length > 0)
        ret = (match[1] ?? "") + target + (match[2] ?? "");
    }
    return ret;
  }
}

/**
 * If target is not provided:
 *   Performs regular broadening: if the base ends in a consonant, and if the vowel cluster immediately before this consonant
 *   ends in a slender vowel, then it changes this vowel cluster such that it ends in a broad vowel now.
 *   @note A base that's already broad passes through unchanged.
 * 
 * Otherwise:
 *   Performs irregular broadening: if the base ends in a consonant, and if the vowel cluster immediately before this consonant
 *   ends in a slender vowel, then it changes this vowel cluster into the target (the second argument).
 *   @note If the target does not end in a broad vowel, then regular broadening is attempted instead.
 *   @note A base that's already broad passes through unchanged.
 */
export function broaden(base: string, target?: string): string {
  if (target === undefined) {
    let ret = base;

    const sources = ["ói", "ei", "éi", "i", "aí", "í", "ui", "io"] as const;
    const targets = ["ó", "ea", "éa", "ea", "aío", "ío", "o", "ea"] as const;
    let match: RegExpMatchArray | null;
    for (let i = 0; i < sources.length; i++) {
      match = base.match(new RegExp(`^(.*[${Cosonants}])?${sources[i]}([${Cosonants}]+)$`));
      if (match != null && match.length > 0) {
        ret = (match[1] ?? "") + targets[i] + (match[2] ?? "");
        return ret;
      }
    }

    // The generic case: remove "i" from the end of the vowel cluster:
    match = base.match(new RegExp(`^(.*)i([${Cosonants}]+)$`));
    if (match != null && match.length > 0)
      ret = (match[1] ?? "") + (match[2] ?? "");

    return ret;
  } else {
    let ret = base;
    if (!new RegExp(`[${VowelsBroad}]$`).test(target)) {
      ret = broaden(base); //attempt regular broadening instead
    }
    else {
      const match = base.match(new RegExp(`^(.*[${Vowels}]*[${VowelsSlender}])([${Cosonants}]+)$`));
      if (match != null && match.length > 0)
        ret = (match[1] ?? "") + target + (match[2] ?? "");
    }
    return ret;
  }
}

/**
 * If the final consonant cluster consists of two consonants that differ in voicing,
 * and if neither one of them is "l", "n" or "r", then devoices the second one.
 */
export function devoice(base: string): string {
  let ret = base;
  const match = base.match(/^(.*)sd$/);
  if (match) {
    ret = match[1] + "st";
    return ret;
  }
  //May need elaboration.
  return ret;
}

/**
 * Reduces any duplicated consonants at the end into a single consonant.
 */
export function unduplicate(base: string): string {
  let ret = base;

  const match = base.match(new RegExp(`^.*[${Cosonants}][${Cosonants}]$`));
  if (match && base[base.length - 1] === base[base.length - 2])
    ret = base.substring(0, base.length - 1);

  return ret;
}

/**
 * Performs syncope by removing the final vowel cluster,
 * then unduplicates and devoices the consonant cluster at the end.
 */
export function syncope(base: string): string {
  let ret = base;

  const match = base.match(new RegExp(`^(.*[${Cosonants}])?[${Vowels}]+([${Cosonants}]+)$`));
  if (match)
    ret = devoice(unduplicate((match[1] ?? "") + (match[2] ?? "")));

  return ret;
}

// HighlightMutations ignored. It is not the goal of this project to produce html at the moment.


export function prefix(prefix: string, body: string): string {
  // Default mutation
  let m: Mutation = "len1";
  if (endsDental(prefix))
    // Pick the right mutation
    m = 'len2';

  if (prefix[prefix.length - 1] === body[0])
    //eg. "sean-nós"
    prefix += "-";

  if (endsVowel(prefix) && startsVowel(body))
    //eg. "ró-éasca"
    prefix += "-";

  //eg. "seanÉireannach" > "Sean-Éireannach"
  if (body.slice(0, 1) === body.slice(0, 1).toUpperCase()) {
    prefix = prefix.slice(0, 1).toUpperCase() + prefix.slice(1);
    if (!prefix.endsWith("-"))
      prefix += "-";
  }
  return prefix + mutate(m, body);
}

//Attaches an emphasizer to the end of the text (which should be the form of a noun, or a string which ends in one):
export function emphasize(text: string, emphasizer: Emphasizer): string {
  const lastLetter = text.length > 1
    ? text.slice(-1).toLowerCase()
    : "";

  let broadEnding = "", slenderEnding = "";
  if (emphasizer === 'saSe' && lastLetter !== "s") {
    broadEnding = "sa";
    slenderEnding = "se";
  }
  if (emphasizer === 'saSe' && lastLetter === "s") {
    broadEnding = "-sa";
    slenderEnding = "-se";
  }
  if (emphasizer === 'sanSean' && lastLetter !== "s") {
    broadEnding = "san";
    slenderEnding = "sean";
  }
  if (emphasizer === 'sanSean' && lastLetter === "s") {
    broadEnding = "-san";
    slenderEnding = "-sean";
  }
  if (emphasizer === 'naNe' && lastLetter !== "n") {
    broadEnding = "na";
    slenderEnding = "ne";
  }
  if (emphasizer === 'naNe' && lastLetter === "n") {
    broadEnding = "-na";
    slenderEnding = "-ne";
  }

  let ret = text;
  if (/(a|ae|o|u|á|ó|ú)[bcdfghjklmnpqrstvwxz]*$/i.test(text))
    ret = text + broadEnding;
  else if (/(e|é|i|í)[bcdfghjklmnpqrstvwxz]*$/i.test(text))
    ret = text + slenderEnding;

  return ret;
}