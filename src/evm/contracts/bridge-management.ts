import { BridgeManagementImpl_abi_ffdf3210_json } from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type {
  ContractWrapperConfig,
} from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';

export type BridgeManagement = BridgeManagementImpl_abi_ffdf3210_json;

export class BridgeManagementFactory extends BridgeManagementImpl_abi_ffdf3210_json {
  private constructor(config: ContractWrapperConfig) {
    const contractConfig = BridgeContractBase.createContractConfig(config);
    super(config.contractAddress as Address, contractConfig);
  }

  static create(config: ContractWrapperConfig): BridgeManagement {
    return new BridgeManagementFactory(config);
  }
}
