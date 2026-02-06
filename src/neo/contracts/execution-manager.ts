import { neonAdapter } from '../n3/neon-adapter.js';
import type {
  ContractWrapperConfig,
  TransactionResult,
} from '../types/interfaces.js';
import { sendContractTransaction } from '../n3/neo-utils.js';
import { AbstractContract } from './abstract-contract.js';
import { ContractParamJson } from "@cityofzion/neon-core/lib/sc/ContractParam";

export class ExecutionManager extends AbstractContract {

  constructor(config: ContractWrapperConfig) {
    super(config);
    console.log(`[EM] Initialized ExecutionManager with RPC URL: ${config.rpcUrl}`);
    this.rpcClient.getVersion().then(v => console.log(`[EM] Magic Number: ${v.protocol.network}`));
    console.log(`[EM] Contract Hash: ${config.contractHash}`);
    console.log(`[EM] Sender Account: ${config.account.address}`);
  }

  // region contract info
  async version(): Promise<string> {
    return await this.getStringValue(this.version.name);
  }

  // endregion

  // region pause
  async isPaused(): Promise<boolean> {
    return await this.getBooleanValue(this.isPaused.name);
  }

  async pause(): Promise<TransactionResult> {
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.pause.name,
        [],
        [],
    );
  }

  async unpause(): Promise<TransactionResult> {
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.unpause.name,
        [],
        [],
    );
  }

  // endregion

  // region execution
  /** Get the current executing nonce
   *
   * @returns The current executing nonce
   *
   * @remarks
   * This nonce represents the message currently being executed by the Execution Manager.
   * It is used to track the progress of message execution *while* the execution is ongoing.
   * Once the execution is complete, this nonce will no longer represent an active execution.
   *
   */
  async getExecutingNonce(): Promise<number> {
    return await this.getNumberValue(this.getExecutingNonce.name);
  }

  /** Execute a message with the given nonce and executable code
   *
   * @returns A promise that resolves to the transaction result of the execution
   *
   * @remarks
   * This function can only be called by the Message Bridge contract.
   */
  async executeMessage(nonce: number, executableCode: string): Promise<TransactionResult> {
    this.validateUint(nonce, this.executeMessage.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.executeMessage.name,
        [
          neonAdapter.create.contractParam('Integer', nonce),
          this.getByteArrayContractParam(executableCode, false)
        ]
    );
  }

  // endregion

  // region serialization and validation
  async serializeCall(target: string, method: string, callFlags: number, args: ContractParamJson[]): Promise<string> {
    this.validateScriptHash(target, this.serializeCall.name);
    this.validateCallFlags(callFlags, this.serializeCall.name);

    return await this.getHexValue(this.serializeCall.name, [
      neonAdapter.create.contractParam('Hash160', target),
      neonAdapter.create.contractParam('String', method),
      neonAdapter.create.contractParam('Integer', callFlags),
      neonAdapter.create.contractParam('Array', args)
    ]);
  }

  /** Validate a serialized call
   *
   * @param serializedCall - The serialized call as a hex string. It is assumed to be a little-endian byte array.
   * @returns A promise that resolves to true if the call is valid, false otherwise
   *
   */
  async isValidCall(serializedCall: string): Promise<boolean> {
    this.validateHexString(serializedCall, 0);
    return await this.getBooleanValue(this.isValidCall.name, [this.getByteArrayContractParam(serializedCall, true)]);
  }

  /** Check if a serialized call is allowed
   *
   * @param serializedCall - The serialized call as a hex string. It is assumed to be a little-endian byte array.
   * @returns A promise that resolves to true if the call is allowed, false otherwise
   *
   */
  async isAllowedCall(serializedCall: string): Promise<boolean> {
    this.validateHexString(serializedCall, 0);
    return await this.getBooleanValue(this.isAllowedCall.name, [this.getByteArrayContractParam(serializedCall, true)]);
  }

  // endregion

  // region contracts
  async bridgeManagement(): Promise<string> {
    return await this.getHash160Value(this.bridgeManagement.name);
  }

  async messageBridge(): Promise<string> {
    return await this.getHash160Value(this.messageBridge.name);
  }

  // endregion
}
