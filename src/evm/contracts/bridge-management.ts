import { BridgeManagementImpl_abi_ffdf3210_json } from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address } from 'viem';
import type {
  ContractWrapperConfig,
} from '../types/interfaces.js';
import { BridgeContractBase } from '../utils/bridge-base.js';

export class BridgeManagement extends BridgeManagementImpl_abi_ffdf3210_json {
  constructor(config: ContractWrapperConfig) {
    const contractConfig = BridgeContractBase.createContractConfig(config);
    super(config.contractAddress as Address, contractConfig);
  }
}
