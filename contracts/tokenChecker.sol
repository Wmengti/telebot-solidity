// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TokenChecker {
  using SafeMath for uint256;
  uint256 private constant DEADLINE = 30 minutes;
  // address private constant UNISWAP_V2_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
  address public immutable swapRouterAddressV2;
  IUniswapV2Router02 private uniswapRouter;

  constructor(address _swapRouterAddressV2) payable {
    swapRouterAddressV2 = _swapRouterAddressV2;
  }

  function check(address tokenAddress) external payable returns (uint256, uint256, uint256, uint256, uint256) {
    uniswapRouter = IUniswapV2Router02(swapRouterAddressV2);
    (uint256 buyExpectedOut, uint256 buyActualOut, uint256 buyActualOut1) = buy(tokenAddress, msg.value);
    (uint256 sellExpectedOut, uint256 sellActualOut) = sell(tokenAddress, buyActualOut);
    return (buyExpectedOut, buyActualOut, buyActualOut1, sellExpectedOut, sellActualOut);
  }

  //eth -> tokens 检测通过ETH买入Token
  function buy(address tokenAddress, uint256 amountEthIn) internal returns (uint256, uint256, uint256) {
    IERC20 token = IERC20(tokenAddress);
    address senderAddress = address(this);
    //eth to tokens
    require(amountEthIn > 0, " INSUFFICIENT_INPUT_AMOUNT");
    address[] memory eth2TokenPath = getPathForEthToToken(tokenAddress);
    uint256 buyExpectedOut = uniswapRouter.getAmountsOut(amountEthIn, eth2TokenPath)[1];

    uint256 initBalance = token.balanceOf(senderAddress);
    uint[] memory amountOuts = uniswapRouter.swapExactETHForTokens{value: amountEthIn}(
      0,
      eth2TokenPath,
      senderAddress,
      block.timestamp + DEADLINE
    );
    uint256 buyActualOut1 = amountOuts[1];
    uint256 buyActualOut = token.balanceOf(senderAddress).sub(initBalance);
    require(buyActualOut > 0, "buyActualOut > 0");
    return (buyExpectedOut, buyActualOut, buyActualOut1);
  }

  //token -> eth 检测通过卖出Token，获得ETH
  function sell(address tokenAddress, uint256 amountTokenIn) private returns (uint256, uint256) {
    IERC20 token = IERC20(tokenAddress);
    address senderAddress = address(this);

    //eth to tokens
    require(amountTokenIn > 0, " INSUFFICIENT_INPUT_AMOUNT");
    address[] memory token2EthPath = getPathForTokenToEth(tokenAddress);

    //tokens to eth
    uint256 sellExpectedOut = uniswapRouter.getAmountsOut(amountTokenIn, token2EthPath)[1];
    require(token.approve(swapRouterAddressV2, amountTokenIn), "Approve Failed.");
    uint256 initEthBalance = senderAddress.balance;
    uniswapRouter.swapExactTokensForETH(amountTokenIn, 0, token2EthPath, senderAddress, block.timestamp + DEADLINE);
    uint256 sellActualOut = senderAddress.balance.sub(initEthBalance);
    return (sellExpectedOut, sellActualOut);
  }

  function getPathForEthToToken(address tokenAddress) private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = uniswapRouter.WETH();
    path[1] = tokenAddress;
    return path;
  }

  function getPathForTokenToEth(address tokenAddress) private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = tokenAddress;
    path[1] = uniswapRouter.WETH();
    return path;
  }

  fallback() external payable {}

  receive() external payable {}
}
