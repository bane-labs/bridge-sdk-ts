import {before, describe, it} from 'node:test';
import assert from 'node:assert';
import type {ContractWrapperConfig, SendExecutableMessageParams} from '../src';
import {InvalidParameterError, MessageBridge, neonAdapter} from '../src';

describe('MessageBridge', () => {
    let bridge: MessageBridge;
    let mockConfig: ContractWrapperConfig;

    before(() => {
        mockConfig = {
            rpcUrl: 'https://mainnet1.neo.coz.io:443',
            contractHash: '0x' + 'a'.repeat(40),
            // @ts-ignore because we are mocking the account
            account: {
                address: 'NMBfzaEq2c5zodiNbLPoohVENARMbJim1r',
                scriptHash: '0x' + 'b'.repeat(40),
                publicKey: '0x' + 'c'.repeat(66)
            }
        };
        bridge = new MessageBridge(mockConfig);
    });

    describe('Constructor', () => {
        it('should create MessageBridge instance', () => {
            assert.ok(bridge instanceof MessageBridge);
        });

        it('should store config correctly', () => {
            assert.strictEqual(bridge.getConfig().contractHash, mockConfig.contractHash);
            assert.strictEqual(bridge.getConfig().rpcUrl, mockConfig.rpcUrl);
        });
    });

    describe('Parameter validation', () => {
        it('should validate message parameters correctly', () => {
            const validParams: SendExecutableMessageParams = {
                messageData: 'test message',
                maxFee: 1000000,
                storeResult: true
            };

            // This should not throw
            assert.doesNotThrow(() => {
                // We'll access the private method via any casting for testing
                (bridge as any).validateMessageParams(validParams, 'test');
            });
        });

        it('should reject invalid maxFee', () => {
            const invalidParams = {
                messageData: 'test',
                maxFee: -1,
                storeResult: true
            };

            assert.throws(() => {
                (bridge as any).validateMessageParams(invalidParams, 'test');
            }, InvalidParameterError);
        });

        it('should reject empty message data', () => {
            const invalidParams = {
                messageData: '',
                maxFee: 1000000,
                storeResult: true
            };

            assert.throws(() => {
                (bridge as any).validateMessageParams(invalidParams, 'test');
            }, InvalidParameterError);
        });
    });

    describe('Message conversion', () => {
        it('should convert string message to bytes', () => {
            const message = 'hello';
            const bytes = (bridge as any).messageToBytes(message);

            assert.ok(Array.isArray(bytes));
            assert.ok(bytes.length > 0);
            assert.ok(bytes.every((b: number) => b >= 0 && b <= 255));
        });

        it('should handle hex string conversion', () => {
            const hexMessage = '0x48656c6c6f'; // "Hello" in hex
            const bytes = (bridge as any).messageToBytes(hexMessage);

            assert.ok(Array.isArray(bytes));
            assert.strictEqual(bytes.length, 5);
        });

        it('should pass through byte array unchanged', () => {
            const byteArray = [72, 101, 108, 108, 111]; // "Hello" as bytes
            const result = (bridge as any).messageToBytes(byteArray);

            assert.deepStrictEqual(result, byteArray);
        });
    });
});

describe('neonAdapter', () => {
    it('should be available', () => {
        assert.ok(neonAdapter);
        assert.ok(neonAdapter.create);
        assert.ok(neonAdapter.utils);
    });

    it('should create contract parameters', () => {
        const param = neonAdapter.create.contractParam('String', 'test');
        assert.ok(param);
        // The type is returned as a number constant, not string
        assert.ok(typeof param.type === 'number');
        assert.strictEqual(param.value, 'test');
    });

    it('should convert bytes to hex', () => {
        const bytes = new Uint8Array([1, 2, 3, 4]);
        const hex = neonAdapter.utils.ab2hexstring(bytes);
        assert.strictEqual(hex, '01020304');
    });
});

describe('Error classes', () => {
    it('should export InvalidParameterError', () => {
        const error = new InvalidParameterError('test', 'expected');
        assert.ok(error instanceof Error);
        assert.ok(error instanceof InvalidParameterError);
        assert.ok(error.message.includes('test'));
        assert.ok(error.message.includes('expected'));
    });
});
