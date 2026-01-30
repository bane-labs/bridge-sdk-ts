import {
  BridgeStorage_abi_e64111c0_json,
  BridgeStorageV1_abi_164708e0_json,
  IBridge_abi_7c01303b_json,
  ITokenBridge_abi_60d245b0_json
} from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type { ContractWrapperConfig, } from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';
import { createComposedProxy } from '../utils/proxy-factory.js';

// Create a combined type that includes all properties from ITokenBridge and only non-conflicting properties from both
// BridgeStorage contracts
export type TokenBridge = IBridge_abi_7c01303b_json &
    Omit<ITokenBridge_abi_60d245b0_json, keyof IBridge_abi_7c01303b_json> &
    Omit<BridgeStorage_abi_e64111c0_json, keyof ITokenBridge_abi_60d245b0_json> &
    Omit<BridgeStorageV1_abi_164708e0_json, keyof ITokenBridge_abi_60d245b0_json | keyof BridgeStorage_abi_e64111c0_json>;

export class TokenBridgeFactory extends ITokenBridge_abi_60d245b0_json {
  private readonly bridge: IBridge_abi_7c01303b_json;
  private readonly bridgeStorage: BridgeStorage_abi_e64111c0_json;
  private readonly bridgeStorageV1: BridgeStorageV1_abi_164708e0_json;

  private constructor(config: ContractWrapperConfig) {
    const contractConfig = BridgeContractBase.createContractConfig(config);
    super(config.contractAddress as Address, contractConfig);

    this.bridgeStorage = BridgeContractBase.createContractInstance(
        BridgeStorage_abi_e64111c0_json,
        config
    );

    this.bridgeStorageV1 = BridgeContractBase.createContractInstance(
        BridgeStorageV1_abi_164708e0_json,
        config
    );

    this.bridge = BridgeContractBase.createContractInstance(
        IBridge_abi_7c01303b_json,
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
