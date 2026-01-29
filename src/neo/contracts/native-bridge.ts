import { neonAdapter } from '../n3/neon-adapter.js';
import type { ContractWrapperConfig, TransactionResult } from '../types/interfaces.js';
import { sendContractTransaction } from '../n3/neo-utils.js';
import { AbstractContract } from './abstract-contract.js';

export class NativeBridge extends AbstractContract {

  constructor(config: ContractWrapperConfig) {
    super(config);
    console.log(`[NativeBridge] Initialized with RPC URL: ${config.rpcUrl}`);
    this.rpcClient.getVersion().then(v => console.log(`[NativeBridge] Magic Number: ${v.protocol.network}`));
    console.log(`[NativeBridge] Contract Hash: ${config.contractHash}`);
    console.log(`[NativeBridge] Sender Account: ${config.account.address}`);
  }

  async pauseBridge(): Promise<TransactionResult> {
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.pauseBridge.name,
        []
    );
  }

  async unpauseBridge(): Promise<TransactionResult> {
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.unpauseBridge.name,
        []
    );
  }

  async isPaused(): Promise<boolean> {
    return await this.getBooleanValue(this.isPaused.name);
  }

  async pauseDeposits(): Promise<TransactionResult> {
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.pauseDeposits.name,
        []
    );
  }

  async unpauseDeposits(): Promise<TransactionResult> {
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.unpauseDeposits.name,
        []
    );
  }

  async depositsArePaused(): Promise<boolean> {
    return await this.getBooleanValue(this.depositsArePaused.name);
  }

  async linkedChainId(): Promise<number> {
    return await this.getNumberValue(this.linkedChainId.name);
  }

  async management(): Promise<string> {
    return await this.getHash160Value(this.management.name);
  }

  async unclaimedRewards(): Promise<number> {
    return await this.getNumberValue(this.unclaimedRewards.name);
  }

  async neoHoldingGasRewards(): Promise<number> {
    return await this.getNumberValue(this.neoHoldingGasRewards.name);
  }

  async setNativeBridge(
    tokenForNativeBridge: string,
    decimalsOnLinkedChain: number,
    depositFee: number,
    minAmount: number,
    maxAmount: number,
    maxWithdrawals: number,
    maxTotalDeposited: number
  ): Promise<TransactionResult> {
    this.validateScriptHash(tokenForNativeBridge, this.setNativeBridge.name);
    this.validateUint(decimalsOnLinkedChain, this.setNativeBridge.name);
    this.validateUint(depositFee, this.setNativeBridge.name);
    this.validateUint(minAmount, this.setNativeBridge.name);
    this.validateUint(maxAmount, this.setNativeBridge.name);
    this.validateUint(maxWithdrawals, this.setNativeBridge.name);
    this.validateUint(maxTotalDeposited, this.setNativeBridge.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setNativeBridge.name,
        [
          neonAdapter.create.contractParam('Hash160', tokenForNativeBridge),
          neonAdapter.create.contractParam('Integer', decimalsOnLinkedChain),
          neonAdapter.create.contractParam('Integer', depositFee),
          neonAdapter.create.contractParam('Integer', minAmount),
          neonAdapter.create.contractParam('Integer', maxAmount),
          neonAdapter.create.contractParam('Integer', maxWithdrawals),
          neonAdapter.create.contractParam('Integer', maxTotalDeposited)
        ]
    );
  }

  async pauseNativeBridge(): Promise<TransactionResult> {
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.pauseNativeBridge.name,
        []
    );
  }

  async unpauseNativeBridge(): Promise<TransactionResult> {
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.unpauseNativeBridge.name,
        []
    );
  }

  /** Deposit native tokens to the bridge
   *
   * @param from The sender's script hash
   * @param to The recipient's address on the linked chain
   * @param amount The amount of native tokens to deposit
   * @param maxFee The maximum fee the depositor is willing to pay
   * @param feeSponsor (Optional) The script hash of the fee sponsor
   *
   * @returns A promise that resolves to a TransactionResult
   */
  async depositNative(from: string, to: string, amount: number, maxFee: number, feeSponsor?: string): Promise<TransactionResult> {
    this.validateScriptHash(from, this.depositNative.name);
    this.validateScriptHash(to, this.depositNative.name);
    this.validateUint(amount, this.depositNative.name);
    this.validateUint(maxFee, this.depositNative.name);

    const params = [
      neonAdapter.create.contractParam('Hash160', from),
      neonAdapter.create.contractParam('Hash160', to),
      neonAdapter.create.contractParam('Integer', amount),
      neonAdapter.create.contractParam('Integer', maxFee)
    ];

    if (feeSponsor) {
      this.validateScriptHash(feeSponsor, this.depositNative.name);
      params.push(neonAdapter.create.contractParam('Hash160', feeSponsor));
    }

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.depositNative.name,
        params,
        [neonAdapter.constants.NATIVE_CONTRACT_HASH.GasToken],
    );
  }

  /** Withdraw native tokens from the bridge
   *
   * @param withdrawalRoot The withdrawal root in hex string format
   * @param signatures A map of validator public keys to their signatures
   * @param withdrawals An array of withdrawal objects
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Relayer may call this method
   */
  async withdrawNative(withdrawalRoot: string, signatures: Map<string, string>, withdrawals: any[]): Promise<TransactionResult> {
    const signaturesMapParam = this.createMapParam(signatures, 'ByteArray', 'ByteArray');
    let rootBuffer = Buffer.from(withdrawalRoot.replace(/^0x/, ''), 'hex');
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.withdrawNative.name,
        [
          neonAdapter.create.contractParam('ByteArray', rootBuffer.toString('base64')),
          neonAdapter.create.contractParam('Map', signaturesMapParam),
          neonAdapter.create.contractParam('Array', withdrawals)
        ]
    );
  }

  async claimNative(nonce: number): Promise<TransactionResult> {
    this.validateUint(nonce, this.claimNative.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.claimNative.name,
        [neonAdapter.create.contractParam('Integer', nonce)]
    );
  }

  async nativeBridgeIsSet(): Promise<boolean> {
    return await this.getBooleanValue(this.nativeBridgeIsSet.name);
  }

  async nativeToken(): Promise<string> {
    return await this.getHash160Value(this.nativeToken.name);
  }

  async getNativeBridge(): Promise<any> {
    return await this.getObjectValue(this.getNativeBridge.name);
  }

  async nativeDepositFee(): Promise<number> {
    return await this.getNumberValue(this.nativeDepositFee.name);
  }

  /** Set native deposit fee
   *
   * @param newFee The new deposit fee
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Governor may call this method
   */
  async setNativeDepositFee(newFee: number): Promise<TransactionResult> {
    this.validateUint(newFee, this.setNativeDepositFee.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setNativeDepositFee.name,
        [neonAdapter.create.contractParam('Integer', newFee)]
    );
  }

  async minNativeDeposit(): Promise<number> {
    return await this.getNumberValue(this.minNativeDeposit.name);
  }

  /** Set native minimum deposit amount
   *
   * @param newMinAmount The new minimum deposit amount
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Governor may call this method
   */
  async setMinNativeDeposit(newMinAmount: number): Promise<TransactionResult> {
    this.validateUint(newMinAmount, this.setMinNativeDeposit.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setMinNativeDeposit.name,
        [neonAdapter.create.contractParam('Integer', newMinAmount)]
    );
  }

  async maxNativeDeposit(): Promise<number> {
    return await this.getNumberValue(this.maxNativeDeposit.name);
  }

  /** Set native maximum deposit amount
   *
   * @param newMaxAmount The new maximum deposit amount
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Governor may call this method
   */
  async setMaxNativeDeposit(newMaxAmount: number): Promise<TransactionResult> {
    this.validateUint(newMaxAmount, this.setMaxNativeDeposit.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setMaxNativeDeposit.name,
        [neonAdapter.create.contractParam('Integer', newMaxAmount)]
    );
  }

  async maxTotalDepositedNative(): Promise<number> {
    return await this.getNumberValue(this.maxTotalDepositedNative.name);
  }

  /** Set native maximum total deposited amount
   *
   * @param newMaxTotalDeposited The new maximum total deposited amount
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Governor may call this method
   */
  async setMaxTotalDepositedNative(newMaxTotalDeposited: number): Promise<TransactionResult> {
    this.validateUint(newMaxTotalDeposited, this.setMaxTotalDepositedNative.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setMaxTotalDepositedNative.name,
        [neonAdapter.create.contractParam('Integer', newMaxTotalDeposited)]
    );
  }

  async nativeDepositNonce(): Promise<number> {
    return await this.getNumberValue(this.nativeDepositNonce.name);
  }

  async nativeDepositRoot(): Promise<string> {
    return await this.getHexValue(this.nativeDepositRoot.name);
  }

  async nativeWithdrawalNonce(): Promise<number> {
    return await this.getNumberValue(this.nativeWithdrawalNonce.name);
  }

  async nativeWithdrawalRoot(): Promise<string> {
    return await this.getHexValue(this.nativeWithdrawalRoot.name);
  }
}
