import { ContractParam, neonAdapter, type StackItemJson } from '../n3/neon-adapter.js';
import { ContractInvocationError, type ContractWrapperConfig, InvalidParameterError } from '../types/index.js';
import { invokeFunction } from '../n3/rpc-utils.js';

// Define types for stack item values and decoded results
type StackItemValue = string | number | boolean | null | StackItemJson[];
type DecodedStackItem =
    string
    | number
    | boolean
    | null
    | StackItemJson
    | DecodedStackItem[];

export abstract class AbstractContract {
  protected readonly rpcClient;
  protected readonly config: ContractWrapperConfig;

  protected constructor(config: ContractWrapperConfig) {
    this.config = config;
    this.rpcClient = neonAdapter.create.rpcClient(config.rpcUrl);
  }

  public getConfig(): ContractWrapperConfig {
    return this.config;
  }

  // region value translators
  protected async getBooleanValue(methodName: string, params?: ContractParam[]): Promise<boolean> {
    const item = await this.getStackItem(methodName, params);
    if (item.type !== 'Boolean') {
      throw new ContractInvocationError(`Invalid boolean value returned from contract for ${methodName}`);
    }
    return Boolean(item.value);
  }

  protected async getNumberValue(methodName: string, params?: ContractParam[]): Promise<number> {
    const item = await this.getStackItem(methodName, params);
    if (item.type !== 'Integer') {
      throw new ContractInvocationError(`Invalid number value returned from contract for ${methodName}`);
    }
    return Number(item.value);
  }

  protected async getStringValue(methodName: string, params?: ContractParam[]): Promise<string> {
    const result = await this.getStackItem(methodName, params);

    const value = result.value;
    if (typeof value === 'string') {
      const hexString = neonAdapter.utils.base642hex(value);
      return neonAdapter.utils.hexstring2str(hexString);
    } else {
      return String(value);
    }
  }

  protected async getHexValue(methodName: string, params?: ContractParam[]): Promise<string> {
    const result = await this.getStackItem(methodName, params);

    let type = result.type;
    if (type !== 'ByteString' && type !== 'Buffer') {
      throw new ContractInvocationError(`Invalid hex value returned from contract for ${methodName}`);
    }

    const value = result.value;
    if (typeof value === 'string') {
      const littleEndian = neonAdapter.utils.base642hex(value);
      return `0x${neonAdapter.utils.HexString.fromHex(littleEndian, true).toBigEndian()}`;
    } else {
      return String(value);
    }
  }

  protected async getObjectValue(methodName: string, params?: ContractParam[]): Promise<DecodedStackItem> {
    const result = await this.getStackItem(methodName, params);

    if(result.type !== 'Array') {
      throw new ContractInvocationError(`Invalid object value returned from contract for ${methodName}`);
    }

    if (Array.isArray(result.value)) {
      return result.value.map(item => this.decodeStackItem(item, methodName));
    }

    return this.decodeStackItem(result, methodName);
  }

  protected decodeStackItem(item: StackItemValue | StackItemJson, methodName?: string): DecodedStackItem {
    if (Array.isArray(item)) {
      return item.map(nestedItem => this.decodeStackItem(nestedItem, methodName));
    }

    if (item && typeof item === 'object' && 'type' in item && 'value' in item) {
      const {type, value} = item;

      switch (type) {
        case 'Array':
          if (Array.isArray(value)) {
            return value.map(nestedItem => this.decodeStackItem(nestedItem, methodName));
          }
          return value as DecodedStackItem;
        case 'ByteString':
        case 'Buffer':
        case 'Pointer':
          if (typeof value === 'string') {
            try {
              return `0x${neonAdapter.utils.base642hex(value)}`;
            } catch {
              return value;
            }
          }
          return value as DecodedStackItem;
        case 'Integer':
          return Number(value);
        case 'Boolean':
          return Boolean(value);
        default:
          return value as DecodedStackItem;
      }
    }

    return item as DecodedStackItem;
  }

  protected async getStackItem(methodName: string, params: ContractParam[] = []): Promise<StackItemJson> {
    const errorMessage = `Invalid ${methodName} value returned from contract`;
    return await invokeFunction(this.rpcClient, this.config.contractHash, methodName, errorMessage, params);
  }

  // endregion

  // region parameter validators
  protected validateUint(uint: number, context: string): void {
    if (uint === undefined || uint === null) {
      throw new InvalidParameterError(`uint for ${context}`, `defined number value`);
    }
    if (!Number.isInteger(uint)) {
      throw new InvalidParameterError(`uint for ${context}`, `integer value, got ${typeof uint}: ${uint}`);
    }
    if (uint < 0) {
      throw new InvalidParameterError(`uint for ${context}`, `non-negative integer, got ${uint}`);
    }
  }

  protected validateScriptHash(hash: string, context: string): void {
    if (!this.validateHexString(hash, 40)) {
      throw new InvalidParameterError(`target hash for ${context}`, `40-character hex string, got ${hash}`);
    }
  }

  protected validateCallFlags(callFlags: number, context: string): void {
    if (!Number.isInteger(callFlags)) {
      throw new InvalidParameterError(`call flags for ${context}`,
          `integer value, got ${typeof callFlags}: ${callFlags}`);
    }
    if (callFlags < 0 || callFlags > 255) {
      throw new InvalidParameterError(`call flags for ${context}`, `value between 0 and 255, got ${callFlags}`);
    }
  }

  protected validatePublicKey(pubKey: string, context: string): void {
    if (!this.validateHexString(pubKey, 66)) {
      throw new InvalidParameterError(`public key for ${context}`, `66-character hex string, got ${pubKey}`);
    }
  }

  protected validateHexString(hexString: string, length: number): boolean {
    const cleanHex = this.getCleanHex(hexString);
    return new RegExp(`^[0-9a-fA-F]{${length}}$`).test(cleanHex);
  }

  protected getCleanHex(hexString: string) {
    return hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  }

// endregion
}
