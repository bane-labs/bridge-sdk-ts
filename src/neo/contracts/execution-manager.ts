import { neonAdapter } from '../n3/neon-adapter.js';
import {
  type ContractWrapperConfig,
  type TransactionResult,
} from '../types/index.js';
import { sendContractTransaction } from '../n3/neo-utils.js';
import { AbstractContract } from './abstract-contract.js';

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
  async getExecutingNonce(): Promise<number> {
    return await this.getNumberValue(this.getExecutingNonce.name);
  }

  async executeMessage(nonce: number, executableCode: string): Promise<TransactionResult> {
    this.validateUint(nonce, this.executeMessage.name);

    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.executeMessage.name,
        [
          neonAdapter.create.contractParam('Integer', nonce),
          neonAdapter.create.contractParam('ByteArray', executableCode)
        ]
    );
  }

  // endregion

  // region serialization and validation
  async serializeCall(target: string, method: string, callFlags: number, args: any[]): Promise<string> {
    this.validateScriptHash(target, this.serializeCall.name);
    this.validateCallFlags(callFlags, this.serializeCall.name);

    return await this.getHexValue(this.serializeCall.name, [
      neonAdapter.create.contractParam('Hash160', target),
      neonAdapter.create.contractParam('String', method),
      neonAdapter.create.contractParam('Integer', callFlags),
      neonAdapter.create.contractParam('Array', args)
    ]);
  }

  async isValidCall(serializedCall: string): Promise<boolean> {
    return await this.getBooleanValue(this.isValidCall.name, [
      neonAdapter.create.contractParam('ByteArray', serializedCall)
    ]);
  }

  async isAllowedCall(serializedCall: string): Promise<boolean> {
    return await this.getBooleanValue(this.isAllowedCall.name, [
      neonAdapter.create.contractParam('ByteArray', serializedCall)
    ]);
  }

  // endregion

  // region contracts
  async bridgeManagement(): Promise<string> {
    return await this.getHexValue(this.bridgeManagement.name);
  }

  async messageBridge(): Promise<string> {
    return await this.getHexValue(this.messageBridge.name);
  }

  // endregion
}
