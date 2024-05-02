/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-07-25 10:08:14
 * @Description:
 */
const { expect } = require("chai");
const { network, ethers } = require("hardhat");
const PriceFeedABI = require("./aggregatorV3InterfaceABI.json");

describe("ChainLink price feed ", async function () {
  const ETH_USD = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  before(async function () {
    [owner] = await ethers.getSigners();

    const priceFeed = new ethers.Contract(ETH_USD, PriceFeedABI, ethers.provider);
    let roundData = await priceFeed.latestRoundData();
    let decimals = await priceFeed.decimals();
    let ethPrice = Number((roundData.answer.toString() / Math.pow(10, decimals)).toFixed(2));
    console.log(ethPrice);
  });
  it("Execution", async function () {});
  after(async function () {});
});
