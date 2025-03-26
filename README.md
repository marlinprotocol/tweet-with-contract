# Tweet With Contract

A Node.js application that seamlessly listens for tweet events from a Solidity smart contract and automates the posting of paid tweets using an encumbered account. Leveraging the power of the [Twitter Agent Service](https://github.com/marlinprotocol/twitter-agent-service), it ensures secure tweeting. 🚀

## Overview

This application listens for events emitted by the `TweetWithOysterAgentService` smart contract and posts corresponding tweets on Twitter. The contract charges a small fee (e.g., 0.0001 ETH) per tweet, which is sent to the contract deployer.

## Prerequisites

1. **Development Environment**: Set up the development environment by following the official guide:  
   [Oyster CVM Setup Guide](https://docs.marlin.org/oyster/build-cvm/tutorials/setup)

2. **Smart Contract Deployment**: Deploy the [`TweetWithOysterAgentService.sol`](./TweetWithOysterAgentService.sol) smart contract on the network of your choice.  
   - **Example**: A verified contract on Arbitrum Sepolia:  
     [0x57927f7bc15e6c29e3373c31c0af560508afe7d7](https://sepolia.arbiscan.io/address/0x57927f7bc15e6c29e3373c31c0af560508afe7d7#code)

   > **Note**: The `TweetWithOysterAgentService` contract charges 0.0001 ETH per tweet and sends the fee to the contract deployer.

## Environment Setup

### 1. Create environment variables files with all the required details for the twitter agent service

   ### .env
   ```
   USERNAME=
   USER_EMAIL=
   X_APP_NAME=
   KMS_ENDPOINT=http://kms_imitator:1100
   AGENT_HOST=0.0.0.0
   ```

   ### .env.secrets
   ```
   OPENAI_API_KEY=
   USER_PASSWORD=
   USER_EMAIL_PASSWORD=
   ```

### 2. Create environment variables files with all the required details for the tweet with contract application service


### .env.twc 
```plaintext
CONTRACT_ADDRESS=
PORT=
```

### .env.twc.secrets
```plaintext
RPC_URL=
```

## Deployment Steps

### Deploy the Application Using Oyster CVM using the following commands
Debug mode:
```bash
oyster-cvm deploy --wallet-private-key *** --pcr-preset base/blue/v1.0.0/amd64 --duration-in-minutes 60 --debug --no-stream --docker-compose docker-compose.yml --operator *** --instance-type r6i.xlarge --image-url https://artifacts.marlin.org/oyster/eifs/base-blue_v1.0.0_linux_amd64.eif --init-params ".env:0:0:file:.env" --init-params ".env.secrets:0:0:file:.env.secrets" --init-params ".env.twc:0:0:file:.env.twc" --init-params ".env.twc.secrets:0:0:file:.env.twc.secrets"
```


Production mode:
```bash
oyster-cvm deploy --wallet-private-key *** --pcr-preset base/blue/v1.0.0/amd64 --duration-in-minutes 60 --docker-compose docker-compose.yml --operator *** --instance-type r6i.xlarge --image-url https://artifacts.marlin.org/oyster/eifs/base-blue_v1.0.0_linux_amd64.eif --init-params ".env:1:0:file:.env" --init-params ".env.secrets:1:0:file:.env.secrets" --init-params ".env.twc:0:1:file:.env.twc" --init-params ".env.twc.secrets:0:1:file:.env.twc.secrets"
```

## Usage

### 1. Generate Access Tokens
Generate access tokens inside the enclave by calling the following endpoint:
```bash
curl {oyster-enclave-ip}:{tweet-with-contract-port}/generate_access_keys
```
> **Note**: This endpoint does not return the API keys or access tokens. It only generates them inside the enclave.

---

### 2. Start Listening for Tweet Events
Start listening for tweet events inside the enclave by calling the following endpoint:
```bash
curl {oyster-enclave-ip}:{tweet-with-contract-port}/start_listening_for_tweet_events
```

---

### 3. Post a Tweet via the Smart Contract
Call the `tweet` function from the deployed smart contract to post a tweet. You can use a explorer or a tool like Remix to interact with the contract.

- **Example**: [Write Contract on Arbitrum Sepolia](https://sepolia.arbiscan.io/address/0x57927f7bc15e6c29e3373c31c0af560508afe7d7#writeContract)
- **Parameters**:
  - `tweetContent`: The string to be posted on Twitter.
  - **Value**: Ensure to send at least 0.0001 ETH with the transaction.


