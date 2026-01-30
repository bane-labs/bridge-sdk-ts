import type { Address, PublicClient, WalletClient } from 'viem';
import type { ContractWrapperConfig, ViemContractClientsConfig } from '../types/interfaces.js';

/**
 * BridgeContractBase is an abstract base class for bridge contract wrappers
 */
export abstract class BridgeContractBase {
  protected constructor(
    MainContractClass: new (address: Address, config: any) => any,
    config: ContractWrapperConfig
  ) {
    const contractConfig = {
      publicClient: config.publicClient as PublicClient,
      walletClient: config.walletClient as WalletClient,
    };

    return new MainContractClass(config.contractAddress as Address, contractConfig);
  }

  /**
   * Creates a ViemContractClientsConfig from a ContractWrapperConfig
   *
   * @param config - The contract wrapper configuration
   * @returns A ViemContractClientsConfig
   */
  public static createViemContractClientsConfig(config: ContractWrapperConfig): ViemContractClientsConfig {
    return {
      publicClient: config.publicClient as PublicClient,
      walletClient: config.walletClient as WalletClient,
    };
  }

  /**
   * Creates an instance of a generated Viem contract
   *
   * @param ContractClass - The contract class to instantiate
   * @param config - The contract wrapper configuration
   * @returns An instance of the contract
   */
  public static createContractInstance<T>(
    ContractClass: new (address: Address, config: ViemContractClientsConfig) => T,
    config: ContractWrapperConfig
  ): T {
    return new ContractClass(
      config.contractAddress as Address,
      BridgeContractBase.createViemContractClientsConfig(config)
    );
  }
}
