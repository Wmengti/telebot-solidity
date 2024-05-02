/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-10-14 18:03:07
 * @Description:
 */

const { network, ethers } = require("hardhat");

const { abi: ERC20TokenABI } = require("./ERC20.json");
const { abi: V2RouterABI } = require("./IUniswapV2Router02.json");
const { abi: NEOTraderABI } = require("./NeoTrader.json");
const usdcABI = require("./USDC.json");

describe("NEO V2 trader", async function () {
  // const factoryAddressV2 = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  // const routerAddressV2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  // const WETH = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
  // const TokenAddress = "0xe66f4D419739EFd5b038F4053B074f495D7C8a31";
  const factoryAddressV2 = process.env.NEO_FACTORY_ADDRESS_V2;
  const routerAddressV2 = process.env.NEO_ROUTER_ADDRESS_V2;
  const WETH = "0x07e56622ac709e2458dd5189e11e55a42e681fb6"; //neo
  // const TokenAddress = "0x6aE9426a6356b383E32a1604C575A24cAd432826"; //neo
  const XOX = "0x3B6dFC89760d5B6F64C043A74210ddF91264Beef";
  const USDC = "0xce221120F145B456ba41b370F11D5E536eCD2BcB";
  const NeoTrader = "0x04A0047e8c094EEDa5d32A9B349Fb617B7167135";
  let router, weth, xox, usdc;
  let owner;

  before(async function () {
    [owner] = await ethers.getSigners();

    weth = await ethers.getContractAt("WETH", WETH);

    // trader = await ethers.getContractAt("Trader", traderAddress);
    trader = await ethers.getContractAt("NeoTrader", NeoTrader);

    xox = new ethers.Contract(XOX, ERC20TokenABI, ethers.provider);
    usdc = new ethers.Contract(USDC, usdcABI, ethers.provider);
    router = new ethers.Contract(routerAddressV2, V2RouterABI, ethers.provider);

    const ethBalance = await owner.getBalance();
    console.log("ETH", ethers.utils.formatEther(ethBalance));
    const ethBeforeBalance = await weth.balanceOf(owner.address);
    console.log("WETH before transfer", ethers.utils.formatEther(ethBeforeBalance));
    const xoxBeforeBalance = await xox.balanceOf(owner.address);
    console.log("xox address's amount before exchange", ethers.utils.formatEther(xoxBeforeBalance));
    const usdcBeforeBalance = await usdc.balanceOf(owner.address);
    console.log("usdc address's amount before exchange", ethers.utils.formatUnits(usdcBeforeBalance, "6"));
  });
  it("Execution", async function () {
    // transfer eth to weth
    // const AmountIn = ethers.utils.parseUnits("3", 18);
    // const tx = await weth.connect(owner).deposit({ value: AmountIn });
    // await tx.wait(1);
    // console.log(tx);
    const AmountIn = ethers.utils.parseUnits("10", 18);
    const poolv2Address = await trader.getPoolV2(XOX, WETH);
    console.log("quotev2 pool:", poolv2Address);
    try {
      const quoteAmountv2 = await trader.getPriceV2(XOX, WETH);
      console.log("quotev2:", `${ethers.utils.formatEther(quoteAmountv2)}`);
    } catch (err) {
      console.log("发生错误：", err.message);
    }
    // const txApprove1 = await xox.connect(owner).approve(trader.address, ethers.constants.MaxInt256);
    // await txApprove1.wait(1);
    // const allownAmount1 = await xox.allowance(owner.address, trader.address);
    // console.log("xox allowance token:", ethers.utils.formatEther(allownAmount1));
    // const txApprove2 = await usdc.connect(owner).approve(trader.address, ethers.constants.MaxInt256);
    // await txApprove2.wait(1);
    // const allownAmount2 = await usdc.allowance(owner.address, trader.address);
    // console.log("usdc allowance token:", ethers.utils.formatEther(allownAmount2));
    // console.log("================================================================");
    // const tx = await trader.connect(owner).swapExactTokensForTokensV2(AmountIn, XOX, WETH, owner.address);
    // await tx.wait(1);
    // console.log(tx);
    // console.log("================================================================");
    // const AmountInToken = ethers.utils.parseUnits("10", 18);
    // const tx2 = await trader.connect(owner).swapExactTokensForETHV2(XOX, AmountInToken, owner.address);
    // await tx2.wait(1);
    // console.log(tx2);
    // console.log("================================================================");
    const AmountInETH = ethers.utils.parseEther("0.01");
    const tx3 = await trader
      .connect(owner)
      .swapETHForExactTokensV2(XOX, AmountInETH, owner.address, { value: AmountInETH });
    await tx3.wait(1);
    console.log(tx3);
    console.log("================================================================");
    const ethBalance = await owner.getBalance();
    console.log("ETH", ethers.utils.formatEther(ethBalance));
    const ethAfterBalance = await weth.balanceOf(owner.address);
    console.log("WETH After transfer", ethers.utils.formatEther(ethAfterBalance));
    const xoxAfterBalance = await xox.balanceOf(owner.address);
    console.log("xox address's amount After exchange", ethers.utils.formatEther(xoxAfterBalance));
    const usdcAfterBalance = await usdc.balanceOf(owner.address);
    console.log("usdc address's amount After exchange", ethers.utils.formatUnits(usdcAfterBalance, "6"));
  });
});
