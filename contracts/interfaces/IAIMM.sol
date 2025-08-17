// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IAIMM {
    struct PoolParameters {
        uint256 feeRate;          // Fee rate in basis points (100 = 1%)
        uint256 spreadMultiplier; // Spread multiplier for volatility
        uint256[] weights;        // Asset weights in pool
        uint256 lastUpdate;      // Timestamp of last AI update
        bool isActive;           // Pool active status
    }
    
    struct SwapParams {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        address to;
        uint256 deadline;
    }
    
    event ParametersUpdated(
        address indexed pool,
        PoolParameters newParams,
        address indexed aiAgent
    );
    
    event Swap(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address indexed to
    );
    
    function updateParameters(
        address pool,
        PoolParameters calldata newParams,
        bytes calldata aiSignature
    ) external;
    
    function swap(SwapParams calldata params) external returns (uint256 amountOut);
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB,
        address to
    ) external returns (uint256 liquidity);
}