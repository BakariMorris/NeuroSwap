// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IAIMM.sol";

// Simplified LayerZero AMM for foundation - will be updated with full LZ SDK
contract LayerZeroAMM is Ownable {
    uint16 public constant MSG_PARAMETER_UPDATE = 1;
    uint16 public constant MSG_LIQUIDITY_SYNC = 2;
    uint16 public constant MSG_CROSS_CHAIN_SWAP = 3;
    
    IAIMM public immutable aimm;
    address public layerZeroEndpoint;
    mapping(uint32 => bool) public trustedChains;
    mapping(uint32 => address) public remotePeers;
    
    event ParametersSynced(uint32 indexed srcEid, address indexed pool);
    event CrossChainSwapInitiated(uint32 indexed dstEid, address indexed user, uint256 amount);
    event TrustedChainAdded(uint32 indexed eid);
    
    struct ParameterUpdateMsg {
        address pool;
        IAIMM.PoolParameters params;
        bytes aiSignature;
    }
    
    struct CrossChainSwapMsg {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        address recipient;
        uint256 deadline;
    }
    
    modifier onlyTrustedChain(uint32 _srcEid) {
        require(trustedChains[_srcEid], "Untrusted source chain");
        _;
    }
    
    modifier onlyLayerZeroEndpoint() {
        require(msg.sender == layerZeroEndpoint, "Only LayerZero endpoint");
        _;
    }
    
    constructor(
        address _endpoint,
        address _delegate,
        address _aimm
    ) Ownable(_delegate) {
        layerZeroEndpoint = _endpoint;
        aimm = IAIMM(_aimm);
    }
    
    // Placeholder for LayerZero message receiving
    function lzReceive(
        uint32 _srcEid,
        bytes32 _guid,
        bytes calldata _message
    ) external onlyLayerZeroEndpoint onlyTrustedChain(_srcEid) {
        uint16 msgType = abi.decode(_message[0:32], (uint16));
        
        if (msgType == MSG_PARAMETER_UPDATE) {
            _handleParameterUpdate(_message[32:]);
        } else if (msgType == MSG_CROSS_CHAIN_SWAP) {
            _handleCrossChainSwap(_message[32:]);
        }
    }
    
    function syncParameters(
        uint32 _dstEid,
        address _pool,
        IAIMM.PoolParameters calldata _params,
        bytes calldata _aiSignature
    ) external payable {
        // Verify locally first
        aimm.updateParameters(_pool, _params, _aiSignature);
        
        ParameterUpdateMsg memory msg = ParameterUpdateMsg({
            pool: _pool,
            params: _params,
            aiSignature: _aiSignature
        });
        
        bytes memory payload = abi.encode(MSG_PARAMETER_UPDATE, msg);
        
        // In full implementation, this would call LayerZero send
        emit ParametersSynced(_dstEid, _pool);
    }
    
    function crossChainSwap(
        uint32 _dstEid,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _minAmountOut,
        address _recipient
    ) external payable {
        require(_amountIn > 0, "Amount must be > 0");
        require(_recipient != address(0), "Invalid recipient");
        
        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);
        
        CrossChainSwapMsg memory swapMsg = CrossChainSwapMsg({
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            amountIn: _amountIn,
            minAmountOut: _minAmountOut,
            recipient: _recipient,
            deadline: block.timestamp + 1800
        });
        
        bytes memory payload = abi.encode(MSG_CROSS_CHAIN_SWAP, swapMsg);
        
        // In full implementation, this would call LayerZero send
        emit CrossChainSwapInitiated(_dstEid, msg.sender, _amountIn);
    }
    
    function _handleParameterUpdate(bytes memory _message) internal {
        ParameterUpdateMsg memory msg = abi.decode(_message, (ParameterUpdateMsg));
        
        try aimm.updateParameters(msg.pool, msg.params, msg.aiSignature) {
            emit ParametersSynced(0, msg.pool);
        } catch Error(string memory) {
            // Log error but don't revert
        }
    }
    
    function _handleCrossChainSwap(bytes memory _message) internal {
        CrossChainSwapMsg memory swapMsg = abi.decode(_message, (CrossChainSwapMsg));
        
        require(block.timestamp <= swapMsg.deadline, "Swap deadline exceeded");
        
        try aimm.swap(IAIMM.SwapParams({
            tokenIn: swapMsg.tokenIn,
            tokenOut: swapMsg.tokenOut,
            amountIn: swapMsg.amountIn,
            minAmountOut: swapMsg.minAmountOut,
            to: swapMsg.recipient,
            deadline: swapMsg.deadline
        })) returns (uint256) {
            // Swap successful
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Swap failed: ", reason)));
        }
    }
    
    function addTrustedChain(uint32 _eid) external onlyOwner {
        trustedChains[_eid] = true;
        emit TrustedChainAdded(_eid);
    }
    
    function setPeer(uint32 _eid, address _peer) external onlyOwner {
        remotePeers[_eid] = _peer;
    }
    
    function setLayerZeroEndpoint(address _endpoint) external onlyOwner {
        layerZeroEndpoint = _endpoint;
    }
}