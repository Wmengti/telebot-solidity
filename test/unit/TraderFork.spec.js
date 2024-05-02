/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-07-25 10:02:59
 * @Description:
 */
const { expect } = require("chai");
const { network, ethers } = require("hardhat");
const { abi: IUniswapV3PoolABI } = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
const { abi: SwapRouterABI } = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
const uniABI = require("./UNIABI.json");
const { getPoolState } = require("../../utils/helper.js");

describe("uniswap V3 trader", async function () {
  const poolAddressV2 = "0xd3d2e2692501a5c9ca623199d38826e513033a17";
  const poolAddress = "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801";
  const factoryAddressV3 = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  const factoryAddressV2 = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const routerAddressV2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const uniAddress = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
  const mockAddress = "0x331865e142ACA526B9f75464A2B597ECdaCAF557";
  let pool, router, weth, uni;
  let owner, signer;

  before(async function () {
    [owner] = await ethers.getSigners();
    pool = new ethers.Contract(poolAddress, IUniswapV3PoolABI, ethers.provider);
    router = new ethers.Contract(routerAddress, SwapRouterABI, ethers.provider);
    weth = await ethers.getContractAt("WETH", WETH);
    trader = await (
      await ethers.getContractFactory("Trader")
    ).deploy(routerAddress, routerAddressV2, factoryAddressV3, factoryAddressV2);

    uni = new ethers.Contract(uniAddress, uniABI, ethers.provider);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [mockAddress],
    });
    signer = await ethers.provider.getSigner(mockAddress);
    const ethBalance = await signer.getBalance();
    console.log("ETH", ethers.utils.formatEther(ethBalance));
    const mockbeforeBalance = await weth.balanceOf(mockAddress);
    console.log("WETH before transfer", ethers.utils.formatEther(mockbeforeBalance));
    const unibeforeBalance = await uni.balanceOf(mockAddress);
    console.log("mock address's uni before exchange", ethers.utils.formatEther(unibeforeBalance));
  });
  it("Execution", async function () {
    const AmountIn = ethers.utils.parseUnits("10", 18);

    const poolv2Address = await trader.getPoolV2(uniAddress, WETH);
    console.log("quotev2 pool:", poolv2Address);
    const poolv3Address = await trader.getPoolV3(uniAddress, WETH);

    console.log("quotev3 pool:", poolv3Address);

    const quoteAmountv2 = await trader.getPriceV2(uniAddress, WETH);
    console.log("quotev2:", `${ethers.utils.formatEther(quoteAmountv2)}`);
    for (let i = 0; i < poolv3Address.length; i++) {
      const quoteAmountv3 = await trader.getPriceV3(poolv3Address[i], uniAddress, WETH);
      console.log(`quotev3 ${i} :${ethers.utils.formatEther(quoteAmountv3)}`);
    }

    const [poolBest, version, price] = await trader.getBestPrice(uniAddress, WETH);
    console.log(
      `交易的池子:${poolBest} token/eth的比例:${ethers.utils.formatEther(price)} 属于${version === true ? "V3" : "V2"}`
    );
    //v3 swap approve每次授权的数量交易了之后要减去交易的数量等于剩余的数量
    await weth.connect(signer).approve(trader.address, AmountIn);

    await trader.connect(owner).swapExactInputSingle(AmountIn, poolBest, WETH, uniAddress, mockAddress);

    const mockafterBalance = await weth.balanceOf(mockAddress);
    console.log("mock address's WETH after exchange", ethers.utils.formatEther(mockafterBalance));
    const uniafterBalance = await uni.balanceOf(mockAddress);
    console.log("mock address's uni after exchange", ethers.utils.formatEther(uniafterBalance));
    const AmountInUNI = ethers.utils.parseUnits("100", 18);
    //v2 swap 卖出eth
    await uni.connect(signer).approve(trader.address, AmountInUNI);
    await trader.connect(owner).swapExactInputForETH(AmountInUNI, uniAddress, WETH, mockAddress);
    const mockafterBalancev2 = await weth.balanceOf(mockAddress);
    console.log("mock address's WETH after exchange", ethers.utils.formatEther(mockafterBalancev2));
    const uniafterBalancev2 = await uni.balanceOf(mockAddress);
    console.log("mock address's uni after exchange", ethers.utils.formatEther(uniafterBalancev2));
    const ethBalance = await signer.getBalance();
    console.log("mock address's ETH after exchange", ethers.utils.formatEther(ethBalance));
    // v2 swap 卖出weth
    await uni.connect(signer).approve(trader.address, AmountInUNI);
    await trader.connect(owner).swapExactTokensForTokensV2(AmountInUNI, uniAddress, WETH, mockAddress);
  });
  after(async function () {
    const mockafterBalance = await weth.balanceOf(mockAddress);
    console.log("mock address's WETH after exchange", ethers.utils.formatEther(mockafterBalance));
    const uniafterBalance = await uni.balanceOf(mockAddress);
    console.log("mock address's uni after exchange", ethers.utils.formatEther(uniafterBalance));
    const ethBalance = await signer.getBalance();
    console.log("mock address's ETH after exchange", ethers.utils.formatEther(ethBalance));
  });
});
