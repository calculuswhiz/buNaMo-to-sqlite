export class Adjective {
  adjectiveId: number;
  declension: number;
  isPre: boolean;
  disambig: string;

  constructor(
    adjectiveId: number,
    declension: number,
    isPre: boolean,
    disambig: string
  ) {
    this.adjectiveId = adjectiveId;
    this.declension = declension;
    this.isPre = isPre;
    this.disambig = disambig;
  }
}