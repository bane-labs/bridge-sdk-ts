import { neonAdapter } from '../n3/neon-adapter.js';
import type { ContractWrapperConfig, TransactionResult } from '../types/interfaces.js';
import { sendContractTransaction } from '../n3/neo-utils.js';
import { AbstractContract } from './abstract-contract.js';

export class TokenBridge extends AbstractContract {

  constructor(config: ContractWrapperConfig) {
    super(config);
    console.log(`[TokenBridge] Initialized with RPC URL: ${config.rpcUrl}`);
    this.rpcClient.getVersion().then(v => console.log(`[TokenBridge] Magic Number: ${v.protocol.network}`));
    console.log(`[TokenBridge] Contract Hash: ${config.contractHash}`);
    console.log(`[TokenBridge] Sender Account: ${config.account.address}`);
  }

  async isRegisteredToken(token: string): Promise<boolean> {
    this.validateScriptHash(token, this.isRegisteredToken.name);

    return await this.getBooleanValue(this.isRegisteredToken.name, [
      neonAdapter.create.contractParam('Hash160', token)
    ]);
  }

  async getTokenBridge(token: string): Promise<any> {
    this.validateScriptHash(token, this.getTokenBridge.name);

    return await this.getObjectValue(this.getTokenBridge.name, [
      neonAdapter.create.contractParam('Hash160', token)
    ]);
  }

  async getRegisteredTokens(): Promise<any[]> {
    const result = await this.getObjectValue(this.getRegisteredTokens.name);
    return Array.isArray(result) ? result : [];
  }

  async registerToken(token: string, tokenConfig: any): Promise<TransactionResult> {
    this.validateScriptHash(token, this.registerToken.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.registerToken.name,
        [
          neonAdapter.create.contractParam('Hash160', token),
          neonAdapter.create.contractParam('Any', tokenConfig)
        ]
    );
  }

  async pauseTokenBridge(neoN3Token: string): Promise<TransactionResult> {
    this.validateScriptHash(neoN3Token, this.pauseTokenBridge.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.pauseTokenBridge.name,
        [neonAdapter.create.contractParam('Hash160', neoN3Token)]
    );
  }

  async unpauseTokenBridge(neoN3Token: string): Promise<TransactionResult> {
    this.validateScriptHash(neoN3Token, this.unpauseTokenBridge.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.unpauseTokenBridge.name,
        [neonAdapter.create.contractParam('Hash160', neoN3Token)]
    );
  }

