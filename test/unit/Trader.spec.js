/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-07-24 23:01:44
 * @Description:
 */
const { expect } = require("chai");
const { network, ethers } = require("hardhat");
const { abi: IUniswapV3PoolABI } = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
const { abi: SwapRouterABI } = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
const { abi: ERC20TokenABI } = require("./ERC20.json");
const { getPoolState } = require("../../utils/helper.js");

describe("uniswap V3 trader", async function () {
  const factoryAddressV3 = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  const factoryAddressV2 = "0x55d232104f0c1AF63f9C0F9e2f757921eD6ee226";
  const routerAddressV3 = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const routerAddressV2 = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
  const WETH = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
  const TokenAddress = "0xa092AFa7F7F0D2cB6DD946Bc8C82F716dD901554";
  const traderAddress = "0x21A28f4eA60e2c29Fe6cBe8C0c68De25715cE8c6";
  // const mockAddress = "0x331865e142ACA526B9f75464A2B597ECdaCAF557";
  let pool, router, weth, erc20;
  let owner, signer;

  before(async function () {
    [owner] = await ethers.getSigners();

    weth = await ethers.getContractAt("WETH", WETH);
    // trader = await ethers.getContractAt("Trader", traderAddress);
    trader = await (
      await ethers.getContractFactory("Trader")
    ).deploy(routerAddressV3, routerAddressV2, factoryAddressV3, factoryAddressV2);

    token = new ethers.Contract(TokenAddress, ERC20TokenABI, ethers.provider);

    const ethBalance = await owner.getBalance();
    console.log("ETH", ethers.utils.formatEther(ethBalance));
    const ethBeforeBalance = await weth.balanceOf(owner.address);
    console.log("WETH before transfer", ethers.utils.formatEther(ethBeforeBalance));
    const tokenBeforeBalance = await token.balanceOf(owner.address);
    console.log("mock address's erc20 before exchange", ethers.utils.formatEther(tokenBeforeBalance));
  });
  it("Execution", async function () {
    const AmountIn = ethers.utils.parseUnits("0.01", 18);

    const poolv2Address = await trader.getPoolV2(TokenAddress, WETH);
    console.log("quotev2 pool:", poolv2Address);
    const poolv3Address = await trader.getPoolV3(TokenAddress, WETH);

    console.log("quotev3 pool:", poolv3Address);
    try {
      const quoteAmountv2 = await trader.getPriceV2(TokenAddress, WETH);
      console.log("quotev2:", `${ethers.utils.formatEther(quoteAmountv2)}`);
    } catch (err) {
      console.log("发生错误：", err.message);
    }
    try {
      for (let i = 0; i < poolv3Address.length; i++) {
        const quoteAmountv3 = await trader.getPriceV3(poolv3Address[i], TokenAddress, WETH);
        console.log(`quotev3 ${i} :${ethers.utils.formatEther(quoteAmountv3)}`);
      }
    } catch (err) {
      console.log(err);
    }

    const [poolBest, version, price] = await trader.getBestPrice(TokenAddress, WETH);
    console.log(
      `交易的池子:${poolBest} token/eth的比例:${ethers.utils.formatEther(price)} 属于${version === true ? "V3" : "V2"}`
    );

    const txApprove = await weth.connect(owner).approve(trader.address, ethers.constants.MaxInt256);
    await txApprove.wait(1);
    const allownAmount = await weth.allowance(owner.address, trader.address);
    console.log("allowance token:", ethers.utils.formatEther(allownAmount));
    console.log("================================================================");
    // const tx = await trader.connect(owner).swapExactInputSingle(AmountIn, poolBest, TokenAddress, WETH, owner.address);
    const tx = await trader.connect(owner).swap(AmountIn, poolBest, WETH, TokenAddress, version, owner.address);
    await tx.wait(1);
    console.log(tx);
    // const AmountInUNI = ethers.utils.parseUnits("100", 18);
    // await uni.connect(signer).approve(trader.address, AmountInUNI);
    // await trader.connect(signer).swapExactInputForETH(AmountInUNI, uniAddress);
    console.log("================================================================");
    const ethAfterBalance = await owner.getBalance();
    console.log("mock address's WETH after exchange", ethers.utils.formatEther(ethAfterBalance));
    const wethAfterBalance = await weth.balanceOf(owner.address);
    console.log("mock address's WETH after exchange", ethers.utils.formatEther(wethAfterBalance));
    const tokenAfterBalance = await token.balanceOf(owner.address);
    console.log("mock address's token after exchange", ethers.utils.formatEther(tokenAfterBalance));
  });
  after(async function () {
    const ethAfterBalance = await owner.getBalance();
    console.log("mock address's WETH after exchange", ethers.utils.formatEther(ethAfterBalance));
    const wethAfterBalance = await weth.balanceOf(owner.address);
    console.log("mock address's WETH after exchange", ethers.utils.formatEther(wethAfterBalance));
    const tokenAfterBalance = await token.balanceOf(owner.address);
    console.log("mock address's token after exchange", ethers.utils.formatEther(tokenAfterBalance));
  });
});
