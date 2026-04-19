export class NounPhrase {
  nounPhraseId: number;
  isDefinite: boolean;
  isPossessed: boolean;
  isImmutable: boolean;
  forceNominative: boolean;
  disambig: string;

  constructor(
    nounPhraseId: number,
    isDefinite: boolean,
    isPossessed: boolean,
    isImmutable: boolean,
    forceNominative: boolean,
    disambig: string
  ) {
    this.nounPhraseId = nounPhraseId;
    this.isDefinite = isDefinite;
    this.isPossessed = isPossessed;
    this.isImmutable = isImmutable;
    this.forceNominative = forceNominative;
    this.disambig = disambig;
  }
}