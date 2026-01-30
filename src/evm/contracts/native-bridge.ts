import { INativeBridge_abi_ce8c68b5_json, BridgeStorage_abi_e64111c0_json, BridgeStorageV1_abi_164708e0_json } from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type {
  ContractWrapperConfig,
} from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';
import { createComposedProxy } from '../utils/proxy-factory.js';

// Create a combined type that includes all properties from INativeBridge and only non-conflicting properties from both BridgeStorage contracts
export type NativeBridge = INativeBridge_abi_ce8c68b5_json &
  Omit<BridgeStorage_abi_e64111c0_json, keyof INativeBridge_abi_ce8c68b5_json> &
  Omit<BridgeStorageV1_abi_164708e0_json, keyof INativeBridge_abi_ce8c68b5_json | keyof BridgeStorage_abi_e64111c0_json>;

export class NativeBridgeFactory extends INativeBridge_abi_ce8c68b5_json {
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
  }

  // Create a factory method that returns the proxied instance
  static create(config: ContractWrapperConfig): NativeBridge {
    const instance = new NativeBridgeFactory(config);

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
