import { ITokenBridge_abi_60d245b0_json } from '@gitmyabi/bane-labs--bridge-evm-contracts/contracts';
import type { Address, PublicClient, WalletClient } from 'viem';
import type { ContractWrapperConfig } from '../types/interfaces.js';

export class TokenBridge extends ITokenBridge_abi_60d245b0_json {
  constructor(config: ContractWrapperConfig) {
    super(config.contractAddress as Address, {
      publicClient: config.publicClient as PublicClient,
      walletClient: config.walletClient as WalletClient,
    });
  }
}
