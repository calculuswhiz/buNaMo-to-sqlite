export class Verb {
  verbId: number;
  disambig: string;

  constructor(
    verbId: number,
    disambig: string
  ) {
    this.verbId = verbId;
    this.disambig = disambig;
  }
}