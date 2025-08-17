// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "../interfaces/IAIMM.sol";

contract AIMM is IAIMM, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    uint256 public constant MAX_FEE_RATE = 1000; // 10% max fee
    uint256 public constant MIN_LIQUIDITY = 1000;
    uint256 public constant BASIS_POINTS = 10000;
    
    address public aiAgent;
    mapping(address => PoolParameters) public poolParameters;
    mapping(address => mapping(address => uint256)) public reserves;
    mapping(address => uint256) public totalSupply;
    mapping(address => mapping(address => uint256)) public balanceOf;
    
    event AIAgentUpdated(address indexed oldAgent, address indexed newAgent);
    event LiquidityAdded(
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    modifier onlyAIAgent() {
        require(msg.sender == aiAgent, "Only AI agent can call");
        _;
    }
    
    constructor(address _aiAgent) Ownable(msg.sender) {
        aiAgent = _aiAgent;
    }
    
    function updateParameters(
        address pool,
        PoolParameters calldata newParams,
        bytes calldata aiSignature
    ) external override {
        bytes32 messageHash = keccak256(abi.encodePacked(
            pool,
            newParams.feeRate,
            newParams.spreadMultiplier,
            newParams.weights,
            newParams.lastUpdate
        ));
        
        address recoveredSigner = ECDSA.recover(messageHash.toEthSignedMessageHash(), aiSignature);
        require(recoveredSigner == aiAgent, "Invalid AI signature");
        
        require(newParams.feeRate <= MAX_FEE_RATE, "Fee rate too high");
        require(newParams.isActive, "Pool must be active");
        require(
            newParams.lastUpdate > poolParameters[pool].lastUpdate,
            "Parameters not newer"
        );
        
        poolParameters[pool] = newParams;
        
        emit ParametersUpdated(pool, newParams, aiAgent);
    }
    
    function swap(SwapParams calldata params) external override returns (uint256 amountOut) {
        require(params.deadline >= block.timestamp, "Deadline exceeded");
        require(params.amountIn > 0, "Amount in must be > 0");
        
        amountOut = getAmountOut(
            params.amountIn,
            params.tokenIn,
            params.tokenOut
        );
        
        require(amountOut >= params.minAmountOut, "Insufficient output amount");
        
        IERC20(params.tokenIn).safeTransferFrom(
            msg.sender,
            address(this),
            params.amountIn
        );
        
        IERC20(params.tokenOut).safeTransfer(params.to, amountOut);
        
        reserves[params.tokenIn][params.tokenOut] += params.amountIn;
        reserves[params.tokenOut][params.tokenIn] -= amountOut;
        
        emit Swap(
            params.tokenIn,
            params.tokenOut,
            params.amountIn,
            amountOut,
            params.to
        );
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB,
        address to
    ) external override returns (uint256 liquidity) {
        require(amountA > 0 && amountB > 0, "Amounts must be > 0");
        
        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);
        
        address pair = getPairAddress(tokenA, tokenB);
        uint256 _totalSupply = totalSupply[pair];
        
        if (_totalSupply == 0) {
            liquidity = sqrt(amountA * amountB) - MIN_LIQUIDITY;
            totalSupply[pair] = MIN_LIQUIDITY;
        } else {
            uint256 reserveA = reserves[tokenA][tokenB];
            uint256 reserveB = reserves[tokenB][tokenA];
            
            liquidity = min(
                (amountA * _totalSupply) / reserveA,
                (amountB * _totalSupply) / reserveB
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        
        totalSupply[pair] += liquidity;
        balanceOf[pair][to] += liquidity;
        reserves[tokenA][tokenB] += amountA;
        reserves[tokenB][tokenA] += amountB;
        
        emit LiquidityAdded(tokenA, tokenB, amountA, amountB, liquidity);
    }
    
    function getAmountOut(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    ) public view returns (uint256 amountOut) {
        require(amountIn > 0, "Amount in must be > 0");
        
        address pair = getPairAddress(tokenIn, tokenOut);
        PoolParameters memory params = poolParameters[pair];
        
        uint256 reserveIn = reserves[tokenIn][tokenOut];
        uint256 reserveOut = reserves[tokenOut][tokenIn];
        
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (BASIS_POINTS - params.feeRate);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * BASIS_POINTS) + amountInWithFee;
        
        amountOut = numerator / denominator;
        
        if (params.spreadMultiplier > BASIS_POINTS) {
            amountOut = (amountOut * BASIS_POINTS) / params.spreadMultiplier;
        }
    }
    
    function getPairAddress(address tokenA, address tokenB) public pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(tokenA, tokenB)))));
    }
    
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x < y ? x : y;
    }
    
    function setAIAgent(address _aiAgent) external onlyOwner {
        address oldAgent = aiAgent;
        aiAgent = _aiAgent;
        emit AIAgentUpdated(oldAgent, _aiAgent);
    }
}