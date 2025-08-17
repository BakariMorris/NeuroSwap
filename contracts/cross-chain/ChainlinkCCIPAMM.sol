// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IAIMM.sol";

// Simplified Chainlink CCIP AMM for foundation - will be updated with full CCIP SDK
contract ChainlinkCCIPAMM is Ownable {
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);
    error DestinationChainNotAllowed(uint64 destinationChainSelector);
    error SourceChainNotAllowed(uint64 sourceChainSelector);
    error SenderNotAllowed(address sender);
    error InvalidReceiverAddress();
    
    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        bytes data,
        uint256 fees
    );
    
    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address sender,
        bytes data
    );
    
    event ParametersSynchronized(
        uint64 indexed sourceChain,
        address indexed pool,
        uint256 timestamp
    );
    
    IAIMM public immutable aimm;
    address public ccipRouter;
    
    mapping(uint64 => bool) public allowlistedChains;
    mapping(address => bool) public allowlistedSenders;
    
    enum MessageType { PARAMETER_UPDATE, LIQUIDITY_SYNC, PRICE_UPDATE }
    
    struct ParameterMessage {
        address pool;
        IAIMM.PoolParameters params;
        bytes aiSignature;
        uint256 timestamp;
    }
    
    modifier onlyAllowlistedChain(uint64 _chainSelector) {
        if (!allowlistedChains[_chainSelector])
            revert DestinationChainNotAllowed(_chainSelector);
        _;
    }
    
    modifier validateReceiver(address _receiver) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        _;
    }
    
    modifier onlyCCIPRouter() {
        require(msg.sender == ccipRouter, "Only CCIP router");
        _;
    }
    
    constructor(
        address _router,
        address _aimm
    ) Ownable(msg.sender) {
        ccipRouter = _router;
        aimm = IAIMM(_aimm);
    }
    
    function sendParameterUpdate(
        uint64 _destinationChainSelector,
        address _receiver,
        address _pool,
        IAIMM.PoolParameters calldata _params,
        bytes calldata _aiSignature
    )
        external
        onlyOwner
        onlyAllowlistedChain(_destinationChainSelector)
        validateReceiver(_receiver)
        returns (bytes32 messageId)
    {
        // Verify locally first
        aimm.updateParameters(_pool, _params, _aiSignature);
        
        ParameterMessage memory paramMsg = ParameterMessage({
            pool: _pool,
            params: _params,
            aiSignature: _aiSignature,
            timestamp: block.timestamp
        });
        
        bytes memory data = abi.encode(MessageType.PARAMETER_UPDATE, paramMsg);
        
        // In full implementation, this would use CCIP router
        messageId = keccak256(abi.encodePacked(block.timestamp, data));
        
        emit MessageSent(
            messageId,
            _destinationChainSelector,
            _receiver,
            data,
            0
        );
        
        emit ParametersSynchronized(_destinationChainSelector, _pool, block.timestamp);
        
        return messageId;
    }
    
    // Placeholder for CCIP message receiving
    function ccipReceive(
        uint64 _sourceChainSelector,
        address _sender,
        bytes calldata _data
    ) external onlyCCIPRouter {
        if (!allowlistedChains[_sourceChainSelector])
            revert SourceChainNotAllowed(_sourceChainSelector);
        if (!allowlistedSenders[_sender])
            revert SenderNotAllowed(_sender);
        
        (MessageType msgType, bytes memory payload) = abi.decode(_data, (MessageType, bytes));
        
        if (msgType == MessageType.PARAMETER_UPDATE) {
            _handleParameterUpdate(payload);
        }
        
        bytes32 messageId = keccak256(abi.encodePacked(block.timestamp, _data));
        emit MessageReceived(messageId, _sourceChainSelector, _sender, _data);
    }
    
    function _handleParameterUpdate(bytes memory _payload) internal {
        ParameterMessage memory paramMsg = abi.decode(_payload, (ParameterMessage));
        
        require(
            block.timestamp <= paramMsg.timestamp + 3600,
            "Parameter update too old"
        );
        
        try aimm.updateParameters(paramMsg.pool, paramMsg.params, paramMsg.aiSignature) {
            emit ParametersSynchronized(0, paramMsg.pool, paramMsg.timestamp);
        } catch Error(string memory) {
            // Log error for monitoring but don't revert
        }
    }
    
    function allowlistDestinationChain(
        uint64 _destinationChainSelector,
        bool _allowed
    ) external onlyOwner {
        allowlistedChains[_destinationChainSelector] = _allowed;
    }
    
    function allowlistSender(address _sender, bool _allowed) external onlyOwner {
        allowlistedSenders[_sender] = _allowed;
    }
    
    function setCCIPRouter(address _router) external onlyOwner {
        ccipRouter = _router;
    }
    
    function withdraw(address _beneficiary) external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw");
        
        (bool sent, ) = _beneficiary.call{value: amount}("");
        require(sent, "Failed to withdraw");
    }
    
    function withdrawToken(
        address _beneficiary,
        address _token
    ) external onlyOwner {
        uint256 amount = IERC20(_token).balanceOf(address(this));
        require(amount > 0, "Nothing to withdraw");
        
        IERC20(_token).transfer(_beneficiary, amount);
    }
    
    receive() external payable {}
}