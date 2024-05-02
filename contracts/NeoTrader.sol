// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "./libraries/OracleLibrary.sol";

contract NeoTrader {
  // For the scope of these swap examples,
  // we will detail the design considerations when using
  // `exactInput`, `exactInputSingle`, `exactOutput`, and  `exactOutputSingle`.

  // It should be noted that for the sake of these examples, we purposefully pass in the swap router instead of inherit the swap router for simplicity.
  // More advanced example contracts will detail how to inherit the swap router safely.

  IUniswapV2Router02 public immutable swapRouterV2;
  IUniswapV2Factory public immutable v2Factory;
  uint256 public constant AMOUNT = 1000000000000000000;
  uint256 private constant DEADLINE = 5 minutes;

  // This example swaps DAI/WETH9 for single path swaps and DAI/USDC/WETH9 for multi path swaps.

  // address public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  constructor(IUniswapV2Router02 _swapRouterV2, IUniswapV2Factory _v2Factory) {
    swapRouterV2 = _swapRouterV2;
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

  function getPoolV2(address token0, address token1) public view returns (address v2PoolAddress) {
    v2PoolAddress = v2Factory.getPair(token0, token1);
    return v2PoolAddress;
  }

  function swapExactTokensForTokensV2(
    uint256 amountIn,
    address token0,
    address token1,
    address sender
  ) external payable returns (uint256 amountOut) {
    require(amountIn > 0, " INSUFFICIENT_INPUT_AMOUNT");
    SafeERC20.safeTransferFrom(IERC20(token0), sender, address(this), amountIn);
    SafeERC20.safeApprove(IERC20(token0), address(swapRouterV2), 0);
    SafeERC20.safeApprove(IERC20(token0), address(swapRouterV2), amountIn);
    address[] memory path = new address[](2);
    path[0] = token0;
    path[1] = token1;
    uint[] memory amountOuts = swapRouterV2.swapExactTokensForTokens(amountIn, 0, path, sender, block.timestamp);
    amountOut = amountOuts[0];
  }

  //eth to tokens
  function swapETHForExactTokensV2(
    address tokenAddress,
    uint256 amountEthIn,
    address sender
  ) external payable returns (uint256 amountOut) {
    require(amountEthIn > 0, " INSUFFICIENT_INPUT_AMOUNT");
    address[] memory eth2TokenPath = getPathForEthToToken(tokenAddress);
    uint256 buyExpectedOut = swapRouterV2.getAmountsOut(amountEthIn, eth2TokenPath)[1];

    uint[] memory amountOuts = swapRouterV2.swapExactETHForTokens{value: amountEthIn}(
      buyExpectedOut,
      eth2TokenPath,
      sender,
      block.timestamp + DEADLINE
    );
    amountOut = amountOuts[0];
  }

  //eth to tokens
  function swapExactTokensForETHV2(
    address tokenAddress,
    uint256 amountTokenIn,
    address sender
  ) external payable returns (uint256 amountOut) {
    require(amountTokenIn > 0, " INSUFFICIENT_INPUT_AMOUNT");
    address[] memory token2EthPath = getPathForTokenToEth(tokenAddress);
    uint256 buyExpectedOut = swapRouterV2.getAmountsOut(amountTokenIn, token2EthPath)[1];
    SafeERC20.safeTransferFrom(IERC20(tokenAddress), sender, address(this), amountTokenIn);
    SafeERC20.safeApprove(IERC20(tokenAddress), address(swapRouterV2), 0);
    SafeERC20.safeApprove(IERC20(tokenAddress), address(swapRouterV2), amountTokenIn);
    uint[] memory amountOuts = swapRouterV2.swapExactTokensForETH(
      amountTokenIn,
      buyExpectedOut,
      token2EthPath,
      sender,
      block.timestamp + DEADLINE
    );
    amountOut = amountOuts[0];
  }

  function getPathForEthToToken(address tokenAddress) private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = swapRouterV2.WETH();
    path[1] = tokenAddress;
    return path;
  }

  function getPathForTokenToEth(address tokenAddress) private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = tokenAddress;
    path[1] = swapRouterV2.WETH();
    return path;
  }

  fallback() external payable {}

  receive() external payable {}
}
