import {
  BridgeStorage,
  BridgeStorageV1,
  IBridge,
  ITokenBridge
} from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type { ContractWrapperConfig, } from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';
import { createComposedProxy } from '../utils/proxy-factory.js';

// Create a combined type that includes all properties from ITokenBridge and only non-conflicting properties from both
// BridgeStorage contracts
export type TokenBridge = IBridge &
    Omit<ITokenBridge, keyof IBridge> &
    Omit<BridgeStorage, keyof ITokenBridge> &
    Omit<BridgeStorageV1, keyof ITokenBridge | keyof BridgeStorage>;

export class TokenBridgeFactory extends ITokenBridge {
  private readonly bridge: IBridge;
  private readonly bridgeStorage: BridgeStorage;
  private readonly bridgeStorageV1: BridgeStorageV1;

  private constructor(config: ContractWrapperConfig) {
    const contractConfig = BridgeContractBase.createContractConfig(config);
    super(config.contractAddress as Address, contractConfig);

    this.bridgeStorage = BridgeContractBase.createContractInstance(
        BridgeStorage,
        config
    );

    this.bridgeStorageV1 = BridgeContractBase.createContractInstance(
        BridgeStorageV1,
        config
    );

    this.bridge = BridgeContractBase.createContractInstance(
        IBridge,
        config
    );
  }

  // Create a factory method that returns the proxied instance
  static create(config: ContractWrapperConfig): TokenBridge {
    const instance = new TokenBridgeFactory(config);

    // Use the utility function for proxy creation
    return createComposedProxy(
        instance,
        [instance.bridgeStorageV1, instance.bridgeStorage] as const
    );
  }

  // Access to the composed instances if needed
  getBridgeStorageContract() {
    return this.bridgeStorage;
  }

  getBridgeStorageV1Contract() {
    return this.bridgeStorageV1;
  }
}
