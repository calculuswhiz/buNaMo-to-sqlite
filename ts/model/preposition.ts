export class Preposition {
  prepositionId: number;
  disambig: string;

  constructor(
    prepositionId: number,
    disambig: string
  ) {
    this.prepositionId = prepositionId;
    this.disambig = disambig;
  }
}