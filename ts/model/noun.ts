export class Noun {
  nounId: number;
  declension: number;
  isProper: boolean;
  isImmutable: boolean;
  isDefinite: boolean;
  allowArticledGenitive: boolean;
  disambig: string;

  constructor(
    nounId: number,
    declension: number,
    isProper: boolean,
    isImmutable: boolean,
    isDefinite: boolean,
    allowArticledGenitive: boolean,
    disambig: string
  ) {
    this.nounId = nounId;
    this.declension = declension;
    this.isProper = isProper;
    this.isImmutable = isImmutable;
    this.isDefinite = isDefinite;
    this.allowArticledGenitive = allowArticledGenitive;
    this.disambig = disambig;
  }
}