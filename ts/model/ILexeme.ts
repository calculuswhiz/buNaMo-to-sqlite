export interface ILexeme {
  getLemma(): string;
  getNickname(): string;
}

export interface IFriendlyNickNamed {
  getFriendlyNickname(): string;
}