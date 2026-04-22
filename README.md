# bridge-sdk-ts

A TypeScript ESM library for interacting with the Neo Bridge and related smart contracts. Designed for use in both front-end and back-end TypeScript projects.

## Features
- ESM-compatible TypeScript library
- Works in Node.js and modern browsers
- Adapter for using neon-js (CJS) in ESM environments
- Type-safe contract interaction utilities

## Installation

To install from npm, run:

```
npm install @bane-labs/bridge-sdk-ts
```

## Usage

The bridge SDK supports both EVM-compatible chains and the Neo blockchain. Import the appropriate classes and utilities for your target blockchain:

```typescript
// For EVM chains
import { EvmMessageBridgeFactory } from '@bane-labs/bridge-sdk-ts';

// For Neo blockchain
import { MessageBridge, neonAdapter, InvalidParameterError } from '@bane-labs/bridge-sdk-ts';
```

### EVM Examples

The EVM module provides factories for creating bridge contract instances that work with Ethereum and other EVM-compatible chains.

#### Creating an EVM Message Bridge

```typescript
import { EvmMessageBridgeFactory } from '@bane-labs/bridge-sdk-ts';
import { createPublicClient, createWalletClient, http } from 'viem';
import { neoxMainnet } from 'viem/chains';

const publicClient = createPublicClient({
  chain: neoxMainnet,
  transport: http('https://mainnet-1.rpc.banelabs.org')
});

const walletClient = createWalletClient({
  chain: neoxMainnet,
  transport: http('https://mainnet-1.rpc.banelabs.org')
});

const config = {
  contractAddress: '0x...your_contract_address...',
  publicClient,
  walletClient
};

const messageBridge = EvmMessageBridgeFactory.create(config);
```


### Neo Examples

The Neo module provides utilities for interacting with Neo blockchain contracts and the neonAdapter for ESM compatibility.

#### Creating a Neo Message Bridge

```typescript
import { MessageBridge } from '@bane-labs/bridge-sdk-ts';

const config = {
  rpcUrl: 'https://mainnet1.neo.coz.io:443',
  contractHash: '0x...your_contract_hash...',
  account: { /* your account object */ }
};

const bridge = new MessageBridge(config);
```

#### Using neonAdapter

`neonAdapter` is a utility object that provides a clean, ESM-compatible interface to the core features of the [neon-js](https://github.com/CityOfZion/neon-js) library. It normalizes exports and provides type-safe helpers for working with Neo accounts, contract parameters, transactions, and more. Use it to create and validate Neo blockchain objects in both browser and Node.js environments.

```typescript
import { neonAdapter } from '@bane-labs/bridge-sdk-ts';

const account = neonAdapter.create.account('your-private-key');
const param = neonAdapter.create.contractParam('String', 'hello');
```

## Publishing & Versioning

- Pre-release versions are published with the `beta` tag.
- For production, use the latest stable version.
