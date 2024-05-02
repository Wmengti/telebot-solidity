/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-07-27 10:31:51
 * @Description:
 */
const { verify } = require("../utils/verify");
const fs = require("fs");
const { ethers } = require("hardhat");
// mumbai
// const factoryAddressV3 = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
// const factoryAddressV2 = "0x55d232104f0c1AF63f9C0F9e2f757921eD6ee226";
// const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
// const routerAddressV2 = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

//goerli\mainnet
const factoryAddressV3 = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const factoryAddressV2 = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const routerAddressV2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const developmentChains = ["hardhat", "localhost"];

  args = [routerAddress, routerAddressV2, factoryAddressV3, factoryAddressV2];
  const contract = await deploy("Trader", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
  //   await verify(contract.address, args);
  // }
};

module.exports.tags = ["Trader", "all"];
// 0xeb0750857D971564C1Dd11af68FCd04e9939264c mumbai
//0xC71f67893Ea95ABa5290D161e8d75cce68E66F75 goerli
