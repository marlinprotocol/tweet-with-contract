import express from 'express';
import { ethers } from "ethers";
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({path: '.env.twc'});
dotenv.config({path: '.env.twc.secrets'});

const app = express();

// ABI for the TweetWithOysterAgentService contract
const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "tweetContent",
          "type": "string"
        },
        {
          "indexed": false,
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "NewTweet",
      "type": "event"
    }
];

async function getTweetWithOysterAgentServiceContract(rpc_url,contract_address) {
  try {
    const provider = new ethers.JsonRpcProvider(rpc_url);
    const tweetContract = new ethers.Contract(contract_address, contractABI, provider);
    console.log(`Listening for events on contract: ${contract_address}`);
    return tweetContract;
  } catch (error) {
    console.error("Error connecting to blockchain:", error);
    process.exit(1);
  }
}

// Listen for new events
async function listenForEvents(contract,api_key,api_key_secret,access_token,access_token_secret) {
  try {
    const client = new TwitterApi({
      appKey: api_key,
      appSecret: api_key_secret,
      accessToken: access_token,
      accessSecret: access_token_secret,
    });

    const rwClient = client.readWrite;

    contract.on("NewTweet", async (user, tweetContent, timestamp, event) => {
      try {
        console.log("\nNew Tweet event Detected!");
        console.log("-".repeat(50));
        console.log(`Tweet: ${tweetContent}`);
        console.log(`Timestamp: ${timestamp}`);
        console.log("-".repeat(50));

        await rwClient.v2.tweet(tweetContent);
        console.log('Tweet posted!');
        console.log("-".repeat(50));
      } catch (error) {
        console.error("Error posting tweet:", error);
      }
    });

    console.log("Event listener looking for new tweets...");
  } catch (error) {
    console.error("Error setting up event listener:", error);
  }
}

app.get('/generate_access_keys', async (req, res) => {
    try {
      // Call the external endpoint to generate keys and access tokens
      const response = await axios.get('http://127.0.0.1:8000/generate_keys_and_access_tokens');
      
      if (response.status === 200) {
        console.log('Keys and access tokens generated successfully.');
        res.status(200).json({ message: 'Keys and access tokens generated successfully.' });
      } else {
        console.error('Failed to generate keys and access tokens.');
        res.status(500).json({ message: 'Failed to generate keys and access tokens.' });
      }
    } catch (error) {
      console.error('Error calling generate_keys_and_access_tokens:', error.message);
      res.status(500).json({ message: 'Error generating keys and access tokens.' });
    }
});

// Endpoint to start listening for tweet events
app.get('/start_listening_for_tweet_events', async (req, res) => {
    try {
      // Fetch API keys and tokens
      const response = await axios.get('http://127.0.0.1:8000/fetch_keys_and_tokens');
      const { api_keys, access_tokens } = response.data;
  
      const api_key = api_keys.api_key;
      const api_key_secret = api_keys.api_key_secret;
      const access_token = access_tokens.access_token;
      const access_token_secret = access_tokens.access_token_secret;
  
      // Get the contract and start listening for events
      const rpc_url = process.env.RPC_URL;
      const contract_address = process.env.CONTRACT_ADDRESS;
      const contract = await getTweetWithOysterAgentServiceContract(rpc_url, contract_address);
      listenForEvents(contract, api_key, api_key_secret, access_token, access_token_secret);
  
      res.status(200).json({ message: 'Listening for new tweets!' });
    } catch (error) {
      console.error("Error starting event listener:", error);
      res.status(500).json({ message: 'Error starting event listener' });
    }
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${process.env.PORT}`);
});