import {
  ContractParam,
  type ContractParamMap,
  ContractParamType,
  neonAdapter,
  type StackItemJson
} from '../n3/neon-adapter.js';
import { ContractInvocationError, InvalidParameterError } from '../types/errors.js';
import type { ContractWrapperConfig } from '../types/interfaces.js';
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
    switch (item.type) {
      case 'Boolean':
        return Boolean(item.value);
      case 'Integer':
        return Number(item.value) === 1;
      default:
        throw new ContractInvocationError(`Invalid boolean value returned from contract for ${methodName}`);
    }
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
      return neonAdapter.utils.base642hex(value)
    } else {
      return String(value);
    }
  }

  protected async getHash160Value(methodName: string, params?: ContractParam[]): Promise<string> {
    let littleEndian = await this.getHexValue(methodName, params);
    if (littleEndian.length !== 40) {
      throw new ContractInvocationError(`Invalid Hash160 value returned from contract for ${methodName}`);
    }
    return `0x${neonAdapter.utils.HexString.fromHex(littleEndian, true).toBigEndian()}`;
  }

  protected async getObjectValue(methodName: string, params?: ContractParam[]): Promise<DecodedStackItem> {
    const result = await this.getStackItem(methodName, params);

    if (result.type !== 'Array') {
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
              let hexBytes = neonAdapter.utils.base642hex(value);
              // Optimistically assume that if it has a 40 character length, it's a Hash160 and convert to big-endian
              //
              // In the case of the bridge, when getting an address from EVM as a store-only/response message,
              // it will be reversed at the output because in a recursive method we can't differentiate between expected
              // Hash160 outputs and other ByteString outputs. In this case please ensure that you reverse it
              // back to big-endian when validating the output object.
              if (hexBytes.length === 40) {
                // Warn that this is an assumption
                console.warn(`Assuming Hash160 return type for item: ${item}, method: ${methodName} based on length`);
                hexBytes = neonAdapter.utils.HexString.fromHex(hexBytes, true).toBigEndian();
              }
              return `0x${hexBytes}`;
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

  // region parameter helpers
  /** Creates a Map ContractParamJson from a Map of key-value pairs.
   * @param mapEntries - The Map containing key-value pairs.
   * @param keyType - The ContractParamType for the keys (default is 'String').
   * @param valueType - The ContractParamType for the values (default is 'Integer').
   * @returns An array of ContractParamJson objects representing the Map entries.
   *
   */
  protected createMapParam(
      // Use any for key and value to allow flexibility in the create.contractParam method.
      mapEntries: Map<any, any>,
      keyType: keyof typeof ContractParamType = 'String',
      valueType: keyof typeof ContractParamType = 'Integer'
  ): ContractParamMap {

    return Array.from(mapEntries).map(([key, value]) => {
      value = this.convertToHexString(valueType, value);
      key = this.convertToHexString(keyType, key);
      return {
        key: neonAdapter.create.contractParam(keyType, key),
        value: neonAdapter.create.contractParam(valueType, value)
      };
    });
  }

  protected getByteArrayContractParam(callHex: string, isLittleEndian: boolean = true): ContractParam {
    let littleEndianHexString = neonAdapter.utils.HexString.fromHex(callHex, isLittleEndian) as any;
    return neonAdapter.create.contractParam('ByteArray', littleEndianHexString);
  }

  /** Validates whether a given string is a valid hexadecimal string of a specified length.
   *
   * @param hexString - The string to validate.
   * @param length - The expected length of the hexadecimal string. If length is 0, any length is accepted.
   * @returns True if the string is a valid hexadecimal string of the specified length, false otherwise.
   */
  protected validateHexString(hexString: string, length: number): boolean {
    const cleanHex = this.getCleanHex(hexString);
    if (length > 0) {
      return new RegExp(`^[0-9a-fA-F]{${length}}$`).test(cleanHex);
    }
    return new RegExp(`^[0-9a-fA-F]+$`).test(cleanHex);
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

  private convertToHexString(keyType: keyof typeof ContractParamType, value: any) {
    if (keyType in ['ByteString', 'Buffer', 'PublicKey', 'Hash160', 'Hash256'] && typeof value === 'string') {
      value = neonAdapter.utils.HexString.fromHex(value, true);
    }
    return value;
  }

  protected getCleanHex(hexString: string) {
    return hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  }

// endregion
}
