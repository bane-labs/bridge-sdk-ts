import type { Address, PublicClient, WalletClient } from 'viem';

export interface ContractWrapperConfig {
  contractAddress: Address;
  publicClient: PublicClient;
  walletClient?: WalletClient;
}

