import { MessageBridge_abi_3a142650_json } from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address, PublicClient, WalletClient } from 'viem';
import type {
  ContractWrapperConfig,
} from '../types/interfaces.js';

export class MessageBridge extends MessageBridge_abi_3a142650_json {
  constructor(config: ContractWrapperConfig) {
    super(config.contractAddress as Address, {
      publicClient: config.publicClient as PublicClient,
      walletClient: config.walletClient as WalletClient,
    });
  }
}
