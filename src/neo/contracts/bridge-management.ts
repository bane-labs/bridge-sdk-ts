import { neonAdapter } from '../n3/neon-adapter.js';
import { AbstractContract } from './abstract-contract.js';
import { sendContractTransaction } from '../n3/neo-utils.js';
import type { ContractWrapperConfig, TransactionResult } from '../types/interfaces.js';

export class BridgeManagement extends AbstractContract {
  constructor(config: ContractWrapperConfig) {
    super(config);
  }

  /** Set a new owner for the BridgeManagement contract
   *
   * @param newOwner - The script hash of the new owner
   *
   * @returns TransactionResult containing the transaction hash and other details
   * @throws Error - ALWAYS: Not implemented
   *
   * @remarks
   * The newOwner must also be a witness to this transaction - currently not implemented in this SDK
   */
  async setOwner(newOwner: string): Promise<TransactionResult> {
    throw new Error(`setOwner ${this.setOwner.name} is not implemented: newOwner witness requirement not supported by SDK`);
    // this.validateScriptHash(newOwner, this.setOwner.name);
    // return await sendContractTransaction(
    //     this.rpcClient,
    //     this.config.account,
    //     this.config.contractHash,
    //     this.setOwner.name,
    //     [neonAdapter.create.contractParam('Hash160', newOwner)],
    //     []
    // );
  }

  async setRelayer(newRelayer: string): Promise<TransactionResult> {
    this.validateScriptHash(newRelayer, this.setRelayer.name);
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setRelayer.name,
        [neonAdapter.create.contractParam('Hash160', newRelayer)],
        []
    );
  }

  async addValidator(validatorPubKey: string, incrementThreshold: boolean): Promise<TransactionResult> {
    this.validatePublicKey(validatorPubKey, this.addValidator.name);
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.addValidator.name,
        [
          // The neon-js lib needs the public key to be in clean hex format (no 0x prefix)
          neonAdapter.create.contractParam('PublicKey', this.getCleanHex(validatorPubKey)),
          neonAdapter.create.contractParam('Boolean', incrementThreshold)
        ],
        []
    );
  }

  async removeValidator(validatorPubKey: string, decrementThreshold: boolean): Promise<TransactionResult> {
    this.validatePublicKey(validatorPubKey, this.removeValidator.name);
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.removeValidator.name,
        [
          //  The neon-js lib needs the public key to be in clean hex format (no 0x prefix)
          neonAdapter.create.contractParam('PublicKey', this.getCleanHex(validatorPubKey)),
          neonAdapter.create.contractParam('Boolean', decrementThreshold)
        ],
        []
    );
  }

  async replaceValidator(oldValidatorPubKey: string, newValidatorPubKey: string): Promise<TransactionResult> {
    this.validatePublicKey(oldValidatorPubKey, this.replaceValidator.name);
    this.validatePublicKey(newValidatorPubKey, this.replaceValidator.name);
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.replaceValidator.name,
        [
          //  The neon-js lib needs the public key to be in clean hex format (no 0x prefix)
          neonAdapter.create.contractParam('PublicKey', this.getCleanHex(oldValidatorPubKey)),
          neonAdapter.create.contractParam('PublicKey', this.getCleanHex(newValidatorPubKey))
        ],
        []
    );
  }

  async setValidatorThreshold(newThreshold: number): Promise<TransactionResult> {
    this.validateUint(newThreshold, this.setValidatorThreshold.name);
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setValidatorThreshold.name,
        [neonAdapter.create.contractParam('Integer', newThreshold)],
        []
    );
  }

  async isValidator(validatorPubKey: string): Promise<boolean> {
    this.validatePublicKey(validatorPubKey, this.isValidator.name);
    //  The neon-js lib needs the public key to be in clean hex format (no 0x prefix)
    return await this.getBooleanValue(this.isValidator.name, [neonAdapter.create.contractParam('PublicKey', this.getCleanHex(validatorPubKey))]);
  }

  async setGovernor(newGovernor: string): Promise<TransactionResult> {
    this.validateScriptHash(newGovernor, this.setGovernor.name);
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setGovernor.name,
        [neonAdapter.create.contractParam('Hash160', newGovernor)],
        []
    );
  }

  async setSecurityGuard(newSecurityGuard: string): Promise<TransactionResult> {
    this.validateScriptHash(newSecurityGuard, this.setSecurityGuard.name);
    return await sendContractTransaction(
        this.rpcClient,
        this.config.account,
        this.config.contractHash,
        this.setSecurityGuard.name,
        [neonAdapter.create.contractParam('Hash160', newSecurityGuard)],
        []
    );
  }

  async owner(): Promise<string> {
    return await this.getHexValue(this.owner.name);
  }

  async relayer(): Promise<string> {
    return await this.getHexValue(this.relayer.name);
  }

  async validators(): Promise<string[]> {
    const result = await this.getObjectValue(this.validators.name);
    if (!Array.isArray(result)) throw new Error('Expected array for validators');
    return result.map(v => String(v));
  }

  async validatorThreshold(): Promise<number> {
    return await this.getNumberValue(this.validatorThreshold.name);
  }

  async governor(): Promise<string> {
    return await this.getHexValue(this.governor.name);
  }

  async securityGuard(): Promise<string> {
    return await this.getHexValue(this.securityGuard.name);
  }
}
