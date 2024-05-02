/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-10-14 12:24:38
 * @Description:
 */
/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-07-25 10:02:59
 * @Description:
 */

const { expect } = require("chai");
const { network, ethers } = require("hardhat");

const { abi: ERC20ABI } = require("./ERC20.json");

describe("uniswap V3 trader", async function () {
  const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const tokenAddress = "0xd909fb6a3453025286c7d700da19d62242416c00";
  const swapRouterV2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  let weth, checker, token;
  let owner, checkerAddress;

  before(async function () {
    [owner, sender] = await ethers.getSigners();

    weth = await ethers.getContractAt("WETH", WETH);
    checker = await (await ethers.getContractFactory("TokenChecker")).deploy(swapRouterV2);
    checkerAddress = checker.address;
    token = new ethers.Contract(tokenAddress, ERC20ABI, ethers.provider);

    const ethBalance = await owner.getBalance();
    console.log("ETH", ethers.utils.formatEther(ethBalance));

    const tokenbeforeBalance = await token.balanceOf(owner.address);
    console.log("mock address's token before exchange", ethers.utils.formatEther(tokenbeforeBalance));
  });
  it("Execution", async function () {
    const calldata = checker.interface.encodeFunctionData("check", [tokenAddress]);
    const transaction = {
      from: owner.address,
      to: checkerAddress,
      value: ethers.utils.parseEther("0.1"),
      gasLimit: ethers.utils.hexValue(450000),
      data: calldata,
    };
    const simulateResult = await ethers.provider.call(transaction);

    const decoded = ethers.utils.defaultAbiCoder.decode(["uint256", "uint256", "uint256", "uint256"], simulateResult);
    console.log(simulateResult);
    const buyExpectedOut = ethers.utils.formatUnits(decoded[0], 18);
    const buyActualOut = ethers.utils.formatUnits(decoded[1], 18);

    const sellExpectedOut = ethers.utils.formatEther(decoded[2]);
    const sellActualOut = ethers.utils.formatEther(decoded[3]);
    console.log(buyExpectedOut, buyActualOut, sellExpectedOut, sellActualOut);
  });
  after(async function () {
    const tokenafterBalance = await token.balanceOf(owner.address);
    console.log("mock address's uni after exchange", ethers.utils.formatEther(tokenafterBalance));
    const ethBalance = await owner.getBalance();
    console.log("mock address's ETH after exchange", ethers.utils.formatEther(ethBalance));
  });
});
