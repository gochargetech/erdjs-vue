export interface TokenLoginType {
  loginToken: string;
  signature?: string;
  nativeAuthToken?: string;
}

export * from './account.types';
export * from './dappProvider.types';
export * from './enums.types';
export * from './network.types';
export * from './login.types';
export * from './serverTransactions.types';
export * from './transactions.types';
// export * from './tokens.types';
