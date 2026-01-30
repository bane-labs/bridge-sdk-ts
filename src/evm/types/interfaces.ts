import type { Address, PublicClient, WalletClient } from 'viem';

/**
 * ContractWrapperConfig defines the configuration for wrapping a contract
 *
 * @property contractAddress - The address of the contract
 * @property publicClient - The public client for interacting with the blockchain
 * @property walletClient - (Optional) The wallet client for signing transactions
 */
export interface ContractWrapperConfig {
  contractAddress: Address;
  publicClient: PublicClient;
  walletClient?: WalletClient;
}

/**
 * ViemContractConfig defines the configuration for Viem contracts
 *
 * @property publicClient - The public client for interacting with the blockchain
 * @property walletClient - (Optional) The wallet client for signing transactions
 *
 * @remarks this is not to be exposed outside the SDK
 */
export interface ViemContractClientsConfig {
  publicClient: PublicClient;
  walletClient?: WalletClient;
}
