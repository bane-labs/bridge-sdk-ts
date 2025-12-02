import { ContractParam, neonAdapter } from '../n3/neon-adapter.js';
import { type ContractWrapperConfig, type TransactionResult, } from '../types/index.js';
import { sendContractTransaction } from '../n3/neo-utils.js';
import { AbstractContract } from './abstract-contract.js';
import { sc } from "@cityofzion/neon-js";
import { ContractParamJson, ContractParamMap, ContractParamsMapLike } from "@cityofzion/neon-core/lib/sc/ContractParam";

export class NativeTokenBridge extends AbstractContract {

  constructor(config: ContractWrapperConfig) {
    super(config);
    console.log(`[NXB] Initialized NeoXBridge with RPC URL: ${config.rpcUrl}`);
    this.rpcClient.getVersion().then(v => console.log(`[NXB] Magic Number: ${v.protocol.network}`));
    console.log(`[NXB] Contract Hash: ${config.contractHash}`);
    console.log(`[NXB] Sender Account: ${config.account.address}`);
  }

  // region bridge pause/unpause
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

  // endregion

  // region contract info
  async linkedChainId(): Promise<number> {
    return await this.getNumberValue(this.linkedChainId.name);
  }

  async management(): Promise<string> {
    return await this.getHexValue(this.management.name);
  }

  async unclaimedRewards(): Promise<number> {
    return await this.getNumberValue(this.unclaimedRewards.name);
  }

  async neoHoldingGasRewards(): Promise<number> {
    return await this.getNumberValue(this.neoHoldingGasRewards.name);
  }

  // endregion

  // region native bridge
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
        params
    );
  }

  /** Withdraw native tokens from the bridge
   *
   * @param withdrawalRoot The withdrawal root
   * @param signatures A map of validator public keys to their signatures
   * @param withdrawals An array of withdrawal objects
   *
   * @returns A promise that resolves to a TransactionResult
   *
   * @remarks
   * Only the Relayer may call this method
   */
  async withdrawNative(withdrawalRoot: string, signatures: Map<string, string>, withdrawals: any[]): Promise<TransactionResult> {
    const signaturesMapParam = this.createMapParam(signatures, 'PublicKey', 'ByteArray');
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.withdrawNative.name,
        [
          neonAdapter.create.contractParam('ByteArray', withdrawalRoot),
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
    return await this.getHexValue(this.nativeToken.name);
  }

  async getNativeBridge(): Promise<any> {
    return await this.getObjectValue(this.getNativeBridge.name);
  }

  async nativeDepositFee(): Promise<number> {
    return await this.getNumberValue(this.nativeDepositFee.name);
  }

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

  // endregion

  // region token bridge
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

  /** Deposit native tokens to the bridge
   *
   * @param token The native token script hash
   * @param from The sender's script hash
   * @param to The recipient's address on the linked chain
   * @param amount The amount of native tokens to deposit
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
        params
    );
  }


  /** Withdraw native tokens from the bridge
   *
   * @param token The native token script hash
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
    const signaturesMapParam = this.createMapParam(signatures, 'PublicKey', 'ByteArray');
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

  // endregion
}
