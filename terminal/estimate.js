/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-08-23 16:21:55
 * @Description:
 */
const { ethers } = require("ethers");
const { abi: ERC20ABI } = require("../test/unit/ERC20.json");
const { abi: CHECKERABI } = require("../artifacts/contracts/tokenChecker.sol/TokenChecker.json");
require("dotenv").config();
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
const tokenAddress = "0xaac88e48767988119b84dea3fc93ceec012f3530";

const checkerAddress = "0x8aAC5570d54306Bb395bf2385ad327b7b706016b";
const token = new ethers.Contract(tokenAddress, ERC20ABI, provider);
const checker = new ethers.Contract(checkerAddress, CHECKERABI, provider);
async function check() {
  const owner = "0xC45d9e0E15b7Baa05470F9f0B6883A1F8213937e";

  const ethBalance = await provider.getBalance(owner);
  console.log("ETH", ethers.utils.formatEther(ethBalance));

  const tokenbeforeBalance = await token.balanceOf(owner);
  console.log("mock address's token before exchange", ethers.utils.formatEther(tokenbeforeBalance));

  const calldata = checker.interface.encodeFunctionData("check", [tokenAddress]);
  const transaction = {
    from: owner,
    to: checkerAddress,
    value: ethers.utils.parseEther("0.1"),
    gasLimit: ethers.utils.hexValue(450000),
    data: calldata,
  };
  const simulateResult = await provider.call(transaction);

  const decoded = ethers.utils.defaultAbiCoder.decode(["uint256", "uint256", "uint256", "uint256"], simulateResult);

  const buyExpectedOut = Number(ethers.utils.formatUnits(decoded[0], 18));
  const buyActualOut = Number(ethers.utils.formatUnits(decoded[1], 18));

  const sellExpectedOut = Number(ethers.utils.formatEther(decoded[2]));
  const sellActualOut = Number(ethers.utils.formatUnits(decoded[3], 18));
  const butTax = ((buyExpectedOut - buyActualOut) / buyExpectedOut) * 100;
  const cellTax = ((sellExpectedOut - sellActualOut) / sellExpectedOut) * 100;
  console.log(butTax.toFixed(2), cellTax.toFixed(2));
  console.log(buyExpectedOut, buyActualOut, sellExpectedOut, sellActualOut);
  const tokenafterBalance = await token.balanceOf(owner);
  console.log("mock address's uni after exchange", ethers.utils.formatEther(tokenafterBalance));
  const ethafterBalance = await provider.getBalance(owner);
  console.log("mock address's ETH after exchange", ethers.utils.formatEther(ethafterBalance));
}

check().catch((err) => {
  console.error(err);
});
