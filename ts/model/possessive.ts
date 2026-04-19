export type Mutation = 'none' |
  'len1' | 'len2' | 'len3' |
  'ecl1' | 'ecl1x' | 'ecl2' | 'ecl3' |
  'prefT' | 'prefH' |
  'len1D' | 'len2D' | 'len3D';

export type Emphasizer = 'saSe' | 'sanSean' | 'naNe';

export class Possessive {
  possessiveId: number;
  mutation: Mutation;
  emphasizer: Emphasizer;
  disambig: string;

  constructor(
    possessiveId: number,
    mutation: Mutation,
    emphasizer: Emphasizer,
    disambig: string
  ) {
    this.possessiveId = possessiveId;
    this.mutation = mutation;
    this.emphasizer = emphasizer;
    this.disambig = disambig;
  }
}