  /** Deposit tokens to the bridge
   *
   * @param token The token script hash
   * @param from The sender's script hash
   * @param to The recipient's address on the linked chain
   * @param amount The amount of tokens to deposit
   * @param maxFee The maximum fee the depositor is willing to pay
   * @param feeSponsor (Optional) The script hash of the fee sponsor
   *
   * @returns A promise that resolves to a TransactionResult
   */
  async depositToken(
    token: string,
    from: string,
    to: string,
    amount: number,
    maxFee: number,
    feeSponsor?: string
  ): Promise<TransactionResult> {
    this.validateScriptHash(token, this.depositToken.name);
    this.validateScriptHash(from, this.depositToken.name);
    this.validateScriptHash(to, this.depositToken.name);
    this.validateUint(amount, this.depositToken.name);
    this.validateUint(maxFee, this.depositToken.name);

    const params = [
      neonAdapter.create.contractParam('Hash160', token),
      neonAdapter.create.contractParam('Hash160', from),
      neonAdapter.create.contractParam('Hash160', to),
      neonAdapter.create.contractParam('Integer', amount),
      neonAdapter.create.contractParam('Integer', maxFee)
    ];

    if (feeSponsor) {
      this.validateScriptHash(feeSponsor, this.depositToken.name);
      params.push(neonAdapter.create.contractParam('Hash160', feeSponsor));
    }

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.depositToken.name,
        params,
        [neonAdapter.constants.NATIVE_CONTRACT_HASH.GasToken, token],
    );
  }

  /** Withdraw tokens from the bridge
   *
   * @param token The token script hash
   * @param withdrawalRoot The withdrawal root
   * @param signatures A map of validator public keys to their signatures
   * @param withdrawals An array of withdrawal objects
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Relayer may call this method
   */
  async withdrawToken(
      token: string,
      withdrawalRoot: string,
      signatures: Map<string, string>,
      withdrawals: any[]
  ): Promise<TransactionResult> {
    this.validateScriptHash(token, this.withdrawToken.name);
    const signaturesMapParam = this.createMapParam(signatures, 'ByteArray', 'ByteArray');
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.withdrawToken.name,
        [
          neonAdapter.create.contractParam('Hash160', token),
          neonAdapter.create.contractParam('ByteArray', withdrawalRoot),
          neonAdapter.create.contractParam('Map', signaturesMapParam),
          neonAdapter.create.contractParam('Array', withdrawals)
        ]
    );
  }

  /** Set token deposit fees
   *
   * @param newDepositFees A map of token script hashes to their new deposit fees
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Governor may call this method
   */
  async setTokenDepositFee(newDepositFees: Map<string,number>): Promise<TransactionResult> {
    const mapParam = this.createMapParam(newDepositFees, 'Hash160', 'Integer');
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setTokenDepositFee.name,
        [neonAdapter.create.contractParam('Map', mapParam)]
    );
  }

  async claimToken(token: string, nonce: number): Promise<TransactionResult> {
    this.validateScriptHash(token, this.claimToken.name);
    this.validateUint(nonce, this.claimToken.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.claimToken.name,
        [
          neonAdapter.create.contractParam('Hash160', token),
          neonAdapter.create.contractParam('Integer', nonce)
        ]
    );
  }

  async tokenDepositFee(token: string): Promise<number> {
    this.validateScriptHash(token, this.tokenDepositFee.name);

    return await this.getNumberValue(this.tokenDepositFee.name, [
      neonAdapter.create.contractParam('Hash160', token)
    ]);
  }

  /** Set token minimum deposit amounts
   *
   * @param newMinDeposits A map of token script hashes to their new minimum deposit amounts
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Governor may call this method
   */
  async setMinTokenDeposit(newMinDeposits: Map<string,number>): Promise<TransactionResult> {
    const mapParam = this.createMapParam(newMinDeposits, 'Hash160', 'Integer');
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setMinTokenDeposit.name,
        [neonAdapter.create.contractParam('Map', mapParam)]
    );
  }

  async minTokenDeposit(token: string): Promise<number> {
    this.validateScriptHash(token, this.minTokenDeposit.name);

    return await this.getNumberValue(this.minTokenDeposit.name, [
      neonAdapter.create.contractParam('Hash160', token)
    ]);
  }

  /** Set token maximum deposit amounts
   *
   * @param newMaxDeposits A map of token script hashes to their new maximum deposit amounts
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Governor may call this method
   */
  async setMaxTokenDeposit(newMaxDeposits: Map<string,number>): Promise<TransactionResult> {
    const mapParam = this.createMapParam(newMaxDeposits, 'Hash160', 'Integer');
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setMaxTokenDeposit.name,
        [neonAdapter.create.contractParam('Map', mapParam)]
    );
  }

  async maxTokenDeposit(token: string): Promise<number> {
    this.validateScriptHash(token, this.maxTokenDeposit.name);

    return await this.getNumberValue(this.maxTokenDeposit.name, [
      neonAdapter.create.contractParam('Hash160', token)
    ]);
  }

  /** Set token maximum withdrawals
   *
   * @param newMaxWithdrawals A map of token script hashes to their new maximum withdrawals
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Governor may call this method
   */
  async setMaxTokenWithdrawals(newMaxWithdrawals: Map<string,number>): Promise<TransactionResult> {
    const mapParam = this.createMapParam(newMaxWithdrawals, 'Hash160', 'Integer');
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setMaxTokenWithdrawals.name,
        [neonAdapter.create.contractParam('Map', mapParam)]
    );
  }

  async maxTokenWithdrawals(token: string): Promise<number> {
    this.validateScriptHash(token, this.maxTokenWithdrawals.name);

    return await this.getNumberValue(this.maxTokenWithdrawals.name, [
      neonAdapter.create.contractParam('Hash160', token)
    ]);
  }

  async tokenDepositNonce(token: string): Promise<number> {
    this.validateScriptHash(token, this.tokenDepositNonce.name);

    return await this.getNumberValue(this.tokenDepositNonce.name, [
      neonAdapter.create.contractParam('Hash160', token)
    ]);
  }

  async tokenDepositRoot(token: string): Promise<string> {
    this.validateScriptHash(token, this.tokenDepositRoot.name);

    return await this.getHexValue(this.tokenDepositRoot.name, [
      neonAdapter.create.contractParam('Hash160', token)
    ]);
  }

  async tokenWithdrawalNonce(token: string): Promise<number> {
    this.validateScriptHash(token, this.tokenWithdrawalNonce.name);

    return await this.getNumberValue(this.tokenWithdrawalNonce.name, [
      neonAdapter.create.contractParam('Hash160', token)
    ]);
  }

  async tokenWithdrawalRoot(token: string): Promise<string> {
    this.validateScriptHash(token, this.tokenWithdrawalRoot.name);

    return await this.getHexValue(this.tokenWithdrawalRoot.name, [
      neonAdapter.create.contractParam('Hash160', token)
    ]);
  }
}
