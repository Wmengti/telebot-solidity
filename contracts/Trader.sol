// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "./libraries/OracleLibrary.sol";

contract Trader {
  // For the scope of these swap examples,
  // we will detail the design considerations when using
  // `exactInput`, `exactInputSingle`, `exactOutput`, and  `exactOutputSingle`.

  // It should be noted that for the sake of these examples, we purposefully pass in the swap router instead of inherit the swap router for simplicity.
  // More advanced example contracts will detail how to inherit the swap router safely.

  ISwapRouter public immutable swapRouterV3;
  IUniswapV2Router02 public immutable swapRouterV2;

  IUniswapV3Factory public immutable v3Factory;
  IUniswapV2Factory public immutable v2Factory;
  uint256 public constant AMOUNT = 1000000000000000000;

  // This example swaps DAI/WETH9 for single path swaps and DAI/USDC/WETH9 for multi path swaps.

  // address public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  constructor(
    ISwapRouter _swapRouterV3,
    IUniswapV2Router02 _swapRouterV2,
    IUniswapV3Factory _v3Factory,
    IUniswapV2Factory _v2Factory
  ) {
    swapRouterV3 = _swapRouterV3;
    swapRouterV2 = _swapRouterV2;
    v3Factory = _v3Factory;
    v2Factory = _v2Factory;
  }

  function getPriceV2(address token0, address token1) public view returns (uint256 quoteAmount) {
    uint112 reservesToken0;
    uint112 reservesToken1;
    address v2PoolAddress = getPoolV2(token0, token1);
    require(v2PoolAddress != address(0), "v2 pool is not exist");
    IUniswapV2Pair v2Pool = IUniswapV2Pair(v2PoolAddress);

    (reservesToken0, reservesToken1, ) = v2Pool.getReserves();

    quoteAmount = swapRouterV2.getAmountOut(AMOUNT, reservesToken0, reservesToken1);
    return quoteAmount;
  }

  function getPriceV3(address v3PoolAddress, address token0, address token1) public view returns (uint256 quoteAmount) {
    require(v3PoolAddress != address(0), "v3 pool is not exist");

    int24 tick;

    (, tick, , , , , ) = IUniswapV3Pool(v3PoolAddress).slot0();
    quoteAmount = OracleLibrary.getQuoteAtTick(tick, uint128(AMOUNT), token0, token1);

    return quoteAmount;
  }

  function getPoolV2(address token0, address token1) public view returns (address v2PoolAddress) {
    v2PoolAddress = v2Factory.getPair(token0, token1);
    return v2PoolAddress;
  }

  function getPoolV3(address token0, address token1) public view returns (address[] memory) {
    uint24[] memory fee = new uint24[](3);
    fee[0] = 500;
    fee[1] = 3000;
    fee[2] = 10000;

    // Create a fixed-size array to store the pool addresses temporarily
    address[3] memory tempAddresses;
    uint256 count = 0;

    for (uint256 i = 0; i < fee.length; i++) {
      address _v3PoolAddress = v3Factory.getPool(token0, token1, fee[i]);
      if (_v3PoolAddress != address(0)) {
        tempAddresses[count] = _v3PoolAddress;
        count++;
      }
    }

    // Create a new dynamic array with the correct length and copy the valid pool addresses
    address[] memory v3PoolAddresses = new address[](count);
    for (uint256 i = 0; i < count; i++) {
      v3PoolAddresses[i] = tempAddresses[i];
    }

    return v3PoolAddresses;
  }

  function getBestPrice(
    address token0,
    address token1
  ) public view returns (address poolAddress, bool typeVersion, uint256 currentPrice) {
    address v2PoolAddress = getPoolV2(token0, token1);
    uint256 v2Price;
    uint256 bestV3price;
    address bestV3PoolAddress;
    if (v2PoolAddress != address(0)) {
      v2Price = getPriceV2(token0, token1);
    }

    address[] memory v3PoolAddresses = getPoolV3(token0, token1);
    if (v3PoolAddresses.length > 0) {
      for (uint256 i = 0; i < v3PoolAddresses.length; i++) {
        uint256 quoteAmount = getPriceV3(v3PoolAddresses[i], token0, token1);
        if (quoteAmount > bestV3price) {
          bestV3price = quoteAmount;
          bestV3PoolAddress = v3PoolAddresses[i];
        }
      }
    }
    if (v2Price > bestV3price) {
      poolAddress = v2PoolAddress;
      typeVersion = false;
      currentPrice = v2Price;
    } else {
      poolAddress = bestV3PoolAddress;
      typeVersion = true;
      currentPrice = bestV3price;
    }
    return (poolAddress, typeVersion, currentPrice);
  }

  function swap(
    uint256 amountIn,
    address Pool,
    address token0,
    address token1,
    bool typeVersion,
    address sender
  ) public {
    if (typeVersion) {
      swapExactInputSingle(amountIn, Pool, token0, token1, sender);
    } else {
      swapExactTokensForTokensV2(amountIn, token0, token1, sender);
    }
  }

  function swapExactInputSingle(
    uint256 amountIn,
    address v3PoolAddress,
    address token0,
    address token1,
    address sender
  ) internal returns (uint256 amountOut) {
    // msg.sender must approve this contract

    // Transfer the specified amount of DAI to this contract.
    SafeERC20.safeTransferFrom(IERC20(token0), sender, address(this), amountIn);

    // Approve the router to spend DAI.
    SafeERC20.safeApprove(IERC20(token0), address(swapRouterV3), 0);
    SafeERC20.safeApprove(IERC20(token0), address(swapRouterV3), amountIn);
    IUniswapV3Pool v3Pool = IUniswapV3Pool(v3PoolAddress);
    // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
    // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
      tokenIn: token0,
      tokenOut: token1,
      fee: v3Pool.fee(),
      recipient: sender,
      deadline: block.timestamp,
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0
    });

    // The call to `exactInputSingle` executes the swap.
    amountOut = swapRouterV3.exactInputSingle(params);
  }

  function swapExactTokensForTokensV2(
    uint256 amountIn,
    address token0,
    address token1,
    address sender
  ) internal returns (uint256 amountOut) {
    SafeERC20.safeTransferFrom(IERC20(token0), sender, address(this), amountIn);
    SafeERC20.safeApprove(IERC20(token0), address(swapRouterV2), 0);
    SafeERC20.safeApprove(IERC20(token0), address(swapRouterV2), amountIn);
    address[] memory path = new address[](2);
    path[0] = token0;
    path[1] = token1;
    uint[] memory amountOuts = swapRouterV2.swapExactTokensForTokens(amountIn, 0, path, sender, block.timestamp);
    amountOut = amountOuts[0];
  }
}
