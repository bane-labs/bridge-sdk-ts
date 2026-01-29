import { BridgeManagementImpl_abi_ffdf3210_json } from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address, PublicClient, WalletClient } from 'viem';
import type {
  ContractWrapperConfig,
} from '../types/interfaces.js';

export class BridgeManagement extends BridgeManagementImpl_abi_ffdf3210_json {
  constructor(config: ContractWrapperConfig) {
    super(config.contractAddress as Address, {
      publicClient: config.publicClient as PublicClient,
      walletClient: config.walletClient as WalletClient,
    });
  }
}
