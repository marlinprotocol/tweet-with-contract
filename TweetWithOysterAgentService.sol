// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TweetWithOysterAgentService
 * @dev A simple contract that charges 0.0001 ETH per tweet and sends it to the contract deployer
 */
contract TweetWithOysterAgentService {
    
    // Owner address where fees will be sent (contract deployer)
    address payable public owner;
    
    // Fee per tweet in ETH (0.0001 ETH)
    uint256 public constant FEE_AMOUNT = 1e14; // 0.0001 ETH in wei
    
    // Event to log tweets
    event NewTweet(address indexed user, string tweetContent, uint256 timestamp);
    
    /**
     * @dev Constructor that sets the owner to the address that deploys the contract
     */
    constructor() {
        owner = payable(msg.sender);
    }
    
    /**
     * @dev Post a tweet by sending a string and paying 0.0001 ETH
     * @param tweetContent The content of the tweet
     */
    function tweet(string calldata tweetContent) external payable {
        // Check if the sent ETH is at least the required fee amount
        require(msg.value >= FEE_AMOUNT, "Insufficient ETH: Send at least 0.0001 ETH to tweet");
        
        // Forward the fee to the owner
        (bool sent, ) = owner.call{value: FEE_AMOUNT}("");
        require(sent, "Failed to send ETH");
        
        // If the user sent more than the fee, refund the excess
        if (msg.value > FEE_AMOUNT) {
            (bool refundSent, ) = payable(msg.sender).call{value: msg.value - FEE_AMOUNT}("");
            require(refundSent, "Failed to refund excess ETH");
        }
        
        // Emit event for the tweet
        emit NewTweet(msg.sender, tweetContent, block.timestamp);
    }
}