import type { Address, PublicClient, WalletClient } from 'viem';
import type { ContractWrapperConfig } from '../types/interfaces.js';

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

  public static createContractConfig(config: ContractWrapperConfig) {
    return {
      publicClient: config.publicClient as PublicClient,
      walletClient: config.walletClient as WalletClient,
    };
  }

  public static createContractInstance<T>(
    ContractClass: new (address: Address, config: any) => T,
    config: ContractWrapperConfig
  ): T {
    return new ContractClass(
      config.contractAddress as Address,
      BridgeContractBase.createContractConfig(config)
    );
  }
}